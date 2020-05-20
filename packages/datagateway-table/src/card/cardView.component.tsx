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

interface CardViewDetails {
  dataKey: string;

  // TODO: Pass in a label for the dataKey to be shown under.
  //       Pass a Link component to wrap the data.
  label?: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  link?: (data?: any) => React.ReactNode;
}

interface CardViewProps {
  data: Entity[];
  totalDataCount: number;
  loadData: (offsetParams: IndexRange) => Promise<void>;
  selectedCards: number[];
  onSelect: (selectedIds: number[]) => void;
  onDeselect: (selectedIds: number[]) => void;

  // Props to get title, description of the card
  // represented by data.
  title: CardViewDetails;
  description?: CardViewDetails;
  furtherInformation?: CardViewDetails[];
  image?: EntityImageDetails;
}

interface CardViewStateProps {
  // data: Entity[];
  // totalDataCount: number;
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

// TODO: CardView needs URL support:
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
    loadData,
    selectedCards,
    onSelect,
    onDeselect,
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

  const [pageChange, setPageChange] = React.useState(false);
  const [loadedData, setLoadedData] = React.useState(false);

  React.useEffect(() => {
    console.log('Got page change: ', page);
    console.log('Current pageNum: ', query.page);
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
    console.log('Total Data Count: ', totalDataCount);
    console.log('Max results: ', maxResults);
    if (totalDataCount > 0) {
      if (!loadedData) {
        // Calculate the maximum pages needed for pagination.
        setNumPages(~~((totalDataCount + maxResults - 1) / maxResults));
        console.log('Number of pages: ', numPages);

        // Calculate the start/end indexes for the data.
        const startIndex = page * maxResults - (maxResults - 1) - 1;
        console.log('startIndex: ', startIndex);

        // End index not incremented for slice method.
        const stopIndex = Math.min(startIndex + maxResults, totalDataCount) - 1;
        console.log('stopIndex: ', stopIndex);

        if (numPages !== -1 && startIndex !== -1 && stopIndex !== -1) {
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
    maxResults,
    page,
    query,
    numPages,
    pageChange,
    loadData,
    loadedData,
    totalDataCount,
    clearData,
  ]);

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
          </Box>
        </Grid>

        {/* Card data */}
        <Grid item xs>
          <List>
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
                      content: title.link && title.link(data),
                    }}
                    description={description && data[description.dataKey]}
                    furtherInformation={
                      furtherInformation &&
                      furtherInformation.map(details => ({
                        // TODO: Create a separate type just for details label?
                        //       We can say the label is the data key if not defined.
                        label: details.label ? details.label : details.dataKey,
                        data: data[details.dataKey],
                      }))
                    }
                    image={image}
                    selected={selectedCards.includes(data.ID)}
                    onSelect={() => {
                      onSelect([data.ID]);
                    }}
                    onDeselect={() => {
                      if (selectedCards.includes(data.ID))
                        onDeselect([data.ID]);
                    }}
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
            pushPage(p);
            setPageChange(true);
            setLoadedData(false);
          }}
          color="secondary"
        />
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state: StateType): CardViewStateProps => {
  return {
    // data: state.dgcommon.data,
    // totalDataCount: state.dgcommon.totalDataCount,
    query: state.dgcommon.query,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): CardViewDispatchProps => ({
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  clearData: () => dispatch(clearData()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CardView);
