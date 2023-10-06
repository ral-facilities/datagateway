import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Pagination,
  Stack,
  Typography,
  Chip,
  Box,
  Link,
} from '@mui/material';
import React from 'react';
import {
  Investigation,
  SuggestedInvestigation,
  useSimilarInvestigations,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { blue } from '@mui/material/colors';

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

function ScoreChip({
  score,
  lowestScore,
  highestScore,
  id,
}: {
  score: number;
  lowestScore: number;
  highestScore: number;
  id: number;
}): JSX.Element {
  const relevanceScore =
    lowestScore === highestScore
      ? 1
      : Math.round(
          ((score - lowestScore) / (highestScore - lowestScore)) * 10
        ) / 10;
  const colorShade = Math.max(
    relevanceScore * 1000 - 100,
    50
  ) as keyof typeof blue;
  const chipColour = blue[`${colorShade}`];
  const suggestionScore = Math.round(score * 100);
  return (
    <Chip
      data-testid={`suggested-investigations-score-${id}`}
      size="small"
      key={`${suggestionScore}%`}
      label={`${suggestionScore}%`}
      sx={{
        color: (theme) => theme.palette.getContrastText(chipColour),
        backgroundColor: chipColour,
      }}
    />
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

  const lowestScore = Math.min(...suggestions.map((s) => s.score));
  const highestScore = Math.max(...suggestions.map((s) => s.score));

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
              <ListItem
                dense
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ flexGrow: 1, marginRight: 2 }}>
                  {suggestion.doi ? (
                    <Link href={constructFullDoiUrl(suggestion.doi)}>
                      <Typography>{suggestion.title}</Typography>
                    </Link>
                  ) : (
                    <Typography>{suggestion.title}</Typography>
                  )}
                </Box>
                <ScoreChip
                  score={suggestion.score}
                  id={suggestion.id}
                  lowestScore={lowestScore}
                  highestScore={highestScore}
                />
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
