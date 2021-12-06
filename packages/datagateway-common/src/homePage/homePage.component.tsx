import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  withStyles,
  Theme,
  WithStyles,
  Grid,
  createStyles,
  Link,
  Box,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    backgroundImage: {
      height: 250,
      width: '100%',
      '& img': {
        paddingLeft: 90,
        paddingTop: 80,
        height: 150,
        float: 'left',
      },
    },
    backgroundTitle: {
      color: '#FFFFFF',
      margin: 'auto',
      fontSize: '48px',
      fontWeight: 'lighter',
      textAlign: 'center',
    },
    howItWorks: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // TODO: Remove use of "vw" here?
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.orange,
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
  exploreLink: string;
  discoverLabel: string;
  discoverDescription: string;
  discoverLink: string;
  downloadLabel: string;
  downloadDescription: string;
  downloadLink: string;
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
      <div className={props.classes.backgroundImage}>
        <div
          style={{
            backgroundImage: `url(${props.backgroundImage})`,
            backgroundPosition: 'center 40%',
            width: '100%',
            height: 250,
          }}
        >
          <Box style={{ paddingTop: '45px' }}>
            <Typography variant="h2" className={props.classes.backgroundTitle}>
              <Box fontWeight="bold" display="inline">
                Data discovery
              </Box>{' '}
              and{' '}
              <Box fontWeight="bold" display="inline">
                access
              </Box>{' '}
            </Typography>
            <Typography variant="h2" className={props.classes.backgroundTitle}>
              for{' '}
              <Box fontWeight="bold" display="inline">
                large-scale
              </Box>{' '}
              science facilities
            </Typography>
          </Box>
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
            <Link
              variant="h5"
              className={props.classes.howItWorksGridItemTitle}
              href={props.exploreLink}
            >
              {props.exploreLabel}
            </Link>
            <Link href={props.exploreLink}>
              <img
                src={props.exploreImage}
                alt={props.exploreLabel}
                className={props.classes.howItWorksGridItemImage}
              />
            </Link>
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
            <Link
              variant="h5"
              className={props.classes.howItWorksGridItemTitle}
              href={props.discoverLink}
            >
              {props.discoverLabel}
            </Link>
            <Link href={props.discoverLink}>
              <img
                src={props.discoverImage}
                alt={props.discoverLabel}
                className={props.classes.howItWorksGridItemImage}
              />
            </Link>
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
            <Link
              variant="h5"
              className={props.classes.howItWorksGridItemTitle}
              href={props.downloadLink}
            >
              {props.downloadLabel}
            </Link>
            <Link href={props.downloadLink}>
              <img
                src={props.downloadImage}
                alt={props.downloadLabel}
                className={props.classes.howItWorksGridItemImage}
              />
            </Link>
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
