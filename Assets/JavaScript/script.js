
var latitude = "";
var longitude = "";

// $(document).ready(function() {

//     $("#search-button").on("click", function() {
//         cityName = $("#search-value").val().trim();

//         var encodedCity = encodeURI(cityName);
//         getCityDetails(encodedCity);
//     });
// });

function getCityDetails(cityName) {

    if(cityName === "") {
        alert("please enter city first");
    } else {
        var queryUrl = "http://open.mapquestapi.com/geocoding/v1/address?key=wraegWcAhDtVMxIGqitPmixrOzkRkRoA&location=" + cityName;

        console.log("city url " + queryUrl);

        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function(response) {
            // console.log("city detail " + response);

            if(response.results.length > 0) {
                latitude = response.results[0].locations[0].latLng.lat;
                longitude = response.results[0].locations[0].latLng.lng;

                console.log("latitude " + latitude);
                console.log("longitude " + longitude);

                getStations(latitude, longitude);

            } else {
                alert("City not found!")
            }
        });
    }
}

function getStations(latitude, longitude) {

    if(latitude === "" || longitude === "") {
        alert("Please type address to get station information");
    } else {
        var queryUrl = "https://api.openchargemap.io/v3/poi/?output=json&distance=10&distanceunit=Miles&maxresults=10&latitude=" + latitude + "&longitude=" + longitude;

        console.log("queryUrl " + queryUrl);

        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function(response) {

            response.forEach(station => {
                console.log("Station: ", station);

                if(station.AddressInfo !== null) {
                    console.log("--------------------------------------");
                    console.log("Station Title:", station.AddressInfo.Title);
                    console.log("Address:", station.AddressInfo.AddressLine1);
                    console.log("Distance (in mile):", station.AddressInfo.DistanceUnit);
                    console.log("Latitude: ", station.AddressInfo.Latitude);
                    console.log("Longitude: ", station.AddressInfo.Longitude);
                    console.log("--------------------------------------");
                }

                console.log("Connections:", station.Connections);

                if(station.Connections.length > 0) {
                    station.Connections.forEach(connection => {

                        console.log("==============");
                        if(connection.CurrentType !== null) {
                            console.log("Current Title: ", connection.CurrentType.Title);
                            console.log("Current Description: ", connection.CurrentType.Description);
                        }
                        if(connection.Voltage !== null) {
                            console.log("Voltage: ", connection.Voltage);
                        }
                        if(connection.Amps !== null) {
                            console.log("Amps: ", connection.Amps);
                        }
                        if(connection.Quantity !== null) {
                            console.log("Quantity:", connection.Quantity);
                        }
                        console.log("==============");
                    });
                }
            });
        });
    }
}
//This will display the map on our page using
//Source: https://developers.google.com/maps/documentation/javascript/overview
let map;

//Function to autofill cities as you type
//Source: https://developers.google.com/maps/documentation/javascript/examples/places-searchbox#maps_places_searchbox-javascript
function initAutocomplete() {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 40.836820, lng: -96.136490 },
      zoom: 5,
      types: ["gas"],
      mapTypeControl: false, //Turns the stellite & map feature off from the map feature
    });
    // Create search box
    const input = document.getElementById("auto-input");
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.LEFT].push(input);
    // Take searchbox results and pass it to map.
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });
    let markers = [];
    // Added event listener so that when user selects a place from list of places
    //more info is provided for that particular place.
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }
      // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];
      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();
      places.forEach((place) => {

          console.log("address" + place.formatted_address);

          if(place.formatted_address !== "") {
            var encodedCity = encodeURI(place.formatted_address);
            getCityDetails(encodedCity);
          }

        if (!place.geometry) {
          console.log("Unknown places");
          return;
        }
        const icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };
        // Create a marker for each place.
        markers.push(
          new google.maps.Marker({
            map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        );

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }
