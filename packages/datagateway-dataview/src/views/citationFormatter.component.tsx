import {
  createStyles,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from '@material-ui/core';
import { Mark } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
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

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    /* Notes:
        - locale 'en-GB' returns plain text whereas 'GB' gives the formatted text */
    const citationPromise = fetchCitation(
      doi,
      event.target.value as string,
      t('studies.details.citation_formatter.locale')
    );
    Promise.resolve(citationPromise).then((value) => setCitation(value));
  };

  //Information on available formats can be found here: https://citationstyles.org/developers/
  const citationFormats: string[] = t(
    'studies.details.citation_formatter.formats',
    { returnObjects: true }
  );

  return (
    <React.Fragment>
      <Typography className={classes.subHeading} component="h6" variant="h6">
        {t('studies.details.citation_formatter.label')}
      </Typography>
      <Typography>{t('studies.details.citation_formatter.details')}</Typography>
      <Select
        className={classes.formatSelect}
        defaultValue="none"
        onChange={handleChange}
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
      <Typography>
        <i>{citation}</i>
      </Typography>
      {!copiedCitation ? (
        <Button
          id="landing-study-copy-citation"
          aria-label={t('studies.details.copy_citation_arialabel')}
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            if (citation !== '') {
              navigator.clipboard.writeText(citation);
              setCopiedCitation(true);
              setTimeout(() => setCopiedCitation(false), 1750);
            }
          }}
        >
          {t('studies.details.copy_citation')}
        </Button>
      ) : (
        <Button
          id="landing-study-copied-citation"
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Mark size={20} visible={true} />}
        >
          {t('studies.details.copied_citation')}
        </Button>
      )}
    </React.Fragment>
  );
};

export default CitationFormatter;
