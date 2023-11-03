import {
  extensionOf,
  isDatafilePreviewable,
  isExtensionSupported,
} from './datafileExtension';
import { mockDatafile } from './testData';

describe('extensionOf', () => {
  it('should return the file extension of the given datafile name', () => {
    expect(extensionOf(mockDatafile)).toEqual('txt');
  });

  it('should return null if the name of the given datafile does not have a file extension', () => {
    const datafile = { ...mockDatafile, name: 'datafile' };
    expect(extensionOf(datafile)).toBeNull();
  });
});

describe('isExtensionSupported', () => {
  it('should return true if the given file extension is supported by the datafile previewer', () => {
    expect(isExtensionSupported('txt')).toBeTruthy();
  });

  it('should return false if the given file extension is not supported by the datafile previewer', () => {
    expect(isExtensionSupported('deb')).toBeFalsy();
    expect(isExtensionSupported('dmg')).toBeFalsy();
    expect(isExtensionSupported('pdf')).toBeFalsy();
  });
});

describe('isDatafilePreviewable', () => {
  it('should return true if the given datafile can be previewed', () => {
    expect(isDatafilePreviewable(mockDatafile)).toBeTruthy();
  });

  it('should return false if the given datafile cannot be previewed', () => {
    expect(
      isDatafilePreviewable({ ...mockDatafile, name: 'datafile' })
    ).toBeFalsy();
    expect(
      isDatafilePreviewable({ ...mockDatafile, name: 'datafile.exe' })
    ).toBeFalsy();
  });
});
