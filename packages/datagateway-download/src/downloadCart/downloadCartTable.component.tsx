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
} from 'datagateway-common';
import {
  IconButton,
  Grid,
  Paper,
  Typography,
  Button,
  LinearProgress,
  createStyles,
  makeStyles,
  Theme,
  Link,
} from '@material-ui/core';
import { RemoveCircle } from '@material-ui/icons';
import {
  fetchDownloadCartItems,
  removeAllDownloadCartItems,
  removeDownloadCartItem,
  getSize,
  getIsTwoLevel,
  getDatafileCount,
} from '../downloadApi';
import chunk from 'lodash.chunk';

import DownloadConfirmDialog from '../downloadConfirmation/downloadConfirmDialog.component';
import { DownloadSettingsContext } from '../ConfigProvider';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

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
  const [data, setData] = React.useState<DownloadCartTableItem[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [sizesLoaded, setSizesLoaded] = React.useState(true);
  const [sizesFinished, setSizesFinished] = React.useState(true);

  const fileCountMax = settings.fileCountMax;
  const totalSizeMax = settings.totalSizeMax;

  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isTwoLevel, setIsTwoLevel] = React.useState(false);

  const [t] = useTranslation();
  const dgDownloadElement = document.getElementById('datagateway-download');

  const totalSize = React.useMemo(() => {
    if (sizesFinished) {
      return data.reduce((accumulator, nextItem) => {
        if (nextItem.size > -1) {
          return accumulator + nextItem.size;
        } else {
          return accumulator;
        }
      }, 0);
    } else {
      return -1;
    }
  }, [data, sizesFinished]);

  const fileCount = React.useMemo(() => {
    if (sizesFinished) {
      return data.reduce((accumulator, nextItem) => {
        if (nextItem.fileCount > -1) {
          return accumulator + nextItem.fileCount;
        } else {
          return accumulator;
        }
      }, 0);
    } else {
      return -1;
    }
  }, [data, sizesFinished]);

  React.useEffect(() => {
    const checkTwoLevel = async (): Promise<void> =>
      setIsTwoLevel(await getIsTwoLevel({ idsUrl: settings.idsUrl }));

    if (settings.idsUrl) checkTwoLevel();
  }, [settings.idsUrl]);
  React.useEffect(() => {
    if (
      settings.facilityName &&
      settings.apiUrl &&
      settings.downloadApiUrl &&
      dgDownloadElement
    )
      fetchDownloadCartItems({
        facilityName: settings.facilityName,
        downloadApiUrl: settings.downloadApiUrl,
      }).then((cartItems) => {
        setData(
          cartItems.map((cartItem) => ({
            ...cartItem,
            size: -1,
            fileCount: -1,
          }))
        );
        setDataLoaded(true);
        setSizesLoaded(false);
        setSizesFinished(false);
      });
  }, [
    settings.facilityName,
    settings.apiUrl,
    settings.downloadApiUrl,
    dgDownloadElement,
  ]);

  React.useEffect(() => {
    if (!sizesLoaded) {
      const chunkSize = 10;
      const chunkedData = chunk(data, chunkSize);
      const allPromises: Promise<void>[] = [];
      chunkedData.forEach((chunk, chunkIndex) => {
        const updatedData = [...data];
        const chunkPromises: Promise<void>[] = [];

        const chunkIndexOffset = chunkIndex * chunkSize;
        chunk.forEach((cartItem, index) => {
          const promiseSize = getSize(cartItem.entityId, cartItem.entityType, {
            facilityName: settings.facilityName,
            apiUrl: settings.apiUrl,
            downloadApiUrl: settings.downloadApiUrl,
          }).then((size) => {
            updatedData[chunkIndexOffset + index].size = size;
          });
          const promiseFileCount = getDatafileCount(
            cartItem.entityId,
            cartItem.entityType,
            {
              apiUrl: settings.apiUrl,
            }
          ).then((fileCount) => {
            updatedData[chunkIndexOffset + index].fileCount = fileCount;
          });
          chunkPromises.push(promiseSize);
          allPromises.push(promiseSize);
          chunkPromises.push(promiseFileCount);
          allPromises.push(promiseFileCount);
        });

        Promise.all(chunkPromises).then(() => {
          setData(updatedData);
        });
      });
      Promise.all(allPromises).then(() => {
        setSizesFinished(true);
      });
      setSizesLoaded(true);
    }
  }, [
    data,
    sizesLoaded,
    settings.facilityName,
    settings.apiUrl,
    settings.downloadApiUrl,
  ]);

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
      value={filters[dataKey] as TextFilter}
    />
  );

  const sortedAndFilteredData = React.useMemo(() => {
    const filteredData = data.filter((item) => {
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

    return filteredData.sort(sortCartItems);
  }, [data, sort, filters]);

  return data.length === 0 ? (
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
                for data.
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
        {!dataLoaded && (
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
              columns={[
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
              data={sortedAndFilteredData}
              loading={!dataLoaded}
              actions={[
                function RemoveButton({ rowData }: TableActionProps) {
                  const cartItem = rowData as DownloadCartItem;
                  const [isDeleting, setIsDeleting] = React.useState(false);
                  return (
                    <IconButton
                      aria-label={t('downloadCart.remove', {
                        name: cartItem.name,
                      })}
                      key="remove"
                      size="small"
                      // Remove the download when clicked.
                      onClick={() => {
                        setIsDeleting(true);
                        removeDownloadCartItem(
                          cartItem.entityId,
                          cartItem.entityType,
                          {
                            facilityName: settings.facilityName,
                            downloadApiUrl: settings.downloadApiUrl,
                          }
                        ).then(() => {
                          setData(
                            data.filter(
                              (item) => item.entityId !== cartItem.entityId
                            )
                          );
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
              ]}
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
            direction="column"
            xs
            alignContent="flex-end"
            style={{ marginRight: '1.2em' }}
          >
            <Typography id="fileCountDisplay">
              {t('downloadCart.number_of_files')}:{' '}
              {fileCount !== -1 ? fileCount : 'Calculating...'}
              {fileCountMax !== -1 && ` / ${fileCountMax}`}
            </Typography>
            <Typography id="totalSizeDisplay">
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
                onClick={() =>
                  removeAllDownloadCartItems({
                    facilityName: settings.facilityName,
                    downloadApiUrl: settings.downloadApiUrl,
                  }).then(() => setData([]))
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
        isTwoLevel={isTwoLevel}
        open={showConfirmation}
        redirectToStatusTab={props.statusTabRedirect}
        setClose={() => setShowConfirmation(false)}
        clearCart={() => setData([])}
      />
    </div>
  );
};

export default DownloadCartTable;
