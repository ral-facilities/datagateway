import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Divider,
} from '@material-ui/core';

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
      paddingTop: '30px',
    },

    chip: {
      margin: theme.spacing(0.5),
    },
  })
);

// TODO: Place Cards within a grid view.
//       Look at how datagateway-search separates search box with results.
const EntityCard: React.FC<{}> = (props: {}) => {
  const classes = useCardStyles();

  return (
    <Card className={classes.root}>
      <CardMedia
        component="img"
        className={classes.cardImage}
        // TODO: Test image.
        image="https://www.iconbolt.com/iconsets/streamline-regular/lab-flask-experiment.svg"
        title="Investigation/Dataset image"
      />
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
            <Typography component="h5" variant="h5">
              Title
            </Typography>
            {/* TODO: Maybe include option to have read more if description is too long? 
                      Similar to collapsible 
            */}
            <Typography paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
              ullamcorper eu velit ut tincidunt.
            </Typography>
          </div>

          {/* TODO: Maybe this should be an array of tags? What would these tags be based on? */}
          <div className={classes.tags}>
            <Chip className={classes.chip} label="particle" size="small" />
            <Chip className={classes.chip} label="experiment" size="small" />
          </div>
        </div>

        <Divider orientation={'vertical'} />

        {/* TODO: Add in margins for spacing. */}
        <div className={classes.further}>
          <div style={{ float: 'left' }}>
            <Typography>Start Date:</Typography>
            <Typography>End Date:</Typography>
            <Typography>DOI:</Typography>
            <Typography>Visit ID:</Typography>
            <Typography>Dataset Count:</Typography>
          </div>
          <div
            style={{ float: 'right', textAlign: 'left', paddingLeft: '5px' }}
          >
            <Typography>12/01/2020</Typography>
            <Typography>24/04/2020</Typography>
            <Typography>12312412X</Typography>
            <Typography>23</Typography>
            <Typography>2</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
