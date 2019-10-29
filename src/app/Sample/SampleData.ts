export interface SampleData {

  /**
   * Vocabank domain name.
   *
   * @type {string}
   * @memberof SampleData
   */
  domain: string;

  /**
   * File UUID.
   *
   * @type {string}
   * @memberof SampleData
   */
  uuid: string;

  /**
   * Vocabank URL.
   *
   * @type {string}
   * @memberof SampleData
   */
  url: string;

  /**
   * Vocabank URL for downloading.
   *
   * @type {string}
   * @memberof SampleData
   */
  downloadUrl: string;

  /**
   * Vocabank URL for listening.
   *
   * @type {string}
   * @memberof SampleData
   */
  listenUrl: string;

  /**
   * Downloaded file name.
   *
   * @type {string}
   * @memberof SampleData
   */
  filename?: string;

  /**
   * Local full path.
   *
   * @type {string}
   * @memberof SampleData
   */
  path?: string;
}
