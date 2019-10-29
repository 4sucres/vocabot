import { Command } from 'discord-akairo';
import { Message, RichEmbed } from 'discord.js';
import CommandCategory from '@app/Category';
import * as help from '@root/util/help';
import _ from 'lodash';
import s from 'voca';

const KEY = '[anything]';

export default class PingCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'h'],
      category: CommandCategory.Utility,
      editable: true,
      args: [
        {
          id: KEY,
          type: 'string',
          match: 'content',
          default: null,
          description: 'A category or a command.',
        },
      ],
      description: 'Get a list of commands, or details about a specific command.',
    });
  }

  exec(message: Message, args: any): any {
    if (!message.util) {
      return;
    }

    if (args[KEY]) {
      // Find command or category
      const key = args[KEY].toLowerCase();
      let category = this.handler.categories.get(key);
      let command = this.handler.modules.get(key);

      if (category) {
        let usage = help.getCommandUsageString(this, this.handler.prefix(message), message).replace('anything', 'command');
        return message.util.send(`**${s.titleCase(String(category))}** has the following commands:`, {
          embed: help.getCategoryHelpEmbed(category, message, this.handler.prefix(message)).setFooter(`You can get specific help by issuing: ${usage}.`),
        });
      } else if (command) {
        return message.util.send(``, {
          embed: help.getCommandUsageEmbed(command, this.handler.prefix(message), message),
        });
      } else {
        return message.util.send(`Could not find any categories or commands named **${key}**`);
      }
    }

    // List all categories if none was provided
    return message.util.send('[This help message is work-in-progress]', {
      embed: this._getFullList(message),
    });
  }

  _getFullList(message: Message) {
    const embed = new RichEmbed();
    const fields: any = [];
    this.handler.categories.forEach((v, k) => {
      const field = {
        name: k,
        value: '',
        inline: true,
      };
      v.forEach(v2 => {
        const p = v2.prefix || this.handler.prefix(message);
        field.value += `\`${v2.enabled ? 'v' : 'x'} ${p}${v2.aliases.join(`, ${p}`)}\`\n`;
      });
      field.value = `${field.value}`;
      fields.push(field);
    });
    embed.color = 7506394;
    embed.fields = fields;
    return embed;
  }
}
