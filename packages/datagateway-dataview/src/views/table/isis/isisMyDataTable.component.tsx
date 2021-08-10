import {
  ColumnType,
  formatBytes,
  Investigation,
  MicroFrontendId,
  NotificationType,
  parseSearchToQuery,
  readSciGatewayToken,
  Table,
  tableLink,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDateFilter,
  useIds,
  useInvestigationCount,
  useInvestigationsInfinite,
  useInvestigationSizes,
  usePushSort,
  useRemoveFromCart,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { StateType } from '../../../state/app.types';
import InvestigationDetailsPanel from '../../detailsPanels/isis/investigationDetailsPanel.component';

import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PublicIcon from '@material-ui/icons/Public';
import SaveIcon from '@material-ui/icons/Save';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router';

const ISISMyDataTable = (): React.ReactElement => {
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
  const location = useLocation();
  const { push } = useHistory();
  const [t] = useTranslation();
  const username = readSciGatewayToken().username || '';

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationUsers.user.name': { eq: username },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({ investigationUsers: 'user' }),
    },
  ]);
  const { fetchNextPage, data } = useInvestigationsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationUsers.user.name': { eq: username },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify([
        {
          investigationInstruments: 'instrument',
        },
        { investigationUsers: 'user' },
        { studyInvestigations: 'study' },
      ]),
    },
  ]);
  const { data: allIds } = useIds('investigation');
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');
  const { data: facilityCycles } = useAllFacilityCycles();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            allIds &&
            cartItem.entityType === 'investigation' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  const aggregatedData: Investigation[] = React.useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const sizeQueries = useInvestigationSizes(data);

  // Broadcast a SciGateway notification for any warning encountered.
  const broadcastWarning = (message: string): void => {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'warning',
            message,
          },
        },
      })
    );
  };

  React.useEffect(() => {
    if (localStorage.getItem('autoLogin') === 'true') {
      broadcastWarning(t('my_data_table.login_warning_msg'));
    }
  }, [t]);

  React.useEffect(() => {
    // Sort and filter by startDate upon load.
    if (!('startDate' in sort)) pushSort('startDate', 'desc');
    // we only want this to run on mount so ignore warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urlPrefix = React.useCallback(
    (investigationData: Investigation): string => {
      if (
        investigationData?.investigationInstruments?.[0]?.instrument &&
        facilityCycles
      ) {
        const facilityCycle = facilityCycles.find(
          (facilitycycle) =>
            facilitycycle.startDate &&
            facilitycycle.endDate &&
            investigationData.startDate &&
            facilitycycle.startDate <= investigationData.startDate &&
            facilitycycle.endDate >= investigationData.startDate
        );
        if (facilityCycle) {
          return `/browse/instrument/${investigationData.investigationInstruments[0].instrument.id}/facilityCycle/${facilityCycle.id}/investigation`;
        }
      }
      return '';
    },
    [facilityCycles]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => (
      <InvestigationDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        viewDatasets={(id: number) =>
          urlPrefix(rowData as Investigation)
            ? push(`${urlPrefix(rowData as Investigation)}/${id}/dataset`)
            : undefined
        }
      />
    ),
    [push, urlPrefix]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: TitleIcon,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          const url = urlPrefix(investigationData);
          if (url) {
            return tableLink(
              `${url}/${investigationData.id}`,
              investigationData.title,
              view
            );
          } else {
            return investigationData.title;
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: PublicIcon,
        label: t('investigations.doi'),
        dataKey: 'studyInvestigations.study.pid',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.studyInvestigations?.[0]?.study) {
            return investigationData.studyInvestigations[0].study.pid;
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: FingerprintIcon,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        icon: TitleIcon,
        label: t('investigations.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          const url = urlPrefix(investigationData);
          if (url) {
            return tableLink(
              `${url}/${investigationData.id}`,
              investigationData.name,
              view
            );
          } else {
            return investigationData.name;
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: AssessmentIcon,
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.investigationInstruments?.[0]?.instrument) {
            return investigationData.investigationInstruments[0].instrument
              .fullName;
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: SaveIcon,
        label: t('investigations.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string => {
          const sizeQuery = sizeQueries[cellProps.rowIndex];
          if (sizeQuery?.isFetching) {
            return 'Calculating...';
          } else {
            return formatBytes(sizeQuery?.data) ?? 'Unknown';
          }
        },
        disableSort: true,
      },
      {
        icon: CalendarTodayIcon,
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, dateFilter, urlPrefix, view, sizeQueries]
  );

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={detailsPanel}
      columns={columns}
    />
  );
};

export default ISISMyDataTable;
