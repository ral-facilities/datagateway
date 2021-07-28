import {
  formatBytes,
  Investigation,
  Table,
  tableLink,
  useISISInvestigationsInfinite,
  useISISInvestigationCount,
  useISISInvestigationIds,
  ColumnType,
  parseSearchToQuery,
  useAddToCart,
  useCart,
  useDateFilter,
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
import { useHistory, useLocation } from 'react-router';

interface ISISInvestigationsTableProps {
  instrumentId: string;
  instrumentChildId: string;
  studyHierarchy: boolean;
}

const ISISInvestigationsTable = (
  props: ISISInvestigationsTableProps
): React.ReactElement => {
  const { instrumentId, instrumentChildId, studyHierarchy } = props;
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
  const location = useLocation();
  const { push } = useHistory();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useISISInvestigationCount(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    studyHierarchy
  );
  const { fetchNextPage, data } = useISISInvestigationsInfinite(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    studyHierarchy
  );
  const { data: allIds } = useISISInvestigationIds(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    studyHierarchy
  );
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');

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

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation`;

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => (
      <InvestigationDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        viewDatasets={(id: number) => push(`${urlPrefix}/${id}/dataset`)}
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
          return tableLink(
            `${urlPrefix}/${investigationData.id}`,
            investigationData.title,
            view
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: FingerprintIcon,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `${urlPrefix}/${investigationData.id}`,
            investigationData.visitId,
            view
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: FingerprintIcon,
        label: t('investigations.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `${urlPrefix}/${investigationData.id}`,
            investigationData.name,
            view
          );
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
            return tableLink(
              `${urlPrefix}/${investigationData.id}`,
              investigationData.studyInvestigations[0].study.pid,
              view
            );
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
          const countQuery = sizeQueries[cellProps.rowIndex];
          if (countQuery?.isFetching) {
            return 'Calculating...';
          } else {
            return formatBytes(countQuery?.data) ?? 'Unknown';
          }
        },
        disableSort: true,
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
      totalRowCount={totalDataCount}
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

export default ISISInvestigationsTable;
