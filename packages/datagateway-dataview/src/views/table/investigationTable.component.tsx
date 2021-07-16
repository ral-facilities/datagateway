import React from 'react';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
} from '@material-ui/core';
import {
  Table,
  investigationLink,
  Investigation,
  ColumnType,
  useInvestigationsInfinite,
  useInvestigationCount,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  parseSearchToQuery,
  usePushSort,
  useTextFilter,
  useDateFilter,
} from 'datagateway-common';
import { StateType } from '../../state/app.types';
import { useSelector } from 'react-redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PublicIcon from '@material-ui/icons/Public';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
    divider: {
      marginBottom: theme.spacing(2),
    },
  })
);

const InvestigationTable = (): React.ReactElement => {
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
  const location = useLocation();
  const [t] = useTranslation();
  const classes = useStyles();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount();
  const { fetchNextPage, data } = useInvestigationsInfinite();
  const { data: allIds } = useIds('investigation');
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            allIds &&
            cartItem.entityType === 'investigation' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  const aggregatedData: Investigation[] = React.useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: <TitleIcon />,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return investigationLink(
            investigationData.id,
            investigationData.title,
            view
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: <FingerprintIcon />,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        icon: <FingerprintIcon />,
        label: t('investigations.rb_number'),
        dataKey: 'rbNumber',
        filterComponent: textFilter,
        disableSort: true,
      },
      {
        icon: <PublicIcon />,
        label: t('investigations.doi'),
        dataKey: 'doi',
        filterComponent: textFilter,
      },
      {
        icon: <ConfirmationNumberIcon />,
        label: t('investigations.dataset_count'),
        dataKey: 'datasetCount',
        disableSort: true,
      },
      {
        icon: <AssessmentIcon />,
        label: t('investigations.instrument'),
        dataKey: 'instrument.name',
        filterComponent: textFilter,
      },
      {
        icon: <CalendarTodayIcon />,

        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
      {
        icon: <CalendarTodayIcon />,
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
    ],
    [t, dateFilter, textFilter, view]
  );

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData }) => {
        const investigationData = rowData as Investigation;
        return (
          <Grid
            id="details-panel"
            container
            className={classes.root}
            direction="column"
          >
            <Grid item xs>
              <Typography variant="h6">
                <b>{investigationData.title}</b>
              </Typography>
              <Divider className={classes.divider} />
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('investigations.details.rb_number')}
              </Typography>
              <Typography>
                <b>{investigationData.rbNumber}</b>
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('investigations.details.start_date')}
              </Typography>
              <Typography>
                <b>{investigationData.startDate}</b>
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('investigations.details.end_date')}
              </Typography>
              <Typography>
                <b>{investigationData.endDate}</b>
              </Typography>
            </Grid>
          </Grid>
        );
      }}
      columns={columns}
    />
  );
};

export default InvestigationTable;
