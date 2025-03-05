async function getWeatherAdvice() {
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Fetch weather advice from Cloud Function
            const getAIWeatherAdvice = await fetch(`https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`, {
		    mode: 'no-cors',
	    });
	        const openAiWeatherData = await getAIWeatherAdvice.json();
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
document.getElementById('advice').style.display = 'block';
getWeatherAdvice();
});
