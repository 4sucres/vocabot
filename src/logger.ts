import pino, { Logger } from 'pino';
import config from '@config';

const logger: Logger = pino({
  level: config.env.debug ? 'debug' : config.env.log_level || 'info',
  prettyPrint: {
    colorize: true,
    translateTime: true,
    ignore: 'pid,hostname',
    crlf: false,
  },
});

const vocabot = logger.child({ name: 'Vocabot' });
const listener = logger.child({ module: 'Listener' });
const database = logger.child({ module: 'Database' });

process.on(
  'uncaughtException',
  pino.final(vocabot, (err: Error, finalLogger: Logger) => {
    finalLogger.error(err, 'uncaughtException');
    // process.exit(1);
  })
);

process.on(
  // @ts-ignore
  'unhandledRejection',
  pino.final(vocabot, (err: Error, finalLogger: Logger) => {
    finalLogger.error(err, 'unhandledRejection');
    // process.exit(1);
  })
);

export { listener, database, vocabot };
export default vocabot;
