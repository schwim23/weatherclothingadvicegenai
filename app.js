async function getWeatherAdvice() {
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
	
            // Fetch weather advice from Cloud Function

// Get the div element by its ID 
const myAdvice = document.getElementById('advice'); 
// Define the URL to fetch data from 
const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;
// Use the fetch API to get data 
fetch(url) .then(response => { 
// Check if the request was successful (status code 200) 
if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); } 
// Parse the JSON response 
return response.json(); }) 
.then(data => { 
// Update the div's inner text with the fetched data 
// Assuming the data is a string or can be converted to a string 
myAdvice.innerText = data.message; // Replace 'message' with the actual key 
}) .catch(error => { 
// Handle errors that occurred during the fetch or processing 
myAdvice.innerText = 'Error fetching data: ' + error; });


/*		
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
    document.getElementById('advice').innerText = response.json();  
    document.getElementById('advice').style.visibility = 'visible';  })
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

  */
		
			});

  
	    
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
