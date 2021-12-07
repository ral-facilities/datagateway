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
  Paper,
  Button,
  Avatar,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import DownloadIcon from '@material-ui/icons/GetApp';

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
    contentBox: {
      transform: 'translate(0px, -20px)',
      marginLeft: '10%',
      marginRight: '10%',
    },
    paper: {
      borderRadius: '4px',
      marginBottom: theme.spacing(2),
    },
    bluePaper: {
      borderRadius: '4px',
      marginBottom: theme.spacing(2),
      backgroundColor: '#003088',
    },
    paperHeading: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
    },
    paperCaption: {
      textAlign: 'left',
      color: theme.palette.secondary.main,
    },
    bluePaperHeading: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
    },
    bluePaperCaption: {
      textAlign: 'left',
      color: theme.palette.secondary.main,
    },
    paperContent: {
      padding: theme.spacing(2),
    },
    avatar: {
      backgroundColor: '#1E5DF8',
      color: '#FFFFFF',
      width: '70px',
      height: '70px',
    },
    avatarIcon: {
      transform: 'scale(1.75)',
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
  greenSwirl1Image: string;
  decal1Image: string;
  decal2Image: string;
  facilityImage: string;
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
          <div
            style={{
              backgroundImage: `url(${props.greenSwirl1Image}), url(${props.decal1Image})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top left, top right',
              width: '100%',
              height: 250,
            }}
          >
            <Box
              style={{
                position: 'relative',
                left: '50%',
                top: '45px',
                transform: 'translate(-50%)',
              }}
            >
              <Typography
                variant="h2"
                className={props.classes.backgroundTitle}
              >
                <Box fontWeight="bold" display="inline">
                  Data discovery
                </Box>{' '}
                and{' '}
                <Box fontWeight="bold" display="inline">
                  access
                </Box>{' '}
              </Typography>
              <Typography
                variant="h2"
                className={props.classes.backgroundTitle}
              >
                for{' '}
                <Box fontWeight="bold" display="inline">
                  large-scale
                </Box>{' '}
                science facilities
              </Typography>
            </Box>
          </div>
        </div>
      </div>
      <Box className={props.classes.contentBox}>
        <Paper className={props.classes.paper} elevation={1}>
          <Grid container style={{ height: '100%' }}>
            <Grid item xs={6}>
              <Box className={props.classes.paperContent}>
                <Typography variant="h4" className={props.classes.paperHeading}>
                  Browse, explore and visualise experimental data
                </Typography>
                <Typography
                  variant="body1"
                  className={props.classes.paperCaption}
                >
                  Large scale facilities, such as synchrotrons, neutron and muon
                  sources, lasers and accelerators, generate vast amounts of
                  data that need to be managed in an efficient way, supporting
                  data ingestion for long-term storage and archival, as well as
                  data analysis and data publication workflows.
                </Typography>
                <Typography
                  variant="body1"
                  className={props.classes.paperCaption}
                >
                  DataGateway focuses on providing data discovery and data
                  access functionality to the data.
                </Typography>
                <Button color="primary" variant="contained">
                  Browse data
                </Button>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <div
                style={{
                  backgroundImage: `url(${props.facilityImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'bottom right',
                  backgroundSize: 'cover',
                  width: '100%',
                  height: '100%',
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    backgroundImage: `url(${props.decal2Image})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'top left',
                    backgroundSize: 'auto 100%',
                    height: '100%',
                  }}
                ></div>
              </div>
            </Grid>
          </Grid>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper className={props.classes.paper} elevation={1}>
              <Box className={props.classes.paperContent}>
                <Avatar className={props.classes.avatar}>
                  <SearchIcon className={props.classes.avatarIcon} />
                </Avatar>
                <Typography variant="h4" className={props.classes.paperHeading}>
                  Discover
                </Typography>
                <Typography
                  variant="body1"
                  className={props.classes.paperCaption}
                >
                  Search for the experimental data according to different
                  criteria.
                </Typography>
                <Button color="primary" variant="contained">
                  Search data
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper className={props.classes.paper} elevation={1}>
              <Box className={props.classes.paperContent}>
                <Avatar className={props.classes.avatar}>
                  <DownloadIcon className={props.classes.avatarIcon} />
                </Avatar>
                <Typography variant="h4" className={props.classes.paperHeading}>
                  Download
                </Typography>
                <Typography
                  variant="body1"
                  className={props.classes.paperCaption}
                >
                  Retrieve the experimental data using a variety of download
                  methods.
                </Typography>
                <Button color="primary" variant="contained">
                  Download data
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper className={props.classes.bluePaper} elevation={1}>
              <Box className={props.classes.paperContent}>
                <Typography
                  variant="h4"
                  className={props.classes.bluePaperHeading}
                >
                  ISIS Neutron and Muon Source
                </Typography>
                <Typography
                  variant="body1"
                  className={props.classes.bluePaperCaption}
                >
                  World-leading centre for research giving unique insights into
                  the properties of materials on the atomic scale.
                </Typography>
                <Button color="primary" variant="contained">
                  Read more
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

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
