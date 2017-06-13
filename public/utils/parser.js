//loop through the entire NPR playground data set, create an obj with relevant info for each park, push obj to array for use in other functions, such as makeMarkers.
function parse(data){
	pgData = data.playgrounds;

	pgData.forEach(function(entry){

		var newPg = {};
		newPg.name = entry.name;
		var pgLat = entry.latitude;
		var pgLong = entry.longitude;
		var latLong = {lat: pgLat, lng: pgLong};
		newPg.slug = entry.slug;
		newPg.location = latLong;
		newPg.address = entry.address;
		newPg.city = entry.city;
		newPg.state = entry.state;
		newPg.url = entry.url;
		newPg.zip = entry.zip_code;
		newPg.features = features(entry.features);
		newPg.remarks = entry.public_remarks;

		writeUserData(newPg.slug, newPg.name, newPg.location, newPg.address, newPg.city, newPg.state, newPg.url, newPg.zip, newPg.features, newPg.remarks);

		function features(arr){
			var pgFeatures = [];
			arr.forEach(function(feature) {
			    pgFeatures.push(feature.name);
			});
			return pgFeatures;
		}

	});
}

parse(pgDataSet);


function writeUserData(userId, name, location, address, city, state, url, zip, features, remarks) {

	var path = 'playgrounds/'+ userId;
  	firebase.database().ref(path).set({
  	userId: userId,
    name: name,
    location: location,
   	address: address,
   	state: state,
   	city: city,
   	url: url,
   	zip: zip,
   	features: features,
		remarks: remarks
  });
}
