import type { Datafile } from 'datagateway-common';
import React from 'react';

interface DatafilePreviewerContextShape {
  datafile: Datafile;
  datafileContent?: Blob;
}

/**
 * Provides the current datafile being previewed in the datafile previewer,
 * and its content.
 */
const DatafilePreviewerContext = React.createContext<DatafilePreviewerContextShape | null>(
  null
);

export default DatafilePreviewerContext;
export type { DatafilePreviewerContextShape };
