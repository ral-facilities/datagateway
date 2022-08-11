import { Datafile } from 'datagateway-common';

const supportedDatafileExtensions = ['txt'];

/**
 * File extension of a datafile.
 */
type DatafileExtension = 'txt';

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
  return part.length <= 0 ? null : part[part.length - 1];
}

/**
 * Determines whether the given datafile extension is supported by the previewer.
 *
 * @return true if the datafile extension is supported by the previewer, false otherwise.
 */
function isExtensionSupported(
  extension: string
): extension is DatafileExtension {
  return supportedDatafileExtensions.includes(extension);
}

export { extensionOf, isExtensionSupported };
export type { DatafileExtension };
