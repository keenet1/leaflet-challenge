// Links to USGS earthquake data (All Earthquakes from the past 7 Days) and tectonic plate data
var earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicplatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Execute a query to the earthquake data URL and console log the data
d3.json(earthquakesUrl).then(function (data) {
    console.log(data);
    // Send the data.features response object to the createAttributes function
    createAttributes(data.features);
});

// Create the functions for the characteristics of the objects to be displayed on the map
// Function for marker size (based on earthequake magnitude)
function markerSize(magnitude) {
    return magnitude * 5000;
};

// Funtion for marker color (based on earthquake depth)
function markerColor(depth) {
    return depth >=90 ? "#FF0D0D" :
        depth < 90 && depth >= 70 ? "#FF4E11" :
        depth < 70 && depth >= 50 ? "#FF8E15" :
        depth < 50 && depth >= 30 ? "#FFB92E" :
        depth < 30 && depth >= 10 ? "#ACB334" :
                                    "#69B34C";
}

function createAttributes(earthquakeData) {

    // Function for defining what information to display in the pop up when each feature is clicked
    function onEachFeature(feature, layer) {
        layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
    }

    // Create a GeoJSON layer that contains the features (location, magnitude, depth) for each earthquakeData object.
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature : onEachFeature,

        // pointToLayer function
        pointToLayer : function(feature, latlng) {

            // Set up marker attributes based on magnitude (marker size) and depth (marker color)
            var markers = {
                radius : markerSize(feature.properties.mag),
                fillColor : markerColor(feature.geometry.coordinates[2]),
                fillOpacity : 0.8,
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

    // Create tile layers
    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        style: "mapbox/light-v11",
        access_token: api_key
    });

    var geoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors'
    })

    var satelliteLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
        id: "mapbox.satellite",
        accessToken: api_key
    });

    // Create tectonic plates layer
    tectonicPlates = new L.layerGroup();

        // Execute a query to the tectonic plates URL and console log the data
        d3.json(tectonicplatesUrl).then(function (plates) {
            console.log(plates);
            L.geoJSON(plates, {
                color: "rgb(255, 94, 0)",
                weight: 2
            }).addTo(tectonicPlates);
        });

        // Base layers (tile layers)
        var baseLayers = {
            "Grayscale" : grayscale,
            "Geography" : geoLayer,
            "Satellite" : satelliteLayer
        };

        // Overlay object layers
        var overlayMaps = {
            "Earthquakes" : earthquakes,
            "Tectonic Plates" : tectonicPlates
        };

    // Create the initial map that the user will see by displaying the "grayscale" background tile layer along with the "earthquakes" and "tectonicPlates" overlays
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [grayscale, earthquakes, tectonicPlates]
    });

    // Add a legend
    var legend = L.control({position : 'bottomright'});

    legend.onAdd = () => {
        var div = L.DomUtil.create('div', 'info legend');
        depth = [-10, 10, 30, 50, 70, 90];

        // Looping through our intervals and generating a label with a colored square for each interval
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

    // Layer control
    L.control.layers(baseLayers, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
};