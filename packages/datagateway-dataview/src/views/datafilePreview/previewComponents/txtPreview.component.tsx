import { Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';
import type { PreviewComponentProps } from './previewComponents';

/**
 * The default font size of the txt preview at 100% zoom.
 */
const BASE_FONT_SIZE = 12;

/**
 * A {@link PreviewComponent} that previews Datafile with .txt extension.
 * @see PreviewComponent
 */
function TxtPreview({ datafileContent }: PreviewComponentProps): JSX.Element {
  const [isReadingContent, setIsReadingContent] = React.useState(true);
  const [textContent, setTextContent] = React.useState('');
  // derive preview font size based on current zoom level
  // 100% zoom = base font size * 100%
  // 110% zoom = base font size * 110%
  const fontSize = useSelector<StateType, number>((state) =>
    Math.round(
      (BASE_FONT_SIZE * state.dgdataview.isisDatafilePreviewer.zoomLevel) / 100
    )
  );

  React.useEffect(() => {
    // read the datafile content as text.

    async function read(): Promise<void> {
      const text = await datafileContent.text();
      setIsReadingContent(false);
      setTextContent(text);
    }

    read();
  }, [datafileContent]);

  if (isReadingContent) {
    return <Typography>Reading content...</Typography>;
  }

  return <pre style={{ margin: 0, fontSize }}>{textContent}</pre>;
}

export default TxtPreview;
