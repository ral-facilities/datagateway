import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      maxWidth: 700,
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
    // TODO: Add in margins for spacing.
    main: {
      display: 'flex',
      // Have contents arranged in columns.
      flexDirection: 'column',

      // Give more space to this content.
      width: '200px',
    },

    further: {
      display: 'flex',
      flexDirection: 'column',
    },
  })
);

// TODO: Place Cards within a grid view.
//       Look at how datagateway-search separates search box with results.
const CardView: React.FC<{}> = (props: {}) => {
  const classes = useStyles();

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
            <Typography variant="subtitle1" color="textSecondary">
              Description
            </Typography>
          </div>
          <div>
            <Chip label="particle" />
          </div>
        </div>

        <div className={classes.further}>
          <div>Start Date:</div>
          <div>End Date:</div>
          <div>DOI:</div>
          <div>Visit ID:</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardView;
