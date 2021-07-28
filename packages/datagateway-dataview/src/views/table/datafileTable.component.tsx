import React from 'react';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
  // IconButton,
} from '@material-ui/core';
import {
  Table,
  // TableActionProps,
  formatBytes,
  Datafile,
  useDatafileCount,
  useDatafilesInfinite,
  parseSearchToQuery,
  useTextFilter,
  useDateFilter,
  ColumnType,
  usePushSort,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  DetailsPanelProps,
} from 'datagateway-common';
// import { GetApp } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { StateType } from '../../state/app.types';
import { useSelector } from 'react-redux';
import { IndexRange } from 'react-virtualized';

import TitleIcon from '@material-ui/icons/Title';
import ExploreIcon from '@material-ui/icons/Explore';
import SaveIcon from '@material-ui/icons/Save';
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

interface DatafileTableProps {
  datasetId: string;
  investigationId: string;
}

const DatafileTable = (props: DatafileTableProps): React.ReactElement => {
  const { datasetId, investigationId } = props;

  const [t] = useTranslation();

  const location = useLocation();

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();
  const { data: allIds } = useIds('datafile', [
    {
      filterType: 'where',
      filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'dataset.investigation.id': { eq: investigationId },
      }),
    },
  ]);
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');

  const { data: totalDataCount } = useDatafileCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'dataset.investigation.id': { eq: investigationId },
      }),
    },
  ]);

  const { fetchNextPage, data } = useDatafilesInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'dataset.investigation.id': { eq: investigationId },
      }),
    },
  ]);

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const aggregatedData: Datafile[] = React.useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: TitleIcon,
        label: t('datafiles.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        icon: ExploreIcon,
        label: t('datafiles.location'),
        dataKey: 'location',
        filterComponent: textFilter,
      },
      {
        icon: SaveIcon,
        label: t('datafiles.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps) => {
          return formatBytes(cellProps.cellData);
        },
      },
      {
        icon: CalendarTodayIcon,
        label: t('datafiles.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [t, dateFilter, textFilter]
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            allIds &&
            cartItem.entityType === 'datafile' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  const DatafileDetailsPanel = (
    props: DetailsPanelProps
  ): React.ReactElement => {
    const classes = useStyles();
    const [t] = useTranslation();
    const datafileData = props.rowData as Datafile;
    return (
      <Grid
        id="details-panel"
        container
        className={classes.root}
        direction="column"
      >
        <Grid item xs>
          <Typography variant="h6">
            <b>{datafileData.name}</b>
          </Typography>
          <Divider className={classes.divider} />
        </Grid>
        <Grid item xs>
          <Typography variant="overline">
            {t('datafiles.details.size')}
          </Typography>
          <Typography>
            <b>{formatBytes(datafileData.fileSize)}</b>
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography variant="overline">
            {t('datafiles.details.location')}
          </Typography>
          <Typography>
            <b>{datafileData.location}</b>
          </Typography>
        </Grid>
      </Grid>
    );
  };

  // const downloadButton = (props: DetailsPanelProps): any => {
  //   const { id, location } = props.rowData as Datafile;
  //   if (location) {
  //     return (
  //       <IconButton
  //         aria-label={t('datafiles.download')}
  //         key="download"
  //         onClick={() => {
  //           downloadData(id, location);
  //         }}
  //       >
  //         <GetApp />
  //       </IconButton>
  //     );
  //   } else {
  //     return null;
  //   }
  // };

  // const DatafileDownloadActions = (
  //   props: DetailsPanelProps
  // ): React.ReactElement => {
  //   const { id, location } = props.rowData as Datafile;
  //     if (location) {
  //       return (
  //         <IconButton
  //           aria-label={t('datafiles.download')}
  //           key="download"
  //           onClick={() => {
  //             downloadData(id, location);
  //           }}
  //         >
  //           <GetApp />
  //         </IconButton>
  //       );
  //     } else {
  //       return null;
  //     }
  //   },
  // };

  // React.useEffect(() => {
  //   fetchCount(parseInt(datasetId), parseInt(investigationId));
  //   fetchAllIds(parseInt(datasetId), parseInt(investigationId));
  // }, [
  //   fetchCount,
  //   fetchAllIds,
  //   location.query.filters,
  //   datasetId,
  //   investigationId,
  // ]);

  // React.useEffect(() => {
  //   fetchData(parseInt(datasetId), parseInt(investigationId), {
  //     startIndex: 0,
  //     stopIndex: 49,
  //   });
  // }, [
  //   fetchData,
  //   location.query.sort,
  //   location.query.filters,
  //   datasetId,
  //   investigationId,
  // ]);

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={DatafileDetailsPanel}
      // actions={[
      //   function downloadButton({ rowData }: TableActionProps) {
      //     const { id, location } = rowData as Datafile;
      //     if (location) {
      //       return (
      //         <IconButton
      //           aria-label={t('datafiles.download')}
      //           key="download"
      //           onClick={() => {
      //             downloadData(id, location);
      //           }}
      //         >
      //           <GetApp />
      //         </IconButton>
      //       );
      //     } else {
      //       return null;
      //     }
      //   },
      // ]}
      columns={columns}
    />
  );
};

