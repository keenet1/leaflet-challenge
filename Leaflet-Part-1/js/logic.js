// Store the API endpoint (query) URL
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Execute a GET request to the endpoint URL
d3.json(queryUrl).then(function (data))