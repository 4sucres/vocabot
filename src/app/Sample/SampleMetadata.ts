import { SampleData } from "./SampleData";

export interface SampleMetadata {

  /**
   * The metadata exist.
   *
   * @type {boolean}
   * @memberof SampleMetadata
   */
  found: boolean;

  /**
   * UUID of the sample.
   *
   * @type {string}
   * @memberof SampleMetadata
   */
  uuid: string;

  /**
   * UUID of the author.
   *
   * @type {string}
   * @memberof SampleMetadata
   */
  authorId: string;

  /**
   * Sample name.
   *
   * @type {string}
   * @memberof SampleMetadata
   */
  name: string;
  
  /**
   * Thumbnail URL.
   *
   * @type {string}
   * @memberof SampleMetadata
   */
  thumbnail: string;
  
  /**
   * Waveform URL.
   *
   * @type {string}
   * @memberof SampleMetadata
   */
  waveform: string;

  /**
   * Sample duration.
   *
   * @type {number}
   * @memberof SampleMetadata
   */
  duration: number;

  /**
   * Sample description.
   *
   * @type {string}
   * @memberof SampleMetadata
   */
  description?: string;

  /**
   * Date of creation.
   *
   * @type {number}
   * @memberof SampleMetadata
   */
  createdAt: number;

  /**
   * Date of last update.
   *
   * @type {number}
   * @memberof SampleMetadata
   */
  updatedAt: number;

  /**
   * Amount of views.
   *
   * @type {number}
   * @memberof SampleMetadata
   */
  views: number;

  /**
   * Is in someone's favorites.
   *
   * @type {boolean}
   * @memberof SampleMetadata
   */
  liked: boolean;

  /**
   * Sample's status.
   *
   * @type {number}
   * @memberof SampleMetadata
   */
  status: number;
}
