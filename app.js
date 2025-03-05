async function getWeatherAdvice() {
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
	
            // Fetch weather advice from Cloud Function

const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;

fetch(url, {
  method: 'GET',
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  },
})
  .then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(response => {
    console.log(response);
    // Adapt this part based on your API's response structure
    // Example:
    // if (response && response.weather && response.weather[0] && response.weather[0].description) {
    // document.getElementById('advice').innerText = response.weather[0].description;
    //
  })
  .catch(error => {
    console.error('Error:', error);
  });
		
			});

    document.getElementById('advice').innerText = response.json();  
    document.getElementById('advice').style.visibility = 'visible';
	    
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}




document.getElementById('getAdviceButton').addEventListener('click', () => {
getWeatherAdvice();
   // Display the advice
//document.getElementById('advice').innerText = advicetext;
//document.getElementById('advice').display = 'block';	
});
