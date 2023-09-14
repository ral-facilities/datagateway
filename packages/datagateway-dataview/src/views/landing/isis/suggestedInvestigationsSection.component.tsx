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
  Pagination,
  Stack,
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

const SUGGESTION_COUNT_PER_PAGE = 5;

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
  const [t] = useTranslation();
  const [currentPage, setCurrentPage] = React.useState(1);

  const pageCount = Math.ceil(suggestions.length / SUGGESTION_COUNT_PER_PAGE);

  function constructFullDoiUrl(doi: string): string {
    return `https://doi.org/${doi}`;
  }

  function changeCurrentPage(
    _event: React.ChangeEvent<unknown>,
    newPageNumber: number
  ): void {
    setCurrentPage(newPageNumber);
  }

  const paginationOffset = (currentPage - 1) * SUGGESTION_COUNT_PER_PAGE;
  const displayedSuggestions = suggestions.slice(
    paginationOffset,
    paginationOffset + SUGGESTION_COUNT_PER_PAGE
  );

  return (
    <Stack alignItems="center">
      <Pagination
        count={pageCount}
        page={currentPage}
        onChange={changeCurrentPage}
        getItemAriaLabel={(type, page) => {
          switch (type) {
            case 'page':
              return t(
                'investigations.landingPage.similarInvestigationListPaginationLabel.pageButton',
                { page }
              );

            case 'first':
              return t(
                'investigations.landingPage.similarInvestigationListPaginationLabel.firstPageButton'
              );

            case 'last':
              return t(
                'investigations.landingPage.similarInvestigationListPaginationLabel.lastPageButton'
              );

            case 'next':
              return t(
                'investigations.landingPage.similarInvestigationListPaginationLabel.nextButton'
              );

            case 'previous':
              return t(
                'investigations.landingPage.similarInvestigationListPaginationLabel.prevButton'
              );
          }
        }}
        shape="rounded"
        size="small"
        sx={{ pb: 2 }}
      />
      <List dense disablePadding>
        {displayedSuggestions.map((suggestion, i) => {
          const isLastItem = i === SUGGESTION_COUNT_PER_PAGE - 1;
          return (
            <React.Fragment key={suggestion.id}>
              <ListItem dense>
                {suggestion.doi ? (
                  <Link href={constructFullDoiUrl(suggestion.doi)}>
                    {suggestion.title}
                  </Link>
                ) : (
                  <Typography>{suggestion.title}</Typography>
                )}
              </ListItem>
              {!isLastItem && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Stack>
  );
}

export default SuggestedInvestigationsSection;
