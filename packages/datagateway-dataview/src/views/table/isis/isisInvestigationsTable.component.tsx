import {
  formatCountOrSize,
  Investigation,
  Table,
  tableLink,
  externalSiteLink,
  useISISInvestigationsInfinite,
  useISISInvestigationCount,
  useISISInvestigationIds,
  ColumnType,
  parseSearchToQuery,
  useAddToCart,
  useCart,
  useDateFilter,
  useInvestigationSizes,
  usePrincipalExperimenterFilter,
  useSort,
  useRemoveFromCart,
  useTextFilter,
  TableActionProps,
  DownloadButton,
  ISISInvestigationDetailsPanel,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { StateType } from '../../../state/app.types';

import {
  Subject,
  Fingerprint,
  Public,
  Save,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

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
  const { data: allIds, isLoading: allIdsLoading } = useISISInvestigationIds(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    studyHierarchy,
    selectAllSetting
  );
  const { data: cartItems, isLoading: cartLoading } = useCart();
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
            cartItem.entityType === 'investigation' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  const aggregatedData: Investigation[] = React.useMemo(
    () =>
      data
        ? 'pages' in data
          ? data.pages.flat()
          : data instanceof Array
          ? data
          : []
        : [],
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const principalExperimenterFilter = usePrincipalExperimenterFilter(filters);

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
      <ISISInvestigationDetailsPanel
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
        icon: Subject,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `${urlPrefix}/${investigationData.id}`,
            investigationData.title,
            view,
            'isis-investigations-table-title'
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'studyInvestigations.study.pid',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.studyInvestigations?.[0]?.study) {
            return externalSiteLink(
              `https://doi.org/${investigationData.studyInvestigations[0].study.pid}`,
              investigationData.studyInvestigations[0].study.pid,
              'isis-investigations-table-doi-link'
            );
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('investigations.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatCountOrSize(sizeQueries[cellProps.rowIndex], true),
        disableSort: true,
      },
      {
        icon: Person,
        label: t('investigations.principal_investigators'),
        dataKey: 'investigationUsers.user.fullName',
        disableSort: true,
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          const principal_investigators = investigationData?.investigationUsers?.filter(
            (iu) => iu.role === 'principal_experimenter'
          );
          if (principal_investigators && principal_investigators.length !== 0) {
            return principal_investigators?.[0].user?.fullName;
          } else {
            return '';
          }
        },
        filterComponent: principalExperimenterFilter,
      },
      {
        icon: CalendarToday,
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,

        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [
      t,
      textFilter,
      principalExperimenterFilter,
      dateFilter,
      urlPrefix,
      view,
      sizeQueries,
    ]
  );

  return (
    <Table
      loading={
        addToCartLoading ||
        removeFromCartLoading ||
        cartLoading ||
        allIdsLoading
      }
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={handleSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={detailsPanel}
      actions={[
        ({ rowData }: TableActionProps) => (
          <DownloadButton
            entityType="investigation"
            entityId={rowData.id}
            entityName={rowData.name}
            variant="icon"
            entitySize={
              sizeQueries[aggregatedData.indexOf(rowData as Investigation)]
                ?.data ?? -1
            }
          />
        ),
      ]}
      columns={columns}
    />
  );
};

export default ISISInvestigationsTable;
