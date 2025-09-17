import functions_framework
import os
import requests
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta

def summarize_tomorrow(weatherData):
    # City/timezone context (seconds offset from UTC)
    city = weatherData.get("city", {})
    tz_offset = city.get("timezone", 0)
    city_name = city.get("name", "Your area")

    # Compute local "tomorrow" date
    now_utc = datetime.utcnow()
    now_local = now_utc + timedelta(seconds=tz_offset)
    tomorrow_local_date = (now_local + timedelta(days=1)).date()

    # Gather all 3h slices for tomorrow (local)
    slices = []
    for item in weatherData.get("list", []):
        dt_local = datetime.utcfromtimestamp(item["dt"]) + timedelta(seconds=tz_offset)
        if dt_local.date() == tomorrow_local_date:
            slices.append((dt_local, item))

    # Fallback if we couldn't group into tomorrow (rare)
    if not slices and weatherData.get("list"):
        cand = weatherData["list"][8]  # ~24h ahead
        dt_local = datetime.utcfromtimestamp(cand["dt"]) + timedelta(seconds=tz_offset)
        slices = [(dt_local, cand)]
        tomorrow_local_date = dt_local.date()

    # Aggregate temps, feels-like, wind, precip
    temps = [it["main"]["temp"] for _, it in slices if "main" in it and "temp" in it["main"]]
    highs = [it["main"]["temp_max"] for _, it in slices if "main" in it and "temp_max" in it["main"]]
    lows  = [it["main"]["temp_min"] for _, it in slices if "main" in it and "temp_min" in it["main"]]
    descs = [it["weather"][0]["description"] for _, it in slices if it.get("weather")]
    pops  = [it.get("pop", 0) for _, it in slices]  # 0..1
    rain_any = any(("rain" in it) or (it.get("pop", 0) >= 0.3) for _, it in slices)

    # Morning/afternoon grouping
    by_hour = defaultdict(list)
    for dt_local, it in slices:
        by_hour[dt_local.hour].append(it)

    morning_pool = [it["main"]["temp"] for h in (8, 9, 10) for it in by_hour.get(h, []) if "main" in it]
    afternoon_pool = [it["main"]["temp"] for h in (14, 15, 16) for it in by_hour.get(h, []) if "main" in it]
    morning_temp = round(sum(morning_pool)/len(morning_pool)) if morning_pool else None
    afternoon_temp = round(sum(afternoon_pool)/len(afternoon_pool)) if afternoon_pool else None

    # Feels-like (AM/PM)
    morning_feels_pool = [it["main"]["feels_like"] for h in (8, 9, 10) for it in by_hour.get(h, []) if "main" in it and "feels_like" in it["main"]]
    afternoon_feels_pool = [it["main"]["feels_like"] for h in (14, 15, 16) for it in by_hour.get(h, []) if "main" in it and "feels_like" in it["main"]]
    feels_like_morning = round(sum(morning_feels_pool)/len(morning_feels_pool)) if morning_feels_pool else None
    feels_like_afternoon = round(sum(afternoon_feels_pool)/len(afternoon_feels_pool)) if afternoon_feels_pool else None

    # Wind (mph)
    wind_speeds = [it.get("wind", {}).get("speed") for _, it in slices if it.get("wind")]
    wind_speeds = [w for w in wind_speeds if isinstance(w, (int, float))]
    wind_gusts = [it.get("wind", {}).get("gust") for _, it in slices if it.get("wind") and "gust" in it["wind"]]
    wind_gusts = [g for g in wind_gusts if isinstance(g, (int, float))]
    wind_avg = round(sum(wind_speeds)/len(wind_speeds), 1) if wind_speeds else None
    wind_gust_max = round(max(wind_gusts), 1) if wind_gusts else None

    high_f = round(max(highs or temps or [None]) if (highs or temps) else None) if (highs or temps) else None
    low_f  = round(min(lows  or temps or [None]) if (lows  or temps) else None) if (lows or temps) else None
    precip_chance = int(round(100 * max(pops))) if pops else 0
    common_desc = (Counter(descs).most_common(1)[0][0] if descs else "weather data unavailable")

    return {
        "location": city_name,
        "date_local": tomorrow_local_date.isoformat(),  # YYYY-MM-DD (city local)
        "high_f": high_f,
        "low_f": low_f,
        "description": common_desc,
        "precipitation_chance_percent": precip_chance,
        "rain_expected": rain_any,
        "morning_temp_f": morning_temp,
        "afternoon_temp_f": afternoon_temp,
        "feels_like_morning_f": feels_like_morning,
        "feels_like_afternoon_f": feels_like_afternoon,
        "wind_avg_mph": wind_avg,
        "wind_gust_max_mph": wind_gust_max
    }

def build_few_shot_messages(context):
    system = {
        "role": "system",
        "content": (
            "You are a helpful, concise assistant for parents and school-aged kids. "
            "Always return a single JSON object ONLY (no prose) matching the schema:\n"
            "{\n"
            '  "date": "YYYY-MM-DD",\n'
            '  "location": "string",\n'
            '  "weather_summary": {\n'
            '    "description": "string",\n'
            '    "summary": "friendly 1-2 sentence description for kids",\n'
            '    "high_f": number,\n'
            '    "low_f": number,\n'
            '    "precipitation_chance_percent": number,\n'
            '    "feels_like_morning_f": number|null,\n'
            '    "feels_like_afternoon_f": number|null,\n'
            '    "wind_avg_mph": number|null,\n'
            '    "wind_gust_max_mph": number|null\n'
            "  },\n"
            '  "clothing_advice": {\n'
            '    "tops": "string",\n'
            '    "bottoms": "string",\n'
            '    "outerwear": "string",\n'
            '    "footwear": "string",\n'
            '    "accessories": "string",\n'
            '    "bring_umbrella": true/false,\n'
            '    "notes": "string"\n'
            "  },\n"
            '  "fact_of_the_day": {\n'
            '    "text": "1 short, kid-friendly fact",\n'
            '    "source": "short source name or URL"\n'
            "  }\n"
            "}\n"
            "The 'summary' should be a friendly, easy-to-understand description that kids can relate to, "
            "like 'It'll be a nice sunny day perfect for playing outside!' or 'A bit chilly and rainy, so great for cozy indoor activities.' "
            "Base advice on both actual temps and feels-like; adjust layers for wind (windbreaker if breezy). "
            "If rain_expected is true, set bring_umbrella=true and mention it briefly in notes."
        )
    }

    # Example 1 (clear)
    user_ex1 = {
        "role": "user",
        "content": json.dumps({
            "location": "Maplewood",
            "date_local": "2025-09-18",
            "high_f": 72,
            "low_f": 55,
            "description": "partly cloudy",
            "precipitation_chance_percent": 10,
            "rain_expected": False,
            "morning_temp_f": 57,
            "afternoon_temp_f": 70,
            "feels_like_morning_f": 56,
            "feels_like_afternoon_f": 71,
            "wind_avg_mph": 7.5,
            "wind_gust_max_mph": None
        })
    }
    assistant_ex1 = {
        "role": "assistant",
        "content": json.dumps({
            "date": "2025-09-18",
            "location": "Maplewood",
            "weather_summary": {
                "description": "Partly cloudy",
                "summary": "It'll be a lovely day with some puffy clouds in the sky! Perfect weather for outdoor fun.",
                "high_f": 72,
                "low_f": 55,
                "precipitation_chance_percent": 10,
                "feels_like_morning_f": 56,
                "feels_like_afternoon_f": 71,
                "wind_avg_mph": 7.5,
                "wind_gust_max_mph": None
            },
            "clothing_advice": {
                "tops": "Short-sleeve tee with a light layer",
                "bottoms": "Jeans or comfy joggers",
                "outerwear": "Light hoodie for the cool morning",
                "footwear": "Sneakers",
                "accessories": "Small water bottle",
                "bring_umbrella": False,
                "notes": "Morning feels cooler (~56°F). A light layer helps; gentle breeze."
            },
            "fact_of_the_day": {
                "text": "Honey never spoils—archaeologists found honey in ancient tombs still edible!",
                "source": "Smithsonian"
            }
        })
    }

    # Example 2 (rain/breeze)
    user_ex2 = {
        "role": "user",
        "content": json.dumps({
            "location": "Brooklyn",
            "date_local": "2025-04-03",
            "high_f": 61,
            "low_f": 49,
            "description": "light rain",
            "precipitation_chance_percent": 80,
            "rain_expected": True,
            "morning_temp_f": 51,
            "afternoon_temp_f": 59,
            "feels_like_morning_f": 50,
            "feels_like_afternoon_f": 58,
            "wind_avg_mph": 14.2,
            "wind_gust_max_mph": 25.0
        })
    }
    assistant_ex2 = {
        "role": "assistant",
        "content": json.dumps({
            "date": "2025-04-03",
            "location": "Brooklyn",
            "weather_summary": {
                "description": "Light rain",
                "summary": "A rainy day with some wind - perfect for splashing in puddles or cozy indoor activities!",
                "high_f": 61,
                "low_f": 49,
                "precipitation_chance_percent": 80,
                "feels_like_morning_f": 50,
                "feels_like_afternoon_f": 58,
                "wind_avg_mph": 14.2,
                "wind_gust_max_mph": 25.0
            },
            "clothing_advice": {
                "tops": "Long-sleeve shirt",
                "bottoms": "Jeans or pants",
                "outerwear": "Water-resistant jacket or light raincoat",
                "footwear": "Waterproof shoes or boots",
                "accessories": "Rain hat if available",
                "bring_umbrella": True,
                "notes": "Gusts up to ~25 mph—use a hooded jacket or sturdy umbrella; pack dry socks."
            },
            "fact_of_the_day": {
                "text": "A group of flamingos is called a flamboyance.",
                "source": "Audubon"
            }
        })
    }

    current = {"role": "user", "content": json.dumps(context)}
    return [system, user_ex1, assistant_ex1, user_ex2, assistant_ex2, current]

