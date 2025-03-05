async function getWeatherAdvice() {
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

		/**
            // Fetch weather advice from Cloud Function
           	const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;
		const response = await fetch(url);
		   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    
const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;		
fetch(url, {
  method: 'GET',
  mode: 'cors',
			headers: {
    'Content-Type': 'application/json',
  },
})
//.then(response => response.json())
.then(response => console.log(response))
.catch(error => console.error('Error:', error));
		//const rawText = data; // Get the response
		//const responseText = rawText.choices[0].message.content.trim();

		//alert (responseText);
	        //const openAiWeatherData = await response.json();
	        //const responseText = respnse.choices[0].message.content.trim();
            // Display the advice
            //document.getElementById('advice').innerText = responseText;
            document.getElementById('advice').visibility = 'visible';
        });
*/

function httpRequest(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(null, xhr.responseText); // Success
      } else {
        callback('Request failed with status: ' + xhr.status); // Error
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
}
const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;		

httpRequest('url', function(error, data) {
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
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
