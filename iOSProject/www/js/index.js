/*
 * Esau Rubio
 * Workganize
 * 0613
 */

//Global Variables
var maintenanceTypes = [ "Cleaning" , "Painting", "Electric" , "Plumbing"],
    priority,
    watchAccel,
    markers=[];

// Add Item Store Interactions
$(document).on('pageinit','#crud',function(){
    // Add Select Label
    $("<label></label>")
        .appendTo('#typeOfWork')
        .prop('for', 'worktype')
        .text('What type of work is it?');

    // Add Select Option
    $("<select></select>")
        .appendTo('#typeOfWork')
        .attr("id","worktype")
        .attr("name","worktype")
        .attr("data-native-menu","false");
    for(var i=0,m=maintenanceTypes.length; i<m ; i++){
        $('<option></option>')
            .appendTo('#worktype')
            .attr("value", maintenanceTypes[i])
            .text(maintenanceTypes[i])
    }

    // Camera Functionality
    var cameraSuccess = function(image) {
        $('<img/>')
            .prependTo('#photoSection')
            .prop("src", image)
            .css("width", "100%");
    };

    var cameraError = function(){
        navigator.notification.alert(
            "Could not retrieve Photo",
            function(){},
            "Camera Error",
            "Return");
    };

    $('#takePhoto')
        .on('click',function(){
            navigator.camera.getPicture(cameraSuccess, cameraError)
        });

    // Refresh Style
    $("#additemform").trigger("create");

    // Validate the Data & Store & Check Against Data
    $('#additemform').validate({
        invalidHandler: function(form, validator) {},
        submitHandler: function() {
            // Store Data
            var data = $('#additemform').serializeArray(),
                d = new Date(),
                keyGen = d.getTime(),
                userInput = {};
            userInput.jName = ["Job Name:" , data[0].value ];
            userInput.location = ["Location:" , data[1].value ];
            userInput.worktype = ["Work Type:" , data[2].value ];
            userInput.priority = ["Priority:" , data[3].value ];
            userInput.people   = ["Workers Sent:" , data[4].value ];
            userInput.finishby = ["Finish By:" , data[5].value ];
            userInput.notes    = ["Notes:" , data[6].value ];
            localStorage.setItem(keyGen , JSON.stringify(userInput));
            location.reload()
        }
    });
});

// Create List of Jobs and Elements
$(document).on('pageinit','#views',function(){

    // Compass Functionality
    var compassSuccess = function(heading) {
        navigator.notification.alert(
            "Current Heading: " + heading.magneticHeading,
            function(){},
            "Success!",
            "Return");
    };

    var compassError = function() {
        navigator.notification.alert(
            "Failed to retrieve",
            function(){},
            "Compass Error",
            "Return");
    };

    $('#compass')
        .on("click", function(){
            navigator.compass.getCurrentHeading(compassSuccess, compassError)
        });

    // Accelerometer Functionality
    var accelSuccess = function(accel) {
        $("#x")
            .empty()
            .text('The X Position is: ' + accel.x)
        $("#y")
            .empty()
            .text('The Y Position is: ' + accel.y)
        $("#z")
            .empty()
            .text('The Z Position is: ' + accel.z)
    };

    var accelError = function() {
        navigator.notification.alert(
            "Failed to retrieve",
            function(){},
            "Accelerometer Error",
            "Return");
    };

    var accelOptions = { frequency:1000 };

    $("#accelerometer")
       .on("click", navigator.accelerometer.watchAcceleration(accelSuccess, accelError, accelOptions));

    // Delete All Button
    $('<button></button>')
        .insertBefore('#listofjobs')
        .attr('id', 'delall')
        .text("Delete All")
        .on('click', function(){
            if (localStorage.length !== 0) {
                var areYouSure = confirm("Are you sure you want to clear all Jobs??");
                if(areYouSure ==  true) {
                    localStorage.clear();
                    alert("Jobs Cleared!");
                    location.reload();
                }
            }
        });

// Generate Jobs from Local Storage
    if(localStorage.length > 0) {
        for(var i=0, l=localStorage.length; i<l; i++){
            var key = localStorage.key(i),
                parsed = JSON.parse(localStorage.getItem(key));
            $('<li></li>')
                .appendTo("#listofjobs")
                .attr("id","job"+i);
            $('<h2></h2>')
                .appendTo("#job"+i)
                .text(parsed.location[1]);
            for(var n in parsed){
                $('<p></p>')
                    .appendTo("#job"+i)
                    .text(parsed[n][0] + " " + parsed[n][1]);
            }

            // Edit Link
            $('<button></button>')
                .appendTo('#job'+i)
                .attr('key', key)
                .attr('data-inline', 'true')
                .text("Edit Job")
                .on('click',function(info){
                    var userInput = JSON.parse(localStorage.getItem($(info.currentTarget).attr('key')));
                    $('#jName').prop('value', userInput.jName[1]);
                    $('#location').prop('value', userInput.location[1]);
                    $('#' + userInput.priority[1].toLowerCase()).attr('checked', true);
                    $('#people').prop('value', userInput.people[1]);
                    $('#finishby').prop('value', userInput.finishby[1]);
                    $('#notes').prop('value', userInput.notes[1]);
                    $('option[value=' + userInput.worktype[1] + ']').prop('selected', true);
                    window.location = "#crud";

                    var keyGen = $(info.currentTarget).attr('key');
                });

            // Delete Link
            $('<button></button>')
                .appendTo('#job'+i)
                .attr('key', key)
                .attr('data-role', 'button')
                .attr('data-inline', 'true')
                .text('Delete Job')
                .on('click',function(info){
                    var
                        ask = confirm('Are you Sure?');
                    if (ask) {
                        localStorage.removeItem($(info.currentTarget).attr('key'));
                        location.reload();
                    }
                });
        }
    } else {
        $("#heads").text("No Jobs to Display!");
        $('#delall')
            .text('Return to add Jobs!')
            .on('click', function(){
                window.location.hash = "crud";
            })
    }
    $('#set').trigger('create');
});

