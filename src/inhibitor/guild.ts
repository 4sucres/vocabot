import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { blacklist } from '@config';

module.exports = class BlacklistInhibitor extends Listener
{
    constructor() {
        super('block', {
            emitter: 'commandHandler',
            eventName: 'commandBlocked'
        });
    }

    exec(message: Message) {
      return (<string[]>blacklist.users).includes(message.author.id) || (<string[]>blacklist.guilds).includes(message.guild.id);
    }
}
