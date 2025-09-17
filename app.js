async function getWeatherAdvice() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Grab elements
        const myAdvice = document.getElementById('advice');
        const myWeather = document.getElementById('weather');
        const myDate = document.getElementById('date');
        const myLocation = document.getElementById('location');
        const myFact = document.getElementById('fact');
        const myFactSource = document.getElementById('factSource');
        const umbrellaBadge = document.getElementById('umbrella');
        const errorBox = document.getElementById('error');

        // Sections (hide them until we have content)
        const summarySection = document.getElementById('summary');
        const adviceSection = document.getElementById('adviceSection');
        const factSection = document.getElementById('factSection');

        // Hide sections + error before fetching
        summarySection.style.display = 'none';
        adviceSection.style.display = 'none';
        factSection.style.display = 'none';
        errorBox.style.display = 'none';
        myAdvice.innerHTML = '';
        myWeather.textContent = '';
        myDate.textContent = '';
        myLocation.textContent = '';
        myFact.textContent = '';
        myFactSource.textContent = '';
        umbrellaBadge.style.display = 'none';

        // Cloud Function URL
        const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;

        try {
            const res = await fetch(url);

            // Read as text first, then try to parse JSON no matter what headers say
            const raw = await res.text();
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${raw || 'Request failed'}`);
            }

            let data;
            try {
                data = JSON.parse(raw);
            } catch {
                // Not JSON — treat as plain text fallback
                myAdvice.innerText = raw || 'No advice returned.';
                adviceSection.style.display = 'block';
                return;
            }

            if (data && data.error) {
                throw new Error(data.error);
            }

            // --- Structured payload ---
            const ws = data.weather_summary || {};
            const ca = data.clothing_advice || {};
            const fact = data.fact_of_the_day || {};

            // Weather summary text
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
                const aft  = (typeof ws.feels_like_afternoon_f === 'number') ? `${ws.feels_like_afternoon_f}°F` : '—';
                parts.push(`Feels-like (AM/PM): ${morn} / ${aft}`);
            }
            if (typeof ws.wind_avg_mph === 'number') {
                const wind = `${ws.wind_avg_mph} mph`;
                const gust = (typeof ws.wind_gust_max_mph === 'number') ? ` (gusts ~${ws.wind_gust_max_mph} mph)` : '';
                parts.push(`Wind: ${wind}${gust}`);
            }
            myWeather.innerText = parts.join(' | ');

            // Date/location
            myDate.innerText = data.date || '';
            myLocation.innerText = data.location || '';

            // Clothing advice (formatted HTML, not raw JSON)
            myAdvice.innerHTML = `
                <strong>Tops:</strong> ${ca.tops || '-'}<br/>
                <strong>Bottoms:</strong> ${ca.bottoms || '-'}<br/>
                <strong>Outerwear:</strong> ${ca.outerwear || '-'}<br/>
                <strong>Footwear:</strong> ${ca.footwear || '-'}<br/>
                <strong>Accessories:</strong> ${ca.accessories || '-'}<br/>
                <strong>Notes:</strong> ${ca.notes || '-'}
            `;

            // Umbrella badge
            if (ca.bring_umbrella) {
                umbrellaBadge.style.display = 'inline-block';
            } else {
                umbrellaBadge.style.display = 'none';
            }

            // Fact of the day
            myFact.innerText = fact.text || '';
            myFactSource.innerText = fact.source ? `Source: ${fact.source}` : '';

            // Show sections only if they have content
            if (myDate.innerText || myLocation.innerText || myWeather.innerText) {
                summarySection.style.display = 'block';
            }
            if (myAdvice.innerText.trim() !== '') {
                adviceSection.style.display = 'block';
            }
            if (myFact.innerText.trim() !== '' || myFactSource.innerText.trim() !== '') {
                factSection.style.display = 'block';
            }
        } catch (e) {
            errorBox.textContent = e.message || String(e);
            errorBox.style.display = 'block';
        }
    });
}

// Click handler
document.getElementById('getAdviceButton').addEventListener('click', () => {
    getWeatherAdvice();
});
