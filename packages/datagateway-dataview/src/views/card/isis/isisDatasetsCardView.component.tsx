import React from 'react';

import { IndexRange } from 'react-virtualized';
import {
  CardView,
  Entity,
  DownloadCartItem,
  fetchDatasets,
  fetchDatasetDetails,
  downloadDataset,
  fetchDatasetCount,
  addToCart,
  removeFromCart,
  Dataset,
  tableLink,
  formatBytes,
  TextColumnFilter,
  TextFilter,
  DateColumnFilter,
  DateFilter,
  Filter,
  pushPageFilter,
  QueryParams,
  pushPageNum,
  pushQuery,
  ViewsType,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { Action, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
  GetApp,
  Save,
  CalendarToday,
} from '@material-ui/icons';
import DatasetDetailsPanel from '../../detailsPanels/isis/datasetDetailsPanel.component';
import { push } from 'connected-react-router';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISDatasetCVDispatchProps {
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
  downloadData: (datasetId: number, name: string) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
  viewDatafiles: (urlPrefix: string, view: ViewsType) => (id: number) => Action;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISDatasetCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  query: QueryParams;
  loadedData: boolean;
  loadedCount: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISDatasetCardViewProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  studyHierarchy: boolean;
}

type ISISDatasetCVCombinedProps = ISISDatasetCVDispatchProps &
  ISISDatasetCVStateProps &
  ISISDatasetCardViewProps;

const ISISDatasetsCardView = (
  props: ISISDatasetCVCombinedProps
): React.ReactElement => {
  const {
    instrumentId,
    instrumentChildId,
    investigationId,
    data,
    totalDataCount,
    cartItems,
    query,
    loadedData,
    loadedCount,
    fetchData,
    fetchCount,
    fetchDetails,
    addToCart,
    removeFromCart,
    downloadData,
    pushFilters,
    pushPage,
    pushQuery,
    viewDatafiles,
    studyHierarchy,
  } = props;

  const filters = query.filters;
  const [t] = useTranslation();

  const selectedCards = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'dataset' &&
            data.map((dataset) => dataset.id).includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, data]
  );

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation/${investigationId}/dataset`;
  const loadCount = React.useCallback(
    () => fetchCount(parseInt(investigationId)),
    [fetchCount, investigationId]
  );
  const loadData = React.useCallback(
    (params) => fetchData(parseInt(investigationId), params),
    [fetchData, investigationId]
  );

  return (
    <CardView
      data={data}
      loadData={loadData}
      loadCount={loadCount}
      totalDataCount={totalDataCount}
      query={query}
      onPageChange={pushPage}
      onFilter={pushFilters}
      pushQuery={pushQuery}
      loadedData={loadedData}
      loadedCount={loadedCount}
      title={{
        label: t('datasets.name'),
        dataKey: 'name',
        content: (dataset: Dataset) =>
          tableLink(`${urlPrefix}/${dataset.id}`, dataset.name, query.view),
        filterComponent: textFilter,
      }}
      description={{
        label: t('datasets.details.description'),
        dataKey: 'description',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Save />,
          label: t('datasets.size'),
          dataKey: 'size',
          content: (dataset: Dataset) => formatBytes(dataset.size),
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: t('datasets.create_time'),
          dataKey: 'createTime',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('datasets.modified_time'),
          dataKey: 'modTime',
          filterComponent: dateFilter,
        },
      ]}
      moreInformation={(dataset: Dataset) => (
        <DatasetDetailsPanel
          rowData={dataset}
          fetchDetails={fetchDetails}
          viewDatafiles={viewDatafiles(urlPrefix, query.view)}
        />
      )}
      buttons={[
        function cartButton(dataset: Dataset) {
          return !(selectedCards && selectedCards.includes(dataset.id)) ? (
            <Button
              id="add-to-cart-btn"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineOutlined />}
              disableElevation
              onClick={() => addToCart([dataset.id])}
            >
              Add to cart
            </Button>
          ) : (
            <Button
              id="remove-from-cart-btn"
              variant="contained"
              color="secondary"
              startIcon={<RemoveCircleOutlineOutlined />}
              disableElevation
              onClick={() => {
                if (selectedCards && selectedCards.includes(dataset.id))
                  removeFromCart([dataset.id]);
              }}
            >
              Remove from cart
            </Button>
          );
        },
        function downloadButton(dataset: Dataset) {
          return (
            <Button
              id="download-btn"
              variant="outlined"
              aria-label="Download"
              key="download"
              color="primary"
              startIcon={<GetApp />}
              disableElevation
              onClick={() => downloadData(dataset.id, dataset.name)}
            >
              Download
            </Button>
          );
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISDatasetCVDispatchProps => ({
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatasets({
        offsetParams,
        getSize: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'investigation.id': { eq: investigationId },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify('investigation'),
          },
        ],
      })
    ),
  fetchCount: (investigationId: number) =>
    dispatch(
      fetchDatasetCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigation.id': { eq: investigationId },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify('investigation'),
        },
      ])
    ),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  downloadData: (datasetId: number, name: string) =>
    dispatch(downloadDataset(datasetId, name)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
  viewDatafiles: (urlPrefix: string, view: ViewsType) => {
    return (id: number) => {
      const url = view
        ? `${urlPrefix}/${id}/datafile?view=${view}`
        : `${urlPrefix}/${id}/datafile`;
      return dispatch(push(url));
    };
  },
});

const mapStateToProps = (state: StateType): ISISDatasetCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    query: state.dgcommon.query,
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISDatasetsCardView);
