// Following this guide
// https://www.youtube.com/watch?v=L9XizMFz-p4&list=PLaxxQQak6D_fxb9_-YsmRwxfw5PH9xALe&index=13

const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();
const mongo = require('./mongo');
const command = require ('./command');
const firstMessage = require('./first-message');
const privateMessage = require('./private-message');
const roleClaim = require('./role-claim');
const sendMessage = require ('./send-message');

client.on('ready', async () => {
	console.log('The client is ready!');
  const {prefix} = config;
  console.log('PREFIX:', prefix);

	await mongo().then(mongoose => {
		try {
			console.log('Connected to mongo');
		} finally {
			mongoose.connection.close();
		}
	});

	// Clear the testing channel
	const testChannel = client.channels.cache.get('871645556450164736');
	testChannel.messages.fetch().then((results) => {
		testChannel.bulkDelete(results);
	});

	// roleClaim(client);
	
	command(client, 'ban', message => {
		const { member, mentions } = message;

		const tag = `<@${member.id}>`;

		if (
			member.hasPermission('ADMINISTRAOTR') || 
			member.hasPermission('BAN_MEMBERS')
		) {
			const target = mentions.users.first();
			if (target) {
				const targetMember = message.guild.members.cache.get(target.id);
				targetMember.ban();
				message.channel.send(`${tag} has been banned.`);
			} else {
				message.channel.send(`${tag} Please specifiy someone to ban.`);
			}

		} else {
			message.channel.send(`${tag} You do not have permission to use this command.`);
		}
		
	});

	command(client, 'kick', message => {
		const { member, mentions } = message;

		const tag = `<@${member.id}>`;

		if (
			member.hasPermission('ADMINISTRAOTR') || 
			member.hasPermission('KICK_MEMBERS')
		) {
			const target = mentions.users.first();
			if (target) {
				const targetMember = message.guild.members.cache.get(target.id);
				targetMember.kick();
				message.channel.send(`${tag} The user has been kicked.`);
			} else {
				message.channel.send(`${tag} Please specifiy someone to kick.`);
			}

		} else {
			message.channel.send(`${tag} You do not have permission to use this command.`);
		}
		
	});

  client.user.setPresence({
    activity: {
      name: `${prefix}help for help`
    }
  });

	command(client, 'help', message => {
		message.channel.send("Coming soon");
    message.channel.send(`
    These are my supported commands
    
    **${prefix}help** – display the help menu
    **${prefix}serverinfo** - find out about the server
    **${prefix}spin** - Play the fruit machine in the casino

    `);
	});

	command(client, 'serverinfo', message => {
		const {guild} = message
		if (null === guild) {
			message.channel.send(`You can't check for server info in a DM.`);
			return;
		}

		const {name, region, memberCount, owner, afkTimeout} = guild;
		const icon = guild.iconURL();

		const embed = new Discord.MessageEmbed()
			.setTitle(`Server info for ${name}`)
			.setThumbnail(icon)
			.addFields({
				name: 'Region',
				value: region,
			},{
				name: 'Members',
				value: memberCount,
			},{
				name: 'Owner',
				value: owner.user.tag,
			},{
				name: 'AFK timeout',
				value: `${afkTimeout} seconds`,
			});

		message.channel.send(embed);
	});

	// Let's bang an embed in
	command(client, 'embed', message => {
		const logo = 'https://secure.gravatar.com/avatar/b93a1015848d6ca970d2ffcea1f5ab8b';

		const embed = new Discord.MessageEmbed()
			.setTitle('Example text embed')
			.setURL('https://twitch.tv/JohnSReid')
			.setAuthor(message.author.username)
			.setImage(logo)
			.setThumbnail(logo)
			.setFooter('This is a footer', logo)
			.setColor('#00ff00')
			.addFields({
				name: 'Field1',
				value: 'Hello world',
				inline: true
			},{
				name: 'Field2',
				value: 'Hello world',
				inline: true
			},{
				name: 'Field3',
				value: 'Hello world',
				inline: false
			})

		message.channel.send(embed);
	})

	// Create a mod text channel
	command(client, 'createtextchannel', (message) => {
		if (!message.member.hasPermission('ADMINISTRATOR')) return;
		// !createtextchannel
		const channelName = message.content.replace('!createtextchannel ','');

		message.guild.channels
		.create(channelName, {
			type: 'text'
		}).then(channel => {
			console.log(channel);
			const categoryId = '810906146595405844';
			channel.setParent(categoryId);
		})
	});

	// Create a mod voice channel
	command(client, 'createVoiceChannel', message => {
		if (!message.member.hasPermission('ADMINISTRATOR')) return;
		const channelName = message.content.replace('!createVoiceChannel ','');

		message.guild.channels
		.create(channelName, {
			type: 'voice'
		}).then(channel => {
			const categoryId = '810906146595405844';
			channel.setParent(categoryId);
			channel.setUserLimit(5);
		})
	});

	privateMessage(client, 'ping', 'Pong!');

	// Send a message to me when the bot starts
	// client.users.fetch('207104373715632128').then(user => {
	// 	user.send('Hello world!');
	// })

	// firstMessage(client, '871645556450164736', 'My first message!', ['✅','🕒','👍🏻']);
	
	command(client, ['test'], (message) => {
		console.log(message.channel);
	});
	
	command(client, 'servers', message => {
		client.guilds.cache.forEach((guild) => {
			//console.log(guild);
		message.channel.send(
			`${guild.name} has a total of ${guild.memberCount} members`
		);
		});
	});
	
	command(client, ['cc', 'clearchannel'], (message) => {
		if (message.member.hasPermission('ADMINISTRATOR')) {
			console.log('is admin');
			// console.log(message.channel.messages);
			message.channel.messages.fetch().then((results) => {
				message.channel.bulkDelete(results);
			});
		};
	});

	command(client, 'status', message => {
		const content = message.content.replace(`!status `,'');

		client.user.setPresence({
			activity: {
				name: content,
				type: 0
			}
		})
		 
	});

	command(client, ['spintest','spin'], message => {
		// Set the channel 872385782978056193 to be the fruit machine channel
		// Message in the DM that it doesn't count
		if (message.channel.id !== '872385782978056193') return;

		const removeDuplicates = (array) => [...new Set (array)];

		const emoteObjects = [
			{
				emote: '🍺',
				congrats: 'Wow {member}! You did it! JACKPOT! Have a celebratory drink!'
			},
			{
				emote: '🍻',
				congrats: 'Wow {member}! You did it! JACKPOT! Clinky!'
			},
			{
				emote: '🦡',
				congrats: 'Wow {member}! You did it! BADGERPOT!'
			},
			{
				emote: '🔔',
				congrats: 'Wow {member}! You did it! JACKPOT! Ding dong!'
			},
			{
				emote: '👍🏻',
				congrats: 'Nice one {member}! You did it! JACKPOT!'
			},
			{
				emote: '7️⃣',
				congrats: 'Wow {member}! You did it! JACKPOT! You\'re so lucky!'
			},
			{
				emote: '🤷🏻‍♂️',
				congrats: 'Wow {member}! You did it! JACKPOT?'
			},
			{
				emote: '🤦🏻‍♀️',
				congrats: 'Oh! {member}! You did it! JACKPOT!'
			},
			{
				emote: '👀',
				congrats: 'Look at {member} with their JACKPOT!'
			},
			{
				emote: '😲',
				congrats: 'O M G! {member} got the JACKPOT!'
			},
			{
				emote: '🍀',
				congrats: 'Wow {member}! You did it! JACKPOT! You\'re super lucky!'
			},
			{
				emote: '😬',
				congrats: 'Eeesh. {member} snagged a JACKPOT!'
			},
			{
				emote: '🤣',
				congrats: 'Wow {member}! You did it! JACKPOT!'
			},
			{
				emote: '☕',
				congrats: 'Wow {member}! You did it! JACKPOT! Have a celebratory hot beverage of your choosing.'
			},
			{
				emote: '🎵',
				congrats: 'Lalala {member}! You did it! JACKPOT!'
			},
			{
				emote: '🍒',
				congrats: 'Wow {member}! You did it! JACKPOT! Top of the slots!'
			},
			{
				emote: '🍌',
				congrats: 'Banananananananana {member}! JACKPOT!'
			},
			{
				emote: '💥',
				congrats: 'KAPOW {member}! You did it! JACKPOT! BOOM!'
			},
			{
				emote: '👻',
				congrats: '{member}! You found the spooky JACKPOT!'
			},
			{
				emote: '💯',
				congrats: 'Wow {member}! You gave 100% and grabbed the JACKPOT!'
			}
		];

		let spinResult = [emoteObjects[Math.floor(Math.random()*emoteObjects.length)].emote,
			emoteObjects[Math.floor(Math.random()*emoteObjects.length)].emote,
			emoteObjects[Math.floor(Math.random()*emoteObjects.length)].emote
		];

		if ( message.content === '!spintest' &&  message.author.id === '207104373715632128') {
			spinResult = ['🦡','🦡','🦡'];
		}

		const result = removeDuplicates(spinResult).length;
    message.channel.send(spinResult.join(' '));
		if (1 === result) {
			const emoteResult = emoteObjects.find(e => e.emote === spinResult[0]);
			message.channel.send(emoteResult.congrats.replace('{member}',`<@${message.member.id}>`));
		} else if (2 === result) {
			sendMessage(message.channel, "Oooh. So close. Have a free spin!", 8);
		} else {
			sendMessage(message.channel, "Better luck next time.", 8);
		}
	})
});


client.login(config.BOT_TOKEN);
