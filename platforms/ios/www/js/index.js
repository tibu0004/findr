
let app = {
  novoMark:{},
    data:[],
    map: null,
    currentMarker: null,
    defaultPos: {
      coords: {
        latitude: 45.555,
        longitude: -75.555
      }
    }, //default location to use if geolocation fails

    init: function() {
      document.addEventListener("deviceready", app.ready);
    },

    ready: function() {
      //load the google map script
      let s = document.createElement("script");
      document.head.appendChild(s);
      s.addEventListener("load", app.mapScriptReady);
      s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPKEY}`;
    },

    mapScriptReady: function() {
      //script has loaded. Now get the location
      if (navigator.geolocation) {
        let options = {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000 * 60 * 60
        };
        navigator.geolocation.getCurrentPosition(
          app.gotPosition,
          app.failPosition,
          options
        );
      } else {
        //not supported
        //pass default location to gotPosition
        app.gotPosition(app.defaultPos);
      }
    },
    
    gotPosition: function(position) {
      console.log("gotPosition", position.coords);
      //build the map - we have deviceready, google script, and geolocation coords
      app.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        disableDoubleClickZoom: true
      });
      //add map event listeners
      app.addMapListeners();
    },
    addMapListeners: function() {
      console.log("addMapListeners");
      //add double click listener to the map object
      app.map.addListener("dblclick", app.addMarker);
    },


    addInfoWindow: function(marker) {

    let infoWindow = new google.maps.InfoWindow({ map: app.map });

    let positionOk = marker.position;
    infoWindow.setPosition(positionOk);
    let contentDiv = document.createElement("div");
    let h1 = document.createElement("h1");
    h1.textContent = marker.infoDesc;
    contentDiv.appendChild(h1);
    let p1 = document.createElement("p");
    p1.textContent = "Position:";
    contentDiv.appendChild(p1);
    let p = document.createElement("p");
    p.textContent = positionOk;
    contentDiv.appendChild(p);
    let btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.addEventListener("click", ev => {
      console.log("evento", ev)
      marker.setMap(null);
      localStorage.removeItem(marker.id);
      console.log("marker deleted");
    });
    contentDiv.appendChild(btn);
    infoWindow.setContent(contentDiv);
    infoWindow.open(app.map, marker);

     },

    addMarker: function(ev) {
      console.log("addMarker", ev);
      let InfoDesc = prompt("description", "");
      let Id = Math.floor(Date.now() / 1000);
      if(InfoDesc != null){
        if(InfoDesc.trim() !== ""){
      let marker = new google.maps.Marker({
        id: Id,
        map: app.map,
        draggable: false,
        position: {
          lat: ev.latLng.lat(),
          lng: ev.latLng.lng()
        },
        infoDesc: InfoDesc
      });
      
      let newMarker = {
        id: Id,
        Lat: marker.position.lat(), 
        Lng: marker.position.lng(),
        infoDesc: InfoDesc
      };
      
     
      app.data.push(marker);
      
      localStorage.setItem(Id, JSON.stringify(newMarker));
      //console.log("stringfy", data);
      

      let descripName = localStorage.getItem(Id);
      let obj = JSON.parse(descripName);
      console.log(obj);

      
      app.addInfoWindow(marker);
      //add click listener to Marker
      marker.addListener("click", app.markerClick);
      //add double click listener to Marker
      marker.addListener("dblclick", app.markerDblClick);
    }}
    },
    markerClick: function(ev) {
      console.log("Click", ev);
      console.log(this);
      let marker = this; // to use the marker locally
      app.currentMarker = marker; //to use the marker globally
      app.map.panTo(marker.getPosition());
      
      app.addInfoWindow(marker);
      
   
    },
    markerDblClick: function(ev) {
      console.log("Double Click", ev);
      console.log(this);
      let marker = this; 
      //to use the marker locally
      app.currentMarker = marker; //to use the marker globally
      //remove the marker from the map
     
    },
    failPosition: function(err) {
      console.log("failPosition", err);
      //failed to get the user's location for whatever reason
      app.gotPosition(app.defaultPos);
    },

   

  };
  
  app.init();