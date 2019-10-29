import Vocabot from './client.js';
import config from './config/config.json';

// initialize the bot
const client = new Vocabot();
client.login(config.bot.token);
