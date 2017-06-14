// Initialize Firebase
var config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId
};

firebase.initializeApp(config);

// apiKey:AIzaSyDTrEvmBOIAoS0kMWQt1goNozOBUE1oeEI
// authDomain: "playground-adventures.firebaseapp.com",
// databaseURL: "https://playground-adventures.firebaseio.com",
// storageBucket: "playground-adventures.appspot.com",
// messagingSenderId: "382666633943"
