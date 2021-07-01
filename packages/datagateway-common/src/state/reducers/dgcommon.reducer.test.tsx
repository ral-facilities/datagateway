import DGCommonReducer, { initialState } from './dgcommon.reducer';
import { DGCommonState, EntityCache, QueryParams } from '../app.types';
import {
  addToCartFailure,
  addToCartRequest,
  addToCartSuccess,
  clearTable,
  downloadDatafileFailure,
  downloadDatafileRequest,
  downloadDatafileSuccess,
  downloadDatasetFailure,
  downloadDatasetRequest,
  downloadDatasetSuccess,
  fetchAllIdsFailure,
  fetchAllIdsRequest,
  fetchAllIdsSuccess,
  fetchDatafileCountFailure,
  fetchDatafileCountRequest,
  fetchDatafileCountSuccess,
  fetchDatafileDetailsFailure,
  fetchDatafileDetailsRequest,
  fetchDatafileDetailsSuccess,
  fetchDatafilesFailure,
  fetchDatafilesRequest,
  fetchDatafilesSuccess,
  fetchDatasetCountFailure,
  fetchDatasetCountRequest,
  fetchDatasetCountSuccess,
  fetchDatasetDatafilesCountFailure,
  fetchDatasetDatafilesCountRequest,
  fetchDatasetDatafilesCountSuccess,
  fetchDatasetDetailsFailure,
  fetchDatasetDetailsRequest,
  fetchDatasetDetailsSuccess,
  fetchDatasetsFailure,
  fetchDatasetSizeSuccess,
  fetchDatasetsRequest,
  fetchDatasetsSuccess,
  fetchDownloadCartFailure,
  fetchDownloadCartRequest,
  fetchDownloadCartSuccess,
  fetchFacilityCycleCountFailure,
  fetchFacilityCycleCountRequest,
  fetchFacilityCycleCountSuccess,
  fetchFacilityCyclesFailure,
  fetchFacilityCyclesRequest,
  fetchFacilityCyclesSuccess,
  fetchInstrumentCountFailure,
  fetchInstrumentCountRequest,
  fetchInstrumentCountSuccess,
  fetchInstrumentDetailsFailure,
  fetchInstrumentDetailsRequest,
  fetchInstrumentDetailsSuccess,
  fetchInstrumentsFailure,
  fetchInstrumentsRequest,
  fetchInstrumentsSuccess,
  fetchInvestigationDatasetsCountFailure,
  fetchInvestigationDatasetsCountRequest,
  fetchInvestigationDatasetsCountSuccess,
  fetchInvestigationDetailsFailure,
  fetchInvestigationDetailsRequest,
  fetchInvestigationDetailsSuccess,
  fetchInvestigationSizeFailure,
  fetchInvestigationSizeRequest,
  fetchInvestigationSizeSuccess,
  fetchInvestigationsRequest,
  fetchInvestigationsSuccess,
  fetchInvestigationsFailure,
  fetchInvestigationCountRequest,
  fetchInvestigationCountSuccess,
  fetchInvestigationCountFailure,
  fetchFilterRequest,
  fetchFilterSuccess,
  clearData,
  updateSaveView,
  updateQueryParams,
  updateSort,
  updateFilters,
  updateResults,
  updatePage,
  updateSearch,
  updateView,
  fetchStudiesRequest,
  fetchStudiesSuccess,
  fetchStudiesFailure,
  fetchStudyCountRequest,
  fetchStudyCountSuccess,
  fetchStudyCountFailure,
  removeFromCartFailure,
  removeFromCartSuccess,
  removeFromCartRequest,
  filterTable,
  loadFacilityName,
  loadUrls,
  sortTable,
} from '../actions';

import {
  Investigation,
  Dataset,
  Datafile,
  Instrument,
  FacilityCycle,
  DownloadCart,
  StudyInvestigation,
} from '../../app.types';
import {
  fetchLuceneIdsRequest,
  fetchLuceneIdsSuccess,
} from '../actions/lucene';

