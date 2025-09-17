async function getWeatherAdvice() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Grab elements (may be null if HTML wasn't updated yet)
        const el = (id) => document.getElementById(id);
        const summarySection = el('summary');
        const adviceSection = el('adviceSection');
        const factSection = el('factSection');
        const myAdvice = el('advice');
        const myWeather = el('weather');
        const myDate = el('date');
        const myLocation = el('location');
        const myFact = el('fact');
        const myFactSource = el('factSource');
        const umbrellaBadge = el('umbrella');
        const errorBox = el('error');

        // Helper to safely set text/HTML if element exists
        const setText = (node, text) => {
            if (node) node.textContent = text ?? '';
        };
        const setHTML = (node, html) => {
            if (node) node.innerHTML = html ?? '';
        };
        const show = (node, on) => {
            if (node) node.style.display = on ? 'block' : 'none';
        };
        const showInline = (node, on) => {
            if (node) node.style.display = on ? 'inline-block' : 'none';
        };

        // Hide all sections/errors initially
        show(summarySection, false);
        show(adviceSection, false);
        show(factSection, false);
        show(errorBox, false);
        setHTML(myAdvice, '');
        setText(myWeather, '');
        setText(myDate, '');
        setText(myLocation, '');
        setText(myFact, '');
        setText(myFactSource, '');
        showInline(umbrellaBadge, false);

        // Cloud Function URL (your current one)
        const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;

        try {
            const res = await fetch(url);
            const raw = await res.text();
            
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw || 'Request failed'}`);

            // Try to parse JSON regardless of headers
            let data;
            try {
                data = JSON.parse(raw);
            } catch {
                console.warn('Response was not valid JSON, rendering as plain text.');
                // Fallback: render raw text into #advice if present
                if (myAdvice) {
                    setText(myAdvice, raw || 'No advice returned.');
                    show(adviceSection || myAdvice, true);
                }
                return;
            }

            // If backend sent an error payload
            if (data && data.error) throw new Error(data.error);

            // ---- Render structured payload ----
            const ws = data.weather_summary || {};
            const ca = data.clothing_advice || {};
            const fact = data.fact_of_the_day || {};
            
            // Debug: Log the weather summary object
            console.log('Weather summary object:', ws);
            console.log('Summary field:', ws.summary);

            // Build technical details first
            const technicalParts = [];
            if (ws.description) technicalParts.push(ws.description);
            if (typeof ws.high_f === 'number' && typeof ws.low_f === 'number') {
                technicalParts.push(`High/Low: ${ws.high_f}°F / ${ws.low_f}°F`);
            }
            if (typeof ws.precipitation_chance_percent === 'number') {
                technicalParts.push(`Precip: ${ws.precipitation_chance_percent}%`);
            }
            if (typeof ws.feels_like_morning_f === 'number' || typeof ws.feels_like_afternoon_f === 'number') {
                const morn = (typeof ws.feels_like_morning_f === 'number') ? `${ws.feels_like_morning_f}°F` : '—';
                const aft = (typeof ws.feels_like_afternoon_f === 'number') ? `${ws.feels_like_afternoon_f}°F` : '—';
                technicalParts.push(`Feels-like (AM/PM): ${morn} / ${aft}`);
            }
            if (typeof ws.wind_avg_mph === 'number') {
                const wind = `${ws.wind_avg_mph} mph`;
                const gust = (typeof ws.wind_gust_max_mph === 'number') ? ` (gusts ~${ws.wind_gust_max_mph} mph)` : '';
                technicalParts.push(`Wind: ${wind}${gust}`);
            }

            // Create formatted weather display
            let weatherDisplay = '';
            console.log('Checking summary:', ws.summary, 'Type:', typeof ws.summary);
            
            if (ws.summary && ws.summary.trim() !== '') {
                // If we have a summary, format it nicely
                console.log('Adding summary to display');
                weatherDisplay = `<div style="font-style: italic; color: #007BFF; margin-bottom: 10px; font-size: 16px; font-weight: 500;">📖 ${ws.summary}</div>`;
                
                // Add technical details in smaller text
                if (technicalParts.length > 0) {
                    weatherDisplay += `<div style="font-size: 14px; color: #333;">${technicalParts.join(' | ')}</div>`;
                }
            } else {
                // Fallback to original format if no summary
                console.log('No summary found, using technical details only');
                weatherDisplay = technicalParts.join(' | ');
            }
            
            console.log('Final weather display HTML:', weatherDisplay);
            setHTML(myWeather, weatherDisplay);
            setText(myDate, data.date || '');
            setText(myLocation, data.location || '');

            // Clothing advice (formatted)
            setHTML(myAdvice, `
                <strong>Tops:</strong> ${ca.tops || '-'}<br/>
                <strong>Bottoms:</strong> ${ca.bottoms || '-'}<br/>
                <strong>Outerwear:</strong> ${ca.outerwear || '-'}<br/>
                <strong>Footwear:</strong> ${ca.footwear || '-'}<br/>
                <strong>Accessories:</strong> ${ca.accessories || '-'}<br/>
                <strong>Notes:</strong> ${ca.notes || '-'}
            `);

            // Umbrella badge
            showInline(umbrellaBadge, !!ca.bring_umbrella);

            // Fact of the day
            setText(myFact, fact.text || '');
            setText(myFactSource, fact.source ? `Source: ${fact.source}` : '');

            // Show sections only if content exists
            if ((myDate && myDate.textContent) || (myLocation && myLocation.textContent) || (myWeather && myWeather.innerHTML.trim() !== '')) {
                show(summarySection, true);
            }
            if (myAdvice && myAdvice.innerHTML.trim() !== '') {
                show(adviceSection, true);
            }
            if ((myFact && myFact.textContent.trim() !== '') || (myFactSource && myFactSource.textContent.trim() !== '')) {
                show(factSection, true);
            }

            // Log to help debug if something still doesn't show
            console.log('[weatherclothingadvice] Rendered payload:', data);

        } catch (e) {
            console.error('[weatherclothingadvice] Error:', e);
            if (errorBox) {
                errorBox.textContent = e.message || String(e);
                show(errorBox, true);
            } else if (myAdvice) {
                // Last resort: show error in the advice area
                setText(myAdvice, 'Error: ' + (e.message || String(e)));
                show(adviceSection || myAdvice, true);
            }
        }
    });
}

// Button click
document.getElementById('getAdviceButton').addEventListener('click', () => {
    getWeatherAdvice();
});
