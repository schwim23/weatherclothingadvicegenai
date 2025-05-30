# Weather Clothing Advice Gen AI App
This app provides clothing advice based on the local weather for school age children. The UI is responsive design to work across different screen sizes. 
The architecture is:
1. Simple HTML/JS/CSS front end to display/render data (hosted on Github pages: https://schwim23.github.io/weatherclothingadvicegenai/)
2. JS fetch API is used to make a request to a GCP Cloud Function
3. GCP Cloud Function handles all of the Geolocation request logic, OpenWeather API Calls and Gen AI prompting/requests to OpenAI and returns the OpenAI API response to the browser

Cloud Function code is in the Cloud Function folder
