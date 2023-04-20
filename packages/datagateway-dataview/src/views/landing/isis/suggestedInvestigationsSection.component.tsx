import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Divider,
  Link,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  Investigation,
  SuggestedInvestigation,
  useSimilarInvestigations,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';

interface SuggestedSectionProps {
  investigation: Investigation;
}

const MAX_SUGGESTION_COUNT = 10;

function SuggestedInvestigationsSection({
  investigation,
}: SuggestedSectionProps): JSX.Element {
  const [t] = useTranslation();
  const { data: suggestedResults, isLoading } = useSimilarInvestigations({
    investigation,
  });

  return (
    <Accordion disabled={isLoading} disableGutters elevation={0}>
      <AccordionSummary
        disabled={isLoading}
        expandIcon={isLoading ? <CircularProgress size={24} /> : <ExpandMore />}
      >
        <Typography>
          {isLoading
            ? t('investigations.landingPage.findingSimilarInvestigations')
            : t('investigations.landingPage.similarInvestigations')}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>
        {suggestedResults && suggestedResults.length > 0 ? (
          <SuggestionList suggestions={suggestedResults} />
        ) : (
          <Typography sx={{ padding: 2 }}>
            {t('investigations.landingPage.noSuggestion')}
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

function SuggestionList({
  suggestions,
}: {
  suggestions: SuggestedInvestigation[];
}): JSX.Element {
  function constructFullDoiUrl(doi: string): string {
    return `https://doi.org/${doi}`;
  }

  return (
    <List dense disablePadding>
      {suggestions.slice(0, MAX_SUGGESTION_COUNT).map((suggestion, i) => {
        const isLastItem = i === MAX_SUGGESTION_COUNT - 1;
        return (
          <React.Fragment key={suggestion.doc.id}>
            <ListItem dense>
              {suggestion.doc.doi ? (
                <Link href={constructFullDoiUrl(suggestion.doc.doi)}>
                  {suggestion.doc.title}
                </Link>
              ) : (
                <Typography>{suggestion.doc.title}</Typography>
              )}
            </ListItem>
            {!isLastItem && <Divider />}
          </React.Fragment>
        );
      })}
    </List>
  );
}

export default SuggestedInvestigationsSection;
export { MAX_SUGGESTION_COUNT };
