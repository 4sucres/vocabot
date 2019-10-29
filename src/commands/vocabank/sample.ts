import { Command, CommandUtil } from 'discord-akairo';
import { Message, Attachment, RichEmbed } from 'discord.js';
import { Sample } from '@app/Sample/Sample';
import { vocabot as logger } from '@root/logger';
import { settings } from '@config';
import { Parser } from '@app/Sample/Parser';
import Category from '@app/Category';
import v from 'voca';
import moment from 'moment';

export const KEY = '<uuid>';

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
        {
          id: 'metadata',
          match: 'flag',
          prefix: ['--metadata', '-m', '-i'],
          description: 'Adds detailed informations about the sample.',
        },
        {
          id: 'keep',
          match: 'flag',
          prefix: ['--keep', '-k'],
          description: `Don't delete the command invocation.`,
        },
        {
          id: 'silent',
          match: 'flag',
          prefix: ['--silent', '-s'],
          description: `Do not respond with errors`,
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
      // Deletes the message invocation if not specified overwise.
      if (!args.keep) {
        message.delete();
      }

      const result = await SampleCommand.handle(message, args[KEY]).catch((reason) => {
        logger.error('An error occured while handling the sample command.', reason);
      });

      // If an error occured
      if (!(result instanceof Sample)) {
        if (!args.silent) {
          let error = 'Sorry, could not download the sample.';

          switch (result) {
            case SampleCommandError.InputError:
              error = 'The file you entered is not a valid sample. You can try with URLs or UUIDs.';
              break;
          }

          // Display the error for a duration.
          return message.channel.send(error).then((sent: Message | Message[]) => {
            setTimeout(() => (<Message>sent).delete(), settings.messageDeleteTimeout);
          });
        }

        return;
      }

      // No error, upload the sample
      try {
        let text = (result.metadata.name ? `\`${result.metadata.name}\` • ` : '') + `<${result.data.url}>`;
        const attachment: Attachment = new Attachment(result.local.path, `${v.slugify(result.metadata.name) || 'sample'}.mp3` || result.local.filename);

        if (args.metadata && result.metadata.found) {
          // @ts-ignore
          const embed: RichEmbed = {
            thumbnail: { url: result.metadata.thumbnail },
            title: result.metadata.name,
            url: result.data.url,
            color: Number(settings.embedColor),
            description: result.metadata.description || 'No description provided.',
            timestamp: moment.unix(result.metadata.createdAt).toDate(),
            footer: {
              text: `${result.data.uuid} • ${result.metadata.views} view${result.metadata.views > 1 ? 's' : ''}`,
              icon_url: settings.icon
            }
          };
          text = '';
          message.channel.send('', { embed });
        }
  
        message.channel.send(text, attachment).then(() => {
          setTimeout(() => result.delete(), settings.fileDeleteTimeout);
        });
      } catch (ex) {
        logger.error('An error occured while uploading the file.', { error: ex, result });
      }
    } else {
      return (<CommandUtil>message.util).send(`Parameter \`${KEY}\` should be an URL. Type \`!help sample\` for more informations.`);
    }
  }

  /**
   * Handles sample parsing and download.
   *
   * @static
   * @param {Message} message
   * @param {string} uuid
   * @returns {(Promise<Sample | SampleCommandError>)}
   * @memberof SampleCommand
   */
  static async handle(message: Message, uuid: string): Promise<Sample | SampleCommandError> {
    try {
      const timeout = setTimeout(() => message.channel.startTyping(), settings.typingDelay);
      const sample = await Parser.parse(uuid);
      clearTimeout(timeout);

      if (!sample) {
        return SampleCommandError.InputError;
      }

      if (!await sample.download()) {
        return SampleCommandError.DownloadError;
      }

      return sample;
    } catch (ex) {
      logger.error('An unexpected error occured while handling the sample command.', { uuid, error: ex });
      return SampleCommandError.UnexpectedError;
    } finally {
      setTimeout(() => message.channel.stopTyping(), settings.typingDelay + settings.typingTimeout);
    }
  }
}

enum SampleCommandError {
  UnexpectedError,
  InputError,
  DownloadError,
}
