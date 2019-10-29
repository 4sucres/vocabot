import { Sample } from "./Sample";
import { sample as config } from '@config';
import { vocabot as logger } from '@logger';

/**
 * A Sample parser.
 *
 * @export
 * @class Parser
 */
export class Parser {

  public static uuidRegex: RegExp = /^([0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12})$/;
  public static urlRegex: RegExp = /^(https:\/\/)?([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5})(?:\/samples\/)([0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12})$/;
  // https://vocabank.dev/samples/519d0a1c-a16e-4dd3-8c50-4f251e4596e3/data

  /**
   * Try to parse an UUID.
   *
   * @static
   * @param {string} input
   * @param {string} domain
   * @returns {Sample}
   * @memberof Parser
   */
  static async parseUuid(input: string): Promise<Sample | false>
  {
    const matches = input.match(Parser.uuidRegex);

    if (matches && 2 === matches.length) {
      return Sample.get(matches[1], input);
    }
    
    return false;
  }

  /**
   * Parses an URL.
   *
   * @private
   * @returns {(SampleData | undefined)}
   * @memberof Sample
   */
  static async parseUrl(input: string): Promise<Sample | false> {
    const matches = input.match(Parser.urlRegex);

    if (matches && 5 === matches.length && config.domain === matches[2]) {
      return Sample.get(matches[4], input);
    }
    
    return false;
  }

  /**
   * Parses an input.
   *
   * @static
   * @param {string} input
   * @returns
   * @memberof Parser
   */
  static async parse(input: string): Promise<Sample | false> {
    const data = (await Parser.parseUuid(input)) || (await this.parseUrl(input));

    if (data) {
      return data;
    }

    logger.debug(`Could not parse the given input as a sample.`, input);
    return false;
  }

}
