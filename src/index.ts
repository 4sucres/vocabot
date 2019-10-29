import 'module-alias/register';
import Vocabot from './client.js';
import config from '@config';

// initialize the bot
const client = new Vocabot();
client.login(config.bot.token);
