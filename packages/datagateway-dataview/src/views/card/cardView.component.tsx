import React from 'react';
import { IndexRange } from 'react-virtualized';
import { Action } from 'redux';

import {
  Entity,
  Filter,
  FiltersType,
  nestedValue,
  SortType,
  Order,
  ArrowTooltip,
} from 'datagateway-common';
import { QueryParams } from 'datagateway-common/lib/state/app.types';

import {
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Typography,
  ListItemText,
  ListItemIcon,
  TableSortLabel,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Pagination } from '@material-ui/lab';

import EntityCard, { EntityImageDetails } from './entityCard.component';
import AdvancedFilter from './advancedFilter.component';

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
}

interface CardViewProps {
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  // TODO: Provide query page and results instead of the whole object.
  query: QueryParams;
  sort: SortType;
  filters: FiltersType;

  loadData: (offsetParams: IndexRange) => Promise<void>;
  loadCount: () => Promise<void>;
  onPageChange: (page: number) => Promise<void>;
  onResultsChange: (results: number) => Promise<void>;
  onSort: (sort: string, order: Order | null) => Promise<void>;
  onFilter: (filter: string, data: Filter | null) => Promise<void>;
  clearData: () => Action;

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
}

interface CVFilterInfo {
  [filterKey: string]: {
    label: string;
    items: {
      [data: string]: boolean;
    };
    // hasSelectedItems: boolean;
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

// TODO: Duplicate count and data requests for filter and page changes.
// TODO: Hide/disable pagination and sort/filters if no results retrieved.
const CardView = (props: CardViewProps): React.ReactElement => {
  const classes = useCardViewStyles();

  // Props.
  const {
    data,
    totalDataCount,
    query,
    filters,
    sort,
    customFilters,
    resultsOptions,
    loadData,
    loadCount,
    loading,
    onPageChange,
    onResultsChange,
    onFilter,
    onSort,
    clearData,
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
  const resOptions = resultsOptions
    ? resultsOptions.sort((a, b) => a - b)
    : [10, 20, 30];

  // Card data.
  const [viewData, setViewData] = React.useState<Entity[]>([]);
  const [loadedData, setLoadedData] = React.useState(false);

  // Pagination.
  const [page, setPage] = React.useState(-1);
  const [dataCount, setDataCount] = React.useState(-1);
  const [numPages, setNumPages] = React.useState(-1);
  const [maxResults, setMaxResults] = React.useState(-1);
  const [pageChange, setPageChange] = React.useState(false);
  const [pageLoad, setPageLoad] = React.useState(false);

  // Change in data.
  const [filterChange, setFilterChange] = React.useState(false);
  const [sortChange, setSortChange] = React.useState(false);

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

  React.useEffect(() => {
    // Get sort information from title, description and information lists.
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
              // TODO: Make use of selected items
              //       (for expansion panel expanded by default on page render).
              // hasSelectedItems: false,
            },
          };

          // Update the selected count for each filter.
          // const selectedItems = Object.values(data[filter.dataKey].items).find(
          //   (v) => v === true
          // );
          // if (selectedItems) {
          //   data[filter.dataKey].hasSelectedItems = true;
          // }
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
      onFilter(filterKey, updateItems);
      setFilterChange(true);
      changePage(1);
    } else {
      if (updateItems.length > 0 && updateItems.includes(filterValue)) {
        // Set to null if this is the last item in the array.
        // Remove the item from the updated items array.
        const i = updateItems.indexOf(filterValue);
        if (i > -1) {
          // Remove the filter value from the update items.
          updateItems.splice(i, 1);
          if (updateItems.length > 0) {
            onFilter(filterKey, updateItems);
          } else {
            onFilter(filterKey, null);
          }
          setFilterChange(true);
          changePage(1);
        }
      }
    }
  };

  // Actions to take when changing a page.
  const changePage = React.useCallback(
    (pageNumber: number): void => {
      setPage(pageNumber);
      onPageChange(pageNumber);
      setPageChange(true);
      setLoadedData(false);
    },
    [onPageChange]
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

  React.useEffect(() => {
    console.log('---------------------------------------');
    console.log('Page number (page): ', page);
    console.log('Current pageNum (query): ', query.page);
    console.log('Page change: ', pageChange);
    console.log('Page results: ', maxResults);
    console.log('Query results: ', query.results);

    // Set the page number if it was found in the parameters.
    if (!pageChange && !pageLoad) {
      if (query.page) {
        console.log('Set to query page: ', query.page);
        setPage(query.page);
      } else {
        // Workaround for issue where page remains same on pagination on investigation/dataset.
        // If this is not a page change and there is no page query parameter,
        // then default to the 1st page (we treat this as the initial page load).
        setPage(1);
      }

      setPageLoad(true);
    } else {
      // Manually scroll to top of the page as the pagination click isn't doing so.
      window.scrollTo(0, 0);
      setPageChange(false);
    }

    // Ensure the max results change according to the query parameter.
    if (query.results && resOptions.includes(query.results)) {
      // dataCount > resOptions[0]
      // maxResults !== query.results
      setMaxResults(query.results);
    } else {
      // Reset the max results back to the default value
      // when switching between pages (this is the same issue as
      // the pagination, page, holding the same value between
      // investigation/dataset card views).
      setMaxResults(resOptions[0]);
    }
  }, [page, pageChange, pageLoad, query, maxResults, dataCount, resOptions]);

  // TODO: Work-around for the pagination, start/stop index
  //       working incorrectly due to the totalDataCount being updated later on
  //       (to the new value for the new view).
  React.useEffect(() => {
    // Handle count and reloading of data based on pagination options.
    if (totalDataCount > 0) {
      setDataCount(totalDataCount);
      // Calculate the maximum pages needed for pagination.
      setNumPages(~~((totalDataCount + maxResults - 1) / maxResults));
      console.log('num pages: ', numPages);
      setLoadedData(false);
    }
  }, [maxResults, numPages, totalDataCount]);

  // TODO: Creates duplicate count request.
  // TODO: This should be not how filter/sort changes work; make it simpler (may require a big change).
  React.useEffect(() => setFilterChange(true), [filters]);
  React.useEffect(() => setSortChange(true), [sort]);

  React.useEffect(() => {
    // TODO: Move this separately so that sort and filters are handled separately
    //       (tied to only one load count/data).
    if (!loading && (filterChange || sortChange)) {
      // Load count again on filter/sort change.
      loadCount();

      if (filterChange) setFilterChange(false);
      if (sortChange) setSortChange(false);
    }

    if (!loading && dataCount > 0) {
      if (!loadedData) {
        // Calculate the start/end indexes for the data.
        const startIndex = page * maxResults - (maxResults - 1) - 1;
        console.log('startIndex: ', startIndex);

        // End index not incremented for slice method.
        const stopIndex = Math.min(startIndex + maxResults, dataCount) - 1;
        console.log('stopIndex: ', stopIndex);

        if (numPages > -1 && startIndex > -1 && stopIndex > -1) {
          // Clear data in the state before loading new data.
          clearData();
          loadData({ startIndex, stopIndex });
          setLoadedData(true);
        }
      } else {
        // Set the data once it has been loaded.
        setViewData(data);
      }
    }
  }, [
    data,
    dataCount,
    maxResults,
    page,
    numPages,
    loadCount,
    loadData,
    loadedData,
    loading,
    filterChange,
    sortChange,
    changePage,
    clearData,
    pageLoad,
  ]);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        style={{ paddingBottom: '5vh' }}
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

        {/* Maximum results selection */}
        <Grid item xs={12}>
          {/* Do not show if the number of data is smaller than the 
              smallest amount of results to display (10) or the smallest amount available. */}
          {dataCount > resOptions[0] && (
            <Grid
              item
              xs
              style={{
                paddingRight: '10vw',
                float: 'right',
              }}
            >
              <FormControl className={classes.formControl}>
                <InputLabel id="select-max-results-label">
                  Max Results
                </InputLabel>
                <Select
                  labelId="select-max-results-label"
                  id="select-max-results"
                  value={maxResults}
                  onChange={(e) => {
                    // TODO: Do we need a separate max results?
                    setMaxResults(e.target.value as number);
                    onResultsChange(e.target.value as number);
                    setLoadedData(false);
                  }}
                >
                  {resOptions
                    .filter((n) => dataCount > n)
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
      </Grid>

      {/* TODO: When browser width becomes smaller this is smaller in width 
                    (needs to expand to take up full width) */}
      <Grid container direction="row">
        <Grid item xs={3} style={{ padding: '1%' }}>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={5}
            xs={12}
          >
            {hasSort && (
              <Grid item xs>
                <Paper>
                  <Box p={2}>
                    <Typography variant="h5">Sort By</Typography>
                  </Box>

                  {/* Show all the available sort options: 
                      TITLE, DESCRIPTION and the further information (if provided) 
                  */}
                  <Box>
                    <List component="nav">
                      {cardSort &&
                        cardSort.map((s, i) => (
                          <ListItem
                            key={i}
                            button
                            onClick={() => {
                              onSort(s.dataKey, nextSortDirection(s.dataKey));
                              setSortChange(true);
                              changePage(1);
                            }}
                          >
                            <ListItemText primary={s.label} />
                            <ListItemIcon>
                              <TableSortLabel
                                active={s.dataKey in sort}
                                direction={sort[s.dataKey]}
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
                            // TODO: Expand filter panel if any options are selected.
                            <ExpansionPanel
                              key={filterIndex}
                              // TODO: Default expanded changes upon state update.
                              // defaultExpanded={filter.hasSelectedItems}
                            >
                              <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                              >
                                <Typography>{filter.label}</Typography>
                              </ExpansionPanelSummary>
                              <ExpansionPanelDetails>
                                <div className={classes.expandDetails}>
                                  <List component="nav">
                                    {Object.entries(filter.items).map(
                                      ([item, selected], valueIndex) => (
                                        <ListItem
                                          key={valueIndex}
                                          button
                                          disabled={selected}
                                          onClick={() => {
                                            changeFilter(filterKey, item);
                                          }}
                                        >
                                          <Chip
                                            label={
                                              <ArrowTooltip title={item}>
                                                <Typography>{item}</Typography>
                                              </ArrowTooltip>
                                            }
                                          />
                                        </ListItem>
                                      )
                                    )}
                                  </List>
                                </div>
                              </ExpansionPanelDetails>
                            </ExpansionPanel>
                          );
                        }
                      )}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item xs>
          <Grid container direction="row">
            {/* Card data */}
            <Grid item>
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
              <List>
                {/* TODO: The width of the card should take up more room when
                      there is no information or buttons. */}
                {viewData.map((data, index) => {
                  return (
                    <ListItem
                      key={index}
                      alignItems="flex-start"
                      className={classes.root}
                    >
                      {/* Create an individual card */}
                      <EntityCard
                        title={{
                          label: nestedValue(data, title.dataKey),
                          content: title.content && title.content(data),
                        }}
                        description={
                          description && nestedValue(data, description.dataKey)
                        }
                        information={
                          information &&
                          information
                            .map((details) => ({
                              // We can say the data key is the label if not defined.
                              label: details.label
                                ? details.label
                                : details.dataKey,
                              content: details.content
                                ? details.content(data)
                                : nestedValue(data, details.dataKey),
                              // Keep the dataKey in so we can use it for adding the tooltip
                              // once content has been created.
                              dataKey: details.dataKey,
                              icon: details.icon,
                            }))
                            // Filter afterwards to only show content with information.
                            .filter((v) => v.content)
                            // Add in tooltips to the content we have filtered.
                            .map((details) => ({
                              ...details,
                              content: (
                                <ArrowTooltip
                                  title={nestedValue(data, details.dataKey)}
                                >
                                  <Typography>{details.content}</Typography>
                                </ArrowTooltip>
                              ),
                            }))
                        }
                        moreInformation={
                          moreInformation && moreInformation(data)
                        }
                        // Pass in the react nodes with the data to the card.
                        buttons={
                          buttons && buttons.map((button) => button(data))
                        }
                        // Pass tag names to the card given the specified data key for the filter.
                        tags={
                          customFilters &&
                          customFilters.map((f) => nestedValue(data, f.dataKey))
                        }
                        image={image}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/*  Pagination  */}
      {loadedData && (
        <Grid item xs style={{ padding: '50px' }}>
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
        </Grid>
      )}
    </Grid>
  );
};

export default CardView;
