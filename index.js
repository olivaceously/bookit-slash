/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______    ______    ______   __  __    __    ______
 /\  == \  /\  __ \  /\__  _\ /\ \/ /   /\ \  /\__  _\
 \ \  __<  \ \ \/\ \ \/_/\ \/ \ \  _"-. \ \ \ \/_/\ \/
 \ \_____\ \ \_____\   \ \_\  \ \_\ \_\ \ \_\   \ \_\
 \/_____/  \/_____/    \/_/   \/_/\/_/  \/_/    \/_/


 This is a sample Slack Button application that provides a custom
 Slash command.

 This bot demonstrates many of the core features of Botkit:

 *
 * Authenticate users with Slack using OAuth
 * Receive messages using the slash_command event
 * Reply to Slash command both publicly and privately-

 # RUN THE BOT:

 Create a Slack app. Make sure to configure at least one Slash command!

 -> https://api.slack.com/applications/new

 Run your bot from the command line:

 clientId=<my client id> clientSecret=<my client secret> PORT=3000 node bot.js

 Note: you can test your oauth authentication locally, but to use Slash commands
 in Slack, the app must be hosted at a publicly reachable IP or host.


 # EXTEND THE BOT:

 Botkit is has many features for building cool and useful bots!

 Read all about it here:

 -> http://howdy.ai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
}

var config = {}
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: './db_slackbutton_slash_command/',
    };
}

var controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands'],
    }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});


//
// BEGIN EDITING HERE!
//

var officeLocations = ["boston","waltham"];
//var meetingDurations = ["15","30","45","60","75","90"];
var meetingRooms = ["Asteroids","Centipede","Contra","Donkey Kong","Frogger","Galaga","Myst","Pac-Man","Pong","Q*Bert","Tetris","Tron","Zelda","Bilbo","Boston Common","Bunker Hill","Charles","Constitution","East","Faneuil","Fenway","Frodo","Gandalf","Hynes","Legolas","Newbury","North","Prudential","Sauron","Seagol","South","The Garden","West","Babbage","Glacier","Gosling","Hopper","Minsky","Redwood","Rossum","Shenandoah","Turing","Yellowstone","Yosemite"];

// dict: {'room': ('startTime','endTime')}
var scheduledMeetings = {}

var availableBoston = ["Hopper","Redwood","Rossum","Shenandoah","Turing"];
var availableWaltham = ["Bilbo","Boston Common","Charles","South","The Garden","West"];

var unavailableBoston = ["Babbage","Glacier","Gosling", "Yellowstone"];
var unavailableWaltham = ["Frogger","Galaga","Myst","Pac-Man","Newbury","North"];


meetingRooms = meetingRooms.map(v => v.toLowerCase());
availableBoston = availableBoston.map(v => v.toLowerCase());
availableWaltham = availableWaltham.map(v => v.toLowerCase());
unavailableBoston = unavailableBoston.map(v => v.toLowerCase());
unavailableWaltham = unavailableWaltham.map(v => v.toLowerCase());