@functions_framework.http
def hello_http(request):
    # CORS preflight
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '1800'
        }
        return ('', 204, headers)

    headers = {'Access-Control-Allow-Origin': '*'}
    weather_api_key = os.environ.get('WEATHER_API_KEY')
    api_key = os.environ.get('API_KEY')

    # lat/lon required
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not (lat and lon):
        return (json.dumps({"error": "lat and lon are required"}), 400, headers)

    # Weather fetch
    weather_url = (
        f"https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={lat}&lon={lon}&appid={weather_api_key}&units=imperial"
    )
    try:
        weather_response = requests.get(weather_url, timeout=10)
        weather_response.raise_for_status()
        weatherData = weather_response.json()
    except requests.exceptions.RequestException as e:
        return (json.dumps({"error": f"Weather API error: {str(e)}"}), 502, headers)

    # Summarize tomorrow
    ctx = summarize_tomorrow(weatherData)

    # OpenAI Chat Completions call
    openAiUrl = 'https://api.openai.com/v1/chat/completions'
    oa_headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    data = {
        'model': 'gpt-4o-mini',
        'messages': build_few_shot_messages(ctx),
        'temperature': 0.6,
        'max_tokens': 600,
        'n': 1,
        # Uncomment if your account supports JSON mode for even stricter output:
        # 'response_format': {'type': 'json_object'}
    }

    try:
        openAiresponse = requests.post(openAiUrl, headers=oa_headers, data=json.dumps(data), timeout=20)
        openAiresponse.raise_for_status()
        open_ai_data = openAiresponse.json()
        raw = open_ai_data['choices'][0]['message']['content'].strip()

        # Ensure valid JSON (the prompt enforces JSON-only)
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"unparsed_model_output": raw}

        return (json.dumps(payload), 200, headers)
    except requests.exceptions.RequestException as e:
        return (json.dumps({"error": f"OpenAI API error: {str(e)}"}), 502, headers)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        return (json.dumps({"error": f"Parsing error: {str(e)}"}), 500, headers)
