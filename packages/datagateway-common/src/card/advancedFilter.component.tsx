import React from 'react';
import { Collapse, Typography, Link, Grid, Box, styled } from '@mui/material';
import { CardViewDetails } from './cardView.component';
import SubjectIcon from '@mui/icons-material/Subject';
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

const FilterDiv = styled('div')({
  padding: '5px',
});

const iconStyle = {
  marginTop: 'auto',
  marginBottom: 'auto',
  marginRight: 1,
};

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

  const { title, description, information } = props;

  // Set to collapsed or not.
  const [advSearchCollapsed, setAdvSearchCollapsed] = React.useState(false);

  const chooseIcon = (label: string): JSX.Element | null => {
    if (
      (t('advanced_filters.icons.title', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <SubjectIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.fingerprint', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <FingerprintIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.public', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <PublicIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.confirmation_number', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <ConfirmationNumberIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.assessment', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <AssessmentIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.calendar_today', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <CalendarTodayIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.explore', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <ExploreIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.save', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <SaveIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.description', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <DescriptionIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.link', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <LinkIcon sx={iconStyle} />;
    } else if (
      (t('advanced_filters.icons.person', {
        returnObjects: true,
      }) as string[]).includes(label)
    ) {
      return <PersonIcon sx={iconStyle} />;
    } else {
      return null;
    }
  };

  return (
    <div>
      <Collapse in={advSearchCollapsed}>
        <Box
          sx={{
            display: 'grid',
            gridGap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            padding: '20px',
          }}
        >
          {/* Filters for title and description provided on card */}
          {title && title.filterComponent && (
            <FilterDiv className="tour-dataview-filter">
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
            </FilterDiv>
          )}
          {description && description.filterComponent && (
            <FilterDiv className="tour-dataview-filter">
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
            </FilterDiv>
          )}

          {/* Filters for other information provided on card */}
          {information &&
            information.map(
              (info, index) =>
                info.filterComponent && (
                  <FilterDiv key={index} className="tour-dataview-filter">
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
                  </FilterDiv>
                )
            )}
        </Box>
      </Collapse>

      {/* Advanced filters link */}
      <Box sx={{ textAlign: 'center' }}>
        <Link
          className="tour-dataview-advanced-filters"
          component="button"
          variant="body1"
          data-testid="advanced-filters-link"
          onClick={() => setAdvSearchCollapsed((prev) => !prev)}
        >
          {!advSearchCollapsed
            ? t('advanced_filters.show')
            : t('advanced_filters.hide')}
        </Link>
      </Box>
    </div>
  );
};

const AdvancedFilter = React.memo(UnmemoisedAdvancedFilter);

export default AdvancedFilter;
