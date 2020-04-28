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
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import {
  Entity,
  fetchInvestigations,
  fetchInvestigationCount,
  Investigation,
} from 'datagateway-common';
import { StateType } from 'datagateway-common/lib/state/app.types';
import { IndexRange } from 'react-virtualized';

import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
// import { push } from 'connected-react-router';

import EntityCard from './card.component';

// TODO: Should be in separate investigation card view.
// TODO: Will require sort/filters/cartItems?
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

interface CardViewProps {
  pageNum: number | null;
  setPageQuery: (pageKey: string, pageNum: string) => void;
}

interface CardViewStateProps {
  data: Entity[];

  // loading: boolean;
  // error: string | null;
  search: string;
}

interface CardViewDispatchProps {
  fetchData: (offsetParams?: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  // pushQuery: (newQuery: string) => void;
}

type CardViewCombinedProps = CardViewProps &
  CardViewStateProps &
  CardViewDispatchProps;

// TODO: CardView needs URL support:
//        - pagination (?page=)
//        - searching (?search=)
//        - sort (?sort=)
// TODO: Place Cards within a grid view.
//       Look at how datagateway-search separates search box with results.
const CardView = (props: CardViewCombinedProps): React.ReactElement => {
  // Props.
  const { pageNum, data, fetchData, setPageQuery } = props; // search, pushQuery
  const classes = useCardViewStyles();

  // Card data.
  const [fetchedData, setFetchedData] = React.useState(false);
  const [viewData, setViewData] = React.useState<Entity[]>([]);

  // Pagination.
  // TODO: Data needs to be fetched from the API page by page.
  const [maxResults, setMaxResults] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [numPages, setNumPages] = React.useState(-1);
  const [startIndex, setStartIndex] = React.useState(-1);
  const [endIndex, setEndIndex] = React.useState(-1);

  const [pageChange, setPageChange] = React.useState(false);

  React.useEffect(() => {
    // TODO: 1. allow for page to be changed via query parameter
    //       2. allow for page to be changed via the pagination component
    console.log('Got page change: ', page);
    console.log('Page change: ', pageChange);

    // Set the page num if it was found in the parameters.
    console.log('Is page change: ', pageChange);
    if (pageNum && !pageChange) setPage(pageNum);
    // TODO: The pageNum is always behind; is this an issue?
    console.log('Current pageNum: ', pageNum);
  }, [page, pageChange, pageNum]);

  React.useEffect(
    () => {
      // Fetch card data.
      console.log('Fetch data page: ', page);
      if (!fetchedData) {
        fetchData();
        setFetchedData(true);
      }

      // Calculate the maximum pages needed for pagination.
      setNumPages(~~((data.length + maxResults - 1) / maxResults));
      console.log('Number of pages: ', numPages);

      // Calculate the start/end indexes for the data.
      setStartIndex(page * maxResults - (maxResults - 1) - 1);
      console.log('Start index: ', startIndex);

      // End index not incremented for slice method.
      setEndIndex(Math.min(startIndex + maxResults, data.length));
      console.log('End index: ', endIndex);

      console.log('NumPages: ', numPages);
      console.log('Start: ', startIndex);
      console.log('End Index: ', endIndex);
      if (numPages !== -1 && startIndex !== -1 && endIndex !== -1) {
        console.log(data.slice(startIndex, endIndex));
        setViewData(data.slice(startIndex, endIndex));
      }
    },
    // TODO: Adding viewData dependency causes a loop?
    [
      data,
      maxResults,
      page,
      pageNum,
      numPages,
      startIndex,
      endIndex,
      fetchData,
      fetchedData,
      pageChange,
    ]
  );

  // const getURLQueryParams = (): URLSearchParams => new URLSearchParams(search);

  // TODO: We would need to customise the read the array of Entity objects as Investigation.
  return (
    <Grid container direction="column" alignItems="center">
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={10}
        xs={12}
      >
        {/* TODO: Place filtering options in a box here. */}
        <Grid item direction="column" justify="flex-start" xs={3}>
          <Box border={1} borderRadius="borderRadius">
            <div>Filtering options</div>
            <FormControl className={classes.formControl}>
              <InputLabel id="select-max-results-label">Max Results</InputLabel>
              <Select
                labelId="select-max-results-label"
                id="select-max-results"
                value={maxResults}
                onChange={e => setMaxResults(e.target.value as number)}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        {/* Card data */}
        <Grid item xs>
          <List>
            {(viewData as Investigation[]).map((investigation, index) => {
              return (
                <ListItem
                  key={index}
                  alignItems="flex-start"
                  className={classes.root}
                >
                  <EntityCard
                    title={investigation.TITLE}
                    summary={investigation.SUMMARY}
                    startDate={investigation.STARTDATE}
                    endDate={investigation.ENDDATE}
                    doi={investigation.DOI}
                    visitId={investigation.VISIT_ID}
                    // imageUrl="https://www.iconbolt.com/iconsets/streamline-regular/lab-flask-experiment.svg"
                  />
                </ListItem>
              );
            })}
          </List>
        </Grid>
      </Grid>

      {/* TODO: Page jumps up on every other page click on the pagination component. */}
      <Grid item xs>
        <Pagination
          size="large"
          style={{ textAlign: 'center' }}
          count={numPages}
          page={page}
          onChange={(e, p) => {
            setPage(p);

            // Add the query parameter for the changed view.
            // const currentParams = getURLQueryParams();
            // console.log('Current query: ' + currentParams.toString());
            // const num = p.toString();
            // if (currentParams.get('page')) {
            //   currentParams.set('page', num);
            // } else {
            //   currentParams.append('page', num);
            // }
            // console.log('Final query: ' + currentParams.toString());
            // pushQuery(`?${currentParams.toString()}`);
            setPageQuery('page', p.toString());

            setPageChange(true);
          }}
          color="secondary"
        />
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state: StateType): CardViewStateProps => {
  return {
    data: state.dgcommon.data,

    // loading: state.dgcommon.loading,
    // error: state.dgcommon.error,

    // TODO: Needs to be moved to a query handling component.
    search: state.router.location.search,
  };
};

// TODO: Should be in a investigation card view component.
const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): CardViewDispatchProps => ({
  fetchData: (offsetParams?: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),
  // pushQuery: (newQuery: string) => dispatch(push(newQuery)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CardView);
