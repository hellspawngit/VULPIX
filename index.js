const Discord = require("discord.js");
const weather = require("weather-js");
const YTDL = require('ytdl-core');
const ytapi = require('./YoutubeAPI.js');
const db = require("quick.db");
const cheerio = require("cheerio");
const snekfetch = require("snekfetch");
const querystring = require("querystring");
const api = "https://images.google.com/";
const fs = require('fs');

const marinlist = [
    "https://media.discordapp.net/attachments/380201502045634571/402610172897525769/image.png?width=272&height=300",
    "https://cdn.discordapp.com/attachments/380485638635520001/400855155668549637/mcis.jpg",
    "https://media.discordapp.net/attachments/380485638635520001/398639665542070294/unknown.png?width=298&height=300",
    "https://media.discordapp.net/attachments/380485638635520001/401225802831626242/sketch-1515729909443.png?width=169&height=301",
    "https://youtu.be/ZdMRMypdtfk",
    "https://media.discordapp.net/attachments/380459393235288064/399649868924321792/image.png?width=212&height=300",
    "https://media.discordapp.net/attachments/380459393235288064/399649580012273665/marinblox.png?width=400&height=211",
    "https://media.discordapp.net/attachments/380459393235288064/399010894706769931/2018-01-05_13.png?width=400&height=225",
    "https://i.redd.it/9yha44ayp4801.png",
    "https://b.thumbs.redditmedia.com/HLSWvuDmNeqpm897GIlFggHoN0LQenkcqGrANTfxQCc.jpg",
    "http://i.imgur.com/2mdaIYG.jpg",
    "https://cdn.discordapp.com/attachments/392285545289744398/402422164180959232/unknown.png",
    "https://i.redditmedia.com/7SuWJ8Tjw57yHYVmfY10RN-taDfREM_MnZCEN-4FRfI.png?w=1024&s=716db816b150c6b0f569ea03c5935374",
    "https://i.redditmedia.com/2XbPtrOVJ3jQTwMjEYIlHyKPjuy9VS9kSmsi3Ropq2U.jpg?w=585&s=728c4057adfaa54e9d55ff2123ef1767",
    "https://cdn.discordapp.com/attachments/380459393235288064/389923737497108480/unknown.png thot bait",
    "https://media.discordapp.net/attachments/380459393235288064/380537087616614436/note_2.jpg?width=226&height=301",
    "https://cdn.discordapp.com/attachments/402301636904747008/402618127700983817/santa-clause.png",
    "https://cdn.discordapp.com/attachments/402301636904747008/402618127700983816/Shadow_the_Hedgehog_Coverart.png",
    "https://cdn.discordapp.com/attachments/402301636904747008/402618256353001472/81S8S6iFkIL._SL1500__2_2_2_2_2_2_2.png",
  "https://cdn.discordapp.com/attachments/402301636904747008/402618127076163585/downloadef16bf59__2fstorage_2femulated_2f0_2fDownload_2fmlss_mario-hammer.png",
    "https://images-ext-1.discordapp.net/external/hAe8sV6W7hfU96QNpFLjsDm0nCQwLtiCPsZ6rTe2q-M/https/media.discordapp.net/attachments/265381707312660480/366217251424174080/unknown.png?width=400&height=221"
];
var bot = new Discord.Client();
var prefix = "?";
var PREFIX = "?";
var Fortunes = [
    "Yes",
    "No",
    "Maybe",
    "Definitely",
    "Reply is hazy",
    "Ask again later",
    "Outcome not looking too good"
];
var nowplaying = {};
var volume = {};
var servers = {};
var sacrifices = [
    " was brutally stabbed in the name of God",
    " talked shit to a feminist",
    " walked into the wrong neighborhood",
    " overate KFC",
    " unironically played Roblox",
    " was mugged",
    " hung themselves",
    " ran out into heavy traffic",
    " choked on something"
];

