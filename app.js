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
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
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
    //   document.getElementById('advice').innerText = response.weather[0].description;
    // }
    document.getElementById('advice').style.visibility = 'visible';
  })
  .catch(error => {
    console.error('Error:', error);
  });
		
/*
const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;		
fetch(url, {
  method: 'GET',
  mode: 'cors',
			headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(response => console.log(response))
.catch(error => console.error('Error:', error));
		//const rawText = data; // Get the response
		//const responseText = rawText.choices[0].message.content.trim();

		//alert (responseText);
	        //const openAiWeatherData = await response.json();
	        //const responseText = respnse.choices[0].message.content.trim();
            // Display the advice
            //document.getElementById('advice').innerText = responseText;
		document.getElementById('advice').style.visibility = 'visible';        
	
	});
*/
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
