import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Collapse,
  Typography,
  Link,
  Grid,
  createStyles,
  Theme,
} from '@material-ui/core';
import { CardViewDetails } from './cardView.component';
import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PublicIcon from '@material-ui/icons/Public';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ExploreIcon from '@material-ui/icons/Explore';
import SaveIcon from '@material-ui/icons/Save';
import DescriptionIcon from '@material-ui/icons/Description';
import LinkIcon from '@material-ui/icons/Link';
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

const AdvancedFilter = (props: AdvancedFilterProps): React.ReactElement => {
  const classes = useAdvancedFilterStyles();

  const { title, description, information } = props;

  // Set to collapsed or not.
  const [advSearchCollapsed, setAdvSearchCollapsed] = React.useState(false);

  const chooseIcon = (label: string): JSX.Element | null => {
    let icon;
    switch (label) {
      case 'Title':
      case 'Name':
      case 'Type':
        icon = <TitleIcon className={classes.icon} />;
        break;
      case 'Visit ID':
      case 'RB Number':
        icon = <FingerprintIcon className={classes.icon} />;
        break;
      case 'DOI':
        icon = <PublicIcon className={classes.icon} />;
        break;
      case 'Dataset Count':
      case 'Datafile Count':
        icon = <ConfirmationNumberIcon className={classes.icon} />;
        break;
      case 'Instrument':
      case 'Beamline':
        icon = <AssessmentIcon className={classes.icon} />;
        break;
      case 'Start Date':
      case 'End Date':
      case 'Create Time':
      case 'Created Time':
      case 'Modified Time':
        icon = <CalendarTodayIcon className={classes.icon} />;
        break;
      case 'Location':
        icon = <ExploreIcon className={classes.icon} />;
        break;
      case 'Size':
        icon = <SaveIcon className={classes.icon} />;
        break;
      case 'Description':
        icon = <DescriptionIcon className={classes.icon} />;
        break;
      case 'URL':
        icon = <LinkIcon className={classes.icon} />;
        break;
      default:
        icon = null;
    }
    return icon;
  };
  const [t] = useTranslation();

  return (
    <div>
      <Collapse in={advSearchCollapsed}>
        <div className={classes.filterGrid}>
          {/* Filters for title and description provided on card */}
          {title && title.filterComponent && (
            <div className={classes.filter}>
              <Grid container>
                {title.label && chooseIcon(title.label)}
                <Typography aria-label="title-label" variant="subtitle1">
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
                <Typography aria-label="description-label" variant="subtitle1">
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
                      <Typography
                        aria-label="information-label"
                        variant="subtitle1"
                      >
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
          aria-label="advanced-filters-link"
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

export default AdvancedFilter;
