import React from 'react';
import {
  Subject,
  CalendarToday,
  Assessment,
  Fingerprint,
  Explore,
  Save,
} from '@mui/icons-material';
import {
  Table,
  parseSearchToQuery,
  useTextFilter,
  useDateFilter,
  ColumnType,
  useSort,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  DLSDatasetDetailsPanel,
  useDataPublicationContent,
  useDataPublicationContentCount,
  Investigation,
  formatBytes,
  DLSVisitDetailsPanel,
  DLSDatafileDetailsPanel,
} from 'datagateway-common';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';

interface DLSDataPublicationContentTableProps {
  dataPublicationId: string;
}

const DLSDataPublicationContentTable = (
  props: DLSDataPublicationContentTableProps
): React.ReactElement => {
  const { dataPublicationId } = props;

  const [currentTab, setCurrentTab] = React.useState<
    'investigation' | 'dataset' | 'datafile'
  >('investigation');

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: 'investigation' | 'dataset' | 'datafile'
  ): void => {
    setCurrentTab(newValue);
    // remove any applied sorts/filters on tab change
    history.replace({
      search: '',
    });
  };

  const [t] = useTranslation();

  const location = useLocation();
  const history = useHistory();

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart(currentTab);
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart(currentTab);

  const { data: totalDataCount } = useDataPublicationContentCount(
    dataPublicationId,
    currentTab
  );

  const { fetchNextPage, data } = useDataPublicationContent(
    dataPublicationId,
    currentTab
  );

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const aggregatedData = React.useMemo(() => {
    if (data) {
      if ('pages' in data) {
        return data.pages.flat();
      } else if ((data as unknown) instanceof Array) {
        return data;
      }
    }

    return [];
  }, [data]);

  const columns: ColumnType[] = React.useMemo(() => {
    if (currentTab === 'investigation') {
      return [
        {
          icon: Fingerprint,
          label: t('investigations.visit_id'),
          dataKey: 'visitId',
          filterComponent: textFilter,
        },
        // TODO: add fileSize or fileCount depending on what DLS want
        {
          icon: Assessment,
          label: t('investigations.instrument'),
          dataKey: 'investigationInstruments.instrument.name',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            if (investigationData?.investigationInstruments?.[0]?.instrument) {
              return investigationData.investigationInstruments[0].instrument
                .name;
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          icon: CalendarToday,
          label: t('investigations.start_date'),
          dataKey: 'startDate',
          filterComponent: dateFilter,
        },
        {
          icon: CalendarToday,
          label: t('investigations.end_date'),
          dataKey: 'endDate',
          filterComponent: dateFilter,
        },
      ];
    } else if (currentTab === 'dataset') {
      return [
        {
          icon: Subject,
          label: t('datasets.name'),
          dataKey: 'name',
          filterComponent: textFilter,
        },
        // TODO: add fileSize or fileCount depending on what DLS want
        {
          icon: CalendarToday,
          label: t('datasets.create_time'),
          dataKey: 'createTime',
          filterComponent: dateFilter,
        },
        {
          icon: CalendarToday,

          label: t('datasets.modified_time'),
          dataKey: 'modTime',
          filterComponent: dateFilter,
        },
      ];
    } else if (currentTab === 'datafile') {
      return [
        {
          icon: Subject,
          label: t('datafiles.name'),
          dataKey: 'name',
          filterComponent: textFilter,
        },
        {
          icon: Explore,
          label: t('datafiles.location'),
          dataKey: 'location',
          filterComponent: textFilter,
        },
        {
          icon: Save,
          label: t('datafiles.size'),
          dataKey: 'fileSize',
          cellContentRenderer: (cellProps) => {
            return formatBytes(cellProps.cellData);
          },
          filterComponent: textFilter,
        },
        {
          icon: CalendarToday,
          label: t('datafiles.create_time'),
          dataKey: 'createTime',
          filterComponent: dateFilter,
        },
      ];
    } else {
      // shouldn't happen
      return [];
    }
  }, [t, textFilter, dateFilter, currentTab]);

  const detailsPanel = React.useMemo(() => {
    if (currentTab === 'investigation') {
      return DLSVisitDetailsPanel;
    } else if (currentTab === 'dataset') {
      return DLSDatasetDetailsPanel;
    } else if (currentTab === 'datafile') {
      return DLSDatafileDetailsPanel;
    }
  }, [currentTab]);

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter((cartItem) => cartItem.entityType === currentTab)
        .map((cartItem) => cartItem.entityId),
    [cartItems, currentTab]
  );

  // TODO: not sure of easy way to implement isParentSelected...
  // const isParentSelected = React.useMemo(() => {
  //   return cartItems?.some(
  //     (cartItem) =>
  //       cartItem.entityType === currentTab &&
  //       cartItem.entityId.toString() === investigationId
  //   );
  // }, [cartItems]);

  const [yPos, setYPos] = React.useState(0);
  const measuredRef = (node: HTMLDivElement): void => {
    if (node !== null) {
      setYPos(node.getBoundingClientRect().y);
    }
  };

  return (
    <>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        aria-label={t('datapublications.content_tab_entity_tabs_aria_label')}
        indicatorColor="secondary"
        textColor="secondary"
      >
        <Tab
          label={t('breadcrumbs.investigation_other')}
          value="investigation"
        />
        <Tab label={t('breadcrumbs.dataset_other')} value="dataset" />
        <Tab label={t('breadcrumbs.datafile_other')} value="datafile" />
      </Tabs>
      {/* add a div just so we can set the height of the table correctly */}
      <div
        ref={measuredRef}
        // calculate height using 100vh - our current y position - SG footer - padding
        style={{ height: `calc(100vh - ${yPos}px - 36px - 8px - 8px - 4px)` }}
      >
        <Table
          loading={addToCartLoading || removeFromCartLoading || cartLoading}
          data={aggregatedData}
          loadMoreRows={loadMoreRows}
          totalRowCount={totalDataCount ?? 0}
          sort={sort}
          onSort={handleSort}
          selectedRows={selectedRows}
          onCheck={addToCart}
          onUncheck={removeFromCart}
          disableSelectAll={true}
          detailsPanel={detailsPanel}
          columns={columns}
          // key prop forces the table to fully rerender on entity type change
          // which means default column sizes get properly set
          key={currentTab}
        />
      </div>
    </>
  );
};

export default DLSDataPublicationContentTable;
