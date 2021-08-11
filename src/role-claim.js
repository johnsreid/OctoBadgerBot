const { Emoji } = require('discord.js');
const firstMessage = require('./first-message');

module.exports = client => {
  const channelId = '871645556450164736';

  const getEmoji = emojiName => client.emojis.cache.find(emoji => emoji.name === emojiName);

  const emojis = {
    goombacat: "3DWorldGang",
    tetris: "Tetris"
  }

  const reactions = [];

  let emojiText = '';
  for (const key in emojis) {
    const emoji = getEmoji(key);
    reactions.push(emoji);

    const role = emojis[key];
    emojiText += `${emoji} = ${role}\n`;
  }

  firstMessage(client, channelId, emojiText, reactions);

  const handleReaction = async (reaction, user, add) => {
    if (user.id === '858298313564487762') { // The bot user
      return;
    }

    console.log(reaction)

    const emojiName = reaction._emoji.name;

    const {guild} = reaction.message;

    const roleName = emojis[emojiName];
    if (!roleName) {
      return;
    }

    const role = guild.roles.cache.find(role => role.name === roleName);
    const member = guild.members.cache.find(member => member.id === user.id);

    // How do I handle the error from the following if 

    try {
      if (add) {
        await member.roles.add(role);
      } else {
        await member.roles.remove(role);
      }
    } catch (e) {
      reaction.message.channel.send("There seems to be a problem changing this role. Probably permissions?");
    }
  }

  client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.channel.id === channelId) {
      handleReaction(reaction, user, true);
    }
  });

  client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.message.channel.id === channelId) {
      handleReaction(reaction, user, false);
    }
  });
}
