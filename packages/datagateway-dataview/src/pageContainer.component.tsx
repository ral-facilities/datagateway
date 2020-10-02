import React, { useEffect } from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';

import {
  Grid,
  Typography,
  Paper,
  Theme,
  withStyles,
  createStyles,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';

import PageBreadcrumbs from './breadcrumbs.component';
import PageTable from './pageTable.component';
import { Route } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { fetchDownloadCart } from 'datagateway-common';

const gridStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default,
    },
  });

const StyledGrid = withStyles(gridStyles)(Grid);

interface PageContainerStoreProps {
  entityCount: number;
}

interface PageContainerDispatchProps {
  fetchDownloadCart: () => Promise<void>;
}

type PageContainerCombinedProps = PageContainerStoreProps &
  PageContainerDispatchProps;

const PageContainer = (
  props: PageContainerCombinedProps
): React.ReactElement => {
  const { entityCount, fetchDownloadCart } = props;

  const [t] = useTranslation();
  const dgDataviewElement = document.getElementById('datagateway-dataview');

  useEffect(() => {
    if (dgDataviewElement) {
      fetchDownloadCart();
    }
  }, [dgDataviewElement, fetchDownloadCart]);

  return (
    <StyledGrid container>
      {/* Hold the breadcrumbs at top left of the page. */}
      <Grid
        className="tour-dataview-breadcrumbs"
        item
        xs
        aria-label="container-breadcrumbs"
      >
        {/* don't show breadcrumbs on /my-data - only on browse */}
        <Route path="/browse" component={PageBreadcrumbs} />
      </Grid>

      {/* The table entity count takes up an xs of 2, where the breadcrumbs
           will take the remainder of the space. */}
      <Grid
        className="tour-dataview-results"
        style={{ textAlign: 'center' }}
        item
        xs={2}
        aria-label="container-table-count"
      >
        <Paper square style={{ backgroundColor: 'inherit' }}>
          <Typography variant="h6" component="h3">
            <b>{t('app.results')}:</b> {entityCount}
          </Typography>
        </Paper>
      </Grid>

      {/* Hold the table for remainder of the page */}
      <Grid item xs={12} aria-label="container-table">
        {/* Place table in Paper component which adjusts for the height
             of the AppBar (64px) on parent application and the breadcrumbs component (31px). */}
        <Paper
          square
          style={{
            height: 'calc(100vh - 95px)',
            width: '100%',
            backgroundColor: 'inherit',
          }}
        >
          <PageTable />
        </Paper>
      </Grid>
    </StyledGrid>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): PageContainerDispatchProps => ({
  fetchDownloadCart: () => dispatch(fetchDownloadCart()),
});
const mapStateToProps = (state: StateType): PageContainerStoreProps => ({
  entityCount: state.dgcommon.totalDataCount,
});

export default connect(mapStateToProps, mapDispatchToProps)(PageContainer);
