import React from 'react';
import {
  TextColumnFilter,
  Table,
  formatBytes,
  Order,
  Filter,
  Entity,
  Datafile,
  TableActionProps,
} from 'datagateway-common';
import { Paper, IconButton } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import {
  fetchDatafiles,
  sortTable,
  filterTable,
  downloadDatafile,
  fetchDatafileDetails,
} from '../../state/actions';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { StateType } from '../../state/app.types';
import { Action, AnyAction } from 'redux';
import DatafileDetailsPanel from '../detailsPanels/datafileDetailsPanel.component';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatafilesTableProps {
  datasetId: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatafilesTableStoreProps {
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
interface ISISDatafilesTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (datasetId: number) => Promise<void>;
  downloadData: (datafileId: number, filename: string) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
}

type ISISDatafilesTableCombinedProps = ISISDatafilesTableProps &
  ISISDatafilesTableStoreProps &
  ISISDatafilesTableDispatchProps;

const ISISDatafilesTable = (
  props: ISISDatafilesTableCombinedProps
): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    datasetId,
    downloadData,
    fetchDetails,
  } = props;

  React.useEffect(() => {
    fetchData(parseInt(datasetId));
  }, [fetchData, sort, filters, datasetId]);

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
        detailsPanel={(rowData, detailsPanelResize) => {
          return (
            <DatafileDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
              fetchDetails={fetchDetails}
            />
          );
        }}
        actions={[
          function downloadButton({ rowData }: TableActionProps) {
            const datafileData = rowData as Datafile;
            if (datafileData.LOCATION) {
              return (
                <IconButton
                  aria-label="Download"
                  key="download"
                  size="small"
                  onClick={() => {
                    // @ts-ignore - otherwise we need to check LOCATION isn't undefined again
                    downloadData(datafileData.ID, datafileData.LOCATION);
                  }}
                >
                  <GetApp />
                </IconButton>
              );
            } else {
              return null;
            }
          },
        ]}
        columns={[
          {
            label: 'Name',
            dataKey: 'NAME',
            filterComponent: textFilter,
          },
          {
            label: 'Location',
            dataKey: 'LOCATION',
            filterComponent: textFilter,
          },
          {
            label: 'Size',
            dataKey: 'FILESIZE',
            cellContentRenderer: props => {
              return formatBytes(props.cellData);
            },
            filterComponent: textFilter,
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
): ISISDatafilesTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (datasetId: number) => dispatch(fetchDatafiles(datasetId)),
  fetchDetails: (datafileId: number) =>
    dispatch(fetchDatafileDetails(datafileId)),
  downloadData: (datafileId: number, filename: string) =>
    dispatch(downloadDatafile(datafileId, filename)),
});

const mapStateToProps = (state: StateType): ISISDatafilesTableStoreProps => {
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
)(ISISDatafilesTable);
