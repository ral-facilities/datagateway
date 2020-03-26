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
// import useAfterMountEffect from '../utils';

// TODO: Understand CSS flexbox to style this correctly OR use Grid/GridList instead of Card?
const useCardStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      maxWidth: 800,
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

      // Give more space to main information.
      width: 400,
      paddingRight: '10px',
    },

    further: {
      display: 'flex',
      paddingLeft: '10px',

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
            <Typography component="h5" variant="h5">
              {title}
            </Typography>
            {/* TODO: Maybe include option to have read more if description is too long? 
                      Similar to collapsible 
            */}
            <Typography paragraph>
              {summary ? summary : 'No description available'}
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
        <div className={classes.further}>
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
  // const maxItems = 10;
  const [page, setPage] = React.useState(1);

  // props
  const { data, fetchData } = props;
  const classes = useCardViewStyles();

  const [fetchedData, setFetchedData] = React.useState(false);
  // const [viewData, setViewData] = React.useState<Investigation[]>([]);

  console.log(data);

  // TODO: Why is function not working in this component?
  //       This function will not get called on the first render/mount of a component intentionally.
  // useAfterMountEffect(() => {
  //    TODO: fetch the data.
  //    fetchData();
  // });

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    pageNum: number
  ): void => {
    setPage(pageNum);
  };

  React.useEffect(() => {
    if (!fetchedData) fetchData();
    setFetchedData(true);

    // setViewData(data.slice())
  }, [data, fetchData, fetchedData, setFetchedData]);

  // TODO: We would need to customise the read the array of Entity objects as Investigation.
  return (
    <Grid container direction="column">
      <Grid item xs>
        {page}
      </Grid>

      {/* TODO: Pagination component */}
      <Grid item xs>
        <Pagination count={10} page={page} onChange={handlePageChange} />
      </Grid>

      <Grid item xs>
        <List>
          {(data as Investigation[]).map((investigation, index) => {
            return (
              // <GridListTile key={index} className={classes.root}>
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
                />
              </ListItem>
              // </GridListTile>
            );
          })}
        </List>
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
