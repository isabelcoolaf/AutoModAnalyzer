const DankChat = require("dank-twitch-irc");
require('dotenv').config();

const TWITCH_LOGIN_NAME = process.env.TWITCH_LOGIN_NAME;
const TWITCH_OAUTH_KEY = process.env.TWITCH_OAUTH_KEY;
const ACTIVE_CHANNEL = process.env.ACTIVE_CHANNEL;
const PREFIX = process.env.PREFIX;

const client = new DankChat.ChatClient({
	username: TWITCH_LOGIN_NAME,
	password: TWITCH_OAUTH_KEY
});

client.connect();
client.join(ACTIVE_CHANNEL);

client.on("ready", () => console.log("Connected"));
client.on("PRIVMSG", (msg) => {
	if (msg.displayName === TWITCH_LOGIN_NAME) return;
  const command = PREFIX + "automoddebug";
	if (!msg.messageText.startsWith(command)) return;
	
  var firstInputIndex = command.length + 1;
	const input = msg.messageText.substring(firstInputIndex);

	const ircFlags = msg.flagsRaw;
	const incidentArray = ircFlags.split(",");

	if (ircFlags === "") {
		client.say(msg.channelName, `@${msg.displayName}, AutoMod seems to be happy with your input! SeemsGood`);
		return;
	}

	client.say(msg.channelName, `@${msg.displayName}, AutoMod found ${incidentArray.length} issue${incidentArray.length==1? '' : 's'} with your input D:`);
	client.say(msg.channelName, `@${msg.displayName}, Here is a detailed breakdown:`);
	
	var incidentIndex = 0;
	incidentArray.forEach(incident => {
		let positionString = incident.split(":")[0];
		let positionA = positionString.split("-")[0];
		let positionB = positionString.split("-")[1];
		
		if (incidentArray.length > 1) client.say(msg.channelName, `@${msg.displayName}, ISSUE ${++incidentIndex}`);
		let highlightedInput = msg.messageText.slice(firstInputIndex, positionA) + "[[" + msg.messageText.slice(positionA, parseInt(positionB) + 1) + "]]" + msg.messageText.slice(parseInt(positionB) + 1);
		client.say(msg.channelName, `@${msg.displayName}, ISSUE LOCATION: ${highlightedInput}`);

		let issueArray = incident.split(":")[1].split("/");
		client.say(msg.channelName, `@${msg.displayName}, ${issueArray.length} categor${issueArray.length==1? 'y' : 'ies'} identified by AutoMod at this location:`);

		issueArray.forEach(issue => {
			let category = issue.split(".")[0];
			let level = issue.split(".")[1];
			switch (category) {
				case "A":
					category = "Aggressive Content";
					break;
				case "I":
					category = "Identity-Based Hate";
					break;
				case "S":
					category = "Sexual Content";
					break;
				case "P":
					category = "Profane Content";
					break;
				default:
					break;
			}

			client.say(msg.channelName, `@${msg.displayName}, ${category} identified at level ${level}.`);

		});

	});

});