// const mapDispatchToProps = (
//   dispatch: ThunkDispatch<StateType, null, AnyAction>
// ): DatafileTableDispatchProps => ({
//   pushSort: (sort: string, order: Order | null) =>
//     dispatch(pushPageSort(sort, order)),

//   pushFilters: (filter: string, data: Filter | null) =>
//     dispatch(pushPageFilter(filter, data)),
//   fetchData: (
//     datasetId: number,
//     investigationId: number,
//     offsetParams: IndexRange
//   ) =>
//     dispatch(
//       fetchDatafiles({
//         offsetParams,
//         additionalFilters: [
//           {
//             filterType: 'where',
//             filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
//           },
//           {
//             filterType: 'where',
//             filterValue: JSON.stringify({
//               'dataset.investigation.id': { eq: investigationId },
//             }),
//           },
//         ],
//       })
//     ),
//   fetchCount: (datasetId: number, investigationId: number) =>
//     dispatch(
//       fetchDatafileCount([
//         {
//           filterType: 'where',
//           filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
//         },
//         {
//           filterType: 'where',
//           filterValue: JSON.stringify({
//             'dataset.investigation.id': { eq: investigationId },
//           }),
//         },
//       ])
//     ),
//   downloadData: (datafileId: number, filename: string) =>
//     dispatch(downloadDatafile(datafileId, filename)),
//   addToCart: (entityIds: number[]) =>
//     dispatch(addToCart('datafile', entityIds)),
//   removeFromCart: (entityIds: number[]) =>
//     dispatch(removeFromCart('datafile', entityIds)),
//   fetchAllIds: (datasetId: number, investigationId: number) =>
//     dispatch(
//       fetchAllIds('datafile', [
//         {
//           filterType: 'where',
//           filterValue: JSON.stringify({
//             'dataset.id': { eq: datasetId },
//           }),
//         },
//         {
//           filterType: 'where',
//           filterValue: JSON.stringify({
//             'dataset.investigation.id': { eq: investigationId },
//           }),
//         },
//       ])
//     ),
// });

// const mapStateToProps = (state: StateType): DatafileTableStoreProps => {
//   return {
//     location: state.router.location,
//     data: state.dgcommon.data,
//     totalDataCount: state.dgcommon.totalDataCount,
//     loading: state.dgcommon.loading,
//     error: state.dgcommon.error,
//     cartItems: state.dgcommon.cartItems,
//     allIds: state.dgcommon.allIds,
//     selectAllSetting: state.dgdataview.selectAllSetting,
//   };
// };

export default DatafileTable;
