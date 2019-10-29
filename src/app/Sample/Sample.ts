import path from 'path';
import Axios from 'axios';
import root from 'app-root-path';
import v from 'voca';
import { SampleData } from './SampleData';
import { Configuration } from './Configuration';
import { Url } from './Url';
import { SampleMetadata } from './SampleMetadata';
import { SampleLocalData } from './SampleLocalData';
import { sample as config } from '@config';
import { env } from '@config';
import { Storage } from './Storage';
import { vocabot as logger } from '@logger';
import https from 'https';
import moment from 'moment';

export class Sample {
  private _input: string;
  private _data: SampleData;
  private _metadata: SampleMetadata;
  private _local: SampleLocalData;

  constructor(input: string, data: SampleData, meta: SampleMetadata, local: SampleLocalData) {
    this._input = input.toString();
    this._data = data;
    this._metadata = meta;
    this._local = local;
  }

  /**
   * Gets an URL with the given UUID.
   */
  public static url(uuid: string, type: Url, options?: Configuration): string {
    return config[type].replace('{domain}', { ...config, ...options }.domain).replace('{uuid}', uuid);
  }

  /**
   * Generates a sample from an UUID.
   *
   * @static
   * @param {string} uuid
   * @param {string} [input='']
   * @returns
   * @memberof Sample
   */
  public static async get(uuid: string, input: string = ''): Promise<Sample | false> {
    const meta = await Sample.meta(uuid);
    const data = Sample.data(uuid);
    const local = Sample.local(uuid);

    if (meta) {
      return new Sample(input, data, meta, local);
    }

    return false;
  }

  /**
   * Generates data object for the given UUID.
   *
   * @private
   * @memberof Sample
   */
  public static data(uuid: string, options?: Configuration): SampleData {
    options = { ...config, ...options };

    return {
      domain: options.domain,
      uuid: uuid,
      url: Sample.url(uuid, Url.Url, options),
      downloadUrl: Sample.url(uuid, Url.Download, options),
      listenUrl: Sample.url(uuid, Url.Listen, options),
    };
  }

  /**
   * Seek the metadata for the given UUID.
   *
   * @static
   * @param {string} uuid
   * @param {Configuration} [options]
   * @returns {(Promise<SampleMetadata | false>)}
   * @memberof Sample
   */
  public static async meta(uuid: string, options?: Configuration): Promise<SampleMetadata | false> {
    options = { ...config, ...options };

    try {
      // We need to handle SSH certificates errors
      const { data } = await Axios.get(Sample.url(uuid, Url.Data, options), {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      return {
        found: true,
        uuid: data.id,
        authorId: data.user_id,
        name: data.name,
        status: data.status,
        duration: data.duration,
        description: data.description,
        createdAt: moment(data.created_at).unix(),
        updatedAt: moment(data.updated_at).unix(),
        views: data.views,
        thumbnail: data.thumbnail_url,
        waveform: data.waveform_url,
        liked: data.liked,
      };
    } catch (ex) {
      logger.error('Could not find metadata.', { uuid, error: ex, options });
      return {
        found: false,
        uuid: '',
        authorId: '',
        name: '',
        status: 0,
        duration: 0,
        description: '',
        createdAt: 0,
        updatedAt: 0,
        views: 0,
        thumbnail: '',
        waveform: '',
        liked: false,
      };
    }
  }

  /**
   * Generates local storage data.
   *
   * @static
   * @param {string} uuid
   * @param {Configuration} [options]
   * @returns {SampleLocalData}
   * @memberof Sample
   */
  public static local(uuid: string, options?: Configuration): SampleLocalData {
    options = { ...config, ...options };
    const directory = path.resolve(root.path, env.sample_directory);
    const filename = `${uuid}.mp3`;
    const destination = path.resolve(directory, filename);

    return {
      filename,
      path: destination,
    };
  }

  /**
   * Downloads the sample.
   *
   * @returns {Promise<boolean>}
   * @memberof Sample
   */
  public async download(): Promise<boolean> {
    return await Storage.download(this);
  }

  /**
   * Deletes a sample from the local storage.
   *
   * @returns {boolean}
   * @memberof Sample
   */
  public delete(): boolean {
    return Storage.delete(this);
  }

  /**
   * Sample data.
   *
   * @readonly
   * @type {string}
   * @memberof Sample
   */
  public get data(): SampleData {
    return this._data;
  }

  /**
   * Sample metadata.
   *
   * @readonly
   * @type {SampleMetadata}
   * @memberof Sample
   */
  public get metadata(): SampleMetadata {
    return this._metadata;
  }

  /**
   * Sample local data.
   *
   * @readonly
   * @type {SampleLocalData}
   * @memberof Sample
   */
  public get local(): SampleLocalData {
    return this._local;
  }
}
