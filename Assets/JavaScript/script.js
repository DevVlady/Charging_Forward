
let latitude = "";
let longitude = "";
let markers = [];
let map;
let bounds;
var infoWindowObject = [];

$(document).ready(function() {

    //get the user's current location
    //getUsersCurrentLocation();

    //Search button click
    $("#search-button").on("click", function() {

        //grab the auto-input value
        var cityName = $("#auto-input").val().trim();

        //encode it
        var encodedCity = encodeURI(cityName);

        //passing it as a parameter in getCityDetails function
        getCityDetails(encodedCity);
    });
});

function getCityDetails(cityName) {

    if(cityName === "") {
        hideAway("Please enter your city first!");
    } else {

        //clear all the markers from map when user search for new place
        clearAllMarkers();

        var queryUrl = "http://open.mapquestapi.com/geocoding/v1/address?key=wraegWcAhDtVMxIGqitPmixrOzkRkRoA&location=" + cityName;

        console.log("city url " + queryUrl);

        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function(response) {
            // console.log("city detail " + response);

            if(response.results.length > 0) {

                //get the each station's latitude and longitude
                latitude = response.results[0].locations[0].latLng.lat;
                longitude = response.results[0].locations[0].latLng.lng;

                console.log("latitude " + latitude);
                console.log("longitude " + longitude);

                //pass it to the getStation function
                getStations(latitude, longitude);

            } else {
                alert("City not found!");
            }
        });
    }
}

function getStations(latitude, longitude) {

    if(latitude === "" || longitude === "") {
        alert("Please type address to get station information");
    } else {
        var queryUrl = "https://api.openchargemap.io/v3/poi/?output=json&distance=10&distanceunit=Miles&maxresults=20&latitude=" + latitude + "&longitude=" + longitude;

        console.log("queryUrl " + queryUrl);

        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function(response) {

            response.forEach(station => {
                // console.log("Station: ", station);

                if(station.AddressInfo !== null) {
                    console.log("--------------------------------------");
                    console.log("Station Title:", station.AddressInfo.Title);
                    console.log("Address:", station.AddressInfo.AddressLine1);
                    console.log("Distance (in mile):", station.AddressInfo.DistanceUnit);
                    console.log("Latitude: ", station.AddressInfo.Latitude);
                    console.log("Longitude: ", station.AddressInfo.Longitude);
                    console.log("--------------------------------------");

                    //pass the station data to create the marker on map to the addMarkerToTheMap function
                    addMarkerToTheMap(station);
                }
                console.log("Connections:", station.Connections);
            });

            //it'll cover all the markers
            map.fitBounds(bounds);

            //then center the map
            map.panToBounds(bounds);
        });
    }
}

//This function is for adding markers(pin) on the map
//source: https://developers.google.com/maps/documentation/javascript/markers
function addMarkerToTheMap(station) {

    // console.log("Station: ", station);

    //create myLatLng const to set latitude and longitude value and pass this const to marker's position property
    const myLatLng = {
        lat: station.AddressInfo.Latitude,
        lng: station.AddressInfo.Longitude
    };

    //set markers bounds for each marker
    bounds.extend(new google.maps.LatLng(myLatLng));

    //create markers using station's latitude and longitude
    const marker = new google.maps.Marker({
      position: myLatLng,
      //Added animation to the markers
      //Source: https://developers.google.com/maps/documentation/javascript/examples/marker-animations
      animation: google.maps.Animation.DROP,
      map,
      title: station.AddressInfo.Title,
    });


    //Added the event listener to bounce the markers on click (turn on or off)
    marker.addListener("click", toggleBounce);

    //Function to make the bounce feature on the markers operate
    function toggleBounce() {
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          //Set the marker to bounce then stop
          //Source: http://superstorefinder.net/support/forums/topic/controlling-the-bouncing-markers/
          setTimeout(function(){ marker.setAnimation(null); }, 750);
        }
      }

    //add each marker to the markers Array
    markers.push(marker);

    //get the infoWindow fo each marker
    var infoWindow = new google.maps.InfoWindow();

    var contentString = getContentString(station);

    //when marker is click fill out station details in this infoWindow
    google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
            closeOtherInfoWindow();
            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
            infoWindowObject[0] = infoWindow;
        }
    })(marker));
}

