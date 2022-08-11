import type { Datafile } from 'datagateway-common';
import type { DatafileExtension } from '../datafileExtension';
import TxtPreview from './txtPreview.component';

interface PreviewComponentProps {
  datafile: Datafile;
  datafileContent: Blob;
}

/**
 * Defines a React component that receives the {@link Datafile} to be previewed
 * and renders the {@link Datafile}.
 */
type PreviewComponent = (props: PreviewComponentProps) => JSX.Element;

/**
 * Maps {@link DatafileExtension} to the corresponding component that should be used to preview
 * datafiles with that extension.
 */
const previewComponents: Record<DatafileExtension, PreviewComponent> = {
  txt: TxtPreview,
};

export { previewComponents };
export type { PreviewComponent, PreviewComponentProps };
