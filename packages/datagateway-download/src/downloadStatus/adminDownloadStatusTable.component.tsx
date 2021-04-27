import React from 'react';
import { Grid, LinearProgress, Paper } from '@material-ui/core';

import {
  DateColumnFilter,
  formatBytes,
  Order,
  Table,
  TextColumnFilter,
} from 'datagateway-common';

import { useTranslation } from 'react-i18next';

const AdminDownloadStatusTable: React.FC = () => {
  // Sorting columns
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{
    [column: string]:
      | { value?: string | number; type: string }
      | { startDate?: string; endDate?: string };
  }>({});
  const [dataLoaded] = React.useState(false);
  const [t] = useTranslation();

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: { value?: string | number; type: string } | null) => {
        if (value) {
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: { startDate?: string; endDate?: string } | null) => {
        if (value) {
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
    />
  );

  return (
    <Grid container direction="column">
      {/* Show loading progress if data is still being loaded */}
      {!dataLoaded && (
        <Grid item xs={12}>
          <LinearProgress color="secondary" />
        </Grid>
      )}
      <Grid item>
        <Paper
          style={{
            height:
              'calc(100vh - 64px - 30px - 48px - 48px - (1.75rem + 40px))',
            minHeight: 230,
            overflowX: 'auto',
          }}
        >
          <Table
            columns={[
              {
                label: t('downloadStatus.username'),
                dataKey: 'userName',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.preparedId'),
                dataKey: 'preparedId',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.transport'),
                dataKey: 'transport',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.status'),
                dataKey: 'status',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.size'),
                dataKey: 'size',
                cellContentRenderer: (cellProps) => {
                  return formatBytes(cellProps.cellData);
                },
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.createdAt'),
                dataKey: 'createdAt',
                filterComponent: dateFilter,
                disableHeaderWrap: true,
              },
              {
                label: t('downloadStatus.deleted'),
                dataKey: 'isDeleted',
                filterComponent: textFilter,
              },
            ]}
            sort={sort}
            onSort={(column: string, order: 'desc' | 'asc' | null) => {
              if (order) {
                setSort({ ...sort, [column]: order });
              } else {
                const { [column]: order, ...restOfSort } = sort;
                setSort(restOfSort);
              }
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminDownloadStatusTable;
