import React from 'react';
import {
  Table,
  formatBytes,
  TextColumnFilter,
  Order,
  TableActionProps,
  DownloadCartItem,
  DownloadCartTableItem,
  TextFilter,
  ColumnType,
} from 'datagateway-common';
import {
  IconButton,
  Grid,
  Paper,
  Typography,
  Button,
  LinearProgress,
  CircularProgress,
  createStyles,
  makeStyles,
  Theme,
  Link,
} from '@material-ui/core';
import { RemoveCircle } from '@material-ui/icons';
import {
  useCart,
  useRemoveEntityFromCart,
  useIsTwoLevel,
  useRemoveAllFromCart,
  useSizes,
  useDatafileCounts,
} from '../downloadApi';

import DownloadConfirmDialog from '../downloadConfirmation/downloadConfirmDialog.component';
import { DownloadSettingsContext } from '../ConfigProvider';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useQueryClient } from 'react-query';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    noSelectionsMessage: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.contrastGrey,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
  })
);

interface DownloadCartTableProps {
  statusTabRedirect: () => void;
}

const DownloadCartTable: React.FC<DownloadCartTableProps> = (
  props: DownloadCartTableProps
) => {
  const classes = useStyles();
  const settings = React.useContext(DownloadSettingsContext);

  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{
    [column: string]: { value?: string | number; type: string };
  }>({});

  const fileCountMax = settings.fileCountMax;
  const totalSizeMax = settings.totalSizeMax;

  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const { data: isTwoLevel } = useIsTwoLevel();
  const { mutateAsync: removeDownloadCartItem } = useRemoveEntityFromCart();
  const {
    mutate: removeAllDownloadCartItems,
    isLoading: removeAllPending,
  } = useRemoveAllFromCart();
  const { data, isFetching: dataLoading } = useCart();

  const queryClient = useQueryClient();
  const setData = React.useCallback(
    (newData: DownloadCartTableItem[]) => {
      queryClient.setQueryData('cart', newData);
    },
    [queryClient]
  );

  const fileCountQueries = useDatafileCounts(data);
  const sizeQueries = useSizes(data);

  const fileCount = React.useMemo(() => {
    return (
      fileCountQueries?.reduce((accumulator, nextItem) => {
        if (nextItem.data && nextItem.data > -1) {
          return accumulator + nextItem.data;
        } else {
          return accumulator;
        }
      }, 0) ?? -1
    );
  }, [fileCountQueries]);

  const totalSize = React.useMemo(() => {
    return (
      sizeQueries?.reduce((accumulator, nextItem) => {
        if (nextItem.data && nextItem.data > -1) {
          return accumulator + nextItem.data;
        } else {
          return accumulator;
        }
      }, 0) ?? -1
    );
  }, [sizeQueries]);

  const sizesLoading = sizeQueries.some((query) => query.isLoading);
  const fileCountsLoading = fileCountQueries.some((query) => query.isLoading);

  const [t] = useTranslation();

  const textFilter = React.useCallback(
    (label: string, dataKey: string): React.ReactElement => (
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
        value={filters[dataKey] as TextFilter}
      />
    ),
    [filters]
  );

  const sortedAndFilteredData = React.useMemo(() => {
    const sizeAddedData = data?.map(
      (item, index) =>
        ({
          ...item,
          size: sizeQueries?.[index]?.data ?? -1,
        } as DownloadCartTableItem)
    );
    const filteredData = sizeAddedData?.filter((item) => {
      for (const [key, value] of Object.entries(filters)) {
        const tableValue = item[key];
        if (
          tableValue === undefined ||
          (typeof tableValue === 'string' &&
            typeof value.value === 'string' &&
            (value.type === 'include'
              ? !tableValue.includes(value.value)
              : tableValue.includes(value.value)))
        ) {
          return false;
        }
      }
      return true;
    });

    function sortCartItems(
      a: DownloadCartTableItem,
      b: DownloadCartTableItem
    ): number {
      for (const [sortColumn, sortDirection] of Object.entries(sort)) {
        if (sortDirection === 'asc') {
          if (a[sortColumn] > b[sortColumn]) {
            return 1;
          } else if (a[sortColumn] < b[sortColumn]) {
            return -1;
          }
        } else {
          if (a[sortColumn] > b[sortColumn]) {
            return -1;
          } else if (a[sortColumn] < b[sortColumn]) {
            return 1;
          }
        }
      }
      return 0;
    }

    return filteredData?.sort(sortCartItems);
  }, [data, sort, filters, sizeQueries]);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('downloadCart.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        label: t('downloadCart.type'),
        dataKey: 'entityType',
        filterComponent: textFilter,
      },
      {
        label: t('downloadCart.size'),
        dataKey: 'size',
        cellContentRenderer: (props) => {
          return formatBytes(props.cellData);
        },
        // cellContentRenderer: (cellProps) =>
        //   formatCountOrSize(sizeQueries[cellProps.rowIndex], true),
      },
    ],
    [t, textFilter]
  );
  const onSort = React.useCallback(
    (column: string, order: 'desc' | 'asc' | null) => {
      if (order) {
        setSort({ ...sort, [column]: order });
      } else {
        const { [column]: order, ...restOfSort } = sort;
        setSort(restOfSort);
      }
    },
    [sort]
  );
  const actions = React.useMemo(
    () => [
      function RemoveButton({ rowData }: TableActionProps) {
        const cartItem = rowData as DownloadCartItem;
        const { entityId, entityType } = cartItem;
        const [isDeleting, setIsDeleting] = React.useState(false);
        return (
          <IconButton
            aria-label={t('downloadCart.remove', {
              name: cartItem.name,
            })}
            key="remove"
            size="small"
            disabled={isDeleting}
            // Remove the download when clicked.
            onClick={() => {
              setIsDeleting(true);
              removeDownloadCartItem({
                entityId,
                entityType,
              }).then(() => {
                setIsDeleting(false);
              });
            }}
          >
            <RemoveCircle
              className="tour-download-remove-single"
              color={isDeleting ? 'error' : 'inherit'}
            />
          </IconButton>
        );
      },
    ],
    [removeDownloadCartItem, t]
  );

  return !dataLoading && data?.length === 0 ? (
    <div
      className="tour-download-results"
      data-testid="no-selections-message"
      style={{
        //Table should take up page but leave room for: SG appbar, SG footer,
        //tabs, table padding.
        height: 'calc(100vh - 64px - 36px - 48px - 48px)',
        minHeight: 230,
        overflowX: 'auto',
      }}
    >
      <Paper>
        <Grid container direction="column" alignItems="center" justify="center">
          <Grid item>
            <Typography className={classes.noSelectionsMessage}>
              <Trans i18nKey="downloadCart.no_selections">
                No data selected.{' '}
                <Link
                  component={RouterLink}
                  to={t('downloadCart.browse_link')}
                  style={{ fontWeight: 'bold' }}
                >
                  Browse
                </Link>{' '}
                or{' '}
                <Link
                  component={RouterLink}
                  to={t('downloadCart.search_link')}
                  style={{ fontWeight: 'bold' }}
                >
                  search
                </Link>{' '}
                for data?.
              </Trans>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </div>
  ) : (
    <div>
      <Grid container direction="column">
        {/* Show loading progress if data is still being loaded */}
        {dataLoading && (
          <Grid item xs={12}>
            <LinearProgress color="secondary" />
          </Grid>
        )}
        <Grid item>
          {/* Table should take up page but leave room for: SG appbar, 
              SG footer, tabs, table padding, text below table, and buttons
              (respectively). */}
          <Paper
            className="tour-download-results"
            style={{
              height:
                'calc(100vh - 64px - 48px - 48px - 48px - 3rem - (1.75 * 0.875rem + 12px)',
              minHeight: 230,
              overflowX: 'auto',
            }}
          >
            <Table
              columns={columns}
              sort={sort}
              onSort={onSort}
              data={sortedAndFilteredData ?? []}
              loading={dataLoading}
              actions={actions}
            />
          </Paper>
        </Grid>
        <Grid
          container
          item
          direction="column"
          alignItems="flex-end"
          justify="space-between"
        >
          <Grid
            container
            item
            justify="flex-end"
            alignItems="center"
            direction="row"
            style={{ marginRight: '1.2em' }}
          >
            {fileCountsLoading && (
              <CircularProgress size={15} thickness={7} disableShrink={true} />
            )}
            <Typography id="fileCountDisplay" style={{ marginLeft: '4px' }}>
              {t('downloadCart.number_of_files')}:{' '}
              {fileCount !== -1 ? fileCount : 'Calculating...'}
              {fileCountMax !== -1 && ` / ${fileCountMax}`}
            </Typography>
          </Grid>
          <Grid
            container
            item
            justify="flex-end"
            alignItems="center"
            direction="row"
            style={{ marginRight: '1.2em' }}
          >
            {sizesLoading && (
              <CircularProgress size={15} thickness={7} disableShrink={true} />
            )}
            <Typography id="totalSizeDisplay" style={{ marginLeft: '4px' }}>
              {t('downloadCart.total_size')}:{' '}
              {totalSize !== -1 ? formatBytes(totalSize) : 'Calculating...'}
              {totalSizeMax !== -1 && ` / ${formatBytes(totalSizeMax)}`}
            </Typography>
          </Grid>
          <Grid
            container
            item
            justify="flex-end"
            spacing={1}
            xs
            style={{ marginRight: '1em' }}
          >
            <Grid item>
              <Button
                className="tour-download-remove-button"
                id="removeAllButton"
                variant="contained"
                color="primary"
                disabled={removeAllPending}
                onClick={() =>
                  removeAllDownloadCartItems({
                    facilityName: settings.facilityName,
                    downloadApiUrl: settings.downloadApiUrl,
                  })
                }
              >
                {t('downloadCart.remove_all')}
              </Button>
            </Grid>
            <Grid item>
              <Button
                className="tour-download-download-button"
                onClick={() => setShowConfirmation(true)}
                id="downloadCartButton"
                variant="contained"
                color="primary"
                disabled={
                  fileCount <= 0 ||
                  totalSize <= 0 ||
                  sizesLoading ||
                  fileCountsLoading ||
                  (fileCountMax !== -1 && fileCount > fileCountMax) ||
                  (totalSizeMax !== -1 && totalSize > totalSizeMax)
                }
              >
                {t('downloadCart.download')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Show the download confirmation dialog. */}
      <DownloadConfirmDialog
        aria-labelledby="downloadCartConfirmation"
        totalSize={totalSize}
        isTwoLevel={isTwoLevel ?? false}
        open={showConfirmation}
        redirectToStatusTab={props.statusTabRedirect}
        setClose={() => setShowConfirmation(false)}
        clearCart={() => setData([])}
      />
    </div>
  );
};

export default DownloadCartTable;
