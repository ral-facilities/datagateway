import React from 'react';
import {
  TextColumnFilter,
  TextFilter,
  Table,
  formatBytes,
  Filter,
  Order,
  Entity,
  Datafile,
  DateColumnFilter,
  DownloadCartItem,
  fetchDatafiles,
  fetchDatafileCount,
  addToCart,
  removeFromCart,
  fetchAllIds,
  pushPageFilter,
  pushPageSort,
  FiltersType,
  SortType,
  DateFilter,
} from 'datagateway-common';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
} from '@material-ui/core';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { StateType } from '../../../state/app.types';
import { AnyAction } from 'redux';
import { IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';

import TitleIcon from '@material-ui/icons/Title';
import ExploreIcon from '@material-ui/icons/Explore';
import SaveIcon from '@material-ui/icons/Save';
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

interface DLSDatafilesTableProps {
  datasetId: string;
  investigationId: string;
}

interface DLSDatafilesTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
  selectAllSetting: boolean;
}

interface DLSDatafilesTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (
    datasetId: number,
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number, investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: (datasetId: number, investigationId: number) => Promise<void>;
}

type DLSDatafilesTableCombinedProps = DLSDatafilesTableProps &
  DLSDatafilesTableStoreProps &
  DLSDatafilesTableDispatchProps;

const DLSDatafilesTable = (
  props: DLSDatafilesTableCombinedProps
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
    datasetId,
    investigationId,
    loading,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
    selectAllSetting,
  } = props;

  const [t] = useTranslation();

  const classes = useStyles();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'datafile' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  React.useEffect(() => {
    fetchCount(parseInt(datasetId), parseInt(investigationId));
    fetchAllIds(parseInt(datasetId), parseInt(investigationId));
  }, [fetchCount, fetchAllIds, filters, datasetId, investigationId]);

  React.useEffect(() => {
    fetchData(parseInt(datasetId), parseInt(investigationId), {
      startIndex: 0,
      stopIndex: 49,
    });
  }, [fetchData, sort, filters, datasetId, investigationId]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
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
  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) =>
        fetchData(parseInt(datasetId), parseInt(investigationId), params)
      }
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData }) => {
        const datafileData = rowData as Datafile;
        return (
          <Grid
            id="details-panel"
            container
            className={classes.root}
            direction="column"
          >
            <Grid item xs>
              <Typography variant="h6">
                <b>{datafileData.name}</b>
              </Typography>
              <Divider className={classes.divider} />
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('datafiles.details.size')}
              </Typography>
              <Typography>
                <b>{formatBytes(datafileData.fileSize)}</b>
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('datafiles.details.location')}
              </Typography>
              <Typography>
                <b>{datafileData.location}</b>
              </Typography>
            </Grid>
          </Grid>
        );
      }}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('datafiles.name'),
          dataKey: 'name',
          filterComponent: textFilter,
        },
        {
          icon: <ExploreIcon />,
          label: t('datafiles.location'),
          dataKey: 'location',
          filterComponent: textFilter,
        },
        {
          icon: <SaveIcon />,
          label: t('datafiles.size'),
          dataKey: 'fileSize',
          cellContentRenderer: (cellProps) => {
            return formatBytes(cellProps.cellData);
          },
          filterComponent: textFilter,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('datafiles.create_time'),
          dataKey: 'createTime',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSDatafilesTableDispatchProps => ({
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  fetchData: (
    datasetId: number,
    investigationId: number,
    offsetParams: IndexRange
  ) =>
    dispatch(
      fetchDatafiles({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
          },
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'dataset.investigation.id': { eq: investigationId },
            }),
          },
        ],
      })
    ),
  fetchCount: (datasetId: number, investigationId: number) =>
    dispatch(
      fetchDatafileCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
        },
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'dataset.investigation.id': { eq: investigationId },
          }),
        },
      ])
    ),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('datafile', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('datafile', entityIds)),
  fetchAllIds: (datasetId: number, investigationId: number) =>
    dispatch(
      fetchAllIds('datafile', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'dataset.id': { eq: datasetId },
          }),
        },
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'dataset.investigation.id': { eq: investigationId },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): DLSDatafilesTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    selectAllSetting: state.dgdataview.selectAllSetting,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSDatafilesTable);
