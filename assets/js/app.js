

var vm;

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
  self.getData = function() {

    function nonce_generate() {
      return (Math.floor(Math.random() * 1e12).toString());
    }

    var yelp_url = 'https://api.yelp.com/v2/search';

    var parameters = {
      oauth_consumer_key: "yVy9s54D7PTzToicjSueFA",
      oauth_token: "ZgNxvcW8R_ccZOetOQl-hXbe3yqSwvgu",
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      limit: 1,
      callback: 'cb',
      term: self.name,
      location: 'Washington, DC'
    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, "Z-qJKTqp-NRvzSGqnyaLgwyQY9s", "L61hpk9p-ec31fehJOwq58jDGzE");
    parameters.oauth_signature = encodedSignature;

    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true, // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
      dataType: 'jsonp',
      success: function(results) {
        if(results.businesses.length > 0){
            var name = results.businesses[0].name || 'no name returned by Yelp for this location';
            var phone = results.businesses[0].display_phone || 'no phone returned by Yelp for this location';
            var image = results.businesses[0].image_url ||'no name image returned by Yelp for this location';
            infowindow.setContent(`<div><span>Name: ${name}</span><br><span>Phone: ${phone}<span><br><img alt = "${name}" src ="${image}"/><div>`);
            }else{
              infowindow.setContent(`<div>Yelp call failed.<div>`);
            }
      },
      error: function(e) {
        infowindow.setContent(`<div>Yelp call failed.<div>`);
      }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);
  };

  self.marker.addListener('mouseout', function() {
    this.setIcon(self.defaultIcon);
  });
  self.marker.addListener('mouseover', function() {
    this.setIcon(self.highlitedIcon);
  });
  self.marker.addListener('click', function() {
    if (infowindow.marker != self.marker) {
      infowindow.marker = self.marker;
      infowindow.open(map, self.marker);
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
      self.toggleBounce(this);
      self.getData();
    }
  });

};

var infowindow;

var ViewModel = function() {
  var self = this;
  this.categories = ko.observableArray(["", "Housing", "Business"]);
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
    var harrietTubmanQuadrangle = {lat: 38.922106, lng: -77.017673}
    map = new google.maps.Map(document.getElementById('map'), {
      center: harrietTubmanQuadrangle,
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
			console.log(locations);
			for (var key in locations) {
				if (!locations.hasOwnProperty(key)) continue;
				var obj = locations[key];
				self.places.push(new Place(obj, map));
				console.log(new Place(obj, map));
			}
	    // initialMarkers.forEach(function(place) {
	    // self.places.push(new Place(place, map));
	    // });
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
