import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';
import { blacklist } from '@config';

module.exports = class BlacklistInhibitor extends Inhibitor {
  constructor() {
    // @ts-ignore
    super('blacklist', {
      reason: 'blacklist',
      type: 'all',
      category: 'r',
    });
  }

  exec(message: Message) {
    return (<string[]>blacklist.users).includes(message.author.id) || (<string[]>blacklist.guilds).includes(message.guild.id);
  }
};