// Instagram API
$(document).on('pageinit', '#integration', function(){
    //Adds Instagram Elements to Page
    var addImage = function(data, n){
        $('<div></div>')
            .appendTo('#instafeed')
            .prop('id','instaG'+n)
            .prop('class', 'ui-block-a')
            .css('margin','10px');
        $('<img/>')
            .appendTo('#instaG'+n)
            .prop('src',data.data[n].images.low_resolution.url);
        $('<p></p>')
            .appendTo('#instaG'+n)
            .text("Username: " + data.data[n].user.username);
        $('<p></p>')
            .appendTo('#instaG'+n)
            .text("Likes: " + data.data[n].likes.count);
    };

    // Gets the Data from the Page
    var getFeed = function() {
        $.getJSON("https://api.instagram.com/v1/media/popular?client_id=7b6f5f09559a46459bb1e3a6c339e8a2&callback=?",
            function(data){
                for(n in data.data){
                    addImage(data,n);
                }
            }
        );
    };

    getFeed();
});

// Gain access to Google Maps API
$(document).on('pageshow','#map',function(){

    var onSuccess = function(position){
        mapsInitialize(position.coords.latitude, position.coords.longitude)
    };

    var onError = function(error) {
       navigator.notification.alert(
           "Could not retrieve Location",
           mapsInitialize(0, 0),
           "Location Error",
           "Reset to Default")
    };


    var mapsInitialize = function(lat,lng) {
        var mapOptions = {
            center: new google.maps.LatLng(lat ,lng ),
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    /*// To add new Marker
    var add = function(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });

        var information = new google.maps.InfoWindow({
            content: '<a href="#crud"><button id="infoWindow" data-inline="true">Click Here to Select</button></a>'
        });

        // GeoCode Marker
        $('#map').on('click', '#infoWindow', function(){
            console.log(location.jb + ', ' + location.kb);
            $('#location').prop('value', [location.jb,location.kb])
        });

        google.maps.event.addListener(marker, 'click', function() {
            information.open(map,marker);
        });

        markers.push(marker);
    };

    // Select All Overlays
    var setAllMap = function(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    };

    // Clear Previous Marker
    var clear = function() {
        setAllMap(null);
        markers = [];
    };

    // On Click Functionality
    google.maps.event.addListener(map, 'click', function(event) {
        clear();
        add(event.latLng);
    });*/
});

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};