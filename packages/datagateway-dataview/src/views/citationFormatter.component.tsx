import {
  Box,
  CircularProgress,
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
import React, { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { FormattedUser } from './landing/isis/isisStudyLanding.component';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    subHeading: {
      marginTop: theme.spacing(1),
    },
    formatSelect: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    spinner: {
      marginLeft: theme.spacing(1),
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
  //api.datacite.org seems to work better than data.crosscite.org
  return axios
    .get<string>(`https://api.datacite.org/text/x-bibliography/${doi}`, {
      params,
    })
    .then((response) => {
      return response.data;
    });
};

interface CitationFormatterProps {
  doi: string | undefined;
  formattedUsers: FormattedUser[];
  title: string | undefined;
  startDate: string | undefined;
}

const CitationFormatter = (
  props: CitationFormatterProps
): React.ReactElement => {
  const { doi, formattedUsers, title, startDate } = props;

  const [t] = useTranslation();
  const classes = useStyles();
  const [citation, setCitation] = React.useState('');
  const [copiedCitation, setCopiedCitation] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const loadCitation = useCallback(
    (format: string): void => {
      if (format === 'default') {
        let citation = '';
        if (formattedUsers.length > 1)
          citation += `${formattedUsers[0].fullName} et al; `;
        if (formattedUsers.length === 1)
          citation += `${formattedUsers[0].fullName}; `;
        if (startDate) citation += `${startDate.slice(0, 4)}: `;
        if (title) citation += `${title}, `;
        citation += t('doi_constants.publisher.name');
        if (doi) citation += `, https://doi.org/${doi}`;

        setCitation(citation);
      } else if (doi) {
        setLoading(true);
        /* Notes:
        - locale 'en-GB' returns plain text whereas 'GB' gives the formatted text */
        const citationPromise = fetchCitation(
          doi,
          format,
          t('studies.details.citation_formatter.locale')
        );
        Promise.resolve(citationPromise)
          .then((value) => {
            setError(false);
            setCitation(value);
            setLoading(false);
          })
          .catch((error) => {
            setError(true);
            setLoading(false);
          });
      }
    },
    [doi, formattedUsers, startDate, t, title]
  );

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    loadCitation(event.target.value as string);
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

  //Load the default format (taken as the first citation format) on page load
  useEffect(() => {
    loadCitation('default');
  }, [loadCitation]);

  return (
    <Box>
      <Typography className={classes.subHeading} component="h6" variant="h6">
        {t('studies.details.citation_formatter.label')}
      </Typography>
      <Typography>
        {t('studies.details.citation_formatter.details') +
          (doi
            ? ` ${t(
                'studies.details.citation_formatter.details_select_format'
              )}`
            : '')}
      </Typography>
      {doi && (
        <FormControl id="citation-formatter" error={error}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              className={classes.formatSelect}
              defaultValue="default"
              onChange={handleChange}
              aria-label={t(
                'studies.details.citation_formatter.select_arialabel'
              )}
              aria-describedby="citation-formatter-error-message"
            >
              <MenuItem value="default">
                {t('studies.details.citation_formatter.default_format')}
              </MenuItem>
              {citationFormats.map((format) => (
                <MenuItem key={format} value={format}>
                  {format}
                </MenuItem>
              ))}
            </Select>
            {loading && (
              <CircularProgress
                data-testid="loading-spinner"
                size={24}
                className={classes.spinner}
              />
            )}
          </div>
          {error && (
            <FormHelperText id="citation-formatter-error-message">
              {t('studies.details.citation_formatter.error')}
            </FormHelperText>
          )}
        </FormControl>
      )}
      <Typography>
        <i data-testid="citation-formatter-citation">
          <Trans>{citation}</Trans>
        </i>
      </Typography>
      {!copiedCitation ? (
        <Button
          id="citation-formatter-copy-citation"
          aria-label={t(
            'studies.details.citation_formatter.copy_citation_arialabel'
          )}
          variant="contained"
          color="primary"
          size="small"
          disabled={citation === ''}
          onClick={() => {
            navigator.clipboard.writeText(citation);
            setCopiedCitation(true);
            setTimeout(() => setCopiedCitation(false), 1750);
          }}
        >
          {t('studies.details.citation_formatter.copy_citation')}
        </Button>
      ) : (
        <Button
          id="citation-formatter-copied-citation"
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Mark size={20} visible={true} />}
        >
          {t('studies.details.citation_formatter.copied_citation')}
        </Button>
      )}
    </Box>
  );
};

export default CitationFormatter;
