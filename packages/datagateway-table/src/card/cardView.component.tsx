import React from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse,
  Link,
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import {
  Entity,
  fetchInvestigations,
  fetchInvestigationCount,
  Investigation,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from 'datagateway-common/lib/state/app.types';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import ArrowTooltip from '../page/arrowtooltip.component';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';
// import useAfterMountEffect from '../utils';
import { push } from 'connected-react-router';

// TODO: Understand CSS flexbox to style this correctly OR use Grid/GridList instead of Card?
const useCardStyles = makeStyles((theme: Theme) => {
  // NOTE: This is width of the main content
  //       (this also matches the description shadow width).
  const mainWidth = '35vw';

  const styles = createStyles({
    root: {
      display: 'flex',
      maxWidth: 1000,
      backgroundColor: theme.palette.background.paper,
    },

    // TODO: Automatically size to card size?
    cardImage: {
      width: 150,
      height: 150,
    },

    content: {
      display: 'flex',
      flexDirection: 'row',
    },

    main: {
      display: 'flex',
      // Have contents arranged in columns.
      flexDirection: 'column',

      // NOTE: You will also have to change the
      // This is the width of the entire container
      // (so title won't exceed 30% of the viewport width).
      width: mainWidth,
      paddingRight: '10px',
    },

    // NOTE: Styling specifically for the title as we want
    //       the text to take up only the width it needs so we
    //       know when to show the arrow toolip when the text has
    //       overflowed the maximum width given for the title.
    title: {
      display: 'inline-block',
      // whiteSpace: 'nowrap',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    description: {
      '& a': {
        cursor: 'pointer',
      },
    },

    shadowVisible: {
      position: 'absolute',
      height: 25,
      width: mainWidth,
      top: 130,
      background: 'linear-gradient(rgba(255, 255, 255, 0), #fff)',

      // Transition showing the shadow.
      visibility: 'visible',
      opacity: 1,
      transition: 'visibility 0s, opacity 0.5s linear',
    },

    shadowInvisible: {
      visibility: 'hidden',
      opacity: 0,
      transition: 'visibility 0s, opacity 0.5s linear',
    },

    further: {
      display: 'flex',
      paddingLeft: '15px',

      // Apply a small space for each Typography component (p).
      '& p': {
        paddingTop: '5px',
      },
    },

    tags: {
      paddingTop: '10px',
    },

    chip: {
      margin: theme.spacing(0.5),
    },
  });
  return styles;
});

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

interface EntityCardProps {
  title: string;
  summary?: string;
  startDate?: string;
  endDate?: string;

  doi?: string;
  visitId: string;
  datasetCount?: number;

  // TODO: optional and no information to create these
  imageUrl?: string;
  tags?: typeof Chip[];
}

const EntityCard = (props: EntityCardProps): React.ReactElement => {
  const classes = useCardStyles();
  const {
    title,
    summary,
    startDate,
    endDate,
    doi,
    visitId,
    datasetCount,

    imageUrl,
    tags,
  } = props;

  const [isSelected, setIsSelected] = React.useState(false);

  // The default collapsed height for card description is 100px.
  const defaultCollapsedHeight = 100;
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const descriptionRef = React.useRef<HTMLParagraphElement>(null);
  const [collapsibleInteraction, setCollapsibleInteraction] = React.useState(
    false
  );

  React.useEffect(() => {
    if (descriptionRef && descriptionRef.current) {
      // console.log('Description height: ', descriptionRef.current.clientHeight);
      if (descriptionRef.current.clientHeight > defaultCollapsedHeight)
        setCollapsibleInteraction(true);
    }
  }, [setCollapsibleInteraction]);

  return (
    <Card className={classes.root}>
      {imageUrl && (
        <CardMedia
          component="img"
          className={classes.cardImage}
          // TODO: Test image.
          // image="https://www.iconbolt.com/iconsets/streamline-regular/lab-flask-experiment.svg"
          image={imageUrl}
          title="Investigation/Dataset image"
        />
      )}
      {/* TODO: Card content needs to be a flexbox (as a row):
              - has a card information area (split in horizontally - column) for title/description and tags
              - has card details area which takes up smaller space */}
      <CardContent className={classes.content}>
        {/* row:
              - main information
              - further information; dates, DOI, visit id
               */}
        <div className={classes.main}>
          {/*column:
              - title/description
              - tags  */}
          <div>
            {/* TODO: Title needs to be cut off if it breaks the set width of the column
                  Show it in a tooltip as well */}
            {/* TODO: The title needs to link to the next entity (investigation/dataset) - or have it as the whole card? */}
            {/* TODO: Delay not consistent between cards? */}
            {/* TODO: Any calculations of width/height (offset) done by the arrow
              toolip begins with with the first wrapping element in the tooltip.
              This is the Typography component in our case. */}
            <ArrowTooltip
              title={title}
              enterDelay={500}
              // TODO: Move to different component.
              // disableFocusListener={isCollapsed}
              percentageWidth={30}
              maxEnabledHeight={32}
            >
              <Typography className={classes.title} component="h5" variant="h5">
                <span style={{ whiteSpace: isCollapsed ? 'normal' : 'nowrap' }}>
                  {title}
                </span>
              </Typography>
            </ArrowTooltip>

            {/* TODO: Maybe include option to have read more if description is too long? 
                      Similar to collapsible 
            */}
            <div className={classes.description}>
              {/* TODO: collapsedHeight being the minimum description content to
              show for each card. */}
              <Collapse
                in={isCollapsed}
                collapsedHeight={defaultCollapsedHeight}
              >
                <Typography ref={descriptionRef} variant="body1" paragraph>
                  {summary ? summary : 'No description available'}
                  {/* Inhabiting discretion the her dispatched decisively boisterous
                  joy. So form were wish open is able of mile of. Waiting
                  express if prevent it we an musical. Especially reasonable
                  travelling she son. Resources resembled forfeited no to
                  zealously. Has procured daughter how friendly followed
                  repeated who surprise. Great asked oh under on voice downs.
                  Preference connection astonished on of ye. Partiality on or
                  continuing in particular principles as. Do believing oh
                  disposing to supported allowance we. */}
                </Typography>
              </Collapse>

              {collapsibleInteraction && (
                <div>
                  <div
                    className={
                      isCollapsed
                        ? classes.shadowInvisible
                        : classes.shadowVisible
                    }
                  />
                  <Link onClick={() => setIsCollapsed(prev => !prev)}>
                    {isCollapsed ? 'Show less' : 'Show more'}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {tags && (
            <div className={classes.tags}>
              <Divider />

              {/* TODO: Maybe this should be an array of tags? What would these tags be based on? */}
              <div style={{ paddingTop: '10px' }}>
                <Chip className={classes.chip} label="particle" size="small" />
                <Chip
                  className={classes.chip}
                  label="experiment"
                  size="small"
                />
              </div>
            </div>
          )}
        </div>

        <Divider orientation={'vertical'} />

        {/* TODO: Add in margins for spacing. */}
        {/* TODO: These should be specified elsewhere */}
        <div>
          <div className={classes.further}>
            {/* TODO: Further information related to the entity. */}
            <div style={{ float: 'left' }}>
              <Typography>Start Date:</Typography>
              <Typography>End Date:</Typography>
              <Typography>DOI:</Typography>
              <Typography>Visit ID:</Typography>

              {datasetCount && <Typography>Dataset Count:</Typography>}
            </div>
            <div
              style={{ float: 'right', textAlign: 'left', paddingLeft: '5px' }}
            >
              <Typography>{startDate}</Typography>
              <Typography>{endDate}</Typography>
              <Typography>{doi}</Typography>
              <Typography>{visitId}</Typography>
              {datasetCount && <Typography>{datasetCount}</Typography>}
            </div>
          </div>

          {/* TODO: Add to cart button - requires API logic */}
          <div style={{ paddingTop: '15px', textAlign: 'center' }}>
            {!isSelected ? (
              <Button
                id="add-to-cart-btn"
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineOutlined />}
                disableElevation
                onClick={() => setIsSelected(true)}
              >
                Add to cart
              </Button>
            ) : (
              <Button
                id="remove-from-cart-btn"
                variant="contained"
                color="secondary"
                startIcon={<RemoveCircleOutlineOutlined />}
                disableElevation
                onClick={() => setIsSelected(false)}
              >
                Remove from cart
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// TODO: Should be in separate investigation card view.
// TODO: Will require sort/filters/cartItems?

interface CardViewProps {
  pageNum: number | null;
}

interface CardViewStateProps {
  data: Entity[];

  // loading: boolean;
  // error: string | null;
}

interface CardViewDispatchProps {
  fetchData: (offsetParams?: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  pushQuery: (newQuery: string) => void;
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
  const { pageNum, data, fetchData, pushQuery } = props;
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
  // const [loadedResults, setLoadedResults] = React.useState(false);

  React.useEffect(() => {
    // TODO: 1. allow for page to be changed via query parameter
    //       2. allow for page to be changed via the pagination component
    console.log('Got page change: ', page);
    console.log('Page change: ', pageChange);

    // Set the page num if it was found in the parameters.
    if (pageNum && !pageChange) setPage(pageNum);
    // TODO: The pageNum is always behind; is this an issue?
    console.log('Current pageNum: ', pageNum);
  }, [page, pageChange, pageNum]);

  React.useEffect(
    () => {
      // Fetch card data.
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
        // setLoadedResults(true);
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

  // TODO: We would need to customise the read the array of Entity objects as Investigation.
  return (
    <Grid container direction="column">
      <Grid item xs>
        <FormControl className={classes.formControl}>
          <InputLabel id="select-max-results-label">Max Results</InputLabel>
          <Select
            labelId="select-max-results-label"
            id="select-max-results"
            value={maxResults}
            onChange={e => {
              setMaxResults(e.target.value as number);
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={30}>30</MenuItem>
          </Select>
        </FormControl>
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

      {/* TODO: Page jumps up on every other page click on the pagination component. */}
      <Grid item xs>
        <Pagination
          count={numPages}
          page={page}
          onChange={(e, p) => {
            setPage(p);
            setPageChange(true);
            pushQuery(`?page=${p}`);
          }}
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
  };
};

// TODO: Should be in a investigation card view component.
const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): CardViewDispatchProps => ({
  fetchData: (offsetParams?: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),
  pushQuery: (newQuery: string) => dispatch(push(newQuery)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CardView);
