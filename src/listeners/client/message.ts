import { Listener, CommandHandler } from 'discord-akairo';
import { listener as logger } from '@logger';
import { Message } from 'discord.js';
import { Parser } from '@app/Sample/Parser';
import SampleCommand, { KEY } from '@root/commands/vocabank/sample';
import { bot } from '@config';
import v from 'voca';

module.exports = class MessageListener extends Listener {
  constructor() {
    super('message', {
      emitter: 'client',
      eventName: 'message',
    });
  }

  async exec(message: Message) {
    if (message.author.id === bot.id || message.author.bot) {
      return;
    }

    const sample = await Parser.parse(v.trim(message.content));

    if (sample) {
      logger.info('Found a message containing a Vocabank URL or UUID.', sample);
      new SampleCommand().exec(message, {
        [KEY]: sample.data.uuid,
        keep: false,
        silent: true,
        metadata: false,
        anonymous: false,
      });
    }
  }
};
