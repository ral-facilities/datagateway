import React from 'react';
import {
  Accordion as MuiAccordion,
  AccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Box,
  Button,
  List,
  styled,
  Typography,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import ToggleableFilterItem from './toggleableFilterItem.component';
import { FacetClassification } from '../../facet';
import { useTranslation } from 'react-i18next';
import { FiltersType } from 'datagateway-common';

const PanelContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  padding: theme.spacing(2),
}));

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  minHeight: 0,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  '& .MuiAccordionSummary-content': {
    margin: 0,
  },
}));

interface FacetPanelProps {
  /**
   * Facet classifications on the search result set.
   */
  facetClassification: FacetClassification;
  selectedFacetFilters: FiltersType;
  onAddFilter: (dimension: string, filterValue: string) => void;
  onRemoveFilter: (dimension: string, filterValue: string) => void;
  onApplyFacetFilters: () => void;
}

/**
 * Allows users to narrow down the search result by applying filters
 * based on the facet classification of the search result set.
 */
function FacetPanel({
  facetClassification,
  selectedFacetFilters,
  onAddFilter,
  onRemoveFilter,
  onApplyFacetFilters,
}: FacetPanelProps): JSX.Element {
  const [t] = useTranslation();

  return (
    <PanelContainer>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
        sx={{ paddingBottom: 1 }}
      >
        <Typography variant="h6">Filters</Typography>
        <Button onClick={onApplyFacetFilters}>Apply</Button>
      </Box>

      <Box width="100%">
        {Object.entries(facetClassification).map(
          ([dimension, classifications]) => (
            <Accordion key={dimension} disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                {t(`facetDimensionLabel.${dimension.toLocaleLowerCase()}`)}
              </AccordionSummary>
              <AccordionDetails sx={{ padding: 0 }}>
                <List dense>
                  {Object.entries(classifications).map(
                    ([classificationLabel, count]) => {
                      const selectedFilterValue =
                        selectedFacetFilters[dimension.toLocaleLowerCase()];
                      const isItemSelected =
                        Array.isArray(selectedFilterValue) &&
                        selectedFilterValue.includes(classificationLabel);

                      return (
                        <ToggleableFilterItem
                          key={classificationLabel}
                          classificationLabel={classificationLabel}
                          selected={isItemSelected}
                          onSelect={(classificationLabel, selected) => {
                            if (selected) {
                              onAddFilter(dimension, classificationLabel);
                            } else {
                              onRemoveFilter(dimension, classificationLabel);
                            }
                          }}
                          count={count}
                        />
                      );
                    }
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          )
        )}
      </Box>
    </PanelContainer>
  );
}

export default FacetPanel;
