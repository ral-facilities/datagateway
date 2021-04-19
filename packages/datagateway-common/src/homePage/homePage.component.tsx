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
import Image from '../images/Jasmin4 _DSC7054.jpg';
import DatagatewayLogoWithText from '../images/datagateway-logo-white.svg';
import ExploreImage from '../images/explore.jpg';
import DiscoverImage from '../images/discover.jpg';
import DownloadImage from '../images/download.jpg';
import { UKRITheme } from './theming';
import homePageContents from './contents';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    bigImage: {
      backgroundImage: `url("${Image}")`,
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
      color: (theme as UKRITheme).ukri.bright.orange,
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

export type HomePageProps = WithStyles<typeof styles>;

const HomePage = (props: HomePageProps): React.ReactElement => (
  <div>
    <div className={props.classes.bigImage}>
      <img src={DatagatewayLogoWithText} alt={homePageContents['title']} />
    </div>
    <div className={props.classes.howItWorks}>
      <Typography variant="h4" className={props.classes.howItWorksTitle}>
        {homePageContents['how-label']}
      </Typography>

      <Grid container spacing={3}>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {homePageContents['explore-label']}
          </Typography>
          <img
            src={ExploreImage}
            alt=""
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            {homePageContents['explore-description']}
          </Typography>
        </Grid>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {homePageContents['discover-label']}
          </Typography>
          <img
            src={DiscoverImage}
            alt=""
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            {homePageContents['discover-description']}
          </Typography>
        </Grid>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {homePageContents['download-label']}
          </Typography>
          <img
            src={DownloadImage}
            alt=""
            className={props.classes.howItWorksGridItemImage}
          />
          <Typography
            variant="body1"
            className={props.classes.howItWorksGridItemCaption}
          >
            {homePageContents['download-description']}
          </Typography>
        </Grid>
      </Grid>
    </div>
  </div>
);

export const HomePageWithoutStyles = HomePage;
export const HomePageWithStyles = withStyles(styles)(HomePage);

export default HomePageWithStyles;
