import type { Datafile } from 'datagateway-common';
import React from 'react';

interface DatafilePreviewerContextShape {
  datafile: Datafile;
  datafileContent?: Blob;
}

const DatafilePreviewerContext = React.createContext<DatafilePreviewerContextShape | null>(
  null
);

export default DatafilePreviewerContext;
export type { DatafilePreviewerContextShape };
