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
import { useHistory, useLocation } from 'react-router-dom';
import { FiltersType, parseSearchToQuery } from 'datagateway-common';

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

  onFilterApplied: () => void;
}

/**
 * Allows users to narrow down the search result by applying filters
 * based on the facet classification of the search result set.
 */
function FacetPanel({
  facetClassification,
  onFilterApplied,
}: FacetPanelProps): JSX.Element {
  const [t] = useTranslation();
  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { filters } = queryParams;

  const [selectedFacetFilters, setSelectedFacetFilters] =
    React.useState<FiltersType>({});

  React.useEffect(() => {
    setSelectedFacetFilters(filters);
  }, [filters]);

  const addFacetFilter = (
    dimension: string,
    classificationLabel: string,
    selected: boolean
  ): void => {
    console.log({ dimension, classificationLabel, selected });

    const filterKey = dimension.toLocaleLowerCase();
    if (selected) {
      setSelectedFacetFilters((prevFilter) => {
        const prevFilterValue = prevFilter[filterKey];
        if (!prevFilterValue) {
          return {
            ...prevFilter,
            [filterKey]: [classificationLabel],
          };
        }
        if (Array.isArray(prevFilterValue)) {
          return {
            ...prevFilter,
            [filterKey]: [...prevFilterValue, classificationLabel],
          };
        }
        return prevFilter;
      });
    } else {
      setSelectedFacetFilters((prevFilter) => {
        const prevFilterValue = prevFilter[filterKey];
        if (!Array.isArray(prevFilterValue)) {
          return prevFilter;
        }

        // new facet filter excluding the classification label that has been unselected
        const dimensionFilters = prevFilterValue?.filter(
          (value) => value !== classificationLabel
        );

        if (dimensionFilters && dimensionFilters.length > 0) {
          return {
            ...prevFilter,
            [filterKey]: dimensionFilters,
          };
        }

        const { [filterKey]: _, ...rest } = prevFilter;
        return rest;
      });
    }
  };

  console.log('selected filters', selectedFacetFilters);

  const applyFacetFilter = (): void => {
    const searchParams = new URLSearchParams(location.search);
    const filters = Object.entries(selectedFacetFilters).reduce<FiltersType>(
      (obj, [dimension, value]) => {
        obj[dimension.toLocaleLowerCase()] = value;
        return obj;
      },
      {}
    );
    searchParams.set('filters', JSON.stringify(filters));
    push({ search: `?${searchParams.toString()}` });
    onFilterApplied();
  };

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
        <Button onClick={applyFacetFilter}>Apply</Button>
      </Box>

      <div>
        {Object.entries(facetClassification).map(
          ([dimension, classifications]) => (
            <Accordion key={dimension} disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                {t(`facetDimensionLabel.${dimension}`)}
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
                            addFacetFilter(
                              dimension,
                              classificationLabel,
                              selected
                            );
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
      </div>
    </PanelContainer>
  );
}

export default FacetPanel;
