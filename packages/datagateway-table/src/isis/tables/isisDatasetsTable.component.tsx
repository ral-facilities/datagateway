import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
  Entity,
  TableActionProps,
} from 'datagateway-common';
import { Paper, IconButton } from '@material-ui/core';
import {
  sortTable,
  filterTable,
  fetchDatasets,
  fetchDatasetDetails,
  downloadDataset,
} from '../../state/actions';
import { AnyAction } from 'redux';
import { StateType } from '../../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { TableCellProps } from 'react-virtualized';
import DatasetDetailsPanel from '../detailsPanels/datasetDetailsPanel.component';
import { GetApp } from '@material-ui/icons';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatasetsTableProps {
  instrumentId: string;
  facilityCycleId: string;
  investigationId: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatasetsTableStoreProps {
  sort: {
    [column: string]: Order;
  };
  filters: {
    [column: string]: Filter;
  };
  data: Entity[];
  loading: boolean;
  error: string | null;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatasetsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (investigationId: number) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
  downloadData: (datasetId: number, name: string) => Promise<void>;
}

type ISISDatasetsTableCombinedProps = ISISDatasetsTableProps &
  ISISDatasetsTableStoreProps &
  ISISDatasetsTableDispatchProps;

const ISISDatasetsTable = (
  props: ISISDatasetsTableCombinedProps
): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    investigationId,
    facilityCycleId,
    instrumentId,
    downloadData,
  } = props;

  React.useEffect(() => {
    fetchData(parseInt(investigationId));
  }, [fetchData, sort, filters, investigationId]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  // TODO: replace with date filter
  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        detailsPanel={({ rowData, detailsPanelResize }) => {
          return (
            <DatasetDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
              fetchDetails={props.fetchDetails}
            />
          );
        }}
        actions={[
          function downloadButton({ rowData }: TableActionProps) {
            return (
              <IconButton
                aria-label="Download"
                key="download"
                size="small"
                onClick={() => {
                  downloadData(rowData.ID, rowData.NAME);
                }}
              >
                <GetApp />
              </IconButton>
            );
          },
        ]}
        columns={[
          {
            label: 'Name',
            dataKey: 'NAME',
            cellContentRenderer: (props: TableCellProps) =>
              tableLink(
                `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${props.rowData.ID}/datafile`,
                props.rowData.NAME
              ),
            filterComponent: textFilter,
          },
          {
            label: 'Size',
            dataKey: 'SIZE',
            disableSort: true,
          },
          {
            label: 'Create Time',
            dataKey: 'CREATE_TIME',
            filterComponent: dateFilter,
          },
          {
            label: 'Modified Time',
            dataKey: 'MOD_TIME',
            filterComponent: dateFilter,
          },
        ]}
      />
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISDatasetsTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (investigationId: number) =>
    dispatch(fetchDatasets(investigationId)),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  downloadData: (datasetId: number, name: string) =>
    dispatch(downloadDataset(datasetId, name)),
});

const mapStateToProps = (state: StateType): ISISDatasetsTableStoreProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISDatasetsTable);
