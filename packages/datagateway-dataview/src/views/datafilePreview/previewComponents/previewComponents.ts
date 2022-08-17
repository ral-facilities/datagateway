import type { Datafile } from 'datagateway-common';
import type { DatafileExtension } from '../datafileExtension';
import TxtPreview from './txtPreview.component';

/**
 * The shape of the props that {@link PreviewComponent} will receive.
 *
 * @see PreviewComponent
 */
interface PreviewComponentProps {
  /**
   * The {@link Datafile} that is being previewed.
   */
  datafile: Datafile;

  /**
   * The content of the {@link Datafile} as a {@link Blob}
   */
  datafileContent: Blob;
}

/**
 * Defines a React component that receives the {@link Datafile} to be previewed
 * and renders the {@link Datafile}.
 *
 * The component should respond to zoom level changes
 * and adjust the size of the preview accordingly.
 * The current zoom level is stored at
 * `dgdatagateway.isisDatafilePreviewer.zoomLevel`.
 *
 * The zoom level is percentage based. For example, 100% maps to 100,
 * 110% maps to 110, 80% maps to 80.
 *
 * The component can also access other states of the previewer.
 * See `../state/reducer.ts`, particularly {@link DatafilePreviewerState}.
 *
 * @see PreviewComponentProps
 */
type PreviewComponent = (props: PreviewComponentProps) => JSX.Element;

/**
 * Maps {@link DatafileExtension} to the corresponding component that should be used to preview
 * datafiles with that extension.
 *
 * @see PreviewComponent
 * @see DatafileExtension
 */
const previewComponents: Record<DatafileExtension, PreviewComponent> = {
  txt: TxtPreview,
};

export { previewComponents };
export type { PreviewComponent, PreviewComponentProps };
