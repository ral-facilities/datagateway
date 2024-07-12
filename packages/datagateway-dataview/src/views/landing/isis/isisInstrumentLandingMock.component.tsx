import {
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  styled,
  Typography,
} from '@mui/material';
import {
  CalendarToday,
  Public,
  Science,
  Link as LinkIcon,
} from '@mui/icons-material';
import { ArrowTooltip, getTooltipText, User } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Branding from './isisBranding.component';
import CitationFormatter from '../../citationFormatter.component';
import InstrumentImage from './17-11-049 GEM detectors (1).jpg';
import { StateType } from '../../../state/app.types';
import { useSelector } from 'react-redux';

const Subheading = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const ShortInfoRow = styled('div')(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  justifyContent: 'space-between',
}));

const StyledDOILink = styled('a')({
  display: 'inline-flex',
  backgroundColor: '#000',
  color: '#fff',
  textDecoration: 'none',
  paddingLeft: '5px',
  borderRadius: '5px',
  overflow: 'hidden',
});

const StyledDOISpan = styled('span')({
  backgroundColor: '#09c',
  padding: '0 5px',
  marginLeft: '5px',
  '&:hover': {
    backgroundColor: '#006a8d',
  },
});

export const StyledDOI: React.FC<{ doi: string }> = ({ doi }) => (
  <StyledDOILink
    href={`https://doi.org/${doi}`}
    data-testid="landing-dataPublication-pid-link"
  >
    DOI <StyledDOISpan>{doi}</StyledDOISpan>
  </StyledDOILink>
);

const shortInfoIconStyle = { mx: 1 };

const ShortInfoLabel = styled(Typography)({
  display: 'flex',
});

const ShortInfoValue = styled(Typography)({
  textAlign: 'right',
});

export interface FormattedUser {
  fullName: string;
}

const LandingPage = (): React.ReactElement => {
  const [t] = useTranslation();
  const pluginHost = useSelector(
    (state: StateType) => state.dgdataview.pluginHost
  );

  const pid = '10.17596/w76y-4s92';
  const title = 'GEM';
  const description =
    'The General Materials Diffractometer (GEM) is used for high intensity, high resolution neutron diffraction and pair distribution function experiments to study the structure of crystalline powders and amorphous materials.';
  const date = '2003-12-01';
  const url = 'https://www.isis.stfc.ac.uk/Pages/Gem.aspx';
  const users: User[] = React.useMemo(
    () => [
      {
        createId: 'Initial Upload Script',
        id: 4947,
        createTime: '2007-10-09 09:08:29+01:00',
        modTime: '2024-04-30 04:20:07.408000+01:00',
        name: 'uows/484',
        familyName: 'Keen',
        modId: 'db/user-sync',
        givenName: 'David',
        fullName: 'Professor David Keen',
      },
      {
        createId: 'Initial Upload Script',
        id: 5912,
        createTime: '2007-10-09 09:08:29+01:00',
        modTime: '2023-05-31 12:21:54.529000+01:00',
        name: 'uows/365',
        familyName: 'Hannon',
        modId: 'simple/isis-icat-ingestion',
        givenName: 'Alex',
        fullName: 'Dr Alex Hannon',
      },
      {
        createId: 'uows/13574',
        id: 42938438,
        createTime: '2013-11-13 13:16:15.024000+00:00',
        modTime: '2023-05-16 18:07:54.411000+01:00',
        name: 'uows/1049018',
        familyName: 'da Silva Gonzalez',
        modId: 'simple/isis-icat-ingestion',
        givenName: 'Ivan',
        fullName: 'Dr Ivan da Silva Gonzalez',
      },
    ],
    []
  );

  const technique = 'Crystallography Diffractometer';

  const formattedUsers = React.useMemo(() => {
    const experimenters: FormattedUser[] = [];

    users.forEach((user) => {
      // Only keep users where we have their fullName
      const fullname = user.fullName;
      if (fullname) {
        experimenters.push({
          fullName: fullname,
        });
      }
    });

    // Ensure PIs are listed first, and sort within roles for consistency

    experimenters.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return experimenters;
  }, [users]);

  const shortInfo = [
    {
      content: () => <StyledDOI doi={pid} />,
      label: t('datapublications.pid'),
      icon: <Public sx={shortInfoIconStyle} />,
    },
    {
      content: function link() {
        return <MuiLink href={url}>{url}</MuiLink>;
      },
      label: 'Website',
      icon: <LinkIcon sx={shortInfoIconStyle} />,
    },
    {
      content: () => technique,
      label: 'Technique',
      icon: <Science sx={shortInfoIconStyle} />,
    },
    {
      content: () => date,
      label: 'Start Date',
      icon: <CalendarToday sx={shortInfoIconStyle} />,
    },
  ];

  return (
    <Paper
      sx={{ margin: 1, padding: 1 }}
      data-testid="isis-dataPublication-landing"
    >
      <Grid container sx={{ padding: 0.5 }}>
        <Grid item xs={12}>
          <Branding />
        </Grid>
        <Grid
          sx={{ pt: 2 }}
          item
          container
          xs={12}
          id="datapublication-details-panel"
        >
          {/* Long format information */}
          <Grid item xs>
            <Subheading variant="h5" data-testid="landing-investigation-title">
              {title}
            </Subheading>
            <Typography data-testid="landing-datapublication-description">
              {description}
            </Typography>

            {formattedUsers.length > 0 && (
              <div>
                <Subheading
                  variant="h6"
                  data-testid="landing-dataPublication-users-label"
                >
                  {'Instrument Scientists'}
                </Subheading>
                {formattedUsers.map((user, i) => (
                  <Typography
                    data-testid={`landing-dataPublication-user-${i}`}
                    key={i}
                  >
                    {user.fullName}
                  </Typography>
                ))}
              </div>
            )}

            <Subheading
              variant="h6"
              data-testid="landing-dataPublication-publisher-label"
            >
              {t('datapublications.details.publisher')}
            </Subheading>
            <Typography data-testid="landing-dataPublication-publisher">
              {t('doi_constants.publisher.name')}
            </Typography>
            <CitationFormatter
              doi={pid}
              formattedUsers={formattedUsers}
              title={title}
              startDate={date}
            />
          </Grid>

          <Divider orientation="vertical" />
          {/* Short format information */}
          <Grid item xs={6} sm={5} md={4} lg={3}>
            {shortInfo.map(
              (field, i) =>
                field.content() && (
                  <ShortInfoRow key={i}>
                    <ShortInfoLabel>
                      {field.icon}
                      {field.label}:
                    </ShortInfoLabel>
                    <ArrowTooltip title={getTooltipText(field.content())}>
                      <ShortInfoValue>{field.content()}</ShortInfoValue>
                    </ArrowTooltip>
                  </ShortInfoRow>
                )
            )}
            <img
              src={pluginHost + InstrumentImage}
              alt="GEM Instrument"
              style={{ width: '100%', paddingLeft: '6px' }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandingPage;
