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
  Paper,
  TableSortLabel,
  Typography,
  Select,
  Divider,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Pagination } from '@material-ui/lab';
import ArrowTooltip from '../arrowtooltip.component';
import { Entity, Filter, Order, SortType, FiltersType } from '../app.types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AdvancedFilter from './advancedFilter.component';
import EntityCard, { EntityImageDetails } from './entityCard.component';

const useCardViewStyles = makeStyles((theme: Theme) =>
  createStyles({
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

  icon?: React.ComponentType<unknown>;
  label?: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  content?: (data?: any) => React.ReactNode;

  // Filter and sort options.
  filterComponent?: (label: string, dataKey: string) => React.ReactElement;
  disableSort?: boolean;
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
  onSort: (sort: string, order: Order | null) => void;

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
}

interface CVFilterInfo {
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

interface CVSelectedFilter {
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
      aria-label="pagination"
    />
  );
}

const CardView = (props: CardViewProps): React.ReactElement => {
  const classes = useCardViewStyles();

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
    onFilter,
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
    // TODO: Possible to useMemo with filters?
    const info = customFilters
      ? Object.values(customFilters).reduce((o, filter) => {
          const data: CVFilterInfo = {
            ...o,
            [filter.dataKey]: {
              label: filter.label,
              items: filter.filterItems.reduce(
                (o, item) => ({
                  ...o,
                  [item.name]: {
                    selected: getSelectedFilter(filter.dataKey, item.name),
                    count: item.count,
                  },
                }),
                {}
              ),
              hasSelectedItems: false,
            },
          };

          // Update the selected count for each filter.
          const selectedItems = Object.values(data[filter.dataKey].items).find(
            (v) => v.selected === true
          );
          if (selectedItems) {
            data[filter.dataKey].hasSelectedItems = true;
          }
          return data;
        }, {})
      : {};

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
              .filter(([, v]) => v.selected)
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
      onPageChange(1);
      onFilter(filterKey, updateItems);
    } else {
      if (updateItems.length > 0 && updateItems.includes(filterValue)) {
        // Set to null if this is the last item in the array.
        // Remove the item from the updated items array.
        const i = updateItems.indexOf(filterValue);
        if (i > -1) {
          // Remove the filter value from the update items.
          updateItems.splice(i, 1);
          onPageChange(1);
          if (updateItems.length > 0) {
            onFilter(filterKey, updateItems);
          } else {
            onFilter(filterKey, null);
          }
        }
      }
    }
  };

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

        {totalDataCount > 0 && (
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
                              onSort(s.dataKey, nextSortDirection(s.dataKey));
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

            {/* Filtering options */}
            {customFilters && totalDataCount > 0 && (
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
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>{filter.label}</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <div className={classes.expandDetails}>
                                  <List
                                    component="nav"
                                    aria-label="filter-by-list"
                                  >
                                    {Object.entries(filter.items).map(
                                      ([name, data], valueIndex) => (
                                        <ListItem
                                          style={{ display: 'flex' }}
                                          key={valueIndex}
                                          button
                                          disabled={data.selected}
                                          onClick={() => {
                                            changeFilter(filterKey, name);
                                          }}
                                          aria-label={`Filter by ${filter.label} ${name}`}
                                        >
                                          <div style={{ flex: 1 }}>
                                            <Chip
                                              label={
                                                <ArrowTooltip title={name}>
                                                  <Typography>
                                                    {name}
                                                  </Typography>
                                                </ArrowTooltip>
                                              }
                                            />
                                          </div>
                                          <Divider
                                            orientation="vertical"
                                            flexItem
                                          />
                                          <Typography
                                            style={{ paddingLeft: '5%' }}
                                          >
                                            {data.count}
                                          </Typography>
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
          {selectedFilters.length > 0 && totalDataCount > 0 && (
            <div className={classes.selectedChips}>
              {selectedFilters.map((filter, filterIndex) => (
                <li key={filterIndex}>
                  {filter.items.map((item, itemIndex) => (
                    <Chip
                      key={itemIndex}
                      className={classes.chip}
                      // TODO: Icon support
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
          {loadedData &&
            (totalDataCount > 0 ? (
              <List style={{ padding: 0, marginRight: 20 }}>
                {data.map((entity, index) => {
                  return (
                    <ListItem key={index} alignItems="flex-start">
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
                <Paper className={classes.noResultsPaper}>
                  <Typography align="center" variant="h6" component="h6">
                    {t('loading.filter_message')}
                  </Typography>
                </Paper>
              </Grid>
            ))}
        </Grid>
      </Grid>

      {/*  Pagination  */}
      {totalDataCount > 0 &&
        (paginationPos === 'bottom' || paginationPos === 'both') && (
          <Grid item xs style={{ padding: '50px' }}>
            {CVPagination(page, maxPage, onPageChange)}
          </Grid>
        )}
    </Grid>
  );
};

export default CardView;
