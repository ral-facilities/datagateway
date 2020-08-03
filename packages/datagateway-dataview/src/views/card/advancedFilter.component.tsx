import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Collapse, Typography, Link } from '@material-ui/core';
import { CardViewDetails } from './cardView.component';

const useAdvancedFilterStyles = makeStyles({
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
});

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

  return (
    <div>
      <Collapse in={advSearchCollapsed}>
        <div className={classes.filterGrid}>
          {/* Filters for title and description provided on card */}
          {title && title.filterComponent && (
            <div className={classes.filter}>
              <Typography aria-label="title-label" variant="subtitle1">
                {title.label}
              </Typography>
              {title.filterComponent &&
                title.filterComponent(
                  title.label ? title.label : title.dataKey,
                  title.dataKey
                )}
            </div>
          )}
          {description && description.filterComponent && (
            <div className={classes.filter}>
              <Typography aria-label="description-label" variant="subtitle1">
                {description.label ? description.label : description.dataKey}
              </Typography>
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
                    <Typography variant="subtitle1">
                      {info.label ? info.label : info.dataKey}
                    </Typography>
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
            ? 'Show Advanced Search'
            : 'Hide Advanced Search'}
        </Link>
      </div>
    </div>
  );
};

export default AdvancedFilter;
