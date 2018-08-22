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
 * Reply to Slash command both publicly and privately

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
var meetingDurations = ["15","30","45","60","75","90"];

controller.on('slash_command', function (slashCommand, message) {

    // ensure token matches
    if (message.token !== process.env.VERIFICATION_TOKEN) return; 

    var textList = message.text.split(' ');
    for (var userText in textList) {
        userText = userText.toLowerCase();
    }
    var method = textList[0];

    switch (message.command) {
        case "/bookit": //handle the `/bookit` slash command. 
          
            switch (method) {
                case ("help" || ""):
                    slashCommand.replyPrivate(message,
                        "I am here to help you book a room. " + 
                        "Try typing `/bookit find` to see all available rooms in your default office.");  

                // case "defaults":
                    // parse text list for location and duration

                    // persist user defaults

                case "find":
                    var location = textList[1];
                    var duration = textList[2];


                    // Check input format
                    if (officeLocations.indexOf(location) < 0) {
                        slashCommand.replyPrivate(message, "I'm sorry, I do not recognize that office location. Please enter either 'Boston' or 'Waltham'.");
                    } 
                    if (meetingDurations.indexOf(duration) < 0) {
                        slashCommand.replyPrivate(message, "I'm sorry, I can only schedule meetings in increments of 15.");
                    }
                    
                    // return the list of available rooms 
                    

                    // if defaults are not set

                    // if defaults are set


                    // tell user they can set defaults if not set

                    slashCommand.replyPrivate(message, method);

                case "book":
                    slashCommand.replyPrivate(message, "this function has not been implemented yet.");

                default:
                    slashCommand.replyPrivate(message,
                        "I am here to help you book a room. " + 
                        "Try typing `/bookit find` to see all available rooms in your default office.");

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

})
;






