import { Sample } from './Sample';
import fs from 'fs';
import https from 'https';
import Axios from 'axios';
import logger from '@logger';

export class Storage {
  /**
   * Creates a directory if it doesn't exist.
   *
   * @private
   * @static
   * @param {Sample} sample
   * @returns {boolean}
   * @memberof Storage
   */
  private static directory(sample: Sample): boolean {
    const directory = sample.local.path.replace(sample.local.filename, '');

    try {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
        return true;
      }
    } catch (error) {
      logger.error('Could not create a directory for the samples.', { sample, error });
    }

    return false;
  }

  /**
   * Downloads a sample.
   *
   * @param {Sample} sample
   * @param {string} [dir]
   * @returns {(Promise<boolean>)}
   * @memberof Storage
   */
  static async download(sample: Sample): Promise<boolean> {
    if (Storage.exists(sample)) {
      logger.info('Sample already existed on the disk.', sample);
      return true;
    }

    Storage.directory(sample);
    const writer = fs.createWriteStream(sample.local.path);

    const { data } = await Axios.get(sample.data.downloadUrl, { responseType: 'stream', httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    data.pipe(writer);

    return new Promise<boolean>((resolve, reject) => {
      writer.on('finish', () => {
        logger.info('Sample has been downloaded.', sample);
        resolve(true);
      });
      writer.on('error', () => {
        logger.error(`Sample could not be downloaded.`, sample);
        reject(false);
      });
    });
  }

  /**
   * Checks if file really exists on local storage.
   *
   * @param {Sample} sample
   * @returns {boolean}
   * @memberof Storage
   */
  static exists(sample: Sample): boolean {
    return fs.existsSync(sample.local.path);
  }

  /**
   * Deletes a file on the local storage.
   *
   * @param {Sample} sample
   * @memberof Storage
   */
  static delete(sample: Sample): boolean {
    if (!Storage.exists(sample)) {
      logger.warn('Tried to delete a sample that does not exist on the disk.', sample);
    }

    try {
      fs.access(sample.local.path, error => {
        if (!error) {
          fs.unlinkSync(sample.local.path);
          return true;
        } else {
          logger.error(`Could not delete a sample because its file is being used.`, { sample, error });
        }
      });
    } catch (ex) {
      logger.error(`An error occured while deleting a sample.`, { sample, error: ex });
    }

    return false;
  }
}
