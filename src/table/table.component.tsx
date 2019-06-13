import React from 'react';
import MaterialTable, {
  Icons,
  Column,
  Action,
  Query,
  QueryResult,
} from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import FilterRow from './m-table-filter-row';
import { EntityType } from '../data/types';

/* eslint-disable react/display-name */
const tableIcons: Icons = {
  Add: () => <AddBox />,
  Check: () => <Check />,
  Clear: () => <Clear />,
  Delete: () => <DeleteOutline />,
  DetailPanel: () => <ChevronRight />,
  Edit: () => <Edit />,
  Export: () => <SaveAlt />,
  Filter: () => <FilterList />,
  FirstPage: () => <FirstPage />,
  LastPage: () => <LastPage />,
  NextPage: () => <ChevronRight />,
  PreviousPage: () => <ChevronLeft />,
  ResetSearch: () => <Clear />,
  Search: () => <Search />,
  SortArrow: () => <ArrowUpward />,
  ThirdStateCheck: () => <Remove />,
  ViewColumn: () => <ViewColumn />,
};
/* eslint-enable react/display-name */

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

interface TableProps {
  title: string;
  data: (query: Query) => Promise<QueryResult>;
  columns: Column[];
  detailPanel?: (rowData: EntityType) => React.ReactNode;
  actions?: (Action | ((rowData: EntityType) => Action))[];
}

const Table = (props: TableProps): React.ReactElement => {
  return (
    <MaterialTable
      icons={tableIcons}
      columns={props.columns}
      data={props.data}
      title={props.title}
      options={{
        filtering: true,
        paging: false,
        search: false,
        actionsColumnIndex: -1,
      }}
      detailPanel={
        props.detailPanel
          ? [
              {
                tooltip: 'Expand details',
                render: props.detailPanel,
              },
            ]
          : undefined
      }
      actions={props.actions}
      components={{
        // eslint-disable-next-line react/display-name
        FilterRow: props => <FilterRow {...props} />,
      }}
    />
  );
};

export default Table;
