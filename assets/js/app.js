var vm,
  infowindow;
var center = {
  lat: 38.922106,
  lng: -77.017673
};
var locations;

var Place = function(data, map) {
  var self = this;
  self.defaultIcon = makeMarkerIcon('ff5c33');
  self.highlitedIcon = makeMarkerIcon('9653ac');
  self.name = data.name;
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
  this.categories = ko.observableArray(["all", "smooth surface throughout", "transfer stations to play components", "ramps to play components", "accessible swing", "sound play components", "sight impaired play components", "safety fence", "single entrance"]);
  this.places = ko.observableArray([]);
  this.selectedCategory = ko.observable('');

  this.navVisible = ko.observable(true);
  this.toggleNav = function() {
    this.navVisible(!this.navVisible());
    document.getElementById('list-view').style.background = '#fff';
  };

  //filtering happens on load
  this.filterPlaces = ko.computed(function() {
    self.currentPlaces = ko.observableArray([]);
    if (!self.selectedCategory() || self.selectedCategory() === 'All') {
      self.places().forEach(function(place) {
        place.marker.setVisible(true);
      });
      return self.places();
    } else {

      self.places().forEach(function(place) {
        if(place.marker.features){
          console.log('place array:',place.marker.features);
          console.log('category:', self.selectedCategory().toLowerCase());

          place.marker.features.forEach(function(place){
            console.log(place)
          });
            console.log("found one: ", place);
            //add type to data in parser
            self.currentPlaces.push(place);
            place.marker.setVisible(true); // marker is shown
            place.marker.setAnimation(google.maps.Animation.DROP);

        }
        place.marker.setVisible(false); // marker is hidden

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
      locations = snapshot.val();
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

      $('#autocomplete').on('keyup', function(e) {
        if (e.keyCode === 13) {
          $('#submit').click();
        }
      });

      $('#submit').click(function(){
        self.toggleNav();
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

          //push all locations ot places markers array
          //this is where markers are going on page TODO compare tp ko original
          count = 0;
          for (var key in locations) {
            var obj = locations[key];
            var objLat = obj.location;
            var distanceFromCenter = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(center.lat,center.lng),new google.maps.LatLng(objLat.lat, objLat.lng));
            if(!locations.hasOwnProperty(key)) contine;
            if (distanceFromCenter < 200000){
              // console.log('loading: ',count,' ',obj,' ',distanceFromCenter);
              self.places.push(new Place(obj, map));
              count ++;
            }
            };
        });
      });
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
