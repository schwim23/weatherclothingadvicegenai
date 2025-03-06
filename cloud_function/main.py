import functions_framework
import os
import requests
import json

@functions_framework.http
def hello_http(request):

     # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type (this is a demo app- not a production app)
        # header and caches preflight response for an 1800 seconds
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '1800'
        }

        return ('', 204, headers) #204 no content

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    #get api keys from envioronment variables
    weather_api_key = os.environ.get('WEATHER_API_KEY')
    api_key=os.environ.get('API_KEY')

    #get lat/lon values from query string
    lat=request.args.get('lat')
    lon=request.args.get('lon')

    #construct weather api call
    weather_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={weather_api_key}&units=imperial"
        
    #get weather from openweather 
    weather_response = requests.get(weather_url)
    weatherData=weather_response.json()

    #parse weather to get tomorrow's weather
    tomorrowWeather=weatherData["list"][8] #assuming 3-hour intervals, 8th index is 24 hours 
    weatherDescription = tomorrowWeather["weather"][0]["description"]
    temperature = tomorrowWeather["main"]["temp"]

    #construct url for openai api post request including the prompt
    openAiUrl = 'https://api.openai.com/v1/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    data = {
        'model': 'gpt-4o-mini',
        'messages': [
            {
                'role': 'system',
                'content': 'You are a helpful assistant.'
            },
            {
                'role': 'user',
                'content': f'Based on the following weather forecast for tomorrow: {weatherDescription} with a temperature of {temperature}°F, what clothing advice would you give to a school age child? Make sure to remind them to bring an umbrella if there\'s rain in the forecast.'
            }
        ],
        'max_tokens': 1000
    }
    
    #make request to open ai api and return response (or error) to client
    try:
        openAiresponse = requests.post(openAiUrl, headers=headers, data=json.dumps(data))
        openAiresponse.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        open_ai_data = openAiresponse.json()
        response_text = open_ai_data['choices'][0]['message']['content'].strip()
        # Set CORS headers for the main request
        headers = {
        'Access-Control-Allow-Origin': '*'
    }
        return (response_text, 200, headers)
    except requests.exceptions.RequestException as e:
        print(f"Error making OpenAI API request: {e}")
        return None
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        print(f"Error parsing OpenAI API response: {e}")
        return None
