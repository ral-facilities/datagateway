import type { Datafile } from 'datagateway-common';

const supportedDatafileExtensions = new Set(['txt', 'log']);

/**
 * File extension of a datafile.
 */
type DatafileExtension = 'txt' | 'log';

/**
 * Retrieves the file extension of the given {@link Datafile}
 * @param datafile The {@link Datafile} that the extension should be extracted from.
 */
function extensionOf(datafile: Datafile): string | null {
  // split the filename by period
  // e.g. datafile.txt => datafile, txt
  const part = datafile.name.split('.');
  // if part has only one element, that means the filename doesn't have an extension
  // otherwise, the last element will always be the extension of the datafile.
  return part.length <= 1 ? null : part[part.length - 1];
}

/**
 * Determines whether the given datafile extension is supported by the previewer.
 *
 * @return true if the datafile extension is supported by the previewer, false otherwise.
 */
function isExtensionSupported(
  extension: string
): extension is DatafileExtension {
  return supportedDatafileExtensions.has(extension);
}

/**
 * Determines whether the given {@link Datafile} can be previewed by the previewer.
 * @return true if the datafile can be previewed by the previewer, false otherwise.
 */
function isDatafilePreviewable(datafile: Datafile): boolean {
  return isExtensionSupported(extensionOf(datafile) ?? '');
}

export { extensionOf, isExtensionSupported, isDatafilePreviewable };
export type { DatafileExtension };
