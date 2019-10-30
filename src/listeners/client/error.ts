import { Listener } from 'discord-akairo';
import { listener as logger } from '@logger';

export default class ErrorListener extends Listener {
  constructor() {
    super('error', {
      emitter: 'client',
      eventName: 'error',
    });
  }

  async exec(error: Error) {
    logger.error('An unexpected error occured.');
    logger.debug({ metadata: { error } }, error.message);
  }
}
