function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}

var map;
var infowindow;
var openInfowindow;
var lastSelected;
var placeMarkers = [];
var markers = [];

//foursquare api credentials
var four_squareApi = {
  ID: 'EDUCD203HVUKYGBQTFL23GMRC030VF1UC3IWS21U0HMTTGTS',
  SECRET: 'KC2KNSDPAPTTNKBMF3RM4TRB2HEE3IOA3A2WP5TK5LA44ROS'
};

function initMap() {
  //console.log("Here I am!");
  // Constructor creates a new map - only center and zoom are required.
  if (typeof window.google === 'object' && typeof window.google.maps ===
    'object') {

    // Creates a new map - Location is Colombo, Sri Lanka.
    var mapOptions = {
      zoom: 14,
      styles: styles,
      center: new google.maps.LatLng(19.0268747, 72.8553352),
      //center: new google.maps.LatLng(19.0269, 72.8553),
      mapTypeControl: false
    };
    map = new google.maps.Map(document.getElementById('map'),
      mapOptions);
    infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      position: mapOptions.center,
      map: map,
      title: 'Matunga!'
    });

  } else {
    // Load error div using knockout if Google Map does not successfully load
    console.log("error");
    viewModel.mapUnavailable(true);
  }

  for (var i = 0; i < viewModel.locations.length; i++) {
    var self = viewModel.locations[i];
    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
      var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
        markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
      return markerImage;
    }

    // Custom Style applied to markers. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('395634');

    // "Highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('dd5f63');

    viewModel.locations[i].marker = new google.maps.Marker({
      position: new google.maps.LatLng(self.lng, self.lat),
      map: map,
      title: self.title,
      icon: defaultIcon,
      id: i
      //wikiID: self.wikiID
    });

    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    viewModel.locations[i].marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });

    viewModel.locations[i].marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });

    // Opens a infowindow for a marker when clicked upon.
    //Also animates(bounces) and highlights marker when clicked
    openInfowindow = function(marker) {

      //Last Selected Variable used to select only latest marker
      if (lastSelected != null) {
        lastSelected.setIcon(defaultIcon);
      }
      lastSelected = marker;

      //console.log(marker);

      marker.setIcon(highlightedIcon);
      map.panTo(marker.getPosition());

      //Set Animation on marker and set it to stop after 700ms
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 700);

      infowindow.setContent(marker.title);
      infowindow.open(map, marker);

      var index = marker.id;
      //console.log(index);
      var location = viewModel.locations[index];
      //console.log(location.lat);
      var phoneNo, latitude, longitude, Address, checkInCount, userCount, tipCount;

      var url = 'https://api.foursquare.com/v2/venues/search?' +
        'll=' + location.lng + ',' + location.lat + '&client_id=' +
        four_squareApi.ID + '&client_secret=' + four_squareApi.SECRET +
        '&v=20131016';

      $.getJSON(url, function(data) {
        //storing the  phone number in phoneNo variable
        // short circut
        phoneNo = data.response.venues[0].contact.phone || 'No phone provided';
        //phoneNo = data.response.venues[0].contact.phone;
        latitude = data.response.venues[0].location.lat || 'Latitude not provided';
        longitude = data.response.venues[0].location.lng || 'Longitude not provided';
        Address = data.response.venues[0].location.formattedAddress || 'Address not provided';
        //displayImage = data.response.venues[0].categories.icon;
        checkInCount = data.response.venues[0].stats.checkinsCount || 'No Check Ins';
        userCount = data.response.venues[0].stats.usersCount || 'No Users';
        tipCount = data.response.venues[0].stats.tipCount || 'No Tips';
        //console.log(c);
        //displayImageExt = data.response.venues[0].categories.icon.suffix;
        //image = displayImage+displayImageExt;
        //console.log(displayImage);
        infowindow.setContent('<div>' + '<b>' + marker.title +
          '</b>' + '</div>' +
          '<div><strong>Check-Ins: </strong>' + checkInCount +
          '<strong> Users: </strong>' + userCount +
          '<strong> Tips: </strong>' + tipCount + '</div>' +
          '<div><strong>Latitude: </strong>' + latitude +
          '</div>' +
          '<div><strong>Longitude: </strong>' + longitude +
          '</div>' +
          '<div><strong>Phone No.: </strong>' + phoneNo +
          '</div>' +
          '<div><strong>Address: </strong>' + Address +
          '</div><br>' +
          '<div>' + 'Powered by ' + '<b>' +
          ' </strong>Google Maps and Foursquare</strong>' +
          '</b>' + '</div>');
      }).fail(function(err) {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>' + ' failed to access foursquare :(' +
          '</div>' +
          '<div>' + 'powered by' + '<b>' + ' ' +
          ' Foursquare' + '</b>' + '</div>');
      });
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
      }

    };

    // Event listener opens infowindow upon being clicked.
    this.addListener = google.maps.event.addListener(self.marker,
      'click',
      function() {
        openInfowindow(this);
        //console.log(this);
      });
  }

  function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }

  // This function fires when the user selects a searchbox picklist item.
  // It will do a nearby search using the selected query string or place.
  function searchBoxPlaces(searchBox) {
    hideMarkers(placeMarkers);
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      window.alert('We did not find any places matching that search!');
    } else {
      // For each place, get the icon, name and location.
      createMarkersForPlaces(places);
    }
  }

}

// Fallback error handling method for Google Maps
mapError = function() {
    viewModel.mapUnavailable(true);
};