import {
  Box,
  Chip,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TableSortLabel,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Pagination } from '@material-ui/lab';
import ArrowTooltip from '../arrowtooltip.component';
import { Entity, Filter, Order } from '../app.types';
import { QueryParams } from '../state/app.types';
import { nestedValue } from '../state/actions';
import { SortTablePayload } from '../state/actions/actions.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange } from 'react-virtualized';
import AdvancedFilter from './advancedFilter.component';
import EntityCard, { EntityImageDetails } from './entityCard.component';

const useCardViewStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    expandDetails: {
      width: '100%',
    },
    selectedChips: {
      display: 'inline-flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      listStyle: 'none',
      padding: theme.spacing(1),
    },
    chip: {
      margin: theme.spacing(0.5),
    },
    paginationGrid: {
      padding: theme.spacing(2),
    },
    noResultsPaper: {
      padding: theme.spacing(2),
      margin: theme.spacing(2),
    },
  })
);

export interface CardViewDetails {
  dataKey: string;

  icon?: JSX.Element;
  label?: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  content?: (data?: any) => React.ReactNode;

  // Filter and sort options.
  filterComponent?: (label: string, dataKey: string) => React.ReactElement;
  disableSort?: boolean;
  noTooltip?: boolean;
}

type CVPaginationPosition = 'top' | 'bottom' | 'both';

export interface CardViewProps {
  data: Entity[];
  totalDataCount: number;
  query: QueryParams;
  loadedData: boolean;
  loadedCount: boolean;

  loadData: (offsetParams: IndexRange) => Promise<void> | undefined;
  loadCount: () => Promise<void> | undefined;
  onPageChange: (page: number) => Promise<void>;
  onFilter: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;

  // Props to get title, description of the card
  // represented by data.
  title: CardViewDetails;
  description?: CardViewDetails;
  information?: CardViewDetails[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  moreInformation?: (data?: any) => React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buttons?: ((data?: any) => React.ReactNode)[];

  customFilters?: { label: string; dataKey: string; filterItems: string[] }[];
  resultsOptions?: number[];
  image?: EntityImageDetails;

  paginationPosition?: CVPaginationPosition;
}

interface CVFilterInfo {
  [filterKey: string]: {
    label: string;
    items: {
      [data: string]: boolean;
    };
    hasSelectedItems: boolean;
  };
}

interface CVSelectedFilter {
  filterKey: string;
  label: string;
  items: string[];
}

interface CVSort {
  label: string;
  dataKey: string;
}

interface OptionalQueryParams {
  newSort?: SortTablePayload;
  newPage?: number;
  newResults?: number;
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
      style={{ textAlign: 'center' }}
      count={numPages}
      page={page}
      onChange={(e, p) => {
        // If we are not clicking on the same page.
        if (p !== page) {
          changePage(p);
        }
      }}
      showFirstButton
      hidePrevButton={page === 1}
      hideNextButton={page >= numPages}
      showLastButton
    />
  );
}

