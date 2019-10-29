import { Command, CommandUtil } from 'discord-akairo';
import { Message } from 'discord.js';
import Category from '@app/Category';

export default class PingCommand extends Command {
  constructor() {
    super('ping', {
      aliases: ['ping', 'rtt', 'heartbeat'],
      category: Category.Utility,
      editable: true,
      args: [
        {
          id: 'details',
          match: 'flag',
          prefix: ['--details', '-d'],
          description: 'Adds detailed informations about the ping.',
        },
      ],
      description: 'Pings the bot.',
    });
  }

  exec(message: Message, args: any): any {
    return (<CommandUtil>message.util).send('Pong!').then((sent: Message | Message[]) => {
      if (Array.isArray(sent)) {
        return;
      }

      if (args.details) {
        const full = ((<any>sent).editedAt || (<any>sent).createdAt) - ((<any>message).editedAt || (<any>message).createdAt);
        return (<Message>sent).edit(`${sent.content}\n> Took a full **${full}** ms trip-time, for a **${Math.round(this.client.ping)}** ms heartbeat.`);
      }
    });
  }
}
