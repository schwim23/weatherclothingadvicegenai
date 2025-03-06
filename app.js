async function getWeatherAdvice() {
    // Get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
	
            // Fetch weather advice from Cloud Function

// Get  div element to display Weather clothing advice by  ID 
const myAdvice = document.getElementById('advice'); 
		
// Define the URL to GCP Cloud Function "middleware" to fetch data from 
const url = `https://getweather-151599888657.us-central1.run.app/?lat=${lat}&lon=${lon}`;
		
// Use the JS fetch API to get data 
fetch(url) .then(response => { 
	// Check if the request was successful (status code 200) 
	if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); } 
	// Parse the text response 
	return response.text(); }) 
	.then(data => { 
	// Update the div's inner text with the fetched data 
	myAdvice.innerText = data;  
	myAdvice.style.display = 'block'; // Make the div visible
	
	}) .catch(error => { 
	// Handle errors that occurred during the fetch or processing 
	myAdvice.innerText = 'Error fetching data: ' + error; });
		
	});
	    
    } else {
	//alert if Geo Location can't be supported or user declines    
        alert('Geolocation is not supported by this browser.');
    }
}

//listen for button click and initiate getWeatherAdvice when clicked
document.getElementById('getAdviceButton').addEventListener('click', () => {
getWeatherAdvice();
});
