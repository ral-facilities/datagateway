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
import DatagatewayLogoWithText from '../images/datagateway-logo.svg';
import ExploreImage from '../images/explore.jpg';
import DiscoverImage from '../images/discover.jpg';
import DownloadImage from '../images/download.jpg';
import { UKRITheme } from '../theming';
import { getAppStrings, getString } from '../state/strings';
import { connect } from 'react-redux';
import { StateType, AppStrings } from '../state/app.types';

const styles = (theme: Theme): StyleRules =>
  createStyles({
    bigImage: {
      backgroundImage: `url("${Image}")`,
      height: 350,
      width: '100%',
      '& img': {
        paddingLeft: 80,
        paddingTop: 100,
        height: 150,
      },
    },
    howItWorks: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingLeft: '10vw',
      paddingRight: '10vw',
      paddingTop: 30,
      backgroundColor: theme.palette.background.default,
    },
    howItWorksTitle: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
      paddingBottom: 30,
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
      height: 250,
      width: 250,
      borderRadius: 250 / 2,
      paddingBottom: 10,
    },
    howItWorksGridItemCaption: {
      textAlign: 'center',
      color: theme.palette.secondary.main,
    },
    strapline: {
      paddingTop: 50,
      fontStyle: 'italic',
      color: theme.palette.text.secondary,
    },
    purpose: {
      paddingTop: 20,
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: theme.palette.secondary.main,
    },
  });

interface HomePageProps {
  res: AppStrings | undefined;
}

export type CombinedHomePageProps = HomePageProps & WithStyles<typeof styles>;

const HomePage = (props: CombinedHomePageProps): React.ReactElement => (
  <div>
    <div className={props.classes.bigImage}>
      <img src={DatagatewayLogoWithText} alt={getString(props.res, 'title')} />
    </div>
    <div className={props.classes.howItWorks}>
      <Typography variant="h4" className={props.classes.howItWorksTitle}>
        {getString(props.res, 'how-label')}
      </Typography>

      <Grid container spacing={3}>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {getString(props.res, 'explore-label')}
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
            {getString(props.res, 'explore-description')}
          </Typography>
        </Grid>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {getString(props.res, 'discover-label')}
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
            {getString(props.res, 'discover-description')}
          </Typography>
        </Grid>
        <Grid item sm={12} md={4} className={props.classes.howItWorksGridItem}>
          <Typography
            variant="h5"
            className={props.classes.howItWorksGridItemTitle}
          >
            {getString(props.res, 'download-label')}
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
            {getString(props.res, 'download-description')}
          </Typography>
        </Grid>
      </Grid>
    </div>
  </div>
);

const mapStateToProps = (state: StateType): HomePageProps => ({
  res: getAppStrings(state, 'home-page'),
});

export const HomePageWithoutStyles = HomePage;
export const HomePageWithStyles = withStyles(styles)(HomePage);

export default connect(mapStateToProps)(HomePageWithStyles);
