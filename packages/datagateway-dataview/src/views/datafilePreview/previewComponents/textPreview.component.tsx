import { styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';
import type { PreviewComponentProps } from './previewComponents';

const TextContainer = styled('pre')<{ fontSize: number }>(({ fontSize }) => ({
  margin: 0,
  fontSize,
  counterReset: 'line',
  display: 'grid',
  gridTemplateColumns: 'min-content 1fr',
  gridAutoRows: 'min-content',
  flex: 1,
}));

const LineNumber = styled('span')(({ theme }) => ({
  textAlign: 'right',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(3),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  opacity: 0.8,
  borderRight: `1px solid ${theme.palette.text.disabled}`,
  // disable text select for line numbers, it makes text selection a lot easier
  // user can drag their mouse to select multiple lines without also selecting the line numbers
  userSelect: 'none',
}));

const TextLine = styled('code')(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  counterIncrement: 'line',
  // highlight the current line when hovered over.
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatusMessage = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2),
}));

/**
 * The default font size of the txt preview at 100% zoom.
 */
const BASE_FONT_SIZE = 12;

/**
 * A {@link PreviewComponent} that previews text-based datafiles.
 * @see PreviewComponent
 */
function TextPreview({
  datafile,
  datafileContent,
}: PreviewComponentProps): JSX.Element {
  // derive preview font size based on current zoom level
  // 100% zoom = base font size * 100%
  // 110% zoom = base font size * 110%
  const fontSize = useSelector<StateType, number>((state) =>
    Math.round(
      (BASE_FONT_SIZE * state.dgdataview.datafilePreviewer.zoomLevel) / 100
    )
  );
  const [t] = useTranslation();
  const {
    isLoading: isReadingContent,
    isError: isReadContentError,
    data: textContent,
  } = useQuery(['datafile', datafile.id, 'textContent'], () =>
    datafileContent.text()
  );

  if (isReadingContent) {
    return (
      <StatusMessage>
        {t('datafiles.preview.txt.reading_content')}
      </StatusMessage>
    );
  }

  if (isReadContentError || !textContent) {
    return (
      <StatusMessage>
        {t('datafiles.preview.txt.cannot_read_content')}
      </StatusMessage>
    );
  }

  return (
    <TextContainer
      fontSize={fontSize}
      aria-label={t('datafiles.preview.txt.file_content_label', {
        fileName: datafile.name,
      })}
    >
      {textContent.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          <LineNumber>{i + 1}</LineNumber>
          <TextLine>{`${line}\n`}</TextLine>
        </React.Fragment>
      ))}
    </TextContainer>
  );
}

export default TextPreview;