bot.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'welcome');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome our newest member, ${member}!`);
});

bot.on("message", function(message) {
    if (message.content == "v.kick") {
return message.channel.send("Victini is allowed here.")}
});

function play(connection, message) {
    var server = servers[message.guild.id];

    nowplaying[message.guild.id] = server.queue.shift();
    var video = nowplaying[message.guild.id];

    var iconurl = bot.user.avatarURL;
    var embed = new Discord.RichEmbed()
        .setAuthor("Music", iconurl)
        .setColor([0, 255, 0])
        .setDescription("**Now Playing:**\n" +
        video.title)
        .setThumbnail(video.thumbnail)
    message.channel.send(embed); // This sends a message of the current music playing

    server.dispatcher = connection.playStream(YTDL(video.url, { filter: "audioonly" })); // This will stream only the audio part of the video.
    if (volume[message.guild.id]) // This checks if the user have set a volume
        server.dispatcher.setVolume(volume[message.guild.id]); // This sets the volume of the stream

    server.dispatcher.on("end", function () {
        nowplaying[message.guild.id] = null;
        if (server.queue.length > 0)
            play(connection, message);
        else {
            connection.disconnect();
            server.dispatcher = null;
        }
    });
}

bot.on("ready", function() {
    console.log("vulpix is online");
})

bot.on("ready", function() {
    bot.user.setActivity(`around in ${bot.guilds.size} servers!`);
});

bot.on("message", function(message){
    if (message.content == "hello") {
        message.channel.send("Hi, there!");
    }
});

bot.on("message", function(message){
    if (message.content == "agree") {
        message.delete();
    }
})



bot.on("message", function(message) {
    // Message Leveling System - Make sure you require quick.db
    db.updateValue(message.author.id + message.guild.id, 1).then(i => { // You pass it the key, which is authorID + guildID, then pass it an increase which is 1 in this instance.
        // It also returns the new updated object, which is what we will use.

        let messages;
        if (i.value == 25) messages = 25; // Level 1
        else if (i.value == 50) messages = 50; // Level 2
        else if (i.value == 100) messages = 100; // Level 3 - You can set these to any number, and any amount of them.
        else if (i.value == 200) messages = 200;
        else if (i.value == 300) messages = 300;
        else if (i.value == 450) messages = 450;
        else if (i.value == 715) messages = 715;
        else if (i.value == 999) messages = 999;
        else if (i.value == 1025) messages = 1025;
        else if (i.value == 2000) messages = 2000;

        if (!isNaN(messages)) { // If messages IS STILL empty, run this.
            db.updateValue(`userLevel_${message.author.id + message.guild.id}`, 1).then(o => { // This returns the updated object of userLevel_ID. 
                message.channel.send(`You sent ${messages} messages, so you leveled up! You are now level ${o.value}`) // Send their updated level to the channel.
            })
        }

    })
      if (!message.content.startsWith(prefix) || message.author.equals(bot.user)) return;
    
      var args = message.content.substring(prefix.length).split(" ");
     
    switch (args[0].toLowerCase()) {
        case "8ball":
            message.channel.send(Fortunes[Math.floor(Math.random() * Fortunes.length)]);    
        break;
        case "say":
            var modRole = message.guild.roles.find("name", "Vulpix Admin");
              if (!message.member.roles.has(modRole.id)) return;
            var channels = message.mentions.channels.first();
        if (channels) {
          var wordstosay = args.slice(2).join(" ");
            message.delete();
            channels.send(wordstosay)
        } else {
          var wordstosay = args.slice(1).join(" ");
          message.delete();
          message.channel.send(wordstosay);
        }
        break;
        case "sacrifice":
            let sacrifice = args.slice(1).join(" ");
                message.channel.send(sacrifice + sacrifices[Math.floor(Math.random() * sacrifices.length)]);
        break;
        case "kick":
            var modRole = message.guild.roles.find("name", "Vulpix Admin");
            var reason = args.slice(2).join(" ");
            if (!message.member.roles.has(modRole.id)) return;
                 let kickMember = message.guild.member(message.mentions.users.first());
            if (!kickMember) return message.channel.send("You must mention someone to kick!");
                  message.guild.member(kickMember).kick(reason);
              message.channel.sendMessage(`${kickMember.username} has been kicked!\n Reason: ${reason}`);
        break;
        case "ban":
            message.channel.send("https://cdn.discordapp.com/attachments/398289142443802636/402620225125613582/image-1.png");
        break;
        case "banfr":
            var modRoless = message.guild.roles.find("name", "Vulpix Admin");
            if (!message.member.roles.has(modRoless.id)) return;
            var banMember = message.guild.member(message.mentions.users.first());
            if (!banMember) return message.channel.send("You must mention a member to ban!");
            var reason = args.slice(2).join(" ");
      message.guild.member(banMember).ban(reason);
      message.channel.sendMessage(`${banMember.username} has been banned.\n Reason: ${reason}`);
        break;
        case "banish":
            var modRoles = message.guild.roles.find("name", "Vulpix Admin");
            if (!message.member.roles.has(modRoles.id)) return;
            let banishrole = message.guild.roles.find("name", "Banished");
            let memberbanish = message.mentions.members.first();
            var reason = args.slice(2).join(" ");
            if (!memberbanish) return message.channel.send("Mention a user to banish!");
            memberbanish.addRole(banishrole).catch(console.error);
            message.channel.send(`${memberbanish} has been banished!\nReason: ${reason}`)
        break;
        case "poll":
            let question = args.slice(1).join(" ");
            let pollmember = message.author;
            if (!question) {
                return message.channel.send("You can't make a poll without a question!");
            }
            message.delete();
            message.channel.send(`:ballot_box: ${pollmember} has started a poll! React to the next message with :ballot_box_with_check: or :regional_indicator_x: to vote! :ballot_box:}`);
            message.channel.send(question)
            .then(function(message) {
                message.react("☑");
                message.react("🇽");
            });
        break;
      case "marinhead":
        message.channel.send("https://cdn.discordapp.com/attachments/380459393235288064/402889988796055555/385604811833475074.png");
      break;
      case "purge":
            if (!message.member.roles.some(r=>(["Vulpix Admin"].includes(r.name)))) return;
            const user = message.mentions.users.first();
            const amount = !!parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) :                         parseInt(message.content.split(' ')[2])
            if (!amount) return message.reply('Must specify an amount to delete!');
            if (!amount && !user) return message.reply('Must specify a user and amount, or just an amount, of messages to purge!');
            message.channel.fetchMessages({
             limit: amount,
            }).then((messages) => {
             if (user) {
                const filterBy = user ? user.id : Client.user.id;
                 messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
                 }
                 message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
});
        break;
        case "invite":
            message.channel.send("Invite me to your server!\n https://discordapp.com/oauth2/authorize?client_id=402626251669504002&scope=bot&permissions=8");
        break;
        case "help":
            message.author.send("Here is a list of all available commands and their functions!\n\n```8ball - gives a fortune\ninvite - provides an invite link for Vulpix\nasl - fun little command\npurge - purges messages from a channel\nsay - says a message\nkick - kicks a user\nbanfr - bans a user\nbanish - banishes a user\nsacrifice - sacrifices a user\nweather - shows weather for your area\npoll - makes a simple yes or no poll\nplay - plays a song\nskip - skips song in queue\nstop - stops queue\nqueue - shows queue\nplaying - shows song currently playing\nvolume - changes volume of the bot\nuser - shows info for a mentioned user\nserver - shows info for a server\njointime - shows when you joined a server\npdp - posts an image of pewdiepie\ncena - shows an are you sure about that meme\ngoogle - performs a google search\nnsfw - gives the nsfw role to a user\nwelchrom - sends the standard welchrom image\nmarin - sends a marin meme\n?ban - try it out for yourself```\n More coming soon!");
        break;
        case "asl":
            let age = args[1];
            let sex = args[2];
            let location = args[3];
                message.channel.send(`Hi, there, I see you're a ${age} year old ${sex} from ${location}. Wanna hook up?`);
        break;
        case "weather":
        weather.find({search: args.join(" "), degreeType: 'F'}, function(err, result) {
            if (err) message.channel.send(err);
            if (result.length === 0) {
                message.channel.send('**Please enter a valid location.**')
                return;
            }

            var current = result[0].current;
            var location = result[0].location;

            const embed = new Discord.RichEmbed()
                .setDescription(`**${current.skytext}**`)
                .setAuthor(`Weather for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(0x00000) 
                .addField('Timezone',`UTC${location.timezone}`, true) // This is the first field, it shows the timezone, and the true means `inline`, you can read more about this on the official discord.js documentation
                .addField('Degree Type',location.degreetype, true)// This is the field that shows the degree type, and is inline
                .addField('Temperature',`${current.temperature} Degrees`, true)
                .addField('Feels Like', `${current.feelslike} Degrees`, true)
                .addField('Winds',current.winddisplay, true)
                .addField('Humidity', `${current.humidity}%`, true)

                // Now, let's display it when called
                message.channel.send({embed});
        });
        break;
        case "play":
            var iconurl = bot.user.avatarURL;

            if (!args[1]) {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Music", iconurl)
                    .setColor([255, 0, 0])
                    .setDescription(`**Usage:** ${PREFIX}play <link/search query>`)
                message.channel.send(embed);
                return;
            }
            if (!message.member.voiceChannel) {
                message.channel.send("You must be in a voice channel");
                return;
            }
            if (!servers[message.guild.id])
                servers[message.guild.id] = {
                    queue: []
                };

            var server = servers[message.guild.id];
            var search;

            if (args[1].toLowerCase().startsWith('http'))
                search = args[1];
            else
                search = message.content.substring(PREFIX.length + args[0].length + 1);

            ytapi.getVideo(search).then(function (video) {

                server.queue.push(video);

                if (server.dispatcher) {
                    if (server.queue.length > 0) {
                        var embed = new Discord.RichEmbed()
                            .setAuthor("Music", iconurl)
                            .setColor([0, 255, 0])
                            .setDescription("**Added to queue:**\n" +
                            video.title)
                            .setThumbnail(video.thumbnail)
                        message.channel.send(embed);
                    }
                }

                if (!message.guild.voiceConnection)
                    message.member.voiceChannel.join().then(function (connection) {
                        if (!server.dispatcher)
                            play(connection, message);
                    })
                else {
                    if (!server.dispatcher)
                        play(message.guild.voiceConnection, message);
                }
            });
            break;
        case "skip":
            var server = servers[message.guild.id];
            if (server.dispatcher) {
                server.dispatcher.end();
            }
            break;
        case "stop":
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection) {
                message.guild.voiceConnection.disconnect();
                server.queue.splice(0, server.queue.length);
            }
            break;
        case "pdp":
    message.channel.send("https://media.discordapp.net/attachments/351841143337648128/402394831806005248/download_2.jpeg");
        break;
        case "welchrom":
            message.channel.send("https://cdn.discordapp.com/attachments/265381707312660480/350418140347367424/7e8.png")
        break;
        case "bubba":
            message.channel.send("Subscribe to our god\nhttp://twitch.tv/bubbajunkgaming\nhttps://www.youtube.com/channel/UC6duKuz7VicdFW-47Fa_SGw");
        break;
        case "playing":
            var iconurl = bot.user.avatarURL;
            if (nowplaying[message.guild.id]) {
                var video = nowplaying[message.guild.id];
                var embed = new Discord.RichEmbed()
                    .setAuthor("Music", iconurl)
                    .setColor([0, 255, 0])
                    .setDescription("**Now Playing:**\n" +
                    video.title)
                    .setThumbnail(video.thumbnail)
                message.channel.send(embed);
            }
            else {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Music", iconurl)
                    .setColor([0, 255, 0])
                    .setDescription("No music is playing.")
                message.channel.send(embed);
            }
            break;
        case "queue":
            var iconurl = bot.user.avatarURL;
            if (nowplaying[message.guild.id]) {
                var video = nowplaying[message.guild.id];
                var server = servers[message.guild.id];
                var desc = `**Now Playing:**\n${video.title}\n\n`;
                for (var i = 0; i < server.queue.length; i++) {
                    if (i == 0) {
                        desc = desc + "**Queue:**\n";
                        desc = desc + `**${i + 1}.** ${server.queue[i].title}\n`;
                    }
                    else {
                        desc = desc + `**${i + 1}.** ${server.queue[i].title}\n`;
                    }
                }
                var embed = new Discord.RichEmbed()
                    .setAuthor("Music", iconurl)
                    .setColor([0, 255, 0])
                    .setDescription(desc)
                message.channel.send(embed);
            }
            else {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Music", iconurl)
                    .setColor([0, 255, 0])
                    .setDescription("No music is playing.")
                message.channel.send(embed);
            }
            break;
        case "volume":
            var iconurl = bot.user.avatarURL;
            if (!args[1]) {
                var embed = new Discord.RichEmbed()
                    .setAuthor("Music", iconurl)
                    .setColor([255, 0, 0])
                    .setDescription(`**Usage:** ${PREFIX}volume <volume>`)
                message.channel.send(embed);
                return;
            }

            if (args[1] < 0 || args[1] > 100) {
                message.channel.send("Invalid Volume! Please provide a volume from 0 to 100.");
                return;
            }

            volume[message.guild.id] = Number(args[1]) / 100;
            var server = servers[message.guild.id];
            if (server.dispatcher) {
                server.dispatcher.setVolume(volume[message.guild.id]);
                message.channel.send(`Volume set: ${args[1]}%`);
            }
            break;
        case "marin":
              message.channel.send(marinlist[Math.floor(Math.random() * marinlist.length)]);
        break;
        case "google":
            // These are our two variables. One of them creates a message while we preform a search,
   // the other generates a URL for our crawler.
   var searchThing = args.slice(1).join(" ");
   var searchMessage = message.reply('Searching... Sec.');
   var searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchThing)}`;
   return snekfetch.get(searchUrl).then((result) => {
      var $ = cheerio.load(result.text);
      var googleData = $('.r').first().find('a').first().attr('href');
      googleData = querystring.parse(googleData.replace('/url?', ''));
      message.channel.send(`Result found!\n${googleData.q}`);
  }).catch((err) => {
     searchMessage.edit('No results found!');
  });
        break;
        case "cena":
         message.channel.send("https://media.discordapp.net/attachments/310876332978601985/401071959607083008/117770200.png?width=400&height=300");
        break;
        case "user":
            var userData = message.mentions.users.first();
            if (!userData) return message.channel.send("Please mention a user to gather info for!");
            var serverData = message.channel.guild;
            var embed = new Discord.RichEmbed()
                .setTitle(`Data for ${userData.username}`)
                .setThumbnail(userData.avatarURL)
                .setDescription(`User since ${userData.createdAt}`)
                .setColor(0xc00000)
                .addField("Last Message",userData.lastMessage,true)
                .addField("Status",userData.presence.status,true)
                .addField("Bot?",userData.bot,true)
            message.channel.send(embed);
            db.fetchObject(userData.id + message.guild.id).then(i => {
            db.fetchObject(`userLevel_${userData.id + message.guild.id}`).then(o => {
                message.channel.send('Messages sent: `' + (i.value + 1) + '`\nLevel: `' + o.value + '`')
                })})
        break;
       case "server":
            var serverData = message.channel.guild;
            var embed = new Discord.RichEmbed()
                .setTitle(`Info for ${serverData.name}`)
                .setThumbnail(serverData.iconURL)
                .setDescription(`Server since ${serverData.createdAt}`)
                .setColor(0xcFFFFF)
                .addField("Member Count",serverData.memberCount,true)
                .addField("Region",serverData.region,true)
                .addField("Status",serverData.available,true)
                .addField("Owner",serverData.owner,true)
            
            message.channel.send(embed);
        break;
        case "jointime":
            message.reply(`You joined **${message.channel.guild.name}** at this time: ${message.member.guild.joinedAt}`)
        break;
        case "nsfw":
            var nsfwRole = message.guild.roles.find("name", "nsfw");
            if (!nsfwRole) {
                var nsfwRole2 = message.guild.roles.find("name", "mature");
                if (!nsfwRole2) return;
                message.member.addRole(nsfwRole2)
                message.channel.send("You norty boi :smirk: :smirk:")
            }
            message.member.addRole(nsfwRole);
            message.channel.send("You norty boi :smirk: :smirk:")
        break;
        case "info":
            message.reply("I am Vulpix, created by ``Nathan#9944``. If you need help, use the ?help command or join this server!\nhttps://discord.gg/Kcy3WNe")
        break;
        case "createguild":
            var servername = args.slice(2).join(" ")
            var godRoleName = args[1];
            async function createGuild(bot, message) {
  try {
    const guild = await bot.user.createGuild(servername, 'us-south');
    const defaultChannel = guild.channels.find(c=> c.permissionsFor(guild.me).has("SEND_MESSAGES"));
    const invite = await defaultChannel.createInvite();
    await message.author.send(invite.url);
    const role = await guild.createRole({ name:godRoleName, permissions:['ADMINISTRATOR'] });
    await message.author.send(role.id);
  } catch (e) {
    console.error(e);
  }
}
createGuild(bot, message);
        break;
        default:
            message.channel.send("Invalid command");
        break;
                                 }
})

bot.login(process.env(BOT_TOKEN));
