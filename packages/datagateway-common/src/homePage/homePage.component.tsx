import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  withStyles,
  Theme,
  WithStyles,
  Grid,
  createStyles,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    bigImage: {
      height: 250,
      width: '100%',
      '& img': {
        paddingLeft: 90,
        paddingTop: 80,
        height: 150,
        float: 'left',
      },
    },
    howItWorks: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingLeft: '10vw',
      paddingRight: '10vw',
      paddingTop: 15,
      backgroundColor: theme.palette.background.default,
    },
    howItWorksTitle: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
      paddingBottom: 20,
    },
    howItWorksGridItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    howItWorksGridItemTitle: {
      color: '#FF6900',
      fontWeight: 'bold',
      paddingBottom: 10,
    },
    howItWorksGridItemImage: {
      height: 200,
      width: 200,
      borderRadius: 200 / 2,
      paddingBottom: 10,
    },
    howItWorksGridItemCaption: {
      textAlign: 'center',
      color: theme.palette.secondary.main,
    },
  });

export interface HomePageProps {
  title: string;
  howLabel: string;
  exploreLabel: string;
  exploreDescription: string;
  discoverLabel: string;
  discoverDescription: string;
  downloadLabel: string;
  downloadDescription: string;
  logo: string;
  backgroundImage: string;
  exploreImage: string;
  discoverImage: string;
  downloadImage: string;
}

type CombinedHomePageProps = HomePageProps & WithStyles<typeof styles>;

const HomePage = (props: CombinedHomePageProps): React.ReactElement => {
  return (
    <div id="dg-homepage">
      <div className={props.classes.bigImage}>
        <div
          style={{
            backgroundImage: `url(${props.backgroundImage})`,
            width: '100%',
            height: 250,
          }}
        >
          <img src={props.logo} alt={props.title} />
        </div>
      </div>
      <div className={props.classes.howItWorks}>
        <Typography variant="h4" className={props.classes.howItWorksTitle}>
          {props.howLabel}
        </Typography>

        <Grid container spacing={3}>
          <Grid
            item
            sm={12}
            md={4}
            className={props.classes.howItWorksGridItem}
          >
            <Typography
              variant="h5"
              className={props.classes.howItWorksGridItemTitle}
            >
              {props.exploreLabel}
            </Typography>
            <img
              src={props.exploreImage}
              alt=""
              className={props.classes.howItWorksGridItemImage}
            />
            <Typography
              variant="body1"
              className={props.classes.howItWorksGridItemCaption}
            >
              {props.exploreDescription}
            </Typography>
          </Grid>
          <Grid
            item
            sm={12}
            md={4}
            className={props.classes.howItWorksGridItem}
          >
            <Typography
              variant="h5"
              className={props.classes.howItWorksGridItemTitle}
            >
              {props.discoverLabel}
            </Typography>
            <img
              src={props.discoverImage}
              alt=""
              className={props.classes.howItWorksGridItemImage}
            />
            <Typography
              variant="body1"
              className={props.classes.howItWorksGridItemCaption}
            >
              {props.discoverDescription}
            </Typography>
          </Grid>
          <Grid
            item
            sm={12}
            md={4}
            className={props.classes.howItWorksGridItem}
          >
            <Typography
              variant="h5"
              className={props.classes.howItWorksGridItemTitle}
            >
              {props.downloadLabel}
            </Typography>
            <img
              src={props.downloadImage}
              alt=""
              className={props.classes.howItWorksGridItemImage}
            />
            <Typography
              variant="body1"
              className={props.classes.howItWorksGridItemCaption}
            >
              {props.downloadDescription}
            </Typography>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default withStyles(styles)(HomePage);
