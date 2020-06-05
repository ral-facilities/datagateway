import React from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  List,
  ListItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Chip,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Pagination } from '@material-ui/lab';

import EntityCard, { EntityImageDetails } from './card.component';

import { connect } from 'react-redux';
import { StateType, QueryParams } from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction, Action } from 'redux';
import {
  Entity,
  pushPageNum,
  pushPageResults,
  clearData,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';

// TODO: Will require sort/filters?
const useCardViewStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.paper,
      margin: '10px',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  })
);

interface CardViewDetails {
  dataKey: string;

  // TODO: Pass in a label for the dataKey to be shown under.
  //       Pass a Link component to wrap the data.
  label?: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  content?: (data?: any) => React.ReactNode;
}

interface CardViewProps {
  data: Entity[];
  totalDataCount: number;
  loadData?: (offsetParams: IndexRange) => Promise<void>;
  paginatedFetch?: boolean;

  // Props to get title, description of the card
  // represented by data.
  title: CardViewDetails;
  description?: CardViewDetails;
  furtherInformation?: CardViewDetails[];

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  buttons?: ((data?: any) => React.ReactNode)[];

  // TODO: Provide filtering options (array of dataKeys?).
  filters?: { label: string; dataKey: string; filterItems?: string[] }[];
  image?: EntityImageDetails;
}

interface CardViewStateProps {
  query: QueryParams;
}

interface CardViewDispatchProps {
  pushPage: (page: number) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  clearData: () => Action;
}

type CardViewCombinedProps = CardViewProps &
  CardViewStateProps &
  CardViewDispatchProps;

interface CardViewFilter {
  label: string;
  // dataKey: string;
  dataItems: {
    [item: string]: number;
  };
  selected: boolean;
}