controller.on('slash_command', function (slashCommand, message) {

    // ensure token matches
    if (message.token !== process.env.VERIFICATION_TOKEN) return; 

    var textList = message.text.split(' ').map(v => v.toLowerCase());


    var method = textList[0];

    switch (message.command) {
        case "/bookit": //handle the `/bookit` slash command. 
          
            switch (method) {
                case ("help" || ""):
                    //slashCommand.replyPrivate(message, String(JSONrooms.meetingRooms.boston.available[0]));
                    slashCommand.replyPrivate(message,
                        "I am here to help you book a room. Try one of the following: \n\n" + 
                        "`/bookit find [location] [duration]`:\t\t see all available rooms in your specified office. \n" +
                        "`/bookit book [room] [duration]`:\t\t\t\t book a room for a specified period of minutes (15, 30, 45, etc.).");  

                // case "defaults":
                    // parse text list for location and duration

                    // persist user defaults

                case "find":
                    var location = textList[1];
                   // var duration = textList[2];
                    var startTime = textList[2];
                    var endTime = textList[3];

                    if (!isValidLocation(location) || /*!isValidDuration(duration)*/ !isValidTime(startTime) || !isValidTime(endTime))
                        break;
                    
                    // return the list of available rooms 

                    // TODO: make office location upper case
                    if (location === "boston") {
                        slashCommand.replyPrivate(message, 
                            "The conference rooms currently available between " + startTime + " and " + endTime + " are " + toTitleCase(officeLocations[0]) + " are: "
                             + toTitleCase(availableBoston.join(", ")) + ".");
                    } else if (location === "waltham") {
                             slashCommand.replyPrivate(message, 
                            "The conference rooms currently available between " + startTime + " and " + endTime + " are " + toTitleCase(officeLocations[1]) + " are: "
                             + toTitleCase(availableWaltham.join(", ")) + ".");
                    }

                    // if defaults are not set

                    // if defaults are set

                    // tell user they can set defaults if not set

                    //slashCommand.replyPrivate(message, method);

                case "book":
                    var room = textList[1];
                    //var duration = textList[2];
                    var startTime = textList[2];
                    var endTime = textList[3];

                    // Check input format
                    if (!isValidRoom(room) || /*!isValidDuration(duration)*/ !isValidTime(startTime) || !isValidTime(endTime))
                        break;

                    // Check meeting duraiton
                    if (!isValidMeetingDuration(startTime, endTime))
                        break;

                    if (availableBoston.indexOf(room) >= 0) {
                        slashCommand.replyPrivate(message, 
                            "Okay, " + room + " is now booked for " + startTime + " to " + endTime + ".");
                            // removes available room from available array
                            var indexRoom = availableBoston.indexOf(room);
                            availableBoston.splice(indexRoom, 1);
                            unavailableBoston.push(room);

                    }if (availableWaltham.indexOf(room) >= 0) {
                        slashCommand.replyPrivate(message, 
                            "Okay, " + room + " is now booked for " + startTime + " to " + endTime + ".");
                            // removes available room from available array
                            var indexRoom = availableWaltham.indexOf(room);
                            availableWaltham.splice(indexRoom, 1);
                            unavailableWaltham.push(room);

                    } else {
                        slashCommand.replyPrivate(message, 
                            "Sorry, but " + room + " is currently unavailable.");
                    }

                    //slashCommand.replyPrivate(message, "yo we did it!");

                default:
                    slashCommand.replyPrivate(message,
                        "I am here to help you book a room. " + 
                        "Try typing `/bookit help` to see all available options.");

            }
           
            // // if no text was supplied, treat it as a help command
            // if (message.text === "" || message.text === "help") {
            //     slashCommand.replyPrivate(message,
            //         "I am here to help you book a room. " + 
            //         "Try typing `/bookit find` to see all available rooms in your default office.");
            //     // slashCommand.replyPrivate(message, String(slashCommand));
            //     return;
            // }

            // if (method === "find" ) {
            //     slashCommand.replyPrivate(message, method);

            // }

            // // If we made it here, 
            // slashCommand.replyPublic(message, "booked!", function() {
            //     slashCommand.replyPublicDelayed(message, "2").then(slashCommand.replyPublicDelayed(message, "3"));
            // });

        break;
        default:
            slashCommand.replyPublic(message, "error. contact administrators.");

    }

    function toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
     }

    function isValidLocation(location) {
        if (officeLocations.indexOf(location) < 0) {
            slashCommand.replyPrivate(message, "I'm sorry, I do not recognize that office location. Please enter either 'Boston' or 'Waltham'.");
            return false;
        } 
        return true;
    }

    function isValidTime(time) {
        var timeList = time.split(':');
        var hour = timeList[0];
        var minute = '00';
        var invalid = false;
        if (timeList.length > 1)
            minute = timeList[1];

        // checking input is numerical
        if (isNaN(Number(hour)) || isNaN(Number(minute))) {
            invalid = true;
        }

        // checking input is a factor of 15
        minuteNumber = Number(minute);
        if (minuteNumber % 15 != 0) {
            invalid = true;
        }

        // return
        if (invalid) {
            slashCommand.replyPrivate(message, "I'm sorry, I can't book that time. Please enter a time between 8 and 6 within a factor of 15. Ex: '5:15 6:30'");
            return false;
        }
        else {
            return true;
        }
        
    }

    function isValidMeetingDuration(startTime, endTime) {

        startHour = startTime.split(':')[0];
        endHour = endTime.split(':')[0];
        
        // converting to military time
        if (startHour < 7)
            startTime = startTime + 12
        if (endTime < 7)
            endTime = endTime + 12

        var duration = endTime - startTime;
        if (duration > 2) {
            slashCommand.replyPrivate(message, "I'm sorry, but you currently cannot book a room for over 2 hours.");
            return false;
        }
        return true;
    }

    // function isValidDuration(duration) {
    //     if (meetingDurations.indexOf(duration) < 0) {
    //         slashCommand.replyPrivate(message, "I'm sorry, I can only schedule meetings in increments of 15 and up to 90 mins.");
    //         return false;
    //     }
    //     return true;
    // }

    function isValidRoom(room) {
        if (meetingRooms.indexOf(room) < 0) {
            slashCommand.replyPrivate(message, "I'm sorry, I do not recognize that conference room. Type /bookit help if you need more information.");
            return false;
        }
        return true;
    }

});






