
function initMap(){
	//make sure map callback fires
	//grab playground data from fb
	firebase.database().ref('playgrounds/').on("value", function(snapshot) {
	var locations = snapshot.val();

	// collect Place for each location from createMarkers
	var places = [];
	//define map center
	var center;
	var input = document.getElementById('autocomplete');
	//save google place info
	var place;

	// Create the autocomplete object, restricting the search to geographical
	// location types.
	autocomplete = new google.maps.places.Autocomplete(
	    /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
	    {types: ['geocode']});
	//save place info on user selection
	autocomplete.addListener('place_changed', function(){
		  place = autocomplete.getPlace();

	});

	$('#submit').on('click', function(){

		// Make api call to convert address or zip to lat/lng and then center map accordingly
		// format: address=1600+Amphitheatre+Parkway,+Mountain+View,+CA
		// TO-DO: get key?
		var address = place.formatted_address;;
		var addressArray = address.split(' ');
		var addressParam = addressArray.join('+');
		var components = '&components=country:US';
		queryURL = 'https://maps.googleapis.com/maps/api/geocode/json?address='+addressParam+components;
		$.ajax({
			url: queryURL,
			method: "GET"
		})
		.done(function(response) {
			center = response.results[0].geometry.location;


		//Place constructor obj
		var Place = function(data, map) {
			var self = this;
			//TO-DO: use this later to animate markers
			// self.defaultIcon = makeMarkerIcon('ff5c33');
			// self.highlitedIcon = makeMarkerIcon('9653ac');
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
				features: data.features
			});
			self.marker.addListener('click', function(){

				//opens the detail modal on clicking the marker
				$('#detailModal').modal('show')

				var name = this.name || 'no name provided';
				var address = this.address || 'no address provided';
				var city = this.city || 'no city provided';
				var state = this.state || 'no state provided';
				var features = this.features.join(', ') || 'no accessibility features provided';
				var contact = this.url || 'no contact provided';
				document.getElementById('name').innerHTML = name;
				document.getElementById('address').innerHTML = `${address}, ${city}, ${state}` || 'no address provided';
				document.getElementById('accessibility').innerHTML = features || 'no accessibility features provided';
				document.getElementById('contact').innerHTML = contact || 'no contact provided';

				// TO-DO: figure out how to launch details screen on click

				//weather

			      	var theLat= this.location.lat;
			      	var theLon = this.location.lng;

			        var queryURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + theLat + "&lon=" + theLon + "&units=imperial&APPID=947f5787036d4b030aeef7beb74b6049"

			        //Weather API data
			        $.ajax({
			          url: queryURL,
			          method: "GET"
			        }).done(function(response) {
				      // Storing the temp data and round the decimal points out and up
				      var temp = Math.ceil(response.main.temp);
				      var theTemp = $("<h2>").html(temp + "&#8457;");

				      $("#temp").html(theTemp);

				      //image for weather icon 
				      var image = "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
				      var addImage = $("<img>").attr("src", image);
				      var idImage = addImage.attr("id", "weatherIcon")
					  $('#weatherIcon').html(idImage);
 

      				});

			        // beta is not working for UV index maybe someone else can fix this in the morning? 

       				// var date = new Date();
					// var iso = date.toISOString();
					// var newLat = Math.ceil(theLat); 
					// var newLon = Math.ceil(theLon); 
					// console.log(iso); 

					// var queryURL = "http://api.openweathermap.org/v3/uvi/" + newLat + "," + newLon + "/" + iso + ".json?appid=947f5787036d4b030aeef7beb74b6049"
					// console.log(queryURL); 
					// $.ajax({
			  //         url: queryURL,
			  //         method: "GET"
			  //       }).done(function(response) { 
			  //       	console.log(response); 
			  //       });


			});

		}

		//create a marker for each location in database using the Place constructor and put it on the map
		this.createMarkers = function(map) {
			for (var key in locations){
				if(!locations.hasOwnProperty(key)) continue;
				var obj = locations[key];
				places.push(new Place(obj, map));
			}
		};

		var map = new google.maps.Map(document.getElementById('gMap'), {
			zoom: 10,
		  //user will submit zip code or address, which is passed to geocode api. response provides lat/lng used to center map accordingly.
		  center: center,
		  mapTypeId: google.maps.MapTypeId.ROADMAP
			});

		this.createMarkers(map);

    	})
    })



});
}


function googleError(){
	alert('Sorry, Google did not respond');
}

//link index.html to firebase;
// add accessiblePlaygrounds to firebase;
//populate locations array in maps with firebase objects
//sort by region?