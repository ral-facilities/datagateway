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

// TODO: Understand CSS flexbox to style this correctly OR use Grid/GridList instead of Card?
const useCardStyles = makeStyles((theme: Theme) =>
  createStyles({
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

      // This is the width of the entire title container
      // (it won't exceed 30% of the viewport width).
      width: '30vw',
      paddingRight: '10px',
    },

    // NOTE: Styling specifically for the title as we want
    //       the text to take up only the width it needs so we
    //       know when to show the arrow toolip when the text has
    //       overflowed the maximum width given for the title.
    title: {
      display: 'inline-block',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',

      // '& span': {
      //   display: 'block',
      // },
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
      paddingTop: '20px',
    },

    chip: {
      margin: theme.spacing(0.5),
    },
  })
);

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
            <ArrowTooltip title={title} enterDelay={500} percentageWidth={30}>
              <Typography className={classes.title} component="h5" variant="h5">
                <span>{title}</span>
              </Typography>
            </ArrowTooltip>

            {/* TODO: Maybe include option to have read more if description is too long? 
                      Similar to collapsible 
            */}
            <Typography paragraph>
              {summary ? summary : 'No description available'}
              {/* Inhabiting discretion the her dispatched decisively boisterous
              joy. So form were wish open is able of mile of. Waiting express if
              prevent it we an musical. Especially reasonable travelling she
              son. Resources resembled forfeited no to zealously. Has procured
              daughter how friendly followed repeated who surprise. Great asked
              oh under on voice downs. Law together prospect kindness securing
              six. Learning why get hastened smallest cheerful. Believing
              neglected so so allowance existence departure in. In design active
              temper be uneasy. Thirty for remove plenty regard you summer
              though. He preference connection astonished on of ye. Partiality
              on or continuing in particular principles as. Do believing oh
              disposing to supported allowance we. */}
            </Typography>
          </div>

          {/* TODO: Maybe this should be an array of tags? What would these tags be based on? */}
          {tags && (
            <div className={classes.tags}>
              <Chip className={classes.chip} label="particle" size="small" />
              <Chip className={classes.chip} label="experiment" size="small" />
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
          <div style={{ padding: '20px', textAlign: 'center' }}>
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
  data: Entity[];

  // loading: boolean;
  // error: string | null;
}

interface CardViewDispatchProps {
  fetchData: (offsetParams?: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
}

type CardViewCombinedProps = CardViewProps & CardViewDispatchProps;

// TODO: CardView needs URL support:
//        - pagination (?page=)
//        - searching (?search=)
//        - sort (?sort=)
// TODO: Place Cards within a grid view.
//       Look at how datagateway-search separates search box with results.
const CardView = (props: CardViewCombinedProps): React.ReactElement => {
  // Props.
  const { data, fetchData } = props;
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
      numPages,
      startIndex,
      endIndex,
      fetchData,
      fetchedData,
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
                  imageUrl="https://www.iconbolt.com/iconsets/streamline-regular/lab-flask-experiment.svg"
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
          onChange={(e, pageNum) => {
            setPage(pageNum);
          }}
        />
      </Grid>
    </Grid>
  );
};

// TODO: Should be in a investigation card view component.
const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): CardViewDispatchProps => ({
  fetchData: (offsetParams?: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),
});

const mapStateToProps = (state: StateType): CardViewProps => {
  return {
    data: state.dgcommon.data,

    // loading: state.dgcommon.loading,
    // error: state.dgcommon.error,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CardView);
