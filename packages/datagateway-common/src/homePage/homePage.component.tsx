import React from 'react';
import Typography from '@mui/material/Typography';
import { Grid, Box, Paper, Button, Avatar, alpha, styled } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/GetApp';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export interface HomePageProps {
  logo: string;
  backgroundImage: string;
  greenSwirl1Image: string;
  greenSwirl2Image: string;
  decal1Image: string;
  decal2Image: string;
  decal2DarkImage: string;
  decal2DarkHCImage: string;
  facilityImage: string;
}

const backgroundTitleStyles = {
  color: '#FFFFFF',
  margin: 'auto',
  fontSize: '48px',
  fontWeight: 'lighter',
  textAlign: 'center',
};

const paperStyles = {
  borderRadius: '4px',
  marginBottom: 2,
  height: '100%',
};

const avatarStyles = {
  backgroundColor: '#1E5DF8',
  color: '#FFFFFF',
  width: '60px',
  height: '60px',
  marginBottom: 2,
};

const paperContentStyles = {
  padding: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  height: '100%',
  boxSizing: 'border-box',
};

const avatarIconStyles = {
  transform: 'scale(1.75)',
};

const PaperHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '24px',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: (theme as any).colours?.homePage?.heading,
  marginBottom: theme.spacing(2),
}));

const PaperDescription = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: (theme as any).colours?.contrastGrey,
  marginBottom: theme.spacing(2),
}));

const BluePaperHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '24px',
  color: '#FFFFFF',
  marginBottom: theme.spacing(2),
}));

const BluePaperDescription = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: (theme as any).colours?.homePage?.blueDescription,
  marginBottom: theme.spacing(2),
}));

interface BrowseDecalProps {
  decal2Image: string;
  decal2DarkImage: string;
  decal2DarkHCImage: string;
}

const BrowseDecal = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'decal2Image' &&
    prop !== 'decal2DarkImage' &&
    prop !== 'decal2DarkHCImage',
})<BrowseDecalProps>(
  ({ theme, decal2Image, decal2DarkImage, decal2DarkHCImage }) => ({
    backgroundImage:
      theme.palette.mode === 'light'
        ? `url(${decal2Image})`
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (theme as any).colours?.type === 'default'
        ? `url(${decal2DarkImage})`
        : `url(${decal2DarkHCImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    backgroundSize: 'auto 100%',
    height: '100%',
  })
);

const LightBlueButton = styled(Button)(({ theme }) => ({
  color: '#FFFFFF',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backgroundColor: (theme as any).colours?.homePage?.blueButton,
  '&:hover': {
    //Check if null to avoid error when loading
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    backgroundColor: (theme as any).colours?.homePage?.blueButton
      ? alpha(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (theme as any).colours?.homePage?.blueButton,
          0.8
        )
      : '#FFFFFF',
  },
}));

const HomePage = (props: HomePageProps): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <div id="dg-homepage">
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
            sx={{
              position: 'relative',
              left: '50%',
              top: '45px',
              transform: 'translate(-50%)',
            }}
          >
            <Typography variant="h2" sx={backgroundTitleStyles}>
              <Trans i18nKey="home_page.title_line1">
                <strong>Data discovery</strong> and <strong>access</strong>
              </Trans>
            </Typography>
            <Typography variant="h2" sx={backgroundTitleStyles}>
              <Trans i18nKey="home_page.title_line2">
                for <strong>large-scale</strong>
                science facilities
              </Trans>
            </Typography>
          </Box>
        </div>
      </div>
      <Box
        sx={{
          transform: 'translate(0px, -20px)',
          marginLeft: '8%',
          marginRight: '8%',
        }}
      >
        <Paper sx={paperStyles} elevation={1}>
          <Grid container style={{ height: '100%' }}>
            <Grid item xs={6}>
              <Box sx={paperContentStyles}>
                <Typography
                  variant="h3"
                  sx={(theme) => ({
                    fontWeight: 'bold',
                    fontSize: '32px',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: (theme as any).colours?.homePage?.heading,
                    marginBottom: theme.spacing(2),
                  })}
                >
                  {t('home_page.browse.title')}
                </Typography>
                <PaperDescription variant="body1">
                  {t('home_page.browse.description1')}
                </PaperDescription>
                <PaperDescription variant="body1">
                  <Trans i18nKey="home_page.browse.description2">
                    <strong>DataGateway</strong> focuses on providing data
                    discovery and data access functionality to the data.
                  </Trans>
                </PaperDescription>
                <Box marginTop="16px">
                  <Button
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={t('home_page.browse.link')}
                    data-testid="browse-button"
                  >
                    {t('home_page.browse.button')}
                  </Button>
                </Box>
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
                <BrowseDecal
                  decal2Image={props.decal2Image}
                  decal2DarkImage={props.decal2DarkImage}
                  decal2DarkHCImage={props.decal2DarkHCImage}
                />
              </div>
            </Grid>
          </Grid>
        </Paper>
        <Grid container spacing={2}>
          <Grid item sm={12} md={4}>
            <Paper sx={paperStyles} elevation={1}>
              <Box sx={paperContentStyles}>
                <Avatar sx={avatarStyles}>
                  <SearchIcon sx={avatarIconStyles} />
                </Avatar>
                <PaperHeading variant="h4">
                  {t('home_page.search.title')}
                </PaperHeading>
                <PaperDescription variant="body1">
                  {t('home_page.search.description')}
                </PaperDescription>
                <Box marginTop="auto">
                  <Button
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={t('home_page.search.link')}
                    data-testid="search-button"
                  >
                    {t('home_page.search.button')}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item sm={12} md={4}>
            <Paper sx={paperStyles} elevation={1}>
              <Box sx={paperContentStyles}>
                <Avatar sx={avatarStyles}>
                  <DownloadIcon sx={avatarIconStyles} />
                </Avatar>
                <PaperHeading variant="h4">
                  {t('home_page.download.title')}
                </PaperHeading>
                <PaperDescription variant="body1">
                  {t('home_page.download.description')}
                </PaperDescription>
                <Box marginTop="auto">
                  <Button
                    color="primary"
                    variant="contained"
                    component={Link}
                    to={t('home_page.download.link')}
                    data-testid="download-button"
                  >
                    {t('home_page.download.button')}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item sm={12} md={4}>
            <Paper
              sx={{ ...paperStyles, backgroundColor: '#003088' }}
              elevation={1}
            >
              <div
                style={{
                  backgroundImage: `url(${props.greenSwirl2Image})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'top right',
                  backgroundSize: 'auto 100%',
                  height: '100%',
                }}
              >
                <Box sx={paperContentStyles}>
                  <BluePaperHeading variant="h4">
                    {t('home_page.facility.title')}
                  </BluePaperHeading>
                  <BluePaperDescription variant="body1">
                    {t('home_page.facility.description')}
                  </BluePaperDescription>
                  <Box marginTop="auto">
                    <LightBlueButton
                      color="primary"
                      variant="contained"
                      href={t('home_page.facility.link')}
                      data-testid="facility-button"
                    >
                      {t('home_page.facility.button')}
                    </LightBlueButton>
                  </Box>
                </Box>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default HomePage;
