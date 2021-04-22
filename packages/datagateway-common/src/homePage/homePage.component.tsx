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
import { HomepageContents } from '../app.types';

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

interface HomePageProps {
  res: HomepageContents | undefined;
}

export type CombinedHomePageProps = HomePageProps & WithStyles<typeof styles>;

class HomePage extends React.Component<CombinedHomePageProps> {
  getString = (key: string): string => {
    return this.props.res && this.props.res[key] ? this.props.res[key] : key;
  };

  render(): JSX.Element {
    return (
      <div id="dg-homepage">
        <div className={this.props.classes.bigImage}>
          <img src={DatagatewayLogoWithText} alt={this.getString('title')} />
        </div>
        <div className={this.props.classes.howItWorks}>
          <Typography
            variant="h4"
            className={this.props.classes.howItWorksTitle}
          >
            {this.getString('how-label')}
          </Typography>

          <Grid container spacing={3}>
            <Grid
              item
              sm={12}
              md={4}
              className={this.props.classes.howItWorksGridItem}
            >
              <Typography
                variant="h5"
                className={this.props.classes.howItWorksGridItemTitle}
              >
                {this.getString('explore-label')}
              </Typography>
              <img
                src={ExploreImage}
                alt=""
                className={this.props.classes.howItWorksGridItemImage}
              />
              <Typography
                variant="body1"
                className={this.props.classes.howItWorksGridItemCaption}
              >
                {this.getString('explore-description')}
              </Typography>
            </Grid>
            <Grid
              item
              sm={12}
              md={4}
              className={this.props.classes.howItWorksGridItem}
            >
              <Typography
                variant="h5"
                className={this.props.classes.howItWorksGridItemTitle}
              >
                {this.getString('discover-label')}
              </Typography>
              <img
                src={DiscoverImage}
                alt=""
                className={this.props.classes.howItWorksGridItemImage}
              />
              <Typography
                variant="body1"
                className={this.props.classes.howItWorksGridItemCaption}
              >
                {this.getString('discover-description')}
              </Typography>
            </Grid>
            <Grid
              item
              sm={12}
              md={4}
              className={this.props.classes.howItWorksGridItem}
            >
              <Typography
                variant="h5"
                className={this.props.classes.howItWorksGridItemTitle}
              >
                {this.getString('download-label')}
              </Typography>
              <img
                src={DownloadImage}
                alt=""
                className={this.props.classes.howItWorksGridItemImage}
              />
              <Typography
                variant="body1"
                className={this.props.classes.howItWorksGridItemCaption}
              >
                {this.getString('download-description')}
              </Typography>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(HomePage);
