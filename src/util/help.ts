import { Argument, Command, PrefixFunction, Category, CommandHandler } from "discord-akairo";
import StringBuilder, { PrefixType } from "./stringBuilder";
import { surrounded, space } from "./string";
import { RichEmbed } from "discord.js";
import { Message } from "discord.js";
import _ from 'lodash';

export function getArgumentUsage(argument: Argument, _default: any, replaceName?: string): string {
    let usage = new StringBuilder();

    if (argument.match === 'flag') {
        let flag = `--${_.trim(replaceName || argument.id, '<[]>')}`;

        if (_default) {
            usage.append(`[${flag}=<${argument.type}>]`, PrefixType.Nothing);
        } else {
            usage.append(`[${flag}]`, PrefixType.Nothing);
        }
    } else {
        usage.append(replaceName || argument.id, PrefixType.Nothing);
    }

    return usage.toString();
}

/**
 * Gets the field for an argument in a command embed.
 */
export function getArgumentEmbedField(argument: Argument, _default: any): { name: string; value: string; inline?: boolean; }
{
    const help = new StringBuilder();
    const required = surrounded(argument.id.trim(), '<', '>');

    let name = _.trim(argument.id, '<[]>');
    let type: string = argument.type.toString();
    let possibleValues: string | undefined;
    let flag = argument.match === 'flag';

    help.append(`${'`Description`'}${space(2)}${argument.description || 'No description provided.'}`);

    if (Array.isArray(argument.type)) {
        type = 'choice';
        possibleValues = argument.type.join(', ');
    }

    if (flag) {
        let prefixes: string[] = Array.isArray(argument.prefix) ? argument.prefix : [argument.prefix || name];
        let prefix: string = prefixes.shift() || name;

        help.append(`${prefixes.length > 1 ? '`Aliases`' : '`Alias`'}${space(2)}${prefixes.join(', ')}`);

        if (_default) {
            help.append(`${'`Type`'}${space(2)}${type}`);
            help.append(`${'`Defaults to`'}${space(2)}${_default}`);
        } else {
            help.append(`*Add **${prefix}** in the command to activate this flag.*`);
        }

        type = 'flag';
    } 
    
    else {
        help.append(`${'`Required`'}${space(2)}${required ? 'yes' : 'no'}`);
        help.append(`${'`Type`'}${space(2)}${type}`);

        if (possibleValues) {
            help.append(`${'`Values`'}${space(2)}${possibleValues}`);
        }
        if (_default) {
            help.append(`${'`Defaults to`'}${space(2)}${_default}`);
        }
    }

    return {
        name: name,
        value: help.toString()
    }
}

/**
 * Gets a string defining the usage of a command.
 */
export function getCommandUsageString(command: Command, prefix: string | string[], message?: Message)
{
    const invoke = `${command.prefix || prefix}${command.id} `;

    let usage = new StringBuilder();
    usage.append(invoke, PrefixType.Nothing);
    
    command.args.forEach((argument: Argument) => {
        usage.append(getArgumentUsage(argument, argument.default(<Message><unknown>message, command.args)), PrefixType.Nothing);
    });

    return usage.toString();
}

/**
 * Gets an embed detailling the usage of a command.
 */
export function getCommandUsageEmbed(command: Command, prefix: string | string[], message?: Message)
{
    const embed = new RichEmbed();
    const fields: { name: string; value: string; inline?: boolean; }[] = [];
    const invoke = `${prefix}${command.id} `;

    // usage
    let usage = getCommandUsageString(command, prefix, message);
    command.args.forEach((argument: Argument) => {
        fields.push(getArgumentEmbedField(argument, argument.default(<Message><unknown>message, command.args)));
    })

    // description
    let description = new StringBuilder();
    description.append(`${'`Usage`'}${space(2)}\`${usage.toString()}\``);
    description.append(`${'`Description`'}${space(2)}${command.description || 'No description provided.'}`)

    embed.fields = fields;
    embed.title = invoke.trim();
    embed.description = description.toString(); 
    embed.color = 7506394;

    return embed;
}

/**
 * Gets a field for a {@see RichEmbed} containing the usage of a command.
 */
export function getShortCommandUsageEmbedField(command: Command, name: string, prefix: string | string[] | PrefixFunction, message: Message): { name: string; value: string; inline?: boolean; } 
{
    const invoke = `${prefix}${name}`;
    let help = new StringBuilder();

    // build usage
    let usage = new StringBuilder();
    usage.append(invoke, PrefixType.Nothing);

    command.args.forEach((argument: Argument) => {
        usage.append(getArgumentUsage(argument, argument.default(message, command.args)), PrefixType.Space);
    })

    // build help
    help.append(`${'`Usage`'}${space(2)}${usage}`);
    help.append(`${'`Enabled`'}${space(2)}${command.enabled ? 'yes' : 'no'}`);

    return {
        name: invoke,
        value: help.toString(),
        inline: true
    }
}

/**
 * Gets an embed for a category, containing a short usage of every command.
 * @param category 
 * @param message 
 */
export function getCategoryHelpEmbed(category: Category<string, Command>, message: Message, prefix: string | string[]) {
    const embed = new RichEmbed();
    const fields: { name: string; value: string; inline?: boolean; }[] = [];
    
    category.forEach((command, name) => {
        fields.push(getShortCommandUsageEmbedField(command, name, command.prefix || prefix, message));
    });
    
    embed.fields = fields;
    embed.color = 7506394; // change
    
    return embed;
}