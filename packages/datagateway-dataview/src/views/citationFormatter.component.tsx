import {
  Box,
  createStyles,
  FormControl,
  FormHelperText,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from '@material-ui/core';
import { Mark } from 'datagateway-common';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import axios from 'axios';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    subHeading: {
      marginTop: theme.spacing(1),
    },
    formatSelect: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  })
);

const fetchCitation = (
  doi: string,
  format: string,
  locale: string
): Promise<string> => {
  const params = new URLSearchParams({
    style: format,
    locale: locale,
  });
  //Documentation found here: https://support.datacite.org/docs/datacite-content-resolver
  return axios
    .get<string>(`https://data.crosscite.org/text/x-bibliography/${doi}`, {
      params,
    })
    .then((response) => {
      return response.data;
    });
};

interface CitationFormatterProps {
  doi: string;
}

const CitationFormatter = (
  props: CitationFormatterProps
): React.ReactElement => {
  const { doi } = props;

  const [t] = useTranslation();
  const classes = useStyles();
  const [citation, setCitation] = React.useState('');
  const [copiedCitation, setCopiedCitation] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    /* Notes:
        - locale 'en-GB' returns plain text whereas 'GB' gives the formatted text */
    const citationPromise = fetchCitation(
      doi,
      event.target.value as string,
      t('studies.details.citation_formatter.locale')
    );
    Promise.resolve(citationPromise)
      .then((value) => {
        setError(false);
        setCitation(value);
      })
      .catch((error) => {
        setError(true);
      });
  };

  //Information on available formats can be found here: https://citationstyles.org/developers/
  let citationFormats: string[] = t(
    'studies.details.citation_formatter.formats',
    { returnObjects: true }
  );
  //When testing can't easily mock i18next data, but citationFormats.map will fail if
  //given a string, so replace the formats here
  if (!Array.isArray(citationFormats))
    citationFormats = ['format1', 'format2', 'format3'];

  return (
    <Box>
      <Typography className={classes.subHeading} component="h6" variant="h6">
        {t('studies.details.citation_formatter.label')}
      </Typography>
      <Typography>{t('studies.details.citation_formatter.details')}</Typography>
      <FormControl id="citation-formatter" error={error}>
        <Select
          className={classes.formatSelect}
          defaultValue="none"
          onChange={handleChange}
          aria-label={t('studies.details.citation_formatter.select_arialabel')}
          aria-describedby="citation-formatter-error-message"
        >
          <MenuItem value="none" disabled>
            {t('studies.details.citation_formatter.select_format')}
          </MenuItem>
          {citationFormats.map((format) => (
            <MenuItem key={format} value={format}>
              {format}
            </MenuItem>
          ))}
        </Select>
        {error && (
          <FormHelperText id="citation-formatter-error-message">
            {t('studies.details.citation_formatter.error')}
          </FormHelperText>
        )}
      </FormControl>
      <Typography>
        <i data-testid="citation-formatter-citation">
          <Trans>{citation}</Trans>
        </i>
      </Typography>
      {!copiedCitation ? (
        <Button
          id="citation-formatter-copy-citation"
          aria-label={t('studies.details.copy_citation_arialabel')}
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            navigator.clipboard.writeText(citation);
            setCopiedCitation(true);
            setTimeout(() => setCopiedCitation(false), 1750);
          }}
        >
          {t('studies.details.copy_citation')}
        </Button>
      ) : (
        <Button
          id="citation-formatter-copied-citation"
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Mark size={20} visible={true} />}
        >
          {t('studies.details.copied_citation')}
        </Button>
      )}
    </Box>
  );
};

export default CitationFormatter;