//function for creating content string.. we'll pass this content string to set content on infoWindow
function getContentString(station) {
    let contentString =
    '<div id="content">' +
    '<div id="siteNotice">' +
    '</div>' +
    `<h1><b>${station.AddressInfo.Title}</b></h1>` +
    '<div id="bodyContent">' +
    `<p>${station.AddressInfo.AddressLine1}</p>` +
    `<p>Distance (in miles): ${station.AddressInfo.DistanceUnit}</p>`;

    if(station.Connections.length > 0) {
        if (station.Connections.length === 1) {
            if(station.Connections[0].CurrentType.Title !== null) {
                contentString += `<p>Current Type: ${station.Connections[0].CurrentType.Title}</p>`;
            }

            if(station.Connections[0].Voltage !== null) {
                contentString += `<p>Voltage: ${station.Connections[0].Voltage}</p>`;
            }

            if(station.Connections[0].Amps !== null) {
                contentString += `<p>AMPS: ${station.Connections[0].Amps}</p>`;
            }

            if(station.Connections[0].Quantity !== null) {
                contentString += `<p>Quantity: ${station.Connections[0].Quantity}</p>`;
            }
        } else {
            station.Connections.forEach(connection => {
                contentString += "<span class='connection-block'>";
                if(connection.CurrentType !== null) {
                    console.log("Current Title: ", connection.CurrentType.Title);
                    console.log("Current Description: ", connection.CurrentType.Description);

                    contentString += `<p>Current Type: ${connection.CurrentType.Title}</p>`;
                }
                if(connection.Voltage !== null) {
                    console.log("Voltage: ", connection.Voltage);
                    contentString += `<p>Voltage: ${connection.Voltage}</p>`;
                }
                if(connection.Amps !== null) {
                    console.log("Amps: ", connection.Amps);
                    contentString += `<p>AMPS: ${connection.Amps}</p>`;
                }
                if(connection.Quantity !== null) {
                    console.log("Quantity:", connection.Quantity);
                    contentString += `<p>Quantity: ${connection.Quantity}</p>`;
                }
                contentString += "</span>";
            });
        }
    }

    contentString += '</div>' + '</div>';
    console.log("contentString" + contentString);
    return contentString;
}

//function for close the info window for every marker on map
function closeOtherInfoWindow() {
    if (infoWindowObject.length > 0) {
        infoWindowObject[0].set("marker", null);
        /* and close it */
        infoWindowObject[0].close();
        /* blank the array */
        infoWindowObject = [];
    }
}

//This will display the map on our page using
//Source: https://developers.google.com/maps/documentation/javascript/overview

//Function to autofill cities as you type
//Source: https://developers.google.com/maps/documentation/javascript/examples/places-searchbox#maps_places_searchbox-javascript
function initAutocomplete() {

    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 40.836820, lng: -96.136490 },
      zoom: 5,
      mapTypeControl: false, //Turns the stellite & map feature off from the map feature
    });

    //set map's min and max zoom limit
    map.setOptions({ minZoom: 3, maxZoom: 17 });

    // Create search box
    const input = document.getElementById("auto-input");
    const searchBox = new google.maps.places.SearchBox(input);

    //map.controls[google.maps.ControlPosition.LEFT].push(input);

    // Take searchbox results and pass it to map.
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });

    // Added event listener so that when user selects a place from list of places
    //more info is provided for that particular place.
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();

      if (places.length == 0) {
          alert("There is no such place! Please try again!")
        return;
      }

      //interate throw all the places
      places.forEach((place) => {

        //get the selected place in place input parameter
          console.log("address" + place.formatted_address);

          if(place.formatted_address !== "") {
            var encodedCity = encodeURI(place.formatted_address);
            getCityDetails(encodedCity);
          }
      });
    });
}

//get user's current location
function getUsersCurrentLocation() {

    if (window.navigator && window.navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }

    function success(position) {

        console.log(position.coords.latitude + position.coords.longitude);

        var currentImg = {
            url: "./Assets/Images/currentLocationMarker.png", // url
            scaledSize: new google.maps.Size(40, 50), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };

        var userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        new google.maps.Marker({
            position: userLatLng,
            title: 'Me',
            map: map,
            icon: currentImg
        });
    }
}

function hideAway(title){
    var hide = document.getElementById('hideaway');
    document.getElementById('hideaway').style.display='block';
    hide.addEventListener('click', function(){
    hide.style.display="none";
    });
    $("#alert-title").text(title);
}

// This applies the click event to the button, hopefully will work with the visual anomoly
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

document.querySelector('button').onclick = function () {
    sidebar.classList.toggle('sidebar_small');
    mainContent.classList.toggle('main-content_Large')
}

//for clearing every marker on screen before user search for new place
function clearAllMarkers() {
    // Clear out the old markers.
    markers.forEach((marker) => {
        marker.setMap(null);
    });
    markers = [];
    bounds  = new google.maps.LatLngBounds();

}
