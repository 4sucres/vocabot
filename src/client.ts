import { AkairoClient, CommandHandler } from 'discord-akairo';
import config from '@config';
import path from 'path';

class Vocabot extends AkairoClient {
  constructor() {
    super(
      {
        ownerID: config.bot.owner,
        prefix: config.bot.prefix,
        handleEdits: true,
        commandUtilLifetime: 120 * 100,
        commandDirectory: path.resolve(__dirname, 'commands'),
        listenerDirectory: path.resolve(__dirname, 'listeners'),
        inhibitorDirectory: path.resolve(__dirname, 'inhibitors'),
      },
      {
        disableEveryone: true,
      }
    );
  }
}

export default Vocabot;
