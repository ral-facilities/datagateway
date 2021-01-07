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
  TextColumnFilter,
  DateColumnFilter,
  investigationLink,
  Order,
  Filter,
  Investigation,
  Entity,
  DownloadCartItem,
  fetchInvestigations,
  addToCart,
  removeFromCart,
  fetchInvestigationCount,
  fetchAllIds,
  pushPageFilter,
  pushPageSort,
  DateFilter,
  SortType,
  FiltersType,
} from 'datagateway-common';
import { StateType } from '../../state/app.types';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { useTranslation } from 'react-i18next';

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

interface InvestigationTableProps {
  sort: SortType;
  filters: FiltersType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
}

interface InvestigationTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  fetchAllIds: () => Promise<void>;
}

type InvestigationTableCombinedProps = InvestigationTableProps &
  InvestigationTableDispatchProps;

const InvestigationTable = (
  props: InvestigationTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    sort,
    pushSort,
    filters,
    pushFilters,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
    loading,
  } = props;

  const [t] = useTranslation();

  const classes = useStyles();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  React.useEffect(() => {
    fetchCount();
    fetchData({ startIndex: 0, stopIndex: 49 });
    fetchAllIds();
  }, [fetchCount, fetchData, fetchAllIds, sort, filters]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={fetchData}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
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
                <b>{investigationData.TITLE}</b>
              </Typography>
              <Divider className={classes.divider} />
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('investigations.details.rb_number')}
              </Typography>
              <Typography>
                <b>{investigationData.RB_NUMBER}</b>
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('investigations.details.start_date')}
              </Typography>
              <Typography>
                <b>{investigationData.STARTDATE}</b>
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('investigations.details.end_date')}
              </Typography>
              <Typography>
                <b>{investigationData.ENDDATE}</b>
              </Typography>
            </Grid>
          </Grid>
        );
      }}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('investigations.title'),
          dataKey: 'TITLE',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            return investigationLink(
              investigationData.ID,
              investigationData.TITLE
            );
          },
          filterComponent: textFilter,
        },
        {
          icon: <FingerprintIcon />,
          label: t('investigations.visit_id'),
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          icon: <FingerprintIcon />,
          label: t('investigations.rb_number'),
          dataKey: 'RB_NUMBER',
          filterComponent: textFilter,
          disableSort: true,
        },
        {
          icon: <PublicIcon />,
          label: t('investigations.doi'),
          dataKey: 'DOI',
          filterComponent: textFilter,
        },
        {
          icon: <ConfirmationNumberIcon />,
          label: t('investigations.dataset_count'),
          dataKey: 'DATASET_COUNT',
          disableSort: true,
        },
        {
          icon: <AssessmentIcon />,
          label: t('investigations.instrument'),
          dataKey: 'INSTRUMENT.NAME',
          filterComponent: textFilter,
        },
        {
          icon: <CalendarTodayIcon />,

          label: t('investigations.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
          cellContentRenderer: (props: TableCellProps) => {
            if (props.cellData) return props.cellData.toString().split(' ')[0];
          },
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('investigations.end_date'),
          dataKey: 'ENDDATE',
          filterComponent: dateFilter,
          cellContentRenderer: (props: TableCellProps) => {
            if (props.cellData) return props.cellData.toString().split(' ')[0];
          },
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationTableDispatchProps => ({
  fetchData: (offsetParams: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),

  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  fetchAllIds: () => dispatch(fetchAllIds('investigation')),

  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (state: StateType): InvestigationTableProps => {
  return {
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
  };
};

// these all need to be converted to dgcommon

export default connect(mapStateToProps, mapDispatchToProps)(InvestigationTable);
