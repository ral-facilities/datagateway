import { Typography } from '@mui/material';
import React from 'react';
import type { PreviewComponentProps } from './previewComponents';

/**
 * A {@link PreviewComponent} that previews Datafile with .txt extension.
 * @see PreviewComponent
 */
function TxtPreview({ datafileContent }: PreviewComponentProps): JSX.Element {
  const [isReadingContent, setIsReadingContent] = React.useState(true);
  const [textContent, setTextContent] = React.useState('');

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

  return <pre style={{ margin: 0 }}>{textContent}</pre>;
}

export default TxtPreview;
