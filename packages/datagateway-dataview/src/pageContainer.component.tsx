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
  IconButton,
  Badge,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import SearchIcon from '@material-ui/icons/Search';

import PageBreadcrumbs from './breadcrumbs.component';
import PageTable from './pageTable.component';
import { Route } from 'react-router';
import { push } from 'connected-react-router';
import { useTranslation } from 'react-i18next';
import { ThunkDispatch } from 'redux-thunk';
import { Action, AnyAction } from 'redux';
import { fetchDownloadCart, DownloadCartItem } from 'datagateway-common';

const gridStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default,
    },
  });

const StyledGrid = withStyles(gridStyles)(Grid);

interface PageContainerStoreProps {
  entityCount: number;
  cartItems: DownloadCartItem[];
}

interface PageContainerDispatchProps {
  fetchDownloadCart: () => Promise<void>;
  navigateToDownload: () => Action;
  navigateToSearch: () => Action;
}

type PageContainerCombinedProps = PageContainerStoreProps &
  PageContainerDispatchProps;

const PageContainer = (
  props: PageContainerCombinedProps
): React.ReactElement => {
  const {
    entityCount,
    cartItems,
    fetchDownloadCart,
    navigateToDownload,
    navigateToSearch,
  } = props;

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
      <Grid item xs aria-label="container-breadcrumbs">
        {/* don't show breadcrumbs on /my-data - only on browse */}
        <Route path="/browse" component={PageBreadcrumbs} />
      </Grid>

      {/* The table entity count takes up an xs of 2, where the breadcrumbs
           will take the remainder of the space. */}
      <Grid
        style={{ textAlign: 'center' }}
        item
        xs={2}
        aria-label="container-table-count"
      >
        <Paper
          square
          style={{
            backgroundColor: 'inherit',
            height: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" component="h3">
            <b>{t('app.results')}:</b> {entityCount}
          </Typography>
        </Paper>
      </Grid>
      <Paper square style={{ backgroundColor: 'inherit' }}>
        <IconButton
          onClick={navigateToSearch}
          aria-label="container-table-search"
        >
          <SearchIcon />
        </IconButton>
      </Paper>
      <Paper square style={{ backgroundColor: 'inherit' }}>
        <IconButton
          onClick={navigateToDownload}
          aria-label="container-table-cart"
        >
          <Badge
            badgeContent={cartItems.length > 0 ? cartItems.length : null}
            color="primary"
            aria-label="container-table-cart-badge"
          >
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Paper>

      {/* Hold the table for remainder of the page */}
      <Grid item xs={12} aria-label="container-table">
        {/* Place table in Paper component which adjusts for the height
             of the AppBar (64px) on parent application and the cart icon (48px). */}
        <Paper
          square
          style={{
            height: 'calc(100vh - 112px)',
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
  navigateToDownload: () => dispatch(push('/download')),
  navigateToSearch: () => dispatch(push('/search/data')),
});
const mapStateToProps = (state: StateType): PageContainerStoreProps => ({
  entityCount: state.dgcommon.totalDataCount,
  cartItems: state.dgcommon.cartItems,
});

export default connect(mapStateToProps, mapDispatchToProps)(PageContainer);
