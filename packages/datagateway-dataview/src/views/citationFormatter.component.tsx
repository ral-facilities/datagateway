import {
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Theme,
  Typography,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Mark } from 'datagateway-common';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import axios, { AxiosError } from 'axios';
import { FormattedUser } from './landing/isis/isisStudyLanding.component';
import { useQuery, UseQueryResult } from 'react-query';

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

const useCitation = (
  citationProps: CitationFormatterProps,
  publisherName: string,
  format: string,
  locale: string
): UseQueryResult<string> => {
  const { doi, formattedUsers, title, startDate } = citationProps;

  return useQuery<string, AxiosError>(
    [formattedUsers, title, startDate, publisherName, doi, format, locale],
    () => {
      //Default citation format (No use of DataCite)
      if (format === 'default') {
        let citation = '';
        if (formattedUsers.length > 1)
          citation += `${formattedUsers[0].fullName} et al; `;
        if (formattedUsers.length === 1)
          citation += `${formattedUsers[0].fullName}; `;
        if (startDate) citation += `${startDate.slice(0, 4)}: `;
        if (title) citation += `${title}, `;
        citation += publisherName;
        if (doi) citation += `, https://doi.org/${doi}`;

        return citation;
      } else {
        if (doi) return fetchCitation(doi, format, locale);
        else throw new Error('No DOI was supplied');
      }
    },
    {
      cacheTime: Infinity,
    }
  );
};

const CitationFormatter = (
  props: CitationFormatterProps
): React.ReactElement => {
  const { doi } = props;

  const [t] = useTranslation();
  const classes = useStyles();
  const [copiedCitation, setCopiedCitation] = React.useState(false);
  const [format, setFormat] = React.useState('default');
  const { data: citation, isFetching: fetching, isError: error } = useCitation(
    props,
    t('doi_constants.publisher.name'),
    format,
    t('studies.details.citation_formatter.locale')
  );

  const handleChange = (event: SelectChangeEvent<string>): void => {
    setFormat(event.target.value as string);
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
      <Typography
        className={classes.subHeading}
        component="h6"
        variant="h6"
        data-testid="citation-formatter-title"
      >
        {t('studies.details.citation_formatter.label')}
      </Typography>
      <Typography data-testid="citation-formatter-details">
        {t('studies.details.citation_formatter.details') +
          (doi
            ? ` ${t(
                'studies.details.citation_formatter.details_select_format'
              )}`
            : '')}
      </Typography>
      {doi && (
        <FormControl id="citation-formatter" error={error} variant="standard">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              className={classes.formatSelect}
              defaultValue="default"
              onChange={handleChange}
              aria-label={t(
                'studies.details.citation_formatter.select_arialabel'
              )}
              aria-describedby="citation-formatter-error-message"
              variant="standard"
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
            {fetching && (
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
          {citation && <Trans>{citation}</Trans>}
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
          disabled={citation === undefined}
          onClick={() => {
            if (citation) {
              navigator.clipboard.writeText(citation);
              setCopiedCitation(true);
              setTimeout(() => setCopiedCitation(false), 1750);
            }
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
