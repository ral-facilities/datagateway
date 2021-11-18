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
  externalSiteLink,
  Investigation,
  ColumnType,
  formatCountOrSize,
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
  DetailsPanelProps,
  useInvestigationSizes,
} from 'datagateway-common';
import { StateType } from '../../state/app.types';
import { useSelector } from 'react-redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PublicIcon from '@material-ui/icons/Public';
import SaveIcon from '@material-ui/icons/Save';
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

export const InvestigationDetailsPanel = (
  props: DetailsPanelProps
): React.ReactElement => {
  const classes = useStyles();
  const [t] = useTranslation();
  const investigationData = props.rowData as Investigation;
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
          {t('investigations.details.name')}
        </Typography>
        <Typography>
          <b>{investigationData.name}</b>
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
};

const InvestigationTable = (): React.ReactElement => {
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount();
  const { fetchNextPage, data } = useInvestigationsInfinite([
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigationInstruments: 'instrument',
      }),
    },
  ]);
  const { data: allIds } = useIds('investigation', undefined, selectAllSetting);
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');

  const aggregatedData: Investigation[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const sizeQueries = useInvestigationSizes(aggregatedData);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: TitleIcon,
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
        icon: FingerprintIcon,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        icon: FingerprintIcon,
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
        disableSort: true,
      },
      {
        icon: PublicIcon,
        label: t('investigations.doi'),
        dataKey: 'doi',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return externalSiteLink(
            `https://doi.org/${investigationData.doi}`,
            investigationData.doi,
            view
          );
        },
        filterComponent: textFilter,
      },

      {
        icon: SaveIcon,
        label: t('investigations.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatCountOrSize(sizeQueries[cellProps.rowIndex], true),
        disableSort: true,
      },
      {
        icon: AssessmentIcon,
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.investigationInstruments?.[0]?.instrument) {
            return investigationData.investigationInstruments[0].instrument
              .name;
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: CalendarTodayIcon,

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
        icon: CalendarTodayIcon,
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
    [t, textFilter, dateFilter, view, sizeQueries]
  );

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={InvestigationDetailsPanel}
      columns={columns}
    />
  );
};

export default InvestigationTable;
