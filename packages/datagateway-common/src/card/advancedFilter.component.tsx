import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Collapse, Typography, Link, Grid, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import { CardViewDetails } from './cardView.component';
import TitleIcon from '@mui/icons-material/Title';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PublicIcon from '@mui/icons-material/Public';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExploreIcon from '@mui/icons-material/Explore';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslation } from 'react-i18next';

const useAdvancedFilterStyles = makeStyles((theme: Theme) =>
  createStyles({
    filterGrid: {
      display: 'grid',
      gridGap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      padding: '20px',
    },
    filter: {
      padding: '5px',
    },
    link: {
      textAlign: 'center',
      '& a': { cursor: 'pointer' },
    },
    icon: {
      marginTop: 'auto',
      marginBottom: 'auto',
      marginRight: theme.spacing(1),
    },
  })
);

interface AdvancedFilterProps {
  title: CardViewDetails;

  description?: CardViewDetails;
  information?: CardViewDetails[];
}

// need to export unmemoised version for use in tests as useState and React.memo don't work
// with enzyme shallow mounting: see enzyme issue #2196
export const UnmemoisedAdvancedFilter = (
  props: AdvancedFilterProps
): React.ReactElement => {
  const [t] = useTranslation();
  const classes = useAdvancedFilterStyles();

  const { title, description, information } = props;

  // Set to collapsed or not.
  const [advSearchCollapsed, setAdvSearchCollapsed] = React.useState(false);

  const chooseIcon = (label: string): JSX.Element | null => {
    if (
      (t('advanced_filters.icons.title', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <TitleIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.fingerprint', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <FingerprintIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.public', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <PublicIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.confirmation_number', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <ConfirmationNumberIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.assessment', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <AssessmentIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.calendar_today', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <CalendarTodayIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.explore', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <ExploreIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.save', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <SaveIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.description', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <DescriptionIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.link', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <LinkIcon className={classes.icon} />;
    } else if (
      (t('advanced_filters.icons.person', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <PersonIcon className={classes.icon} />;
    } else {
      return null;
    }
  };

  return (
    <div>
      <Collapse in={advSearchCollapsed}>
        <div className={classes.filterGrid}>
          {/* Filters for title and description provided on card */}
          {title && title.filterComponent && (
            <div className={classes.filter}>
              <Grid container>
                {title.label && chooseIcon(title.label)}
                <Typography variant="subtitle1">
                  {title.label ? title.label : title.dataKey}
                </Typography>
              </Grid>
              {title.filterComponent &&
                title.filterComponent(
                  title.label ? title.label : title.dataKey,
                  title.dataKey
                )}
            </div>
          )}
          {description && description.filterComponent && (
            <div className={classes.filter}>
              <Grid container>
                {description.label && chooseIcon(description.label)}
                <Typography variant="subtitle1">
                  {description.label ? description.label : description.dataKey}
                </Typography>
              </Grid>
              {description.filterComponent(
                description.label ? description.label : description.dataKey,
                description.dataKey
              )}
            </div>
          )}

          {/* Filters for other information provided on card */}
          {information &&
            information.map(
              (info, index) =>
                info.filterComponent && (
                  <div key={index} className={classes.filter}>
                    <Grid container>
                      {info.label && chooseIcon(info.label)}
                      <Typography variant="subtitle1">
                        {info.label ? info.label : info.dataKey}
                      </Typography>
                    </Grid>
                    {info.filterComponent(
                      info.label ? info.label : info.dataKey,
                      info.dataKey
                    )}
                  </div>
                )
            )}
        </div>
      </Collapse>

      {/* Advanced filters link */}
      <div className={classes.link}>
        <Link
          component="button"
          variant="body1"
          data-testid="advanced-filters-link"
          onClick={() => setAdvSearchCollapsed((prev) => !prev)}
        >
          {!advSearchCollapsed
            ? t('advanced_filters.show')
            : t('advanced_filters.hide')}
        </Link>
      </div>
    </div>
  );
};

const AdvancedFilter = React.memo(UnmemoisedAdvancedFilter);

export default AdvancedFilter;
