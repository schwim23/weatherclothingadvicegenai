# Kids Weather Clothing Advice App

A web application that provides child-friendly weather summaries and clothing recommendations using AI. Built with vanilla JavaScript, Python (Google Cloud Functions), and OpenAI's GPT-4.

## Features

- **Child-friendly weather summaries** - Engaging descriptions kids can understand
- **Detailed clothing recommendations** - Specific advice for tops, bottoms, outerwear, footwear, and accessories
- **Location-based forecasts** - Uses browser geolocation for accurate local weather
- **Interactive UI** - Clean, responsive design with umbrella recommendations
- **Fun facts** - Daily educational facts to keep kids engaged

## Architecture

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Google Cloud Function (Python)
- **APIs**: OpenWeatherMap API, OpenAI GPT-4 API
- **Deployment**: Static hosting for frontend, Google Cloud Function for backend

## Setup Instructions

### Prerequisites

- Google Cloud Platform account
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))
- OpenAI API key (from [platform.openai.com](https://platform.openai.com))
- Google Cloud CLI installed locally

### 1. Clone the Repository

```bash
git clone https://github.com/schwim23/weatherclothingadvicegenai.git
cd weatherclothingadvicegenai
```

### 2. Set Up Google Cloud Function

#### Install Dependencies

Create a `requirements.txt` file:

```txt
functions-framework==3.*
requests==2.*
```

#### Deploy the Cloud Function

1. **Set up Google Cloud CLI** (if not already done):
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Deploy the function**:
   ```bash
   gcloud functions deploy getweather \
     --runtime python311 \
     --trigger-http \
     --allow-unauthenticated \
     --set-env-vars WEATHER_API_KEY=your_openweather_api_key,API_KEY=your_openai_api_key \
     --source . \
     --entry-point hello_http
   ```

3. **Note the deployed URL** - it will look like:
   ```
   https://getweather-123456789.us-central1.run.app
   ```

#### Alternative: Deploy via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/functions)
2. Click "Create Function"
3. Configure:
   - **Function name**: `getweather`
   - **Trigger**: HTTP
   - **Allow unauthenticated invocations**: Yes
   - **Runtime**: Python 3.11
4. Copy the cloud function code from `main.py`
5. Set environment variables:
   - `WEATHER_API_KEY`: Your OpenWeatherMap API key
   - `API_KEY`: Your OpenAI API key
6. Deploy

### 3. Configure Frontend

Update the Cloud Function URL in `app.js`:

```javascript
// Line ~49 in app.js
const url = `https://YOUR_CLOUD_FUNCTION_URL/?lat=${lat}&lon=${lon}`;
```

Replace `YOUR_CLOUD_FUNCTION_URL` with the URL from your deployed function.

### 4. Deploy Frontend

#### Option A: GitHub Pages (Recommended)

1. Push your code to GitHub
2. Go to your repository settings
3. Navigate to "Pages" section
4. Select source branch (usually `main`)
5. Your app will be available at `https://yourusername.github.io/weatherclothingadvicegenai`

#### Option B: Local Development

```bash
# Serve locally (Python)
python -m http.server 8000

# Or with Node.js
npx http-server

# Or any static file server
```

Access at `http://localhost:8000`

## API Keys Setup

### OpenWeatherMap API

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Get your free API key
3. Add to Cloud Function environment variables as `WEATHER_API_KEY`

### OpenAI API

1. Create account at [platform.openai.com](https://platform.openai.com)
2. Generate API key in your dashboard
3. Add to Cloud Function environment variables as `API_KEY`

## File Structure

```
weatherclothingadvicegenai/
├── index.html          # Main HTML file
├── app.js             # Frontend JavaScript
├── styles.css         # Styling
├── main.py            # Cloud Function code
├── requirements.txt   # Python dependencies
├── README.md          # This file
└── weather.jpg        # Favicon (optional)
```

## Cloud Function Response Format

The Cloud Function returns JSON in this format:

```json
{
  "date": "2025-09-18",
  "location": "Westfield",
  "weather_summary": {
    "description": "Overcast clouds",
    "summary": "It'll be a cloudy day, but warm enough for outdoor adventures!",
    "high_f": 80,
    "low_f": 64,
    "precipitation_chance_percent": 20,
    "feels_like_morning_f": 65,
    "feels_like_afternoon_f": 79,
    "wind_avg_mph": 3.5,
    "wind_gust_max_mph": 12.5
  },
  "clothing_advice": {
    "tops": "Short-sleeve shirt or light tee",
    "bottoms": "Shorts or light pants",
    "outerwear": "Light jacket for the morning",
    "footwear": "Sneakers or comfortable shoes",
    "accessories": "Sunglasses just in case",
    "bring_umbrella": true,
    "notes": "A slight chance of rain, so having an umbrella handy is a good idea!"
  },
  "fact_of_the_day": {
    "text": "Octopuses have three hearts!",
    "source": "National Geographic"
  }
}
```

## Customization

### Modify AI Prompts

Edit the `build_few_shot_messages()` function in `main.py` to customize:
- Clothing recommendation style
- Fact categories
- Summary tone and language

### Styling

Modify `styles.css` to change:
- Color scheme
- Typography
- Layout and spacing
- Mobile responsiveness

### Weather Data

The app uses OpenWeatherMap's 5-day forecast API. Modify `summarize_tomorrow()` in `main.py` to:
- Change forecast timeframe
- Add new weather parameters
- Adjust temperature units

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Cloud Function has proper CORS headers
2. **API Key Issues**: Check environment variables are set correctly
3. **Geolocation Blocked**: Use HTTPS or allow location permissions
4. **Function Timeout**: Increase timeout in Cloud Function settings

### Debug Mode

Add console logging to see API responses:

```javascript
// In app.js, after data parsing
console.log('API Response:', data);
```

### Testing Cloud Function Locally

```bash
# Install Functions Framework
pip install functions-framework

# Set environment variables
export WEATHER_API_KEY=your_key
export API_KEY=your_openai_key

# Run locally
functions-framework --target=hello_http --debug
```

Test at `http://localhost:8080?lat=40.7128&lon=-74.0060`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Cost Considerations

- **OpenWeatherMap**: Free tier includes 1,000 calls/day
- **OpenAI**: GPT-4 costs ~$0.01-0.03 per request
- **Google Cloud Functions**: Free tier includes 2 million invocations/month
- **Hosting**: GitHub Pages is free

Estimated cost for moderate usage: $5-20/month

## Support

For issues or questions:
- Open a GitHub issue
- Check the troubleshooting section
- Review Cloud Function logs in Google Cloud Console
