import { RemoveCircle } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Theme,
  Typography,
} from '@mui/material';
import {
  ColumnType,
  DownloadCartItem,
  DownloadCartTableItem,
  formatBytes,
  Order,
  Table,
  TableActionProps,
  TextColumnFilter,
  TextFilter,
} from 'datagateway-common';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import {
  useCart,
  useDatafileCounts,
  useIsTwoLevel,
  useRemoveAllFromCart,
  useRemoveEntityFromCart,
  useSizes,
} from '../downloadApiHooks';

import DownloadConfirmDialog from '../downloadConfirmation/downloadConfirmDialog.component';

interface DownloadCartTableProps {
  statusTabRedirect: () => void;
}

const DownloadCartTable: React.FC<DownloadCartTableProps> = (
  props: DownloadCartTableProps
) => {
  const settings = React.useContext(DownloadSettingsContext);

  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{
    [column: string]: { value?: string | number; type: string };
  }>({});

  const fileCountMax = settings.fileCountMax;
  const totalSizeMax = settings.totalSizeMax;

  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const { data: isTwoLevel } = useIsTwoLevel();
  const { mutate: removeDownloadCartItem } = useRemoveEntityFromCart();
  const { mutate: removeAllDownloadCartItems, isLoading: removingAll } =
    useRemoveAllFromCart();
  const { data, isFetching: dataLoading } = useCart();

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
    const sizeAndCountAddedData = data?.map(
      (item, index) =>
        ({
          ...item,
          size: sizeQueries?.[index]?.data ?? -1,
          fileCount: fileCountQueries?.[index]?.data ?? -1,
        } as DownloadCartTableItem)
    );
    const filteredData = sizeAndCountAddedData?.filter((item) => {
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
  }, [data, sort, filters, sizeQueries, fileCountQueries]);

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
      },
      {
        label: t('downloadCart.fileCount'),
        dataKey: 'fileCount',
        cellContentRenderer: (props) => {
          if (props.cellData === -1) return 'Loading...';
          return props.cellData;
        },
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
            key={`remove-${entityId}`}
            size="small"
            disabled={isDeleting}
            // Remove the download when clicked.
            onClick={() => {
              setIsDeleting(true);
              removeDownloadCartItem({
                entityId,
                entityType,
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

  const emptyItems = React.useMemo(
    () =>
      sizeQueries.some((query) => query.data === 0) ||
      fileCountQueries.some((query) => query.data === 0),
    [sizeQueries, fileCountQueries]
  );

  return (
    <>
      {!dataLoading && data?.length === 0 ? (
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
            <Grid
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
            >
              <Grid item>
                <Typography
                  sx={{
                    color: (theme: Theme) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (theme as any).colours?.contrastGrey,
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  <Trans i18nKey="downloadCart.no_selections">
                    No data selected.{' '}
                    <Link
                      component={RouterLink}
                      to={t('downloadCart.browse_link')}
                      sx={{ fontWeight: 'bold' }}
                    >
                      Browse
                    </Link>{' '}
                    or{' '}
                    <Link
                      component={RouterLink}
                      to={t('downloadCart.search_link')}
                      sx={{ fontWeight: 'bold' }}
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
              SG footer, tabs, table padding, text below table, loading bar and
              buttons (respectively). */}
              <Paper
                className="tour-download-results"
                sx={{
                  height: `calc(100vh - 64px - 48px - 48px - 48px - 3rem${
                    emptyItems ||
                    (fileCountMax && fileCount > fileCountMax) ||
                    (totalSizeMax && totalSize > totalSizeMax)
                      ? ' - 2rem'
                      : ''
                  }${dataLoading ? ' - 4px' : ''} - (1.75 * 0.875rem + 12px))`,
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
              justifyContent="space-between"
              spacing={0.5}
              sx={{ marginTop: 0 }}
            >
              <Grid
                container
                item
                direction="row"
                xs
                justifyContent="flex-end"
                alignContent="flex-end"
                alignItems="flex-end"
                columnGap={1}
              >
                <Grid item>
                  {fileCountsLoading && (
                    <CircularProgress
                      size={15}
                      thickness={7}
                      disableShrink={true}
                      aria-label={t('downloadCart.calculating')}
                      sx={{ verticalAlign: -1 }}
                    />
                  )}
                  <Typography
                    id="fileCountDisplay"
                    style={{ marginLeft: '4px' }}
                    component="span"
                  >
                    {t('downloadCart.number_of_files')}:{' '}
                    {fileCount !== -1
                      ? fileCount
                      : `${t('downloadCart.calculating')}...`}
                    {fileCountMax && ` / ${fileCountMax}`}
                  </Typography>
                </Grid>
                <Grid item>
                  {fileCountMax && fileCount > fileCountMax && (
                    <Alert
                      id="fileLimitAlert"
                      variant="filled"
                      severity="error"
                      icon={false}
                      style={{
                        padding: '0px 8px',
                        lineHeight: 0.6,
                      }}
                    >
                      {t('downloadCart.file_limit_error', {
                        fileCountMax: fileCountMax,
                      })}
                    </Alert>
                  )}
                </Grid>
              </Grid>
              <Grid
                container
                item
                direction="row"
                xs
                justifyContent="flex-end"
                alignContent="flex-end"
                alignItems="flex-end"
                columnGap={1}
              >
                <Grid item>
                  {sizesLoading && (
                    <CircularProgress
                      size={15}
                      thickness={7}
                      disableShrink={true}
                      aria-label={t('downloadCart.calculating')}
                      sx={{ verticalAlign: -1 }}
                    />
                  )}
                  <Typography
                    id="totalSizeDisplay"
                    style={{ marginLeft: '4px' }}
                    component="span"
                  >
                    {t('downloadCart.total_size')}:{' '}
                    {totalSize !== -1
                      ? formatBytes(totalSize)
                      : `${t('downloadCart.calculating')}...`}
                    {totalSizeMax && ` / ${formatBytes(totalSizeMax)}`}
                  </Typography>
                </Grid>
                <Grid item>
                  {totalSizeMax && totalSize > totalSizeMax && (
                    <Alert
                      id="sizeLimitAlert"
                      variant="filled"
                      severity="error"
                      icon={false}
                      style={{
                        padding: '0px 8px',
                        lineHeight: 0.6,
                      }}
                    >
                      {t('downloadCart.size_limit_error', {
                        totalSizeMax: formatBytes(totalSizeMax),
                      })}
                    </Alert>
                  )}
                </Grid>
              </Grid>
              {emptyItems && (
                <Grid
                  container
                  item
                  direction="column"
                  xs
                  alignContent="flex-end"
                  alignItems="flex-end"
                >
                  <Alert
                    id="emptyFilesAlert"
                    variant="filled"
                    severity="error"
                    icon={false}
                    style={{
                      padding: '0px 8px',
                      lineHeight: 0.6,
                    }}
                  >
                    {t('downloadCart.empty_items_error')}
                  </Alert>
                </Grid>
              )}
              <Grid container item justifyContent="flex-end" columnGap={1} xs>
                <Grid item>
                  {/* Request to remove all selections is in progress. To prevent excessive requests, disable button during request */}
                  <Button
                    className="tour-download-remove-button"
                    id="removeAllButton"
                    variant="contained"
                    color="primary"
                    disabled={removingAll}
                    startIcon={removingAll && <CircularProgress size={20} />}
                    onClick={() => removeAllDownloadCartItems()}
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
                      fileCountsLoading ||
                      sizesLoading ||
                      emptyItems ||
                      (fileCountMax ? fileCount > fileCountMax : false) ||
                      (totalSizeMax ? totalSize > totalSizeMax : false)
                    }
                  >
                    {t('downloadCart.download')}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      )}
      {/* Show the download confirmation dialog. */}
      <DownloadConfirmDialog
        aria-labelledby="downloadCartConfirmation"
        totalSize={totalSize}
        isTwoLevel={isTwoLevel ?? false}
        open={showConfirmation}
        redirectToStatusTab={props.statusTabRedirect}
        setClose={() => setShowConfirmation(false)}
      />
    </>
  );
};

export default DownloadCartTable;
