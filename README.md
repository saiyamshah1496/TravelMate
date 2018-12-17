# TravelMate
The distributed systems application “Travel-Mate” intends to provide an enriched user experience to travellers. The users, when input the source and destination location will get the entire details of the route, along with the weather conditions at the source, destination and various other intermediary stations along with other important information. 
Getting Started
Copy the folder at an appropriate position
Enter your google maps API key and Dark Sky Weather API key in the url placeholders
Prerequisites- System 
Install the following softwares before deployment 
1. Node.JS
2. MongoDB
3. Robomongo
Deploying- Steps
1. Navigate to the folder where the project is copied
2. Run the following command in the Node.js Command Prompt
npm install
This will install all the required dependencies if not present in the folder
3. Run the following command
node server.js
This will get the server running and you will get a message
"Server is up and running on port 8000"
4. Go to any browser and type the following
localhost:8000
You will see the website up and running 
Running the tests
Enter any origin and destination (Buffalo to New York)
You will get a route with multiple markers, displayed on the map, which on clicking give the weather details
Built With
Node.js - Server
HTML, Javascript- Front end website
Google Maps API- call for the directions
Dark Sky Weather API, OpenWeather API- for the weather
Atom - IDE used for deployment
Versioning
We use Version1, See Phase 2 for Version 2
Authors
Saiyam Pravinchandra Shah - saiyampr@buffalo.edu
Acknowledgments
Google Maps API - Documentation
DarkSky Weather API- Documentation
OpenWether API- Documentation
Structure
Phase1
- views	
	- Page.ejs
	- skycons.js
	- Weather.ejs
- directions.js
- package.json
- server.js
Readme.rtf

 

 
