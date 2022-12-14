import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  Paper,
  Select,
  TableSortLabel,
  Typography,
} from '@mui/material';
import {
  Entity,
  Filter,
  FiltersType,
  Order,
  SortType,
  UpdateMethod,
} from '../app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AdvancedFilter from './advancedFilter.component';
import EntityCard, { EntityImageDetails } from './entityCard.component';
import { DatasearchType } from '../api';

export interface CardViewDetails {
  dataKey: string;

  icon?: React.ComponentType<unknown>;
  label?: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  content?: (data?: any) => React.ReactNode;

  // Filter and sort options.
  filterComponent?: (label: string, dataKey: string) => React.ReactElement;
  disableSort?: boolean;
  defaultSort?: Order;
  noTooltip?: boolean;
}

export interface CVCustomFilters {
  label: string;
  dataKey: string;
  filterItems: {
    name: string;
    count: string;
  }[];
  prefixLabel?: boolean;
  dataKeySearch?: string;
}

type CVPaginationPosition = 'top' | 'bottom' | 'both';

export interface CardViewProps {
  data: Entity[];
  totalDataCount: number;
  sort: SortType;
  filters: FiltersType;
  page: number | null;
  results: number | null;
  loadedData: boolean;
  loadedCount: boolean;

  onPageChange: (page: number) => void;
  onFilter: (filter: string, data: Filter | null) => void;
  onResultsChange: (page: number) => void;
  onSort: (
    sort: string,
    order: Order | null,
    updateMethod: UpdateMethod
  ) => void;

