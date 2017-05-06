var vm,
  infowindow;
var center = {
  lat: 38.922106,
  lng: -77.017673
};

var Place = function(data, map) {
  var self = this;
  self.defaultIcon = makeMarkerIcon('ff5c33');
  self.highlitedIcon = makeMarkerIcon('9653ac');
  self.name = data.title;
  self.type = data.type;
  self.currentMarker = null;
  self.marker = new google.maps.Marker({
    map: map,
    position: data.location,
    animation: google.maps.Animation.DROP,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    location: data.location,
    url: data.utl,
    features: data.features,
    remarks: data.public_remarks
  });
  self.toggleBounce = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      infowindow.marker.setAnimation(null);
    }, 400);
  };

  self.marker.addListener('click', function() {
    // document.getElementById('detailModal').visibility = 'visible';
    if (infowindow.marker != self.marker) {
      var name = self.marker.name || "no name provided";
      var address = self.marker.address || "no address provided";
      var features = self.marker.features || "no features provided";
      var remarks = self.marker.remarks || " ";
      infowindow.marker = self.marker;
      infowindow.open(map, self.marker);
      infowindow.setContent(`<div>${name}<div><div>${address}<div><div>${features}<div><div>${remarks}<div>`);
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
      self.toggleBounce(this);
    }
  });

};

var ViewModel = function() {
  var self = this;
  this.categories = ko.observableArray(["All", "Something", "Something"]);
  this.places = ko.observableArray([]);
  this.selectedCategory = ko.observable('');

  this.navVisible = ko.observable(true);
  this.toggleNav = function() {
    this.navVisible(!this.navVisible());
  };

  this.filterPlaces = ko.computed(function() {
    self.currentPlaces = ko.observableArray([]);
    if (!self.selectedCategory() || self.selectedCategory() === 'All') {
      self.places().forEach(function(place) {
        place.marker.setVisible(true);
      });
      return self.places();
    } else {
      self.places().forEach(function(place) {
        place.marker.setVisible(false); // marker is hidden
        //add type to data in parser
        var type = place.type;
        if (self.selectedCategory().toLowerCase() === type.toLowerCase()) {
          self.currentPlaces.push(place);
          place.marker.setVisible(true); // marker is shown
          place.marker.setAnimation(google.maps.Animation.DROP);
        }
      });
      return self.currentPlaces();
    }

  });

  this.initMap = function() {
    infowindow = new google.maps.InfoWindow();
    var map;
    map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: 13,
      styles: vintageStyles,
      mapTypeControl: false
    });
    self.createMarkers(map);
  };

  this.createMarkers = function(map) {
    //grab playground data from fb
    firebase.database().ref('playgrounds/').on("value", function(snapshot) {
      var locations = snapshot.val();
      var places = [];
      var place;
      var input = document.getElementById('autocomplete');

      autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */
        (document.getElementById('autocomplete')), {
          types: ['geocode']
        });
      //save place info on user selection
      autocomplete.addListener('place_changed', function() {
        place = autocomplete.getPlace();

      });

      document.getElementById('submit').onclick = function() {
        var address = place.formatted_address;
        var addressArray = address.split(' ');
        var addressParam = addressArray.join('+');
        var components = '&components=country:US';
        queryURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + addressParam + components;
        $.ajax({
          url: queryURL,
          method: "GET"
        }).done(function(response) {
          center = response.results[0].geometry.location;
          map = new google.maps.Map(document.getElementById('map'), {
            center: center,
            zoom: 10,
            styles: vintageStyles,
            mapTypeControl: false
          });
        });
        for (var key in locations){
				if(!locations.hasOwnProperty(key)) continue;
				var obj = locations[key];
				places.push(new Place(obj, map));
			}

      }
      // for (var key in locations) {
      // 	if (!locations.hasOwnProperty(key)) continue;
      // 	var obj = locations[key];
      // 	self.places.push(new Place(obj, map));
      // }
    });

  };

  this.setWindow = function(clickedLoc) {
    var marker = clickedLoc.marker;
    google.maps.event.trigger(marker, 'click');
    self.toggleNav();
  };

};

vm = new ViewModel();
ko.applyBindings(vm);

function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}

function googleError() {
  alert("Google failed to respond. Try again later");
}
