import type { Datafile } from 'datagateway-common';
import React from 'react';

interface DatafilePreviewerContextShape {
  /**
   * The current datafile being previewed.
   */
  datafile: Datafile;

  /**
   * The content of the datafile stored as a {@link Blob}.
   * This is undefined when the previewer is still downloading the content,
   * or when it can't do so.
   */
  datafileContent?: Blob;
}

/**
 * Provides the current datafile being previewed in the datafile previewer,
 * and its content.
 */
const DatafilePreviewerContext =
  React.createContext<DatafilePreviewerContextShape | null>(null);

export default DatafilePreviewerContext;
export type { DatafilePreviewerContextShape };