  // Props to get title, description of the card
  // represented by data.
  title: CardViewDetails;
  description?: CardViewDetails;
  information?: CardViewDetails[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  moreInformation?: (data?: any) => React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buttons?: ((data?: any) => React.ReactNode)[];

  customFilters?: CVCustomFilters[];
  resultsOptions?: number[];
  image?: EntityImageDetails;

  paginationPosition?: CVPaginationPosition;
  allIds?: number[];
  entityName?: DatasearchType;
}

export interface CVFilterInfo {
  [filterKey: string]: {
    label: string;
    items: {
      [data: string]: {
        selected: boolean;
        count: number;
      };
    };
    hasSelectedItems: boolean;
  };
}

export interface CVSelectedFilter {
  filterKey: string;
  label: string;
  items: string[];
}

interface CVSort {
  label: string;
  dataKey: string;
}

function CVPagination(
  page: number,
  numPages: number,
  changePage: (page: number) => void
): React.ReactElement {
  return (
    <Pagination
      size="large"
      color="secondary"
      sx={{ textAlign: 'center' }}
      count={numPages}
      page={page}
      onChange={(e, p) => {
        // If we are not clicking on the same page. TT
        if (p !== page) {
          changePage(p);
        }
      }}
      showFirstButton
      hidePrevButton={page === 1}
      hideNextButton={page >= numPages}
      showLastButton
      aria-label="pagination"
      className="tour-dataview-pagination"
    />
  );
}

const CardView = (props: CardViewProps): React.ReactElement => {
  // Props.
  const {
    data,
    totalDataCount,
    customFilters,
    resultsOptions,
    paginationPosition,
    loadedData,
    loadedCount,
    onPageChange,
    onSort,
    onResultsChange,
  } = props;

  // Get card information.
  const {
    title,
    description,
    information,
    moreInformation,
    image,
    buttons,
    filters,
    sort,
  } = props;

  // Results options (by default it is 10, 20 and 30).
  const resOptions = React.useMemo(
    () =>
      resultsOptions ? resultsOptions.sort((a, b) => a - b) : [10, 20, 30],
    [resultsOptions]
  );

  // Extract relevant entries from query
  const page = React.useMemo(() => {
    return props.page && props.page > 0 ? props.page : 1;
  }, [props.page]);

  const results = React.useMemo(() => {
    return props.results && resOptions.includes(props.results)
      ? props.results
      : resOptions[0];
  }, [resOptions, props.results]);

  // Pagination.
  const [maxPage, setMaxPage] = React.useState(0);
  const paginationPos = paginationPosition ? paginationPosition : 'both';

  // Filters.
  const hasInfoFilters = information
    ? information.some((i) => i.filterComponent)
    : false;
  const [filterUpdate, setFilterUpdate] = React.useState(false);

  // Sort.
  const [cardSort, setCardSort] = React.useState<CVSort[] | null>(null);
  const hasSort =
    !title.disableSort ||
    (description ? !description.disableSort : false) ||
    (information ? information.some((i) => !i.disableSort) : false);

  //Apply default sort on page load (but only if not already defined in URL params)
  //This will apply them in the order of title, description and information, wherever
  //defaultSort has been provided
  React.useEffect(() => {
    if (title.defaultSort !== undefined && sort[title.dataKey] === undefined)
      onSort(title.dataKey, title.defaultSort, 'replace');
    if (
      description &&
      description.defaultSort !== undefined &&
      sort[description.dataKey] === undefined
    )
      onSort(description.dataKey, description.defaultSort, 'replace');
    if (information) {
      information.forEach((element: CardViewDetails) => {
        if (
          element.defaultSort !== undefined &&
          sort[element.dataKey] === undefined
        )
          onSort(element.dataKey, element.defaultSort, 'replace');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get sort information from title, description and information lists.
  React.useEffect(() => {
    let sortList: CVSort[] = [];

    if (!title.disableSort) {
      sortList.push({
        label: title.label ? title.label : title.dataKey,
        dataKey: title.dataKey,
      });
    }

    if (description && !description.disableSort) {
      sortList.push({
        label: description.label ? description.label : description.dataKey,
        dataKey: description.dataKey,
      });
    }

    if (information) {
      sortList = sortList.concat(
        information
          .filter((i) => !i.disableSort)
          .map((i) => ({
            label: i.label ? i.label : i.dataKey,
            dataKey: i.dataKey,
          }))
      );
    }

    setCardSort(sortList);
  }, [description, information, title.dataKey, title.disableSort, title.label]);

  React.useEffect(() => {
    if (filterUpdate && loadedData) setFilterUpdate(false);
  }, [filterUpdate, totalDataCount, loadedData]);

  const nextSortDirection = (dataKey: string): Order | null => {
    switch (sort[dataKey]) {
      case 'asc':
        return 'desc';
      case 'desc':
        return null;
      case undefined:
        return 'asc';
    }
  };

  // Handle (max) page
  React.useEffect(() => {
    if (loadedCount) {
      const newMaxPage = ~~(1 + (totalDataCount - 1) / results);
      if (newMaxPage !== maxPage) {
        // Update maxPage (if needed) due to changed filters or results
        setMaxPage(newMaxPage);
      } else if (maxPage > 0 && page > newMaxPage) {
        // Change page (if needed) before loading data
        onPageChange(1);
      }
    }
  }, [
    onPageChange,
    maxPage,
    page,
    results,
    filters,
    totalDataCount,
    loadedCount,
  ]);

  // Handle (max) result
  React.useEffect(() => {
    if (loadedCount && props.results) {
      if (
        resOptions
          .filter(
            (n, i) =>
              (i === 0 && totalDataCount > n) ||
              (i > 0 && totalDataCount > resOptions[i - 1])
          )
          .includes(props.results)
      ) {
        onResultsChange(props.results);
      } else {
        onResultsChange(resOptions[0]);
      }
    }
  }, [onResultsChange, resOptions, loadedCount, totalDataCount, props.results]);

  const [t] = useTranslation();
  const hasFilteredResults = loadedData && (filterUpdate || totalDataCount > 0);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid
        container
        item
        direction="row"
        justifyContent="center"
        alignItems="center"
        xs={12}
      >
        {/* Advanced filters  */}
        {(title.filterComponent ||
          (description && description.filterComponent) ||
          hasInfoFilters) && (
          <Grid item xs={12}>
            <AdvancedFilter
              title={title}
              description={description}
              information={information}
            />
          </Grid>
        )}

        {(filterUpdate || totalDataCount > 0) && (
          <Grid
            container
            item
            direction="row"
            alignItems="center"
            justifyContent="space-around"
            xs={12}
            padding={2}
          >
            {/* Fake box to mirror Max Results selector */}
            {totalDataCount > resOptions[0] && (
              <Grid item xs={12} md={1}>
                <Box px={1} width={120} />
              </Grid>
            )}

            {/*  Pagination container  */}
            {(paginationPos === 'top' || paginationPos === 'both') && (
              <Grid item>{CVPagination(page, maxPage, onPageChange)}</Grid>
            )}

            {/* Maximum results selection 
                Do not show if the number of data is smaller than the 
                smallest amount of results to display (10) or the smallest amount available. */}
            {totalDataCount > resOptions[0] && (
              <Grid container item xs={12} md={1} justifyContent="flex-end">
                <FormControl
                  variant="standard"
                  sx={{ margin: 1, minWidth: '120px' }}
                >
                  <InputLabel htmlFor="select-max-results">
                    {t('app.max_results')}
                  </InputLabel>
                  <Select
                    native
                    value={results}
                    inputProps={{
                      name: 'Max Results',
                      id: 'select-max-results',
                    }}
                    className="tour-dataview-max-results"
                    onChange={(e) => {
                      const newResults = e.target.value as number;
                      const newMaxPage = ~~(
                        1 +
                        (totalDataCount - 1) / newResults
                      );
                      onResultsChange(newResults);
                      if (page > newMaxPage) {
                        onPageChange(1);
                      }
                    }}
                    variant="standard"
                  >
                    {resOptions
                      .filter(
                        (n, i) =>
                          (i === 0 && totalDataCount > n) ||
                          (i > 0 && totalDataCount > resOptions[i - 1])
                      )
                      .map((n, i) => (
                        <option key={i} value={n} aria-label={`${n}...`}>
                          {n}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        )}
      </Grid>

      <Grid
        container
        item
        direction="row"
        justifyContent="center"
        spacing={2}
        padding={4}
      >
        {(hasSort || customFilters || !hasFilteredResults) && (
          <Grid item xs={12} md={3}>
            <Grid
              item
              container
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch"
              xs={12}
              rowSpacing={4}
              sx={{ marginLeft: 0, marginRight: 0, marginBottom: 0 }}
            >
              {/* Sorting options */}
              {hasSort && (filterUpdate || totalDataCount > 0) && (
                <Grid item xs>
                  <Paper>
                    <Box p={2}>
                      <Typography variant="h5">Sort By</Typography>
                    </Box>

                    {/* Show all the available sort options: 
                        title, description and the further information (if provided) */}
                    <Box>
                      <List
                        component="nav"
                        aria-label="sort-by-list"
                        className="tour-dataview-sort"
                      >
                        {cardSort &&
                          cardSort.map((s, i) => (
                            <ListItem
                              key={i}
                              button
                              onClick={() => {
                                onSort(
                                  s.dataKey,
                                  nextSortDirection(s.dataKey),
                                  'push'
                                );
                                if (page !== 1) {
                                  onPageChange(1);
                                }
                              }}
                              aria-label={`Sort by ${s.label.toUpperCase()}${
                                sort[s.label]
                                  ? `, current direction ${
                                      sort[s.label] === 'asc'
                                        ? 'ascending'
                                        : 'descending'
                                    }`
                                  : ''
                              }`}
                            >
                              <ListItemText primary={s.label} />
                              <ListItemIcon>
                                <TableSortLabel
                                  active={s.dataKey in sort}
                                  direction={sort[s.dataKey]}
                                  // Set tabindex to -1 to prevent button focus
                                  tabIndex={-1}
                                >
                                  {s.dataKey in sort && sort[s.dataKey]}
                                </TableSortLabel>
                              </ListItemIcon>
                            </ListItem>
                          ))}
                      </List>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}

        {/* Card data */}
        <Grid item xs={12} md={9}>
          {/* List of cards */}
          {hasFilteredResults ? (
            <List sx={{ padding: 0, margin: 0 }}>
              {data.map((entity, index) => {
                return (
                  <ListItem
                    key={index}
                    alignItems="flex-start"
                    sx={{ paddingRight: 0 }}
                  >
                    {/* Create an individual card */}
                    <EntityCard
                      entity={entity}
                      title={title}
                      description={description}
                      information={information}
                      moreInformation={moreInformation}
                      // Pass in the React nodes with the data to the card.
                      buttons={buttons}
                      // Pass tag names to the card given the specified data key for the filter.
                      customFilters={customFilters}
                      image={image}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Grid item xs={12} md={8}>
              <Paper sx={{ padding: 2, margin: 2 }}>
                <Typography align="center" variant="h6" component="h6">
                  {t('loading.filter_message')}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Grid>

      {/*  Pagination  */}
      {(filterUpdate || totalDataCount > 0) &&
        (paginationPos === 'bottom' || paginationPos === 'both') && (
          <Grid item xs sx={{ padding: '50px' }}>
            {CVPagination(page, maxPage, onPageChange)}
          </Grid>
        )}
    </Grid>
  );
};

export default CardView;