// TODO: CardView needs URL support:
//        - filtering (?filter=)
//        - searching (?search=)
//        - sort (?sort=)
// TODO: Look at how datagateway-search creates a search/filter box; style the box.
const CardView = (props: CardViewCombinedProps): React.ReactElement => {
  const classes = useCardViewStyles();

  // Props.
  const {
    data,
    totalDataCount,
    query,
    filters,
    paginatedFetch,
    loadData,
    buttons,
    pushPage,
    pushResults,
    clearData,
  } = props;

  // Get card information.
  const { title, description, furtherInformation, image } = props;

  // Card data.
  const [viewData, setViewData] = React.useState<Entity[]>([]);

  // Pagination.
  // TODO: This page is not reset when component is changed.
  const [page, setPage] = React.useState(-1);
  const [numPages, setNumPages] = React.useState(-1);
  const [maxResults, setMaxResults] = React.useState(-1);

  // Filters.
  const [filtersInfo, setFiltersInfo] = React.useState<CardViewFilter[]>([]);
  // const [loadedFilters, setLoadedFilters] = React.useState(false);

  const [fetchPaginated, setFetchedPaginated] = React.useState(true);

  const [pageChange, setPageChange] = React.useState(false);
  const [loadedData, setLoadedData] = React.useState(false);

  React.useEffect(() => {
    if (paginatedFetch === false) {
      setFetchedPaginated(false);
    }
  }, [paginatedFetch]);

  // React.useEffect(() => {
  //   if (filters && !loadedFilters) {
  //     setFiltersInfo(
  //       Object.values(filters).map(filter => {
  //         let info: CardViewFilter = {
  //           label: filter.label,
  //           dataKey: filter.dataKey,
  //           dataItems: {},
  //           selected: false,
  //         };
  //         const filterValues = data.map(d => d[info.dataKey].toString());
  //         if (filterValues) {
  //           filterValues.forEach(v => {
  //             info.dataItems[v] = (info.dataItems[v] || 0) + 1;
  //           });
  //         }
  //         return info;
  //       })
  //     );
  //     setLoadedFilters(true);
  //   }
  //   console.log('filters: ', filtersInfo);
  // }, [filters, filtersInfo, loadedData, loadedFilters, data]);

  // React.useEffect(() => {
  //   if (filters && !loadedFilters) {
  //     const filterInfo = Object.values(filters).map(filter => {
  //       let info: CardViewFilter = {
  //         label: filter.label,
  //         dataKey: filter.dataKey,
  //         dataItems: {},
  //         selected: false,
  //       };
  //       return info;
  //     });
  //     setFiltersInfo(filterInfo);
  //   }
  //   setLoadedFilters(true);
  // }, [filters, loadedFilters]);

  // React.useEffect(() => {
  //   // TODO: Need to use Object for Array?
  //   // TODO: We do not need to recreate the filtersInfo object every time.
  //   // TODO: This runs twice due to state updates elsewhere?
  //   if (filtersInfo && loadedData && !loadedFilters) {
  //     setFiltersInfo(
  //       Object.values(filtersInfo).map(info => {

  //         return info;
  //       })
  //     );
  //   }
  //   setLoadedFilters(true);
  //   console.log('filters: ', filtersInfo);
  // }, [data, filtersInfo, loadedData, loadedFilters]);

  // React.useEffect(() => {
  // if (filters) {
  //   // Update the filter based on the types we receive.
  //   console.log('filter: ', filtered);
  //   let values: { [item: string]: number } = {};
  //   if (filtered) {
  //     filtered.forEach(v => {
  //       values[v] = (values[v] || 0) + 1;
  //     });
  //   }
  //   console.log('Count: ', values);
  // }
  // }, [data, filters, filtered]);

  React.useEffect(() => {
    // console.log('Got page change: ', page);
    // console.log('Current pageNum: ', query.page);
    // console.log('Page change: ', pageChange);

    // Set the page number if it was found in the parameters.
    if (!pageChange) {
      if (query.page) {
        setPage(query.page);
      } else {
        // TODO: Workaround for issue where page remains same on pagination on investigation/dataset.
        //       If this is not a page change and there is no page query parameter,
        //       then default the initial page (we treat this as the initial page load).
        setPage(1);
      }
    }

    // Ensure the max results change according to the query parameter.
    if (query.results) {
      if (totalDataCount > 10 && maxResults !== query.results) {
        setMaxResults(query.results);
      }
    } else {
      // TODO: Reset the max results back to the default value
      //       when switching between pages (this is the same issue as
      //       the pagination, page, holding the same value between
      //       investigation/dataset card views).
      setMaxResults(10);
    }
  }, [page, pageChange, query, maxResults, totalDataCount]);

  // TODO: Work-around for the pagination, start/stop index
  //       working incorrectly due to the totalDataCount being updated later on.
  React.useEffect(() => {
    setLoadedData(false);
  }, [totalDataCount]);

  React.useEffect(() => {
    // console.log('Total Data Count: ', totalDataCount);
    // console.log('Max results: ', maxResults);
    console.log('Fetch paginated: ', fetchPaginated);
    console.log('data: ', data);
    if (
      (fetchPaginated && totalDataCount > 0) ||
      (!fetchPaginated && data.length > 0)
    ) {
      if (!loadedData) {
        const totalCount = fetchPaginated ? totalDataCount : data.length;
        console.log('total count: ', totalCount);

        // Calculate the maximum pages needed for pagination.
        setNumPages(~~((totalCount + maxResults - 1) / maxResults));
        // console.log('Number of pages: ', numPages);

        // Calculate the start/end indexes for the data.
        const startIndex = page * maxResults - (maxResults - 1) - 1;
        // console.log('startIndex: ', startIndex);

        // End index not incremented for slice method.
        const stopIndex = Math.min(startIndex + maxResults, totalCount) - 1;
        // console.log('stopIndex: ', stopIndex);

        if (numPages !== -1 && startIndex !== -1 && stopIndex !== -1) {
          if (fetchPaginated && loadData) {
            // Clear data in the state before loading new data.
            clearData();
            console.log('cleared data');
            loadData({ startIndex, stopIndex });
          } else {
            setViewData(data.slice(startIndex, stopIndex + 1));
          }
          setLoadedData(true);
        }
      } else {
        // TODO: Gets called multiple times?
        if (filters) {
          // TODO: This might take a long time, we do not want to recreate the filtersInfo every time.
          //       Create once and then only just update the dataItems.
          setFiltersInfo(
            Object.values(filters).map(filter => {
              let info: CardViewFilter = {
                label: filter.label,
                // TODO: Do we need a dataKey for this now?
                // dataKey: filter.dataKey,
                dataItems: {},
                selected: false,
              };

              let filterValues = [];
              // TODO: filter values are always string.
              // TODO: filterable values can be passed in with the filter object.
              if (filter.filterItems) {
                filterValues = filter.filterItems;
              } else {
                // TODO: This toString will explicitly fail if the data does not is not found.
                filterValues = data.map(d => d[filter.dataKey].toString());
              }

              if (filterValues.length > 0) {
                filterValues.forEach(v => {
                  info.dataItems[v] = (info.dataItems[v] || 0) + 1;
                });
              }
              return info;
            })
          );
        }

        // Set the data once it has been loaded.
        if (fetchPaginated) {
          setViewData(data);
        }
      }
    }
  }, [
    data,
    maxResults,
    page,
    query,
    numPages,
    pageChange,
    loadData,
    loadedData,
    totalDataCount,
    clearData,
    filters,
    fetchPaginated,
  ]);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid container direction="row" justify="center">
        {/* Search bar */}
        <Grid item xs={10} style={{ paddingLeft: '700px' }}>
          <TextField
            style={{ width: '500px' }}
            label="Search Data"
            type="search"
            margin="normal"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Maximum results selection */}
        <Grid item xs style={{ paddingTop: '10px' }}>
          <FormControl className={classes.formControl}>
            <InputLabel id="select-max-results-label">Max Results</InputLabel>
            <Select
              labelId="select-max-results-label"
              id="select-max-results"
              value={maxResults}
              onChange={e => {
                setMaxResults(e.target.value as number);
                pushResults(e.target.value as number);
                setLoadedData(false);
              }}
              // Disable if the number of data is smaller than the
              // smallest amount of results to display (10).
              disabled={totalDataCount <= 10}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Filtering options */}
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={10}
        xs={12}
      >
        {/* TODO: Place filtering options in a box here. */}
        <Grid item xs={3}>
          {/* style={{ height: '100%', width: '100%' }} */}
          <Paper>
            <Grid
              item
              direction="column"
              justify="flex-start"
              alignItems="stretch"
            >
              <Box p={2}>
                <Typography variant="h5">Filter By</Typography>
              </Box>

              <Box>
                {filtersInfo &&
                  filtersInfo.map((filter, index) => {
                    return (
                      <ExpansionPanel key={index}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{filter.label}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                          <div style={{ maxWidth: 360, width: '100%' }}>
                            <List component="nav">
                              {Object.entries(filter.dataItems).map(
                                (item, index) => {
                                  return (
                                    <ListItem key={index} button>
                                      {/* TODO: The label chip could have its contents overflow (requires tooltip in future) */}
                                      <Chip label={item[0]} />
                                      <Chip
                                        style={{ marginLeft: '125px' }}
                                        label={item[1]}
                                        color="primary"
                                      />
                                    </ListItem>
                                  );
                                }
                              )}
                            </List>
                          </div>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    );
                  })}
              </Box>
            </Grid>
          </Paper>
        </Grid>

        {/* Card data */}
        {loadedData ? (
          <Grid item xs>
            <List>
              {/* TODO: The width of the card should take up more room when 
                        there is no further information or buttons. */}
              {viewData.map((data, index) => {
                return (
                  <ListItem
                    key={index}
                    alignItems="flex-start"
                    className={classes.root}
                  >
                    <EntityCard
                      title={{
                        // TODO: Is this the best way to handle label/dataKey?
                        label: data[title.dataKey],
                        content: title.content && title.content(data),
                      }}
                      description={description && data[description.dataKey]}
                      furtherInformation={
                        furtherInformation &&
                        furtherInformation
                          // Handle case when details dataKey is not present in data.
                          .filter(details => details.dataKey in data)
                          .map(details => ({
                            // TODO: Create a separate type just for details label?
                            //       We can say the label is the data key if not defined.
                            label: details.label
                              ? details.label
                              : details.dataKey,
                            content: details.content
                              ? details.content(data)
                              : data[details.dataKey],
                          }))
                      }
                      image={image}
                      // Pass in the react nodes with the data to the card.
                      buttons={buttons && buttons.map(button => button(data))}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Grid>
        ) : (
          <Grid item xs>
            <CircularProgress size={50} />
          </Grid>
        )}
      </Grid>

      {/* Pagination  */}
      {loadedData && (
        <Grid item xs style={{ padding: '50px' }}>
          <Pagination
            size="large"
            style={{ textAlign: 'center' }}
            count={numPages}
            page={page}
            onChange={(e, p) => {
              setPage(p);
              pushPage(p);
              setPageChange(true);
              setLoadedData(false);
            }}
            color="secondary"
          />
        </Grid>
      )}
    </Grid>
  );
};

const mapStateToProps = (state: StateType): CardViewStateProps => {
  return {
    query: state.dgcommon.query,
  };
};

// TODO: Should pushPage, pushResults, clearData be passed in or
//       present in the card view by default?
const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): CardViewDispatchProps => ({
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  clearData: () => dispatch(clearData()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CardView);
