const { TeamSpeakClient } = require("node-ts");
const Entities = require('html-entities').AllHtmlEntities;

const Playlist = require("./playlist");
const youtube = require('./youtube-api');

const entities = new Entities();

/**
 * @param {TeamSpeakClient} client
 * @param {string} message
 * */
function sendChannelMessage(client, message) {
	client.send('sendtextmessage', {
		targetmode: 2,//CHANNEL
		target: 0,//current serveradmin channel
		msg: message
	}).catch(console.error);
}

function addToPlaylist(title, invokerName, client) {
    youtube.searchVideos(title, 1).then((result) => {
        let title = entities.decode(result[0].title);
        Playlist.add(result[0].url, invokerName, title);
        console.log(invokerName, 'added', title, 'to the playlist');
        sendChannelMessage(client, invokerName +  ' added ' + title + ' to the playlist');
        console.log('Playlist size:', Playlist.getSize());
    });
}

module.exports = {
	/**
	 * @param {TeamSpeakClient} client
	 * @param {TextMessageNotificationData} message
	 * */
	handleMessage(client, message) {
		let {msg, invokername, invokerid} = message;
		msg = msg.toString().trim();
		console.log(`Message received from ${invokername}[${invokerid}]: ${msg}`);

		if( !msg.startsWith('!') )//not a command
			return;

		let [cmd, ...args] = msg.substring(1).split(' ');
        switch(cmd.toLowerCase()) {
			default:
				sendChannelMessage(client, 'Unknown command: ' + msg);
				break;
			case 'sr': {// song request
                let song;
				if (args.length < 1) {
					sendChannelMessage(client, 'You need to provide the link to youtube or the title of the song.');
					break;
				}

				else if(args.length === 1) {
                    // noinspection RegExpRedundantEscape
                    song = args[0].replace(/^\[URL\]/i, '')
                        .replace(/\[\/URL\]$/i, '');
                    addToPlaylist(song, invokername, client);
                    break;
                }

				else {
                    addToPlaylist(args.join(' '), invokername, client);
                    break;
                }
			}
			case 'skip': {//skip current song
				let currentInfo;
				if(Playlist.getCurrent() !== undefined) {
					currentInfo = Playlist.getCurrent().title + ' requested by ' + Playlist.getCurrent().clientName;
				}
				if(Playlist.skipCurrent() === true) {
					sendChannelMessage(client, 'Skipping ' + currentInfo);
				}
				else {
					sendChannelMessage(client, 'Queue is empty')
				}
				break;
			}
			case 'skiplast': {//remove the most recent added song from queue
				if(Playlist.skipLast() === true ) {
					sendChannelMessage(client, 'Removed the most recent added song');
				}
				else {
					sendChannelMessage(client, 'Queue is empty');
				}
				break;
			}
            case 'current': {
                sendChannelMessage(client, Playlist.getCurrent().title + ' requested by ' + Playlist.getCurrent().clientName);
                break;
            }
			case 'size': {
				sendChannelMessage(client, Playlist.getSize() + ' songs in the queue');
			}
		}
	}
};