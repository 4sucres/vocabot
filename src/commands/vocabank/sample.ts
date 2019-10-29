import { Command, CommandUtil } from 'discord-akairo';
import { Message, Attachment } from 'discord.js';
import { Sample } from '@app/Sample/Sample';
import { sample as config, env } from '@config';
import { vocabot as logger } from '@root/logger';
import { SampleData } from '@app/Sample/SampleData';
import Category from '@app/Category';

const KEY = '<uuid>';

export default class SampleCommand extends Command {
  constructor() {
    super('sample', {
      aliases: ['vc', 'vb', 's', 'v'],
      category: Category.Vocabank,
      editable: false,
      args: [
        {
          id: KEY,
          type: 'string',
          description: 'An UUID or an URL.',
        },
      ],
      description: 'Upload and share the given sample.',
    });
  }

  async exec(message: Message, args: any): Promise<any> {
    if (!message.util) {
      return;
    }

    if (args[KEY]) {
      const url = args[KEY];
      message.delete(); // deletes the invokation
      const waiting = await (<CommandUtil>message.util).send(`> Loading the sample...`);

      try {
        const sample = new Sample(url, config);
        sample
          .download(env.sample_directory)
          .then(async (data: SampleData) => {
            message.channel.send('', new Attachment(<string>data.path, 'Vocabank.mp3')).then(() => {
              (<Message>waiting).delete();
              sample.delete();
            });
          })
          .catch(() => {
            logger.error(`A sample could not be downloaded.`, sample);
          });
      } catch (error) {
        logger.error('An error happened when trying to handle the sample command.', error);
      }
    } else {
      return (<CommandUtil>message.util).send(`Parameter \`${KEY}\` should be an URL. Type \`!help sample\` for more informations.`);
    }
  }
}

// function handle(message: Message, input: string) {
// }
