import fs from 'fs';
import path from 'path';
import Axios from 'axios';
import root from 'app-root-path';
import vocabot from '../../logger';
import { SampleData } from './SampleData';
import { Configuration } from './Configuration';
import { Url } from './Url';

export class Sample {
  private _input: string;
  private _data?: SampleData;
  private _urlRegex: RegExp;
  private _uuidRegex: RegExp;
  private _config: Configuration;

  constructor(input: string, config: Configuration) {
    this._input = input.toString();
    this._config = config;
    this._urlRegex = /^(https:\/\/)?([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5})(?:\/samples\/)([0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12})$/;
    this._uuidRegex = /^([0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12})$/;
    this._data = this.parse();
  }

  /**
   * Gets data about the sample.
   *
   * @readonly
   * @type {SampleData}
   * @memberof Sample
   */
  public get data(): SampleData | undefined {
    return this._data;
  }

  /**
   * Parses an URL or UUID and returns its data.
   */
  private parse(): SampleData | undefined {
    const data = this.parseUuid() || this.parseUrl();

    if (data) {
      return data;
    }

    vocabot.debug(`Could not parse an URL nor an UUID: ${this._input}`);
  }

  /**
   * Parses an UUID.
   *
   * @private
   * @returns {(SampleData | undefined)}
   * @memberof Sample
   */
  private parseUuid(): SampleData | undefined {
    const matches = this._input.match(this._uuidRegex);
    console.log(matches);

    if (matches && 2 === matches.length) {
      return Sample.data(this._config.domain, matches[1], this._config);
    }
  }

  /**
   * Parses an URL.
   *
   * @private
   * @returns {(SampleData | undefined)}
   * @memberof Sample
   */
  private parseUrl(): SampleData | undefined {
    const matches = this._input.match(this._urlRegex);

    if (matches && 5 === matches.length && this._config.domain === matches[2]) {
      return Sample.data(this._config.domain, matches[4], this._config);
    }
  }

  /**
   * Gets an URL with the given UUID.
   */
  public getUrl(uuid: string, type: Url): string {
    return Sample.url(uuid, type, this._config);
  }

  /**
   * Gets an URL with the given UUID.
   */
  public static url(uuid: string, type: Url, config: Configuration): string {
    return config[type].replace('{domain}', config.domain).replace('{uuid}', uuid);
  }

  /**
   * Generates sample data.
   *
   * @private
   * @memberof Sample
   */
  public static data(domain: string, uuid: string, config: Configuration): SampleData {
    return {
      domain: domain,
      uuid: uuid,
      url: Sample.url(uuid, Url.Url, config),
      downloadUrl: Sample.url(uuid, Url.Download, config),
      listenUrl: Sample.url(uuid, Url.Listen, config),
    };
  }

  /**
   * Creates a directory if it doesn't exist.
   *
   * @param directory Directory.
   */
  private async createDirectoryIfInexistant(directory: string) {
    try {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }
    } catch (error) {
      throw new Error(`Could not create '${directory}'.`);
    }
  }

  /**
   * Downloads a sample.
   *
   * @param name File name.
   */
  public async download(directory: string, name?: string): Promise<SampleData> {
    if (!this._data) {
      return new Promise((a, r) => r(`Invalid sample.`));
    }

    this.createDirectoryIfInexistant((directory = path.resolve(root.path, directory)));
    const filename = `${name || this._data.uuid}.mp3`;
    const file = path.resolve(directory, filename);
    const writer = fs.createWriteStream(file);

    const response = await Axios({
      url: this._data.downloadUrl,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    this._data.filename = filename;
    this._data.path = file;

    return new Promise<SampleData>((resolve, reject) => {
      writer.on('finish', () => {
        vocabot.info('A sample has been downloaded.', this);
        resolve(this._data);
      });
      writer.on('error', () => {
        vocabot.error(`A sample could not be downloaded.`, this);
        reject(this._input);
      });
    });
  }
}