describe('DGCommon reducer', () => {
  let state: DGCommonState;
  const invalidTimestamp = 0;
  let validTimestamp = 0;

  beforeEach(() => {
    state = { ...initialState };
    validTimestamp = Date.now() + 1000;
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGCommonReducer(state, { type: 'irrelevant action' });

    expect(updatedState).toBe(state);
  });

  it('should set the sort state when given a SortTable action with asc or desc order', () => {
    expect(state.query.sort).toEqual({});

    const updatedState = DGCommonReducer(state, sortTable('test', 'asc'));
    expect(updatedState.query.sort).toEqual({ test: 'asc' });
  });

  it('should remove column from sort state when given a SortTable action with null order', () => {
    state = {
      ...initialState,
      query: {
        ...initialState.query,
        sort: {
          test: 'asc',
        },
      },
    };

    const updatedState = DGCommonReducer(state, sortTable('test', null));
    expect(updatedState.query.sort).toEqual({});
  });

  it('should set the filters state when given a FilterTable action', () => {
    expect(state.query.filters).toEqual({});

    const updatedState = DGCommonReducer(
      state,
      filterTable('test column', 'test filter')
    );
    expect(updatedState.query.filters).toEqual({
      'test column': 'test filter',
    });
  });

  it('should remove column from filter state when given a FilterTable action with null filter', () => {
    state = {
      ...initialState,
      query: {
        ...initialState.query,
        filters: {
          test: 'test filter',
        },
      },
    };

    const updatedState = DGCommonReducer(state, filterTable('test', null));
    expect(updatedState.query.filters).toEqual({});
  });

  it('should clear the table state when given a ClearTable action', () => {
    state = {
      ...initialState,
      data: [{ id: 1, name: 'test' }],
      totalDataCount: 1,
      loading: true,
      downloading: true,
      error: 'test error',
      query: {
        view: 'table',
        search: 'searchOne',
        page: 1,
        results: 1,
        sort: { name: 'asc' },
        filters: { name: 't' },
      },
      savedQuery: {
        view: 'card',
        search: 'searchTwo',
        page: 2,
        results: 2,
        sort: { name: 'desc' },
        filters: { name: 'c' },
      },
      savedQuery: {
        view: 'card',
        search: 'searchTwo',
        page: 2,
        results: 2,
        sort: { name: 'desc' },
        filters: { name: 'c' },
      },
    };

    const updatedState = DGCommonReducer(state, clearTable());
    expect(updatedState).toEqual({
      ...initialState,
      data: [],
      totalDataCount: 0,
      loading: false,
      downloading: false,
      error: null,
      query: initialState.query,
      savedQuery: initialState.savedQuery,
    });
  });

  it('should clear data only when given a clearData action', () => {
    state = {
      ...initialState,
      data: [{ id: 1, name: 'test' }],
      totalDataCount: 1,
      loading: true,
      downloading: true,
      error: 'test error',
      query: {
        view: 'table',
        search: 'searchOne',
        page: 1,
        results: 1,
        sort: { name: 'asc' },
        filters: { name: 't' },
      },
    };

    const updatedState = DGCommonReducer(state, clearData());
    expect(updatedState).toEqual({
      ...initialState,
      data: [],
      totalDataCount: 1,
      loading: true,
      downloading: true,
      error: 'test error',
      query: {
        view: 'table',
        search: 'searchOne',
        page: 1,
        results: 1,
        sort: { name: 'asc' },
        filters: { name: 't' },
      },
    });
  });

  it('should save state on a saveView action without a saved view already present', () => {
    const queryOne: QueryParams = {
      view: 'table',
      search: 'searchOne',
      page: 1,
      results: 1,
      sort: { name: 'asc' },
      filters: { name: 't' },
    };
    state = {
      ...initialState,
      query: queryOne,
      data: [{ id: 1, name: 'test' }],
    };

    const updatedState = DGCommonReducer(state, updateSaveView('table'));
    expect(updatedState).toEqual({
      ...initialState,
      data: [],
      totalDataCount: 0,
      query: {
        view: null,
        search: null,
        page: null,
        results: null,
        sort: { name: 'asc' },
        filters: { name: 't' },
      },
      savedQuery: {
        sort: {},
        filters: {},
        search: 'searchOne',
        page: 1,
        results: 1,
        view: 'table',
      },
    });
  });

  it('should save state on a saveView action with saved view already present', () => {
    const queryOne: QueryParams = {
      view: 'table',
      search: 'searchOne',
      page: 1,
      results: 1,
      sort: { name: 'asc' },
      filters: { TABLE: 't', CUSTOM: ['1', '2', '3'] },
    };
    const queryTwo: QueryParams = {
      view: 'card',
      search: 'searchTwo',
      page: 2,
      results: 2,
      filters: { CARD: 'c' },
      sort: { name: 'desc' },
    };
    state = {
      ...initialState,
      data: [{ id: 1, name: 'test' }],
      totalDataCount: 1,
      query: queryOne,
      savedQuery: queryTwo,
    };

    const updatedState = DGCommonReducer(state, updateSaveView('table'));
    expect(updatedState).toEqual({
      ...initialState,
      data: [],
      totalDataCount: 0,
      query: {
        ...queryTwo,
        sort: queryOne.sort,
        filters: { CARD: 'c', TABLE: 't' },
      },
      savedQuery: {
        ...queryOne,
        sort: queryTwo.sort,
        filters: { CUSTOM: ['1', '2', '3'] },
      },
    });
  });

  describe('timestamps', () => {
    it('should ignore data requests with invalid timestamps', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationsRequest(invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore data successes with invalid timestamps', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchDatasetsSuccess([], invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore count requests with invalid timestamps', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchDatafileCountRequest(invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore count successes with invalid timestamps', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentCountSuccess(1, invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore allIds requests with invalid timestamps', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchAllIdsRequest(invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore allIds successes with invalid timestamps', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchAllIdsSuccess([1], invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should update dataTimestamp when given a valid fetchDataRequest', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchDatafilesRequest(validTimestamp)
      );
      expect(updatedState.dataTimestamp).toBe(validTimestamp);
    });

    it('should update dataTimestamp when given a valid fetchDataSuccess', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchFacilityCyclesSuccess([], validTimestamp)
      );
      expect(updatedState.dataTimestamp).toBe(validTimestamp);
    });

    it('should update countTimestamp when given a valid fetchCountRequest', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchDatasetCountRequest(validTimestamp)
      );
      expect(updatedState.countTimestamp).toBe(validTimestamp);
    });

    it('should update countTimestamp when given a valid fetchCountSuccess', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationCountSuccess(1, validTimestamp)
      );
      expect(updatedState.countTimestamp).toBe(validTimestamp);
      expect(updatedState.loadedData).toBeFalsy();
    });

    it('should set loadedData when fetchCountSuccess has count of 0', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationCountSuccess(0, validTimestamp)
      );
      expect(updatedState.countTimestamp).toBe(validTimestamp);
      expect(updatedState.loadedData).toBeTruthy();
    });

    it('should update allIdsTimestamp when given a valid fetchAllIdsRequest', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchAllIdsRequest(validTimestamp)
      );
      expect(updatedState.allIdsTimestamp).toBe(validTimestamp);
    });

    it('should update allIdsTimestamp when given a valid fetchAllIdsSuccess', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchAllIdsSuccess([1], validTimestamp)
      );
      expect(updatedState.allIdsTimestamp).toBe(validTimestamp);
    });
  });

  it('should set facility name property when configure facility name action is sent', () => {
    expect(state.facilityName).toEqual('');

    const updatedState = DGCommonReducer(state, loadFacilityName('Generic'));

    expect(updatedState.facilityName).toEqual('Generic');
  });

  it('should set urls property when configure urls action is sent', () => {
    expect(state.urls.apiUrl).toEqual('');

    const updatedState = DGCommonReducer(
      state,
      loadUrls({
        ...state.urls,
        apiUrl: 'test',
      })
    );

    expect(updatedState.urls.apiUrl).toEqual('test');
  });

  describe('FetchInvestigations actions', () => {
    it('should set the loading state when given a FetchInvestigationsRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchInvestigationsSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
          rbNumber: '1',
          doi: 'doi 1',
          size: 1,
          startDate: '2019-06-10',
          endDate: '2019-06-11',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 1',
          visitId: '2',
          rbNumber: '2',
          doi: 'doi 2',
          size: 10000,
          startDate: '2019-06-10',
          endDate: '2019-06-12',
        },
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationsSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInvestigationsFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInvestigationDetails actions', () => {
    it('should not update state when given a FetchInvestigationDetailsRequest action', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationDetailsRequest()
      );
      expect(updatedState).toEqual(state);
    });

    it('should update the data state and reset error state when given a FetchInvestigationDetailsSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
          rbNumber: '1',
          doi: 'doi 1',
          size: 1,
          startDate: '2019-06-10',
          endDate: '2019-06-11',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 1',
          visitId: '2',
          rbNumber: '2',
          doi: 'doi 2',
          size: 10000,
          startDate: '2019-06-10',
          endDate: '2019-06-12',
        },
      ];

      state.data = mockData;

      const investigationDetails = {
        ...mockData[0],
        investigationUsers: [
          {
            id: 3,
            role: 'Investigator',
            user: { id: 4, name: 'Louise' },
          },
        ],
      };

      const mockDataUpdated: Investigation[] = [
        investigationDetails,
        mockData[1],
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationDetailsSuccess([investigationDetails])
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchInvestigationDetailsFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationDetailsFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInvestigationSize and FetchDatasetSize actions', () => {
    const mockData: Investigation[] = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
        rbNumber: '1',
        doi: 'doi 1',
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
      {
        id: 2,
        title: 'Test 2',
        name: 'Test 1',
        visitId: '2',
        rbNumber: '2',
        doi: 'doi 2',
        size: 10000,
        startDate: '2019-06-10',
        endDate: '2019-06-12',
      },
    ];

    it('should have the same state when given a FetchSizeRequest', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationSizeRequest()
      );

      expect(updatedState).toEqual(state);
    });

    it('should set the data and investigationCache state when given a FetchInvestigationSize action', () => {
      state.data = mockData;

      const mockDataUpdated = [{ ...mockData[0], size: 1 }, mockData[1]];
      const mockInvestigationCacheUpdated: EntityCache = {
        1: {
          childEntitySize: 1,
        },
      };

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationSizeSuccess(1, 1)
      );
      expect(updatedState.investigationCache).toEqual(
        mockInvestigationCacheUpdated
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the data and datasetCache state when given a FetchDatasetSize action', () => {
      state.data = mockData;

      const mockDataUpdated = [mockData[0], { ...mockData[1], size: 10000 }];
      const mockDatasetCacheUpdated: EntityCache = {
        2: {
          childEntitySize: 10000,
        },
      };

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetSizeSuccess(2, 10000)
      );
      expect(updatedState.datasetCache).toEqual(mockDatasetCacheUpdated);
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchInvestigationSizeFailure action', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationSizeFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInvestigationCount actions', () => {
    it('should set the loading state when given a FetchInvestigationCountRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchInvestigationCountSuccess action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationCountSuccess(11, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(11);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInvestigationCountFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationCountFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(0);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasets actions', () => {
    it('should set the loading state when given a FetchDatasetsRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchDatasetsSuccess action', () => {
      state.loading = true;
      const mockData: Dataset[] = [
        {
          id: 1,
          name: 'Test 1',
          modTime: '2019-06-10',
          createTime: '2019-06-11',
        },
        {
          id: 2,
          name: 'Test 2',
          modTime: '2019-06-10',
          createTime: '2019-06-12',
        },
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetsSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatasetsFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasetDetails actions', () => {
    it('should not update state when given a FetchDatasetDetailsRequest action', () => {
      const updatedState = DGCommonReducer(state, fetchDatasetDetailsRequest());
      expect(updatedState).toEqual(state);
    });

    it('should update the data state and reset error state when given a FetchDatasetDetailsSuccess action', () => {
      state.loading = true;
      const mockData: Dataset[] = [
        {
          id: 1,
          name: 'Test 1',
          modTime: '2019-06-10',
          createTime: '2019-06-11',
        },
        {
          id: 2,
          name: 'Test 2',
          modTime: '2019-06-10',
          createTime: '2019-06-12',
        },
      ];

      state.data = mockData;

      const datasetDetails = {
        ...mockData[0],
        type: {
          id: 3,
          name: 'Test type',
        },
      };

      const mockDataUpdated: Dataset[] = [datasetDetails, mockData[1]];

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetDetailsSuccess([datasetDetails])
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatasetDetailsFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetDetailsFailure('Test error message')
      );

      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasetCount actions', () => {
    it('should set the loading state when given a FetchDatasetCountRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchDatasetCountSuccess action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetCountSuccess(12, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(12);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatasetCountFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetCountFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(0);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('DownloadDataset actions', () => {
    it('should set the downloading state to true when given a DownloadDatasetRequest action', () => {
      expect(state.downloading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        downloadDatasetRequest(validTimestamp)
      );
      expect(updatedState.downloading).toBe(true);
    });

    it('should set the downloading state to false when given a DownloadDatasetSuccess action', () => {
      state.downloading = true;

      const updatedState = DGCommonReducer(state, downloadDatasetSuccess());
      expect(updatedState.downloading).toBe(false);
    });

    it('should set the error state and the downloading state to false when given a DownloadDatasetFailure action', () => {
      state.downloading = true;

      const updatedState = DGCommonReducer(
        state,
        downloadDatasetFailure('Test error message')
      );
      expect(updatedState.downloading).toBe(false);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInvestigationDatasetsCount actions', () => {
    it('should set loading when given a FetchInvestigationDatasetsCountRequest action', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationDatasetsCountRequest(validTimestamp)
      );
      expect(updatedState).toEqual({ ...state, loading: true });
    });

    it('should set the data state and reset error and loading state when given a FetchInvestigationDatasetsCountSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
          rbNumber: '1',
          doi: 'doi 1',
          size: 1,
          startDate: '2019-06-10',
          endDate: '2019-06-11',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 2',
          visitId: '2',
          rbNumber: '2',
          doi: 'doi 2',
          size: 10000,
          startDate: '2019-06-10',
          endDate: '2019-06-12',
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Investigation[] = [
        { ...mockData[0], datasetCount: 2 },
        mockData[1],
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationDatasetsCountSuccess(1, 2, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the data state with cached dataset count and reset error and loading state when given a FetchInvestigationDatasetsCountSuccess action', () => {
      state.loading = true;

      state.investigationCache = {
        1: {
          childEntityCount: 3,
        },
        2: {
          childEntityCount: 5,
        },
      };

      const mockData: Investigation[] = [
        {
          id: 3,
          title: 'Test 3',
          visitId: '3',
          rbNumber: '3',
          doi: 'doi 3',
          size: 1,
          instrument: {
            name: 'LARMOR',
          },
          startDate: '2019-10-08',
          endDate: '2019-10-08',
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Investigation[] = [
        { ...mockData[0], datasetCount: 4 },
      ];

      const mockInvestigationCacheUpdated: EntityCache = {
        1: {
          childEntityCount: 3,
        },
        2: {
          childEntityCount: 5,
        },
        3: {
          childEntityCount: 4,
        },
      };

      // We give the investigation ID of 3 and the new dataset count (we would cache) as 4.
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationDatasetsCountSuccess(3, 4, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.investigationCache).toEqual(
        mockInvestigationCacheUpdated
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchInvestigationDatasetsCountFailure action', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInvestigationDatasetsCountFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatafiles actions', () => {
    it('should set the loading state when given a FetchDatafilesRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchDatafilesRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchDatafilesSuccess action', () => {
      state.loading = true;
      const mockData: Datafile[] = [
        {
          id: 1,
          name: 'Test 1',
          location: '/test1',
          fileSize: 1,
          modTime: '2019-06-10',
          createTime: '2019-06-10',
        },
        {
          id: 2,
          name: 'Test 2',
          location: '/test2',
          fileSize: 2,
          modTime: '2019-06-10',
          createTime: '2019-06-10',
        },
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchDatafilesSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatafilesFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchDatafilesFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatafileCount actions', () => {
    it('should set the loading state when given a FetchDatafileCountRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchDatafileCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchDatafileCountSuccess action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchDatafileCountSuccess(13, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(13);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatafileCountFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchDatafileCountFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(0);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatafileDetails actions', () => {
    it('should not update state when given a FetchDatafileDetailsRequest action', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchDatafileDetailsRequest()
      );
      expect(updatedState).toEqual(state);
    });

    it('should update the data state and reset error state when given a FetchDatafileDetailsSuccess action', () => {
      state.loading = true;
      const mockData: Datafile[] = [
        {
          id: 1,
          name: 'Test 1',
          location: '/test1',
          fileSize: 1,
          modTime: '2019-06-10',
          createTime: '2019-06-10',
        },
        {
          id: 2,
          name: 'Test 2',
          location: '/test2',
          fileSize: 2,
          modTime: '2019-06-10',
          createTime: '2019-06-10',
        },
      ];

      state.data = mockData;

      const datafileDetails: Datafile = {
        ...mockData[0],
        parameters: [
          {
            id: 3,
            type: {
              id: 4,
              name: 'Test parameter type',
              units: 'Test unit',
              VALUE_TYPE: 'STRING',
            },
          },
        ],
      };

      const mockDataUpdated: Datafile[] = [datafileDetails, mockData[1]];

      const updatedState = DGCommonReducer(
        state,
        fetchDatafileDetailsSuccess([datafileDetails])
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatafileDetailsFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchDatafileDetailsFailure('Test error message')
      );

      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('DownloadDatafile actions', () => {
    it('should set the downloading state to true when given a DownloadDatafileRequest action', () => {
      expect(state.downloading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        downloadDatafileRequest(validTimestamp)
      );
      expect(updatedState.downloading).toBe(true);
    });

    it('should set the downloading state to false when given a DownloadDatafileSuccess action', () => {
      state.downloading = true;

      const updatedState = DGCommonReducer(state, downloadDatafileSuccess());
      expect(updatedState.downloading).toBe(false);
    });

    it('should set the error state and the downloading state to false when given a DownloadDatafileFailure action', () => {
      state.downloading = true;

      const updatedState = DGCommonReducer(
        state,
        downloadDatafileFailure('Test error message')
      );
      expect(updatedState.downloading).toBe(false);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasetDatafilesCount actions', () => {
    it('should set loading when given a FetchDatasetDatafilesCountRequest action', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchDatasetDatafilesCountRequest(validTimestamp)
      );
      expect(updatedState).toEqual({ ...state, loading: true });
    });

    it('should set the data state and reset error and loading state when given a FetchDatasetDatafilesCountSuccess action', () => {
      state.loading = true;
      const mockData: Dataset[] = [
        {
          id: 1,
          name: 'Test 1',
          modTime: '2019-06-10',
          createTime: '2019-06-11',
        },
        {
          id: 2,
          name: 'Test 2',
          modTime: '2019-06-10',
          createTime: '2019-06-12',
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Dataset[] = [
        { ...mockData[0], datafileCount: 2 },
        mockData[1],
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchDatasetDatafilesCountSuccess(1, 2, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the data state with cached datafile count and reset error and loading state when given a FetchDatasetDatafilesCountSuccess action', () => {
      state.loading = true;

      state.datasetCache = {
        1: {
          childEntityCount: 100,
        },
        2: {
          childEntityCount: 100,
        },
      };

      const mockData: Dataset[] = [
        {
          id: 1,
          name: 'Test 1',
          modTime: '2019-10-08',
          createTime: '2019-10-08',
        },
        {
          id: 2,
          name: 'Test 2',
          modTime: '2019-10-08',
          createTime: '2019-10-08',
        },
        {
          id: 3,
          name: 'Test 3',
          modTime: '2019-10-08',
          createTime: '2019-10-08',
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Dataset[] = [
        mockData[0],
        mockData[1],
        { ...mockData[2], datafileCount: 99 },
      ];

      const mockDatasetCacheUpdated: EntityCache = {
        1: {
          childEntityCount: 100,
        },
        2: {
          childEntityCount: 100,
        },
        3: {
          childEntityCount: 99,
        },
      };

      // We give the investigation ID of 3 and the new datafile count (we would cache) as 99.
      const updatedState = DGCommonReducer(
        state,
        fetchDatasetDatafilesCountSuccess(3, 99, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.datasetCache).toEqual(mockDatasetCacheUpdated);

      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatasetDatafilesCountFailure action', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchDatasetDatafilesCountFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInstruments actions', () => {
    it('should set the loading state when given a FetchInstrumentsRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchInstrumentsSuccess action', () => {
      state.loading = true;
      const mockData: Instrument[] = [
        {
          id: 1,
          name: 'Test 1',
        },
        {
          id: 2,
          name: 'Test 2',
        },
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentsSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInstrumentsFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInstrumentCount actions', () => {
    it('should set the loading state when given a FetchInstrumentCountRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchInstrumentCountSuccess action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentCountSuccess(14, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(14);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInstrumentCountFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentCountFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(0);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInstrumentDetails actions', () => {
    it('should not update state when given a FetchInstrumentDetailsRequest action', () => {
      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentDetailsRequest()
      );
      expect(updatedState).toEqual(state);
    });

    it('should update the data state and reset error state when given a FetchInstrumentDetailsSuccess action', () => {
      state.loading = true;
      const mockData: Instrument[] = [
        {
          id: 1,
          name: 'Test 1',
        },
        {
          id: 2,
          name: 'Test 2',
        },
      ];

      state.data = mockData;

      const instrumentDetails: Instrument = {
        ...mockData[0],
        instrumentScientists: [
          {
            id: 3,
            user: { id: 4, name: 'Louise' },
          },
        ],
      };

      const mockDataUpdated: Instrument[] = [instrumentDetails, mockData[1]];

      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentDetailsSuccess([instrumentDetails])
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchInstrumentDetailsFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchInstrumentDetailsFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchFacilityCycles actions', () => {
    it('should set the loading state when given a FetchFacilityCyclesRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchFacilityCyclesRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchFacilityCyclesSuccess action', () => {
      state.loading = true;
      const mockData: FacilityCycle[] = [
        {
          id: 1,
          name: 'Test 1',
          description: 'Test 1',
          startDate: '2019-07-03',
          endDate: '2019-07-04',
        },
        {
          id: 2,
          name: 'Test 2',
          description: 'Test 2',
          startDate: '2019-07-03',
          endDate: '2019-07-04',
        },
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchFacilityCyclesSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchFacilityCyclesFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchFacilityCyclesFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchFacilityCycleCount actions', () => {
    it('should set the loading state when given a FetchFacilityCycleCountRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchFacilityCycleCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchFacilityCycleCountSuccess action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchFacilityCycleCountSuccess(15, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(15);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchFacilityCycleCountFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchFacilityCycleCountFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(0);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchStudies actions', () => {
    it('should set the loading state when given a FetchStudiesRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchStudiesRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchStudiesSuccess action', () => {
      state.loading = true;
      const mockData: StudyInvestigation[] = [
        {
          id: 1,
          study: {
            id: 1,
            pid: 'doi 1',
            name: 'Test 1',
            modTime: '2000-01-01',
            createTime: '2000-01-01',
          },
        },
        {
          id: 2,
          study: {
            id: 2,
            pid: 'doi 2',
            name: 'Test 2',
            modTime: '2000-01-02',
            createTime: '2000-01-02',
          },
        },
      ];

      const updatedState = DGCommonReducer(
        state,
        fetchStudiesSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchStudiesFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchStudiesFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchStudyCount actions', () => {
    it('should set the loading state when given a FetchStudyCountRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchStudyCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchStudyCountSuccess action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchStudyCountSuccess(15, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(15);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchStudyCountFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchStudyCountFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(0);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('Cart actions', () => {
    const mockData: DownloadCart = {
      cartItems: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'DATASET 1',
          parentEntities: [],
        },
      ],
      createdAt: '2019-10-15T14:11:43+01:00',
      facilityName: 'TEST',
      id: 1,
      updatedAt: '2019-10-15T14:11:43+01:00',
      userName: 'test',
    };

    describe('FetchDownloadCart actions', () => {
      it('should set the loading state when given a FetchDownloadCartRequest action', () => {
        expect(state.loading).toBe(false);

        const updatedState = DGCommonReducer(state, fetchDownloadCartRequest());
        expect(updatedState.loading).toBe(true);
      });

      it('should set the downloadCart state and reset loading state when given a FetchDownloadCartSuccess action', () => {
        state.loading = true;

        const updatedState = DGCommonReducer(
          state,
          fetchDownloadCartSuccess(mockData)
        );
        expect(updatedState.loading).toBe(false);
        expect(updatedState.cartItems).toEqual(mockData.cartItems);
      });

      it('should set the error state and reset loading state when given a FetchDownloadCartFailure action', () => {
        state.loading = true;

        const updatedState = DGCommonReducer(
          state,
          fetchDownloadCartFailure('Test error message')
        );
        expect(updatedState.loading).toBe(false);
        expect(updatedState.error).toEqual('Test error message');
      });
    });

    describe('AddToCart actions', () => {
      it('should set the loading state when given a AddToCartRequest action', () => {
        expect(state.loading).toBe(false);

        const updatedState = DGCommonReducer(state, addToCartRequest());
        expect(updatedState.loading).toBe(true);
      });

      it('should set the downloadCart state and reset loading state when given a AddToCartSuccess action', () => {
        state.loading = true;

        const updatedState = DGCommonReducer(state, addToCartSuccess(mockData));
        expect(updatedState.loading).toBe(false);
        expect(updatedState.cartItems).toEqual(mockData.cartItems);
      });

      it('should set the error state and reset loading state when given a AddToCartFailure action', () => {
        state.loading = true;

        const updatedState = DGCommonReducer(
          state,
          addToCartFailure('Test error message')
        );
        expect(updatedState.loading).toBe(false);
        expect(updatedState.error).toEqual('Test error message');
      });
    });

    describe('RemoveFromCart actions', () => {
      it('should set the loading state when given a RemoveFromCartRequest action', () => {
        expect(state.loading).toBe(false);

        const updatedState = DGCommonReducer(state, removeFromCartRequest());
        expect(updatedState.loading).toBe(true);
      });

      it('should set the downloadCart state and reset loading state when given a RemoveFromCartSuccess action', () => {
        state.loading = true;

        const updatedState = DGCommonReducer(
          state,
          removeFromCartSuccess(mockData)
        );
        expect(updatedState.loading).toBe(false);
        expect(updatedState.cartItems).toEqual(mockData.cartItems);
      });

      it('should set the error state and reset loading state when given a RemoveFromCartFailure action', () => {
        state.loading = true;

        const updatedState = DGCommonReducer(
          state,
          removeFromCartFailure('Test error message')
        );
        expect(updatedState.loading).toBe(false);
        expect(updatedState.error).toEqual('Test error message');
      });
    });
  });

  describe('FetchAllIds actions', () => {
    it('should set the loading state when given a FetchAllIdsRequest action', () => {
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchAllIdsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the allIds state and reset loading state when given a FetchAllIdsSuccess action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchAllIdsSuccess([1, 2, 3], validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.allIds).toEqual([1, 2, 3]);
    });

    it('should set the error state and reset loading state when given a FetchAllIdsFailure action', () => {
      state.loading = true;

      const updatedState = DGCommonReducer(
        state,
        fetchAllIdsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchLuceneIds actions', () => {
    it('should set state when given a FetchLuceneIdsRequest action', () => {
      state = { ...initialState, loading: false };
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchLuceneIdsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
      expect(updatedState.luceneIdsTimestamp).toEqual(validTimestamp);
    });

    it('should not set state when given a FetchLuceneIdsRequest action with invalid timestamp', () => {
      state = { ...initialState, loading: false };
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(
        state,
        fetchLuceneIdsRequest(invalidTimestamp)
      );
      expect(updatedState).toEqual(state);
    });

    it('should set state when given a FetchLuceneIdsSuccess action', () => {
      state = { ...initialState, loading: true };
      expect(state.loading).toBe(true);

      const updatedState = DGCommonReducer(
        state,
        fetchLuceneIdsSuccess([1], validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.luceneIdsTimestamp).toEqual(validTimestamp);
      expect(updatedState.luceneIds).toEqual([1]);
    });

    it('should not set state when given a FetchLuceneIdsSuccess action with invalid timestamp', () => {
      state = { ...initialState, loading: true };
      expect(state.loading).toBe(true);

      const updatedState = DGCommonReducer(
        state,
        fetchLuceneIdsSuccess([1], invalidTimestamp)
      );
      expect(updatedState).toEqual(state);
    });
  });

  describe('FetchFilter actions', () => {
    it('should set the loading state when given a FetchFilterRequest action', () => {
      state = { ...initialState, loading: false };
      expect(state.loading).toBe(false);

      const updatedState = DGCommonReducer(state, fetchFilterRequest());
      expect(updatedState.loading).toBe(true);
    });

    it('should set the loading, filter data when given a FetchFilterSuccess action', () => {
      state = { ...initialState, loading: true };
      expect(state.loading).toBe(true);

      const updatedState = DGCommonReducer(
        state,
        fetchFilterSuccess('testKey', ['testData'])
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.filterData).toEqual({ testKey: ['testData'] });
    });
  });

  describe('Update actions', () => {
    it('should update view on UpdateView', () => {
      state = {
        ...initialState,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      };

      const updatedState = DGCommonReducer(state, updateView('card'));

      expect(updatedState).toEqual({
        ...initialState,
        query: {
          view: 'card',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      });
    });
    it('should update search on UpdateSearch', () => {
      state = {
        ...initialState,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      };

      const updatedState = DGCommonReducer(state, updateSearch('searchTwo'));

      expect(updatedState).toEqual({
        ...initialState,
        query: {
          view: 'table',
          search: 'searchTwo',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      });
    });

    it('should update page on UpdatePage', () => {
      state = {
        ...initialState,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      };

      const updatedState = DGCommonReducer(state, updatePage(2));

      expect(updatedState).toEqual({
        ...initialState,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 2,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      });
    });

    it('should update results on UpdateResults', () => {
      state = {
        ...initialState,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      };

      const updatedState = DGCommonReducer(state, updateResults(2));

      expect(updatedState).toEqual({
        ...initialState,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 2,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      });
    });

    it('should update filter on UpdateFilters', () => {
      state = {
        ...initialState,
        data: [{ id: 1, name: 'test' }],
        totalDataCount: 1,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      };

      const updatedState = DGCommonReducer(state, updateFilters({ name: 'c' }));

      expect(updatedState).toEqual({
        ...initialState,
        data: [],
        totalDataCount: 0,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 'c' },
          sort: { name: 'asc' },
        },
      });
    });

    it('should update sort on UpdateSort', () => {
      state = {
        ...initialState,
        data: [{ id: 1, name: 'test' }],
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      };

      const updatedState = DGCommonReducer(state, updateSort({ name: 'desc' }));

      expect(updatedState).toEqual({
        ...initialState,
        data: [],
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'desc' },
        },
      });
    });

    it('should update query on UpdateQueryParams', () => {
      state = {
        ...initialState,
        query: {
          view: 'table',
          search: 'searchOne',
          page: 1,
          results: 1,
          filters: { name: 't' },
          sort: { name: 'asc' },
        },
      };

      const updatedState = DGCommonReducer(
        state,
        updateQueryParams({
          view: 'card',
          search: 'searchTwo',
          page: 2,
          results: 2,
          filters: { name: 'c' },
          sort: { name: 'desc' },
        })
      );

      expect(updatedState).toEqual({
        ...initialState,
        query: {
          view: 'card',
          search: 'searchTwo',
          page: 2,
          results: 2,
          filters: { name: 'c' },
          sort: { name: 'desc' },
        },
      });
    });
  });
});
