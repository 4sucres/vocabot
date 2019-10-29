import { AkairoClient, CommandHandler } from "discord-akairo";
import config from './config/config.json';
import path from 'path';

class Vocabot extends AkairoClient
{
    constructor() {
        super({
            ownerID: config.bot.owner,
            prefix: config.bot.prefix,
            handleEdits: true,
            commandUtilLifetime: 120 * 100,
            commandDirectory: path.resolve(__dirname, 'commands'),
            listenerDirectory: path.resolve(__dirname, 'listeners'),
        }, {
            disableEveryone: true
        });
    }
}

export default Vocabot;
