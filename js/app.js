/*jshint loopfunc: true */

//search nav open (8)
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("openbtn").style.visibility = "hidden";
}

//search nav close
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("openbtn").style.visibility = "visible";
}

function googleApiError() {
    alert('Weather Data Failed to Load!');
}

//Add a map and markers using hardcoded data (14, 23)
var locations = [
    {
        title: "Marlins Park",
        latlong: { lat: 25.7783176, lng: -80.219597 },
        street: "501 Marlins Way",
        city: "Miami, FL 33125",
        url: "www.miami.marlins.mlb.com",
        id: 0,
        showLoc: ko.observable(true), // (13)
        visible: ko.observable(true),
    },
    {
        title: "Bayfront Park",
        latlong: { lat: 25.776221, lng: -80.1860117 },
        street: "301 Biscayne Blvd",
        city: "Miami, FL 33132",
        url: "www.bayfrontparkmiami.com",
        id: 1,
        showLoc: ko.observable(true),
        visible: ko.observable(true),
    },
    {
        title: "Miami Seaquarium",
        latlong: { lat: 25.7344829, lng: -80.1647995, },
        street: "4400 Rickenbacker Causeway",
        city: "Miami, FL 33149",
        url: "www.miamiseaquarium.com",
        id: 2,
        showLoc: ko.observable(true),
        visible: ko.observable(true),
    },
    {
        title: "The Biltmore Hotel",
        latlong: { lat: 25.7418204, lng: -80.2788139, },
        street: "1200 Anastasia Ave",
        city: "Coral Gables, FL 33134",
        url: "www.biltmorehotel.com",
        id: 3,
        showLoc: ko.observable(true),
        visible: ko.observable(true),
    },
    {
        title: "Homestead-Miami Speedway",
        latlong: { lat: 25.4517029, lng: -80.4097982, },
        street: "1 Speedway Blvd",
        city: "Homestead, FL 33035",
        url: "www.homesteadmiamispeedway.com",
        id: 4,
        showLoc: ko.observable(true),
        visible: ko.observable(true),
    },
    {
        title: "Coral Castle",
        latlong: { lat: 25.5006612, lng: -80.4443242, },
        street: "28655 S Dixie Hwy",
        city: "Homestead, FL 33033",
        url: "www.coralcastle.com",
        id: 5,
        showLoc: ko.observable(true),
        visible: ko.observable(true),
    },
    {
        title: "Zoo Miami",
        latlong: { lat: 25.6081041, lng: -80.3993919, },
        street: "12400 SW 152nd St",
        city: "Miami, FL 33177",
        url: "www.zoomiami.org",
        id: 6,
        showLoc: ko.observable(true),
        visible: ko.observable(true),
    }
];

//initialize map, place the markers (1) 
var map;
var marker;
var infowindow;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 25.6179071, lng: -80.3748414 },
        zoom: 11
    });
    createMarkers();
    animateMarkers();
    onMapClick();

    //responsive on screen size (24)
    if ($(window).width() < 481) {
        closeNav();
    } 
    else openNav();
}

//responsive on resize (24)
$(window).resize(function () {
    if ($(this).width() < 801) {
        closeNav();
    }
    else openNav();
});

//loop to drop markers on map and add marker properties (14, 18, 23)
function createMarkers() {
    for (i = 0; i < locations.length; i++) {
        locations[i].marker = new google.maps.Marker({
            position: locations[i].latlong,
            map: map,
            title: locations[i].title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        //creates infowindow for each marker (3)
        locations[i].marker.infowindow = new google.maps.InfoWindow({
            content: locations[i].title + "</br>" + locations[i].street + "</br>" + locations[i].city
        });
    }
}

//sets marker visibility
function setMarkerVisibility() {
    for (i = 0; i < locations.length; i++) {
        locations[i].marker.setVisible(locations[i].visible);
    }
}

//closes info windows, stops marker animations (19)
function stopMarkerAnimation() {
    for (i = 0; i < locations.length; i++) {
        var marker = locations[i].marker;
        marker.infowindow.close();
        marker.setAnimation(null);
        marker.setIcon();
    }
}

//on marker click - animates markers, changes color (2)
function animateMarkers() {
    for (i = 0; i < locations.length; i++) {
        locations[i].marker.addListener('click', function () {
            stopMarkerAnimation();
            this.infowindow.open(map, this);
            this.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
            map.setZoom(13);
            map.panTo(this.position);
            if (this.getAnimation() !== null) {
                this.setAnimation(null);
            } else {
                this.setAnimation(google.maps.Animation.BOUNCE);
            }
            nyTimesApiData(this.id);
        });
    }
}      

//on map click - adds listener
function onMapClick() {
    for (i = 0; i < locations.length; i++) {
        google.maps.event.addListener(map, "click", function (event) {
            stopMarkerAnimation();
        });
    }
}

//knockout viewmodel 
function AppViewModel() {
    //handles search nav locations array and filtering (15, 16, 17, 20, 21, 22)
    this.koLocations = ko.observableArray(locations);
    query = ko.observable('');
    this.locations = ko.computed(function () {
        var self = this;
        var search = self.query().toLowerCase();
        return ko.utils.arrayFilter(locations, function (loc) {
            if (loc.title.toLowerCase().indexOf(search) >= 0) {
                loc.showLoc(true); // (13)
                loc.visible = true;
            } else {
                loc.showLoc(false);
                loc.visible = false;
                setMarkerVisibility();
            }
        });
    });

    //GET Dark Sky Weather API JSON data, append to Dark Sky widget (4, 5, 6)
    self.weatherSummary = ko.observable(); // (25)
    self.weatherTemp = ko.observable();
    self.weatherSummary = ko.observable();
    self.weatherHumidity = ko.observable();
    self.weatherUv = ko.observable();

    var darkSkyUrl = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/bf08b879669df44747fbb2ef9b9c2326/25.7823404,-80.3695441';
    $.getJSON(darkSkyUrl, function (data) {
        var weatherJson = data.currently;
        weatherSummary(weatherJson.summary);
        weatherTemp(weatherJson.temperature + ' &deg;F');
        weatherHumidity('Humidity: ' + Math.round(weatherJson.humidity * 100) + '%');
        weatherUv('UV Index: ' + weatherJson.uvIndex);

    //error handling for failed JSON (7)
    }).fail(function (e) {
        $("#weatherBox").text('Weather Data Failed to Load!');
    });

    //GET NY Times API JSON data, append to NY Times
    self.nytSnippet = ko.observable("Articles related to locations will display here when locations are clicked...");
    self.nytUrl = ko.observable();
    self.nytUrlText = ko.observable();

    self.nyTimesApiData = function (id) {
        var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + locations[id].title + '&sort=newest&api-key=005923b487ff4d8bb41847183af3574f';
        $.getJSON(nytimesUrl, function (data) {
            var articles = data.response.docs;
            nytSnippet(articles[0].snippet.substring(0, 130) + "...");
            nytUrl(articles[0].web_url);
            nytUrlText("Read full NY Times article");

            //error handling for failed JSON
        }).fail(function (e) {
            $("#nyTimesBox").text('News Articles Failed to Load!');
        });
    };
    
}
ko.applyBindings(new AppViewModel());

//knockout click binding function, opens relevant infowindow for each list item clicked
function gotoMarker(id) {
    stopMarkerAnimation();
    var marker = locations[id].marker;
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    marker.infowindow.open(map, marker);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    map.setZoom(13);
    map.panTo(marker.position);
    nyTimesApiData(id);
}


