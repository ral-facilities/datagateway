import React from 'react';
import {
  Table,
  formatBytes,
  TextColumnFilter,
  Order,
  TableActionProps,
  DownloadCartItem,
  DownloadCartTableItem,
} from 'datagateway-common';
import { IconButton, Grid, Paper, Typography, Button } from '@material-ui/core';
import { RemoveCircle } from '@material-ui/icons';
import {
  fetchDownloadCartItems,
  removeAllDownloadCartItems,
  removeDownloadCartItem,
  getSize,
  getCartDatafileCount,
  getIsTwoLevel,
} from './downloadCartApi';
import chunk from 'lodash.chunk';

import DownloadConfirmDialog from '../downloadConfirmation/downloadConfirmDialog.component';
import { DownloadSettingsContext } from '../ConfigProvider';

const DownloadCartTable: React.FC = () => {
  const settings = React.useContext(DownloadSettingsContext);

  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{ [column: string]: string }>(
    {}
  );
  const [data, setData] = React.useState<DownloadCartTableItem[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [sizesLoaded, setSizesLoaded] = React.useState(true);
  const [sizesFinished, setSizesFinished] = React.useState(true);

  // TODO: work these out via API calls
  const [fileCount, setFileCount] = React.useState<number>(-1);
  const [fileCountMax, setFileCountMax] = React.useState<number>(-1);
  const [totalSizeMax, setTotalSizeMax] = React.useState<number>(-1);

  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isTwoLevel, setIsTwoLevel] = React.useState(false);

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

  React.useEffect(() => {
    // console.log(settings.idsUrl);
    const checkTwoLevel = async (): Promise<void> =>
      setIsTwoLevel(await getIsTwoLevel(settings.idsUrl));

    if (settings.idsUrl) checkTwoLevel();
  }, [settings.idsUrl]);

  React.useEffect(() => {
    if (settings.facilityName && settings.apiUrl && settings.downloadApiUrl)
      fetchDownloadCartItems(
        settings.facilityName,
        settings.downloadApiUrl
      ).then(cartItems => {
        setData(cartItems.map(cartItem => ({ ...cartItem, size: -1 })));
        setDataLoaded(true);
        setSizesLoaded(false);
        setSizesFinished(false);
        getCartDatafileCount(cartItems, settings.apiUrl).then(count =>
          setFileCount(count)
        );
      });
  }, [settings.facilityName, settings.apiUrl, settings.downloadApiUrl]);

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
          const promise = getSize(
            cartItem.entityId,
            cartItem.entityType,
            settings.facilityName,
            settings.apiUrl,
            settings.downloadApiUrl
          ).then(size => {
            updatedData[chunkIndexOffset + index].size = size;
          });
          chunkPromises.push(promise);
          allPromises.push(promise);
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

  React.useEffect(() => {
    setFileCountMax(5000);
    setTotalSizeMax(1000000000000);
  }, [setFileCount, setFileCountMax, setTotalSizeMax]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => {
        if (value) {
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
    />
  );

  const sortedAndFilteredData = React.useMemo(() => {
    const filteredData = data.filter(item => {
      for (let [key, value] of Object.entries(filters)) {
        const tableValue = item[key];
        if (
          tableValue === undefined ||
          (typeof tableValue === 'string' && !tableValue.includes(value))
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
      for (let [sortColumn, sortDirection] of Object.entries(sort)) {
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

  return (
    <div>
      <Grid container direction="column">
        <Grid item>
          <Paper style={{ height: 'calc(100vh - 150px)' }}>
            <Table
              columns={[
                {
                  label: 'Name',
                  dataKey: 'name',
                  filterComponent: textFilter,
                },
                {
                  label: 'Type',
                  dataKey: 'entityType',
                  filterComponent: textFilter,
                },
                {
                  label: 'Size',
                  dataKey: 'size',
                  cellContentRenderer: props => {
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
                      aria-label={`Remove ${cartItem.name} from cart`}
                      key="remove"
                      size="small"
                      onClick={() => {
                        setIsDeleting(true);
                        setTimeout(
                          () =>
                            removeDownloadCartItem(
                              cartItem.entityId,
                              cartItem.entityType,
                              settings.facilityName,
                              settings.downloadApiUrl
                            ).then(() =>
                              setData(
                                data.filter(
                                  item => item.entityId !== cartItem.entityId
                                )
                              )
                            ),
                          100
                        );
                      }}
                    >
                      <RemoveCircle color={isDeleting ? 'error' : 'inherit'} />
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
            xs={3}
            alignContent="flex-end"
            style={{ marginRight: '1.2em' }}
          >
            <Typography id="fileCountDisplay">
              Number of files: {fileCount !== -1 ? fileCount : 'Calculating...'}
              {fileCountMax !== -1 && ` / ${fileCountMax}`}
            </Typography>
            <Typography id="totalSizeDisplay">
              Total size:{' '}
              {totalSize !== -1 ? formatBytes(totalSize) : 'Calculating...'}
              {totalSizeMax !== -1 && ` / ${formatBytes(totalSizeMax)}`}
            </Typography>
          </Grid>
          <Grid
            container
            item
            justify="flex-end"
            spacing={1}
            xs={3}
            style={{ marginRight: '1em' }}
          >
            <Grid item>
              <Button
                id="removeAllButton"
                variant="contained"
                color="primary"
                onClick={() =>
                  removeAllDownloadCartItems(
                    settings.facilityName,
                    settings.downloadApiUrl
                  ).then(() => setData([]))
                }
              >
                Remove All
              </Button>
            </Grid>
            <Grid item>
              <Button
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
                Download Cart
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
        setClose={() => setShowConfirmation(false)}
        clearCart={() => setData([])}
      />
    </div>
  );
};

export default DownloadCartTable;
