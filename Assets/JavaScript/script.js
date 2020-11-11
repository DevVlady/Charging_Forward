//This will display the map on our page using
//Source: https://developers.google.com/maps/documentation/javascript/overview
let map;

//Function to autofill cities as you type
//Source: https://developers.google.com/maps/documentation/javascript/examples/places-searchbox#maps_places_searchbox-javascript
function initAutocomplete() {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 40.836820, lng: -96.136490 },
      zoom: 5,
      mapTypeId: "roadmap",
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
          console.log(place)
        // if (!place.geometry) {
        //   console.log("Unknown places");
        //   return;
        // }
        // const icon = {
        //   url: place.icon,
        //   size: new google.maps.Size(71, 71),
        //   origin: new google.maps.Point(0, 0),
        //   anchor: new google.maps.Point(17, 34),
        //   scaledSize: new google.maps.Size(25, 25),
        // };
        // // Create a marker for each place.
        // markers.push(
        //   new google.maps.Marker({
        //     map,
        //     icon,
        //     title: place.name,
        //     position: place.geometry.location,
        //   })
        // );

        // if (place.geometry.viewport) {
        //   bounds.union(place.geometry.viewport);
        // } else {
        //   bounds.extend(place.geometry.location);
        // }
      });
      map.fitBounds(bounds);
    });
  }
