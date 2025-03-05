async function getWeatherAdvice() {
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Fetch weather advice from Cloud Function
            const response = await fetch(`https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`, {
		    mode: 'no-cors',
	    });
	        //const openAiWeatherData = await response.json();
	        //const responseText = respnse.choices[0].message.content.trim();
            // Display the advice
            document.getElementById('advice').innerText = response;
            document.getElementById('advice').display = 'block';
        });


    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

document.getElementById('getAdviceButton').addEventListener('click', () => {
advicetext=getWeatherAdvice();
   // Display the advice
document.getElementById('advice').innerText = advicetext;
document.getElementById('advice').display = 'block';	
});
