// Link to USGS earthquake data (All Earthquakes from the past 7 Days)
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Execute a query to the URL and console log the data
d3.json(url).then(function (data) {
    console.log(data);
    // Send the data.features response object to the createAttributes functin
    createAttributes(data.features);
});

// Create the functions for the characteristics of the objects to be displayed on the map
// Function for marker size (based on earthequake magnitude)
function markerSize(magnitude) {
    return magnitude * 2000;
};

// Funtion for marker color (based on earthquake depth)
function markerColor(depth) {
    if (depth >= 90) {
        color = "#ff0000";
    }
    else if (depth < 90 && depth >= 70) {
        color = "#ff5500";
    }
    else if (depth < 70 && depth >= 50) {
        color = "#ffaa00";
    }
    else if (depth < 50 && depth >= 30) {
        color = "#ffd500";
    }
    else if (depth < 30 && depth >= 10) {
        color = "#15ea00";
    }
    else if (depth < 10 && depth >= -10) {
        color = "#00ff00";
    };

    return color;
};

function createAttributes(earthquakeData) {

    // Function for defining what information to display in the pop up when each feature is clicked
    function OnMouseClick(feature, layer) {
        layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: {feature.geometry.coordinates[2]}`);
    }

    // Create a GeoJSON layer that contains the features (location, magnitude, depth) for each earthquakeData object.
    var earthquakes = L.geoJSON(earthquakeData, {
        OnMouseClick : OnMouseClick,

        // pointToLayer function
        pointToLayer : function(feature, latlng) {

            // Set up marker attributes based on magnitude (marker size) and depth (marker color)
            var markers = {
                radius : markerSize(feature.properties.mag),
                fillcolor : markerColor(feature.geometry.coordinates[2]),
                fillOpacity : 0.5
                color : "black",
                stroke : true,
                weight : 0.5
            }
            return L.circle(latlng, markers);
        }
    });

    // Send the earthquakes GeoJSON layer to a function for creating the map
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create tile layer
    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    style:    'mapbox/light-v11',
    access_token: api_key
  });

  // Create the map by displaying both the "earthquakes" (GeoJSON layer) and the "grayscale" (tile layer) simultaneously
  var myMap = L.map("map", {
    center: [37.6000, -95.6650],
    zoom: 10,
    layers: [grayscale, earthquakes]
  });

  // Add a legend
  var legend = L.control({position : bottomright});
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
    depth = [-10, 10, 30, 50, 70, 90];

    // Looping through our intervals and generating a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};
legend.addTo(myMap);
};