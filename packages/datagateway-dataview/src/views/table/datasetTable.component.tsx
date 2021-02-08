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
  TextFilter,
  DateColumnFilter,
  datasetLink,
  Order,
  Filter,
  Dataset,
  Entity,
  DownloadCartItem,
  fetchDatasets,
  addToCart,
  removeFromCart,
  fetchDatasetCount,
  fetchAllIds,
  pushPageFilter,
  pushPageSort,
  DateFilter,
  SortType,
  FiltersType,
  ViewsType,
} from 'datagateway-common';
import { AnyAction } from 'redux';
import { StateType } from '../../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';

import TitleIcon from '@material-ui/icons/Title';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
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

interface DatasetTableProps {
  investigationId: string;
}

interface DatasetTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  view: ViewsType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
  selectAllSetting: boolean;
}

interface DatasetTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: () => Promise<void>;
}

type DatasetTableCombinedProps = DatasetTableProps &
  DatasetTableStoreProps &
  DatasetTableDispatchProps;

const DatasetTable = (props: DatasetTableCombinedProps): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    sort,
    pushSort,
    filters,
    pushFilters,
    view,
    investigationId,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
    loading,
    selectAllSetting,
  } = props;

  const [t] = useTranslation();

  const classes = useStyles();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'dataset' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  React.useEffect(() => {
    fetchCount(parseInt(investigationId));
    fetchAllIds();
  }, [fetchCount, fetchAllIds, filters, investigationId]);

  React.useEffect(() => {
    fetchData(parseInt(investigationId), { startIndex: 0, stopIndex: 49 });
  }, [fetchData, sort, filters, investigationId]);

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
      loadMoreRows={(params) => fetchData(parseInt(investigationId), params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData }) => {
        const datasetData = rowData as Dataset;
        return (
          <Grid
            id="details-panel"
            container
            className={classes.root}
            direction="column"
          >
            <Grid item xs>
              <Typography variant="h6">
                <b>{datasetData.NAME}</b>
              </Typography>
              <Divider className={classes.divider} />
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('datasets.details.description')}
              </Typography>
              <Typography>
                <b>{datasetData.NAME}</b>
              </Typography>
            </Grid>
          </Grid>
        );
      }}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('datasets.name'),
          dataKey: 'NAME',
          cellContentRenderer: (props) => {
            const datasetData = props.rowData as Dataset;
            return datasetLink(
              investigationId,
              datasetData.ID,
              datasetData.NAME,
              view
            );
          },
          filterComponent: textFilter,
        },
        {
          icon: <ConfirmationNumberIcon />,
          label: t('datasets.datafile_count'),
          dataKey: 'DATAFILE_COUNT',
          disableSort: true,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('datasets.create_time'),
          dataKey: 'CREATE_TIME',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
        {
          icon: <CalendarTodayIcon />,
          label: t('datasets.modified_time'),
          dataKey: 'MOD_TIME',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>,
  ownProps: DatasetTableProps
): DatasetTableDispatchProps => ({
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatasets({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              INVESTIGATION_ID: { eq: investigationId },
            }),
          },
        ],
      })
    ),
  fetchCount: (investigationId: number) =>
    dispatch(
      fetchDatasetCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            INVESTIGATION_ID: { eq: investigationId },
          }),
        },
      ])
    ),

  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  fetchAllIds: () =>
    dispatch(
      fetchAllIds('dataset', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            INVESTIGATION_ID: { eq: parseInt(ownProps.investigationId) },
          }),
        },
      ])
    ),

  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (state: StateType): DatasetTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    view: state.dgcommon.query.view,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    selectAllSetting: state.dgdataview.selectAllSetting,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetTable);
