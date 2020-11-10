
var latitude = ""; //"40.86027";
var longitude = ""; //"-74.177187";
var cityName = ""; //"clifton";

$(document).ready(function() {

    $("#search-button").on("click", function() {
        cityName = $("#search-value").val().trim();

        var encodedCity = encodeURI(cityName);

        getCityDetails(encodedCity);
    });
});

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
            console.log("station detail " + response);

            response.forEach(station => {
                // console.log("Title:", station);

                console.log("--------------------------------------");
                console.log("Station Title:", station.AddressInfo.Title);
                console.log("Address:", station.AddressInfo.AddressLine1);
                console.log("Distance (in mile):", station.AddressInfo.DistanceUnit);
                console.log("Latitude: ", station.AddressInfo.Latitude);
                console.log("Longitude: ", station.AddressInfo.Longitude);
                console.log("--------------------------------------");

                console.log("Connections:", station.Connections);

                if(station.Connections.length > 0) {
                    station.Connections.forEach(connection => {

                        console.log("==============");
                        console.log("Current Title: ", connection.CurrentType.Title);
                        console.log("Current Description: ", connection.CurrentType.Description);
                        console.log("Voltage: ", connection.Voltage);
                        console.log("Amps: ", connection.Amps);
                        console.log("Quantity:", connection.Quantity);
                        console.log("==============");
                    });
                }
            });
        });    
    }
}