// TODO: Hide/disable pagination and sort/filters if no results retrieved.
const CardView = (props: CardViewProps): React.ReactElement => {
  const classes = useCardViewStyles();

  // Props.
  const {
    data,
    totalDataCount,
    query,
    customFilters,
    resultsOptions,
    paginationPosition,
    loadedData,
    loadedCount,
    loadData,
    loadCount,
    onPageChange,
    onFilter,
    pushQuery,
  } = props;

  // Get card information.
  const {
    title,
    description,
    information,
    moreInformation,
    image,
    buttons,
  } = props;

  // Results options (by default it is 10, 20 and 30).
  const resOptions = React.useMemo(
    () =>
      resultsOptions ? resultsOptions.sort((a, b) => a - b) : [10, 20, 30],
    [resultsOptions]
  );

  // Extract relevant entries from query
  const filters = query.filters;
  const sort = query.sort;
  const page = React.useMemo(
    () => (query.page && query.page > 0 ? query.page : 1),
    [query]
  );
  const results = React.useMemo(
    () =>
      query.results && resOptions.includes(query.results)
        ? query.results
        : resOptions[0],
    [query, resOptions]
  );

  // Pagination.
  const [maxPage, setMaxPage] = React.useState(0);
  const paginationPos = paginationPosition ? paginationPosition : 'both';

  // Filters.
  const hasInfoFilters = information
    ? information.some((i) => i.filterComponent)
    : false;
  const [filtersInfo, setFiltersInfo] = React.useState<CVFilterInfo>({});
  const [selectedFilters, setSelectedFilters] = React.useState<
    CVSelectedFilter[]
  >([]);

  // Sort.
  const [cardSort, setCardSort] = React.useState<CVSort[] | null>(null);
  const hasSort =
    !title.disableSort ||
    (description ? !description.disableSort : false) ||
    (information ? information.some((i) => !i.disableSort) : false);

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

  // Set the filter information based on what was provided.
  React.useEffect(() => {
    const getSelectedFilter = (
      filterKey: string,
      filterValue: string
    ): boolean => {
      if (filterKey in filters) {
        const v = filters[filterKey];
        if (Array.isArray(v) && v.includes(filterValue)) {
          return true;
        }
      }
      return false;
    };

    // Get the updated info.
    const info = customFilters
      ? Object.values(customFilters).reduce((o, filter) => {
          const data: CVFilterInfo = {
            ...o,
            [filter.dataKey]: {
              label: filter.label,
              items: filter.filterItems.reduce(
                (o, item) => ({
                  ...o,
                  [item]: getSelectedFilter(filter.dataKey, item),
                }),
                {}
              ),
              hasSelectedItems: false,
            },
          };

          // Update the selected count for each filter.
          const selectedItems = Object.values(data[filter.dataKey].items).find(
            (v) => v === true
          );
          if (selectedItems) {
            data[filter.dataKey].hasSelectedItems = true;
          }
          return data;
        }, {})
      : [];

    setFiltersInfo(info);
  }, [customFilters, filters]);

  React.useEffect(() => {
    if (Object.keys(filtersInfo).length > 0) {
      // Get selected items only and remove any arrays without items.
      const selected = Object.entries(filtersInfo)
        .map(
          ([filterKey, info]) => ({
            filterKey: filterKey,
            label: info.label,
            items: Object.entries(info.items)
              .filter(([, v]) => v)
              .map(([i]) => i),
          }),
          []
        )
        .filter((v) => v.items.length > 0);
      setSelectedFilters(selected);
    }
  }, [filtersInfo]);

  const changeFilter = (
    filterKey: string,
    filterValue: string,
    remove?: boolean
  ): void => {
    // Add or remove the filter value in the state.
    let updateItems: string[];
    if (filterKey in filters) {
      const filterItems = filters[filterKey];
      if (Array.isArray(filterItems)) {
        updateItems = filterItems;
      } else {
        updateItems = [];
      }
    } else {
      updateItems = [];
    }

    // Add or remove the filter value.
    if (!remove && !updateItems.includes(filterValue)) {
      // Add a filter item.
      updateItems.push(filterValue);
      updateQuery({ newPage: 1 }, query);
      onFilter(filterKey, updateItems);
    } else {
      if (updateItems.length > 0 && updateItems.includes(filterValue)) {
        // Set to null if this is the last item in the array.
        // Remove the item from the updated items array.
        const i = updateItems.indexOf(filterValue);
        if (i > -1) {
          // Remove the filter value from the update items.
          updateItems.splice(i, 1);
          updateQuery({ newPage: 1 }, query);
          if (updateItems.length > 0) {
            onFilter(filterKey, updateItems);
          } else {
            onFilter(filterKey, null);
          }
        }
      }
    }
  };

  // Allows updating different query entries simultaneously
  const updateQuery = React.useCallback(
    (
      { newPage, newResults, newSort }: OptionalQueryParams,
      oldQuery: QueryParams
    ): void => {
      let combinedSort;
      if (newSort) {
        const { column, order } = newSort;
        if (order !== null) {
          combinedSort = {
            ...oldQuery.sort,
            [column]: order,
          };
        } else {
          const { [column]: order, ...rest } = oldQuery.sort;
          combinedSort = {
            ...rest,
          };
        }
      }

      const newQuery = {
        ...oldQuery,
        page: newPage ? newPage : oldQuery.page,
        results: newResults ? newResults : oldQuery.results,
        sort: combinedSort ? combinedSort : oldQuery.sort,
      };
      pushQuery(newQuery);
    },
    [pushQuery]
  );
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

  // Data count only changes when filters change
  React.useEffect(() => {
    loadCount();
  }, [loadCount, filters]);

  // Handle (max) page and loading data
  React.useEffect(() => {
    if (loadedCount) {
      const newMaxPage = ~~(1 + (totalDataCount - 1) / results);
      if (newMaxPage !== maxPage) {
        // Update maxPage (if needed) due to changed fitlers or results
        setMaxPage(newMaxPage);
      } else if (maxPage > 0 && page > newMaxPage) {
        // Change page (if needed) before loading data
        onPageChange(1);
      } else if (results > 0 && totalDataCount > 0 && page > 0) {
        const startIndex = (page - 1) * results;
        const stopIndex = startIndex + results - 1;
        loadData({ startIndex, stopIndex });
      }
    }
  }, [
    loadData,
    onPageChange,
    maxPage,
    page,
    results,
    sort,
    filters,
    totalDataCount,
    loadedCount,
  ]);

  const [t] = useTranslation();

  return (
    <Grid container direction="column" alignItems="center">
      <Grid
        container
        item
        direction="row"
        justify="center"
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

        {totalDataCount > 0 && loadedData && (
          <Grid
            container
            item
            direction="row"
            alignItems="center"
            justify="space-around"
            xs={12}
            className={classes.paginationGrid}
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
              <Grid container item xs={12} md={1} justify="flex-end">
                <FormControl className={classes.formControl}>
                  <InputLabel id="select-max-results-label">
                    Max Results
                  </InputLabel>
                  <Select
                    labelId="select-max-results-label"
                    id="select-max-results"
                    value={results}
                    onChange={(e) => {
                      const newResults = e.target.value as number;
                      const newMaxPage = ~~(
                        1 +
                        (totalDataCount - 1) / newResults
                      );
                      if (page > newMaxPage) {
                        updateQuery(
                          { newResults: newResults, newPage: 1 },
                          query
                        );
                      } else {
                        updateQuery({ newResults: newResults }, query);
                      }
                    }}
                  >
                    {resOptions
                      .filter(
                        (n, i) =>
                          (i === 0 && totalDataCount > n) ||
                          (i > 0 && totalDataCount > resOptions[i - 1])
                      )
                      .map((n, i) => (
                        <MenuItem key={i} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        )}
      </Grid>

      {loadedData && (
        <Grid container direction="row">
          <Grid item xs={12} md={3}>
            <Grid
              item
              container
              direction="column"
              justify="flex-start"
              alignItems="stretch"
              spacing={5}
              xs={12}
              style={{ marginLeft: 0, marginRight: 0, marginBottom: 0 }}
            >
              {/* Sorting options */}
              {hasSort && totalDataCount > 0 && (
                <Grid item xs>
                  <Paper>
                    <Box p={2}>
                      <Typography variant="h5">Sort By</Typography>
                    </Box>

                    {/* Show all the available sort options: 
                        title, description and the further information (if provided) */}
                    <Box>
                      <List component="nav" aria-label="sort-by-list">
                        {cardSort &&
                          cardSort.map((s, i) => (
                            <ListItem
                              key={i}
                              button
                              onClick={() => {
                                updateQuery(
                                  {
                                    newPage: 1,
                                    newSort: {
                                      column: s.dataKey,
                                      order: nextSortDirection(s.dataKey),
                                    },
                                  },
                                  query
                                );
                              }}
                              aria-label={`Sort by ${s.dataKey}${
                                sort[s.dataKey]
                                  ? `, ${
                                      sort[s.dataKey] === 'asc'
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

              {/* Filtering options */}
              {customFilters && (
                <Grid item xs>
                  <Paper>
                    <Box p={2}>
                      <Typography variant="h5">Filter By</Typography>
                    </Box>

                    {/* Show the specific options available to filter by */}
                    <Box>
                      {filtersInfo &&
                        Object.entries(filtersInfo).map(
                          ([filterKey, filter], filterIndex) => {
                            return (
                              <Accordion
                                key={filterIndex}
                                defaultExpanded={filter.hasSelectedItems}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                >
                                  <Typography>{filter.label}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <div className={classes.expandDetails}>
                                    <List
                                      component="nav"
                                      aria-label="filter-by-list"
                                    >
                                      {Object.entries(filter.items).map(
                                        ([item, selected], valueIndex) => (
                                          <ListItem
                                            key={valueIndex}
                                            button
                                            disabled={selected}
                                            onClick={() => {
                                              changeFilter(filterKey, item);
                                            }}
                                            aria-label={`Filter by ${filter.label} ${item}`}
                                          >
                                            <Chip
                                              label={
                                                <ArrowTooltip title={item}>
                                                  <Typography>
                                                    {item}
                                                  </Typography>
                                                </ArrowTooltip>
                                              }
                                            />
                                          </ListItem>
                                        )
                                      )}
                                    </List>
                                  </div>
                                </AccordionDetails>
                              </Accordion>
                            );
                          }
                        )}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Card data */}
          <Grid item xs={12} md={9}>
            {/* Selected filters array */}
            {selectedFilters.length > 0 && (
              <div className={classes.selectedChips}>
                {selectedFilters.map((filter, filterIndex) => (
                  <li key={filterIndex}>
                    {filter.items.map((item, itemIndex) => (
                      <Chip
                        key={itemIndex}
                        className={classes.chip}
                        label={`${filter.label} - ${item}`}
                        onDelete={() => {
                          changeFilter(filter.filterKey, item, true);
                        }}
                      />
                    ))}
                  </li>
                ))}
              </div>
            )}

            {/* List of cards */}
            {totalDataCount > 0 ? (
              <List style={{ padding: 0, marginRight: 20 }}>
                {/* TODO: The width of the card should take up more room when
                      there is no information or buttons. */}
                {data.map((entity, index) => {
                  return (
                    <ListItem
                      key={index}
                      alignItems="flex-start"
                      className={classes.root}
                    >
                      {/* Create an individual card */}
                      <EntityCard
                        title={{
                          label: nestedValue(entity, title.dataKey),
                          content: title.content && title.content(entity),
                        }}
                        description={
                          description &&
                          nestedValue(entity, description.dataKey)
                        }
                        information={
                          information &&
                          information
                            .map((details) => ({
                              icon: details.icon,
                              // We can say the data key is the label if not defined.
                              label: details.label
                                ? details.label
                                : details.dataKey,
                              // Keep the dataKey in so we can use it for adding the tooltip
                              // once content has been created.
                              dataKey: details.dataKey,
                              content: details.content
                                ? details.content(entity)
                                : nestedValue(entity, details.dataKey),
                              noTooltip: details.noTooltip,
                            }))
                            // Filter afterwards to only show content with information.
                            .filter((v) => v.content)
                            // Add in tooltips to the content we have filtered.
                            .map((details) => ({
                              ...details,
                              // If we use custom content we can choose to not show a tooltip.
                              content: !details.noTooltip ? (
                                <ArrowTooltip
                                  title={nestedValue(entity, details.dataKey)}
                                >
                                  <Typography>{details.content}</Typography>
                                </ArrowTooltip>
                              ) : (
                                details.content
                              ),
                            }))
                        }
                        moreInformation={
                          moreInformation && moreInformation(entity)
                        }
                        // Pass in the react nodes with the data to the card.
                        buttons={
                          buttons && buttons.map((button) => button(entity))
                        }
                        // Pass tag names to the card given the specified data key for the filter.
                        tags={
                          customFilters &&
                          customFilters.map((f) =>
                            nestedValue(entity, f.dataKey)
                          )
                        }
                        image={image}
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Grid item xs={12} md={8}>
                <Paper className={classes.noResultsPaper}>
                  <Typography align="center" variant="h6" component="h6">
                    {t('loading.filter_message')}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}

      {/*  Pagination  */}
      {totalDataCount > 0 &&
        loadedData &&
        (paginationPos === 'bottom' || paginationPos === 'both') && (
          <Grid item xs style={{ padding: '50px' }}>
            {CVPagination(page, maxPage, onPageChange)}
          </Grid>
        )}
    </Grid>
  );
};

export default CardView;
