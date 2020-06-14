import {
  Box,
  Chip,
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import { Pagination } from '@material-ui/lab';
import {
  clearData,
  Entity,
  nestedValue,
  pushPageFilter,
  pushPageNum,
  pushPageResults,
} from 'datagateway-common';
import { QueryParams, StateType } from 'datagateway-common/lib/state/app.types';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import EntityCard, { EntityImageDetails } from './card.component';

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
  filters?: { label: string; dataKey: string; filterItems: string[] }[];
  image?: EntityImageDetails;
}

interface CardViewStateProps {
  loading: boolean;
  query: QueryParams;
}

interface CardViewDispatchProps {
  pushPage: (page: number) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushFilters: (
    filter: string,
    data: string,
    selected: boolean
  ) => Promise<void>;
  clearData: () => Action;
}

type CardViewCombinedProps = CardViewProps &
  CardViewStateProps &
  CardViewDispatchProps;

interface CardViewFilter {
  label: string;
  filterKey: string;
  items: { data: string; selected: boolean }[];
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
    loading,
    pushPage,
    pushResults,
    pushFilters,
    clearData,
  } = props;

  // Get card information.
  const { title, description, furtherInformation, image } = props;

  // Card data.
  const [viewData, setViewData] = React.useState<Entity[]>([]);

  // Pagination.
  // TODO: This page is not reset when component is changed.
  const [page, setPage] = React.useState(-1);
  const [dataCount, setDataCount] = React.useState(-1);
  const [numPages, setNumPages] = React.useState(-1);
  const [maxResults, setMaxResults] = React.useState(-1);

  const [fetchPaginated, setFetchedPaginated] = React.useState(true);
  const [pageChange, setPageChange] = React.useState(false);
  const [loadedData, setLoadedData] = React.useState(false);

  // Set the filter information based on what was provided.
  const filtersInfo = React.useMemo(
    () =>
      filters &&
      Object.values(filters).map(filter => {
        // TODO: Type this into an interface?
        return {
          label: filter.label,
          filterKey: filter.dataKey,
          items: filter.filterItems.map(v => ({
            data: v,
            // Selected is based on the current query in the state.
            selected: query.filters
              ? filter.dataKey in query.filters
                ? v in query.filters[filter.dataKey]
                  ? query.filters[filter.dataKey][v]
                  : false
                : false
              : false,
          })),
        };
      }),
    [filters, query]
  );

  React.useEffect(() => {
    console.log('Page number (page): ', page);
    console.log('Current pageNum (query): ', query.page);
    console.log('Page change: ', pageChange);

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
      if (dataCount > 10 && maxResults !== query.results) {
        setMaxResults(query.results);
      }
    } else {
      // TODO: Reset the max results back to the default value
      //       when switching between pages (this is the same issue as
      //       the pagination, page, holding the same value between
      //       investigation/dataset card views).
      setMaxResults(10);
    }
  }, [page, pageChange, query, maxResults, dataCount]);

  // TODO: Work-around for the pagination, start/stop index
  //       working incorrectly due to the totalDataCount being updated later on
  //       (to the new value for the new view).
  React.useEffect(() => {
    // Get when the pagination fetch is disabled.
    if (paginatedFetch === false) {
      setFetchedPaginated(false);
    }

    // Handle count and reloading of data based on pagination options.
    if (fetchPaginated) {
      if (totalDataCount > 0 && totalDataCount !== dataCount) {
        setDataCount(totalDataCount);
        setLoadedData(false);
      }
    } else {
      if (data.length > 0 && data.length !== dataCount) {
        setDataCount(data.length);
      }
      // Reload data if we are not fetching via pagination
      // as data can be changed at any time as it only passed in.
      setLoadedData(false);
    }
  }, [paginatedFetch, fetchPaginated, totalDataCount, dataCount, data]);

  // TODO: If fetchPaginated is false, data will only be set to view data once.
  React.useEffect(() => {
    if (!loading && dataCount > 0) {
      if (!loadedData) {
        // Calculate the maximum pages needed for pagination.
        setNumPages(~~((dataCount + maxResults - 1) / maxResults));
        // console.log('Number of pages: ', numPages);

        // Calculate the start/end indexes for the data.
        const startIndex = page * maxResults - (maxResults - 1) - 1;
        // console.log('startIndex: ', startIndex);

        // End index not incremented for slice method.
        const stopIndex = Math.min(startIndex + maxResults, dataCount) - 1;
        // console.log('stopIndex: ', stopIndex);

        if (numPages !== -1 && startIndex !== -1 && stopIndex !== -1) {
          if (fetchPaginated && loadData) {
            // Clear data in the state before loading new data.
            clearData();
            loadData({ startIndex, stopIndex });
          } else {
            setViewData(data.slice(startIndex, stopIndex + 1));
          }
          setLoadedData(true);
        }
      } else {
        // Set the data once it has been loaded.
        if (fetchPaginated) {
          setViewData(data);
        }
      }
    }
  }, [
    data,
    dataCount,
    maxResults,
    page,
    numPages,
    loadData,
    loadedData,
    clearData,
    filters,
    fetchPaginated,
    loading,
  ]);

  return (
    <Grid container direction="column" alignItems="center">
      <Grid container direction="row" justify="center">
        {/* TODO: Search bar */}
        {/* TODO: Provide dropdown additional filters */}
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
              disabled={dataCount <= 10}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={10}
        xs={12}
      >
        {/* Filtering options */}
        <Grid item xs={3}>
          {filters && (
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

                {/* Show the specific options available to filter by */}
                <Box>
                  {filtersInfo &&
                    filtersInfo.map((filter, filterIndex) => {
                      return (
                        <ExpansionPanel key={filterIndex}>
                          <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon />}
                          >
                            <Typography>{filter.label}</Typography>
                          </ExpansionPanelSummary>
                          <ExpansionPanelDetails>
                            <div style={{ maxWidth: 360, width: '100%' }}>
                              <List component="nav">
                                {filter.items.map((item, valueIndex) => (
                                  <ListItem
                                    key={valueIndex}
                                    button
                                    // TODO: Add selected to each individual item.
                                    disabled={item.selected}
                                    onClick={() => {
                                      console.log(
                                        'Got click of filter option: ',
                                        item.data
                                      );
                                      pushFilters(
                                        filter.filterKey,
                                        item.data,
                                        true
                                      );
                                    }}
                                  >
                                    {/* TODO: The label chip could have its contents overflow
                                            (requires tooltip in future)  */}
                                    <Chip label={item.data} />
                                  </ListItem>
                                ))}
                              </List>
                            </div>
                          </ExpansionPanelDetails>
                        </ExpansionPanel>
                      );
                    })}
                </Box>
              </Grid>
            </Paper>
          )}
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
                    {/* Create an individual card */}
                    <EntityCard
                      title={{
                        // TODO: Is this the best way to handle label/dataKey?
                        label: nestedValue(data, title.dataKey),
                        content: title.content && title.content(data),
                      }}
                      description={
                        description && nestedValue(data, description.dataKey)
                      }
                      furtherInformation={
                        furtherInformation &&
                        furtherInformation
                          .map(details => ({
                            // TODO: Create a separate type just for details label?
                            //       We can say the data key is the label if not defined.
                            label: details.label
                              ? details.label
                              : details.dataKey,
                            content: details.content
                              ? details.content(data)
                              : nestedValue(data, details.dataKey),
                          }))
                          // Filter afterwards to only show content with information.
                          .filter(v => v.content)
                      }
                      image={image}
                      // Pass in the react nodes with the data to the card.
                      buttons={buttons && buttons.map(button => button(data))}
                      // Pass tag names to the card given the specified data key for the filter.
                      tags={
                        filters &&
                        filters.map(f => nestedValue(data, f.dataKey))
                      }
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
            color="secondary"
            style={{ textAlign: 'center' }}
            count={numPages}
            page={page}
            onChange={(e, p) => {
              if (p !== page) {
                setPage(p);
                pushPage(p);
                setPageChange(true);
                setLoadedData(false);
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

const mapStateToProps = (state: StateType): CardViewStateProps => {
  return {
    loading: state.dgcommon.loading,
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
  pushFilters: (filter: string, data: string, selected: boolean) =>
    dispatch(pushPageFilter(filter, data, selected)),
  clearData: () => dispatch(clearData()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CardView);
