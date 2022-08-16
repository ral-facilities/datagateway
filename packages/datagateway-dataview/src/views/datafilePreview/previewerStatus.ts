/**
 * An interface representing possible statuses of the datafile previewer.
 *
 * This is meant to mimic data-values/enum associated value in other languages
 * like Swift. Only one field will be present for every {@link PreviewerStatus}.
 */
interface PreviewerStatus {
  /**
   * This field is set when the datafile previewer is loading the datafile content.
   */
  loadingContent?: {
    /**
     * The current progress of downloading the datafile content, between 0-100
     */
    progress: number;
  };

  /**
   * This field is set when the datafile previewer is unable to load
   * the metadata of the datafile.
   */
  metadataUnavailable?: { errorMessage?: string };

  /**
   * This field is set when the datafile previewer is unable to determine the
   * extension of the datafile.
   */
  unknownExtension?: true;

  /**
   * This field is set when the datafile previewer doesn't yet support previewing
   * the datafile.
   */
  unsupportedExtension?: { extension: string };

  /**
   * This field is set when the datafile previewer is unable to download
   * the content of the datafile for preview.
   */
  contentUnavailable?: { errorMessage?: string };
}

export type { PreviewerStatus };
