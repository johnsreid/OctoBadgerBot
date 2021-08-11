const {prefix} = require("./config.json");

module.exports = (client, aliases, callback) => {
	if (typeof aliases === 'string') {
		aliases = [aliases];
	}
	
	client.on("message", message => {
		// Just initial checks for speed
		if (message.author.bot) return;

		const {content} = message;
		if (!content.startsWith(prefix)) return;
		
		aliases.forEach(alias => {
			const command = `${prefix}${alias}`
			
			if (content.startsWith(`${command} `) || content === command) {
				console.log(`Command ${command} ran by ${message.author.username}`);
				callback(message);
			}
		});
		
		
		
		
/*		if (message.author.bot) return;
		if (!message.content.startsWith(prefix)) return;
		
		const commandBody = message.content.slice(prefix.length);
		const args = commandBody.split(' ');
		const command = args.shift().toLowerCase();
		
		if (command === "ping") {
			const timeTaken = Date.now() - message.createdTimestamp;
			message.reply(`Pong! This message has a latency of ${timeTaken}ms.`);
		};
		
		if (command === "spin") {
			message.reply("Hold your horses! We're not there yet!");
		}*/
	});
}