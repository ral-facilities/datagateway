/**
 * The datafile previewer is loading the metadata of the datafile.
 */
interface LoadingMetadata {
  code: 'LOADING_METADATA';
}

/**
 * The datafile previewer is loading the datafile content.
 */
interface LoadingContent {
  code: 'LOADING_CONTENT';
  /**
   * The current progress of downloading the datafile content, between 0-100
   */
  progress: number;
}

/**
 * The datafile previewer is unable to load the metadata of the datafile.
 */
interface MetadataUnavailable {
  code: 'METADATA_UNAVAILABLE';
  errorMessage?: string;
}

/**
 * The datafile previewer is unable to determine the extension of the datafile.
 */
interface UnknownExtension {
  code: 'UNKNOWN_EXTENSION';
}

/**
 * The datafile previewer doesn't yet support previewing the datafile.
 */
interface UnsupportedExtension {
  code: 'UNSUPPORTED_EXTENSION';
  extension: string;
}

/**
 * The datafile previewer is unable to download the content of the datafile for preview.
 */
interface ContentUnavailable {
  code: 'CONTENT_UNAVAILABLE';
  errorMessage?: string;
}

/**
 * The datafile previewer has successfully loaded the content of the datafile.
 */
interface ContentLoaded {
  code: 'CONTENT_LOADED';
}

/**
 * Different statuses the datafile previewer can be in.
 */
type PreviewerStatus =
  | LoadingMetadata
  | LoadingContent
  | MetadataUnavailable
  | UnknownExtension
  | UnsupportedExtension
  | ContentUnavailable
  | ContentLoaded;

export type { PreviewerStatus };
