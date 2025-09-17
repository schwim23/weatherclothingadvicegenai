async function getWeatherAdvice() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Grab elements by ID
            const myAdvice = document.getElementById('advice');
            const myWeather = document.getElementById('weather');
            const myDate = document.getElementById('date');
            const myLocation = document.getElementById('location');
            const myFact = document.getElementById('fact');
            const myFactSource = document.getElementById('factSource');
            const umbrellaBadge = document.getElementById('umbrella');

            // Cloud Function endpoint (replace if different)
            const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const contentType = response.headers.get('content-type') || '';
                let data;
                if (contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    // fallback if function returns plain text
                    const text = await response.text();
                    myAdvice.innerText = text;
                    myAdvice.style.display = 'block';
                    return;
                }

                if (data.error) {
                    myAdvice.innerText = 'Error: ' + data.error;
                    myAdvice.style.display = 'block';
                    return;
                }

                // --- Weather summary ---
                const ws = data.weather_summary || {};
                const parts = [];
                if (ws.description) parts.push(ws.description);
                if (typeof ws.high_f === 'number' && typeof ws.low_f === 'number') {
                    parts.push(`High/Low: ${ws.high_f}°F / ${ws.low_f}°F`);
                }
                if (typeof ws.precipitation_chance_percent === 'number') {
                    parts.push(`Precip: ${ws.precipitation_chance_percent}%`);
                }
                if (typeof ws.feels_like_morning_f === 'number' || typeof ws.feels_like_afternoon_f === 'number') {
                    const morn = (typeof ws.feels_like_morning_f === 'number') ? `${ws.feels_like_morning_f}°F` : '—';
                    const aft = (typeof ws.feels_like_afternoon_f === 'number') ? `${ws.feels_like_afternoon_f}°F` : '—';
                    parts.push(`Feels-like (AM/PM): ${morn} / ${aft}`);
                }
                if (typeof ws.wind_avg_mph === 'number') {
                    const wind = `${ws.wind_avg_mph} mph`;
                    const gust = (typeof ws.wind_gust_max_mph === 'number') ? ` (gusts ~${ws.wind_gust_max_mph} mph)` : '';
                    parts.push(`Wind: ${wind}${gust}`);
                }
                myWeather.innerText = parts.join(' | ');

                // --- Date/location ---
                myDate.innerText = data.date || '';
                myLocation.innerText = data.location || '';

                // --- Clothing advice ---
                const ca = data.clothing_advice || {};
                myAdvice.innerHTML = `
                    <strong>Tops:</strong> ${ca.tops || '-'}<br/>
                    <strong>Bottoms:</strong> ${ca.bottoms || '-'}<br/>
                    <strong>Outerwear:</strong> ${ca.outerwear || '-'}<br/>
                    <strong>Footwear:</strong> ${ca.footwear || '-'}<br/>
                    <strong>Accessories:</strong> ${ca.accessories || '-'}<br/>
                    <strong>Notes:</strong> ${ca.notes || '-'}
                `;
                myAdvice.style.display = 'block';

                // --- Umbrella badge ---
                if (ca.bring_umbrella) {
                    umbrellaBadge.style.display = 'inline-block';
                } else {
                    umbrellaBadge.style.display = 'none';
                }

                // --- Fact of the day ---
                const fact = data.fact_of_the_day || {};
                myFact.innerText = fact.text || '';
                myFactSource.innerText = fact.source ? `Source: ${fact.source}` : '';

            } catch (error) {
                myAdvice.innerText = 'Error fetching data: ' + error;
                myAdvice.style.display = 'block';
            }
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Listen for button click
document.getElementById('getAdviceButton').addEventListener('click', () => {
    getWeatherAdvice();
});
