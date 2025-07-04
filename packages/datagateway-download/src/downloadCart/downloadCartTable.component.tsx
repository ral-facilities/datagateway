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
  Tooltip,
  Typography,
} from '@mui/material';
import {
  type ColumnType,
  type DownloadCartItem,
  type DownloadCartTableItem,
  DownloadConfirmDialog,
  formatBytes,
  Table,
  type TableActionProps,
  TextColumnFilter,
  type TextFilter,
  type SortType,
  useSubmitCart,
  Download,
} from 'datagateway-common';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import {
  useCart,
  useIsCartMintable,
  useIsTwoLevel,
  useRemoveAllFromCart,
  useRemoveEntityFromCart,
  useFileSizesAndCounts,
} from '../downloadApiHooks';

import DownloadCartItemLink from './downloadCartItemLink.component';
import {
  buildDatafileUrl,
  buildDatasetUrl,
  buildInvestigationUrl,
} from './urlBuilders';
import { downloadPreparedCart } from '../downloadApi';

interface DownloadCartTableProps {
  statusTabRedirect: () => void;
}

const DownloadCartTable: React.FC<DownloadCartTableProps> = (
  props: DownloadCartTableProps
) => {
  const {
    fileCountMax,
    totalSizeMax,
    apiUrl,
    facilityName,
    doiMinterUrl,
    dataCiteUrl,
    downloadApiUrl,
    accessMethods,
  } = React.useContext(DownloadSettingsContext);

  const [sort, setSort] = React.useState<SortType>({});
  const [filters, setFilters] = React.useState<{
    [column: string]: TextFilter;
  }>({});

  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const { data: isTwoLevel } = useIsTwoLevel();
  const { mutate: removeDownloadCartItem } = useRemoveEntityFromCart();
  const { mutate: removeAllDownloadCartItems, isLoading: removingAll } =
    useRemoveAllFromCart();
  const { data: cartItems, isFetching: isFetchingCart } = useCart();
  const {
    data: mintable,
    isLoading: cartMintabilityLoading,
    error: mintableError,
  } = useIsCartMintable(cartItems);

  const fileSizesAndCounts = useFileSizesAndCounts(cartItems);

  const { fileCount, totalSize } = React.useMemo(() => {
    return (
      fileSizesAndCounts?.reduce(
        (accumulator, nextItem) => {
          return {
            fileCount: nextItem.data?.fileCount
              ? accumulator.fileCount + nextItem.data.fileCount
              : accumulator.fileCount,
            totalSize: nextItem.data?.fileSize
              ? accumulator.totalSize + nextItem.data.fileSize
              : accumulator.totalSize,
          };
        },
        { fileCount: 0, totalSize: 0 }
      ) ?? { fileCount: -1, totalSize: -1 }
    );
  }, [fileSizesAndCounts]);

  const fileSizesAndCountsLoading = fileSizesAndCounts.some(
    (query) => query?.isLoading
  );

  const [t] = useTranslation();

  const textFilter = React.useCallback(
    (label: string, dataKey: string): React.ReactElement => (
      <TextColumnFilter
        label={label}
        onChange={(value: TextFilter | null) => {
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
    const sizeAndCountAddedData = cartItems?.map(
      (item, index) =>
        ({
          ...item,
          size: fileSizesAndCounts?.[index]?.data?.fileSize ?? -1,
          fileCount: fileSizesAndCounts?.[index]?.data?.fileCount ?? -1,
        } as DownloadCartTableItem)
    );
    const filteredData = sizeAndCountAddedData?.filter((item) => {
      for (const [key, value] of Object.entries(filters)) {
        const tableValue = item[key];
        if (tableValue === undefined) return false;
        if (typeof tableValue === 'string' && typeof value.value === 'string') {
          // use switch statement to ensure TS can detect we cover all cases
          switch (value.type) {
            case 'include':
              if (!tableValue.includes(value.value)) return false;
              break;
            case 'exclude':
              if (tableValue.includes(value.value)) return false;
              break;
            case 'exact':
              if (tableValue !== value.value) return false;
              break;
            default:
              const exhaustiveCheck: never = value.type;
              throw new Error(`Unhandled text filter type: ${exhaustiveCheck}`);
          }
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
  }, [cartItems, fileSizesAndCounts, filters, sort]);

  const unmintableEntityIDs: number[] | null | undefined = React.useMemo(
    () =>
      mintableError?.response?.status === 403 &&
      typeof mintableError?.response?.data?.detail === 'string' &&
      JSON.parse(
        mintableError.response.data.detail.substring(
          mintableError.response.data.detail.indexOf('['),
          mintableError.response.data.detail.lastIndexOf(']') + 1
        )
      ),
    [mintableError]
  );

  const unmintableRowIDs = React.useMemo(() => {
    if (unmintableEntityIDs && sortedAndFilteredData) {
      return unmintableEntityIDs.map((id) =>
        sortedAndFilteredData.findIndex((entity) => entity.entityId === id)
      );
    } else {
      return [];
    }
  }, [unmintableEntityIDs, sortedAndFilteredData]);

  const [generateDOIButtonHover, setGenerateDOIButtonHover] =
    React.useState(false);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('downloadCart.name'),
        dataKey: 'name',
        filterComponent: textFilter,
        cellContentRenderer: (props) => {
          const item: DownloadCartItem = props.rowData;

          switch (item.entityType) {
            case 'investigation':
              return (
                <DownloadCartItemLink
                  cartItem={item}
                  linkBuilder={() =>
                    buildInvestigationUrl({
                      apiUrl,
                      facilityName,
                      investigationId: item.entityId,
                    })
                  }
                />
              );

            case 'dataset':
              return (
                <DownloadCartItemLink
                  cartItem={item}
                  linkBuilder={() =>
                    buildDatasetUrl({
                      apiUrl,
                      facilityName,
                      datasetId: item.entityId,
                    })
                  }
                />
              );

            case 'datafile':
              return (
                <DownloadCartItemLink
                  cartItem={item}
                  linkBuilder={() =>
                    buildDatafileUrl({
                      apiUrl,
                      facilityName,
                      datafileId: item.entityId,
                    })
                  }
                />
              );

            default:
              return item.name;
          }
        },
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
    [apiUrl, facilityName, t, textFilter]
  );
  const onSort: React.ComponentProps<typeof Table>['onSort'] =
    React.useCallback(
      (column, order, _, shiftDown) => {
        if (order) {
          shiftDown
            ? setSort({ ...sort, [column]: order })
            : setSort({ [column]: order });
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

  const downloadIfComplete = React.useCallback(
    (download: Download) => {
      if (download.status === 'COMPLETE' && download.preparedId)
        // Download the file as long as it is available for instant download.
        downloadPreparedCart(
          download.preparedId,
          download.fileName,
          // Use the idsUrl that has been defined for this access method.
          { idsUrl: accessMethods[download.transport].idsUrl }
        );
    },
    [accessMethods]
  );

  const emptyItems = fileSizesAndCounts.some(
    (query) => query.data?.fileSize === 0 || query.data?.fileCount === 0
  );

  const isLoading = isFetchingCart;

  return (
    <>
      {!isFetchingCart && cartItems?.length === 0 ? (
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
            {isLoading && (
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
                  }${isLoading ? ' - 4px' : ''} - (1.75 * 0.875rem + 12px))`,
                  minHeight: 230,
                  overflowX: 'auto',
                  // handle the highlight of unmintable entities
                  ...(generateDOIButtonHover && {
                    '& [role="rowgroup"] [role="row"]': Object.assign(
                      {},
                      ...unmintableRowIDs.map((id) => ({
                        [`&:nth-of-type(${id + 1})`]: {
                          bgcolor: 'error.main',
                          '& [role="gridcell"] *': {
                            color: 'error.contrastText',
                          },
                        },
                      }))
                    ),
                  }),
                }}
              >
                <Table
                  columns={columns}
                  sort={sort}
                  onSort={onSort}
                  data={sortedAndFilteredData ?? []}
                  loading={isLoading}
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
                  {fileSizesAndCountsLoading && (
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
                  {fileSizesAndCountsLoading && (
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
                    variant="outlined"
                    color="secondary"
                    disabled={removingAll}
                    startIcon={removingAll && <CircularProgress size={20} />}
                    onClick={() => removeAllDownloadCartItems()}
                  >
                    {t('downloadCart.remove_all')}
                  </Button>
                </Grid>
                {doiMinterUrl && dataCiteUrl && (
                  <Grid item>
                    <Tooltip
                      title={
                        cartMintabilityLoading
                          ? t('downloadCart.mintability_loading')
                          : !mintable
                          ? t('downloadCart.not_mintable')
                          : ''
                      }
                      onMouseEnter={() => setGenerateDOIButtonHover(true)}
                      onMouseLeave={() => setGenerateDOIButtonHover(false)}
                    >
                      {/* need this span so the tooltip works when the button is disabled */}
                      <span>
                        <Button
                          className="tour-download-mint-button"
                          id="generateDOIButton"
                          variant="contained"
                          color="primary"
                          disabled={cartMintabilityLoading || !mintable}
                          component={RouterLink}
                          to={{
                            pathname: '/download/mint',
                            state: { fromCart: true },
                          }}
                        >
                          {t('downloadCart.generate_DOI')}
                        </Button>
                      </span>
                    </Tooltip>
                  </Grid>
                )}
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
                      fileSizesAndCountsLoading ||
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
        totalSize={totalSize}
        isTwoLevel={isTwoLevel ?? false}
        facilityName={facilityName}
        downloadApiUrl={downloadApiUrl}
        accessMethods={accessMethods}
        open={showConfirmation}
        redirectToStatusTab={props.statusTabRedirect}
        setClose={() => setShowConfirmation(false)}
        postDownloadSuccessFn={downloadIfComplete}
        submitDownloadHook={useSubmitCart}
      />
    </>
  );
};

export default DownloadCartTable;
