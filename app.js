async function getWeatherAndFunFact() {
    #const apiKey = '';
    #const weatherApiKey = '';
    const apiKey = process.env.apiKey;
    const apiKey = process.env.weatherApiKey; 

// ... use apiKey ...
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Fetch weather data
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=imperial`);
            const weatherData = await weatherResponse.json();
            const tomorrowWeather = weatherData.list[8]; // Assuming 3-hour intervals, 8th index is 24 hours from now

            const weatherDescription = tomorrowWeather.weather[0].description;
            const temperature = tomorrowWeather.main.temp;

            // Fetch clothing advice 
            const openAiWeatherResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant.'
                        },
                        {
                            role: 'user',
                            content: `Based on the following weather forecast for tomorrow: ${weatherDescription} with a temperature of ${temperature}°F, what clothing advice would you give to a school age child? Make sure to remind them to bring an umbrella if there's rain in the forecast.`
                        }
                    ],
                    max_tokens: 150
                })
            });
            const openAiWeatherData = await openAiWeatherResponse.json();
            const responseText = openAiWeatherData.choices[0].message.content.trim();

            // Display the advice
            const adviceElement = document.getElementById('advice');
            adviceElement.innerText = responseText; // Set the full response text
            adviceElement.style.display = 'block';
        });


    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

document.getElementById('getAdviceButton').addEventListener('click', () => {
    document.getElementById('advice').style.display = 'none';
    getWeatherAndFunFact();
});
