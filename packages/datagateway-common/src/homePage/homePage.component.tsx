import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  withStyles,
  Theme,
  WithStyles,
  Grid,
  createStyles,
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
      height: '100%',
    },
    bluePaper: {
      borderRadius: '4px',
      marginBottom: theme.spacing(2),
      backgroundColor: '#003088',
      height: '100%',
    },
    paperHeading: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(2),
    },
    paperCaption: {
      textAlign: 'left',
      color: theme.palette.secondary.main,
      marginBottom: theme.spacing(2),
    },
    bluePaperHeading: {
      fontWeight: 'bold',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(2),
    },
    bluePaperCaption: {
      textAlign: 'left',
      color: theme.palette.secondary.main,
      marginBottom: theme.spacing(2),
    },
    paperContent: {
      padding: theme.spacing(2),
    },
    avatar: {
      backgroundColor: '#1E5DF8',
      color: '#FFFFFF',
      width: '60px',
      height: '60px',
    },
    avatarIcon: {
      transform: 'scale(1.75)',
    },
    buttonContainer: {
      display: 'flex',
    },
    button: {
      margin: theme.spacing(2),
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
  greenSwirl2Image: string;
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
              <div
                style={{
                  backgroundImage: `url(${props.greenSwirl2Image})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'top right',
                  backgroundSize: 'auto 100%',
                  height: '100%',
                }}
              >
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
                    World-leading centre for research giving unique insights
                    into the properties of materials on the atomic scale.
                  </Typography>
                  <Button color="primary" variant="contained">
                    Read more
                  </Button>
                </Box>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default withStyles(styles)(HomePage);
