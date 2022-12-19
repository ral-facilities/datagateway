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
  overflow: 'auto',
  height: '100%',
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
  /**
   * The currently selected filters.
   */
  selectedFacetFilters: FiltersType;
  /**
   * Called when a filter is added by the user. The dimension and the value of the filter is passed.
   * For example, `dimension` can be "investigation.type.name" and `filterValue` can be `"experiment"`,
   * which indicates that the user wishes to only see investigations with type `"experiment"`.
   *
   * @param dimension The dimension of the added filter. For example investigation.type.name (Investigation type)
   * @param filterValue The value of the added filter.
   */
  onAddFilter: (dimension: string, filterValue: string) => void;
  /**
   * Called when a filter is removed by the user.
   *
   * @param dimension The dimension of the removed filter. For example investigation.type.name (Investigation type)
   * @param filterValue The value of the removed filter.
   * @see FacetPanelProps.onAddFilter
   */
  onRemoveFilter: (dimension: string, filterValue: string) => void;
  /**
   * Called when the selected filters are applied by the user. The search data should refresh
   * to reflect the applied filters.
   */
  onApplyFacetFilters: () => void;
}

/**
 * Allows users to narrow down the search result by applying filters
 * based on the facet classification of the search result set.
 *
 * For example, users can filter the search result by investigation type
 * or datafile format (txt? log? nexus file?)
 *
 * When filters are added/removed via {@link FacetPanelProps.onAddFilter} or {@link FacetPanelProps.onRemoveFilter},
 * the data should not be updated until the user *applies* them via {@link FacetPanelProps.onApplyFacetFilters}.
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
      >
        <Typography variant="h6">Filters</Typography>
        <Button onClick={onApplyFacetFilters}>Apply</Button>
      </Box>

      <Box width="100%" sx={{ marginTop: 1, marginBottom: 2 }}>
        {/* For each facet classification on the search data,
            render a new Accordion that expands to show the available filter values on that facet (dimension). */}
        {Object.entries(facetClassification).map(
          ([dimension, classifications]) => (
            <Accordion key={dimension} disableGutters elevation={0}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`${dimension}-filter-panel`}
                aria-label={`Toggle ${t(
                  `facetDimensionLabel.${dimension.toLocaleLowerCase()}`
                )} filter panel`}
              >
                {t(`facetDimensionLabel.${dimension.toLocaleLowerCase()}`)}
              </AccordionSummary>
              <AccordionDetails
                sx={{ padding: 0 }}
                aria-label={`${t(
                  `facetDimensionLabel.${dimension.toLocaleLowerCase()}`
                )} filter panel`}
                id={`${dimension}-filter-panel`}
              >
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