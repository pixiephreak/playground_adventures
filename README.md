# Playground Adventures
Continuing work on the project created and developed by Meagan Gallagher, Cyrus Vossoughi, Alfred Avor, and Jane Claire Remick
See the beta version (here) [https://github.com/pixiephreak/GWCB_project-1]

## Overview and Purpose of Application
(**Playground Adventures**)[https://mysterious-brook-83674.herokuapp.com/] parses JSON from the (NPR Playgrounds for Everyone) [http://www.playgroundsforeveryone.com/] dataset and stores it in Firebase, where it can be updated and added to. The Firebase data is used by the Google interactive map to show accessible playground locations and information. I integrated the Knockout.js framework to show locations in a sidebar list view as well. 

Many caregivers find that children are unpredictable. Locating a safe, accessible recreation area at a moments notice is a common need. This can be especially challenging on the road. Playground Adventures is designed and implemented as a mobile-first app with a clean interface, so parents can see playgrounds near any location, as well as information details and accessibility information about each. 

## Technologies Used

This web application was built using the following technologies:
- Data/Database
  - [firebase](https://firebase.google.com/) realtime data base
  - http://www.playgroundsforeveryone.com/ data as JSON
- Front End Development
  - Knockout.js
  - CSS
  - HTML
  - Google Maps JavaScript API
- Deployment
  - Heroku

## Installation Instructions
*For Users*
- Visit the application at [**Playground Adventures**](https://mysterious-brook-83674.herokuapp.com/).

*For Developers*
- Download or clone the local repository
- Keys have been hidden, so enter your own Firebase and Google Maps credentials

## Unsolved Problems
- The code could be audited to meet 508 accessibility standards.
- The Accessibility Features do not appear as a list and they should.


## Future Plans
- Users upload pictures of each playground.
- Reintegrate weather API and UV index for each location.
