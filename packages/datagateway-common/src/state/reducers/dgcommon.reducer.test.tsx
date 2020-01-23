import DGCommonReducer, { initialState } from './dgcommon.reducer';
import { DGCommonState, EntityCache } from '../app.types';
import {
  sortTable,
  filterTable,
  fetchDatafilesRequest,
  fetchDatafilesSuccess,
  fetchDatafilesFailure,
  fetchDatasetDatafilesCountRequest,
  fetchDatasetDatafilesCountSuccess,
  fetchDatasetDatafilesCountFailure,
  fetchInstrumentsRequest,
  fetchInstrumentsSuccess,
  fetchInstrumentsFailure,
  fetchFacilityCyclesRequest,
  fetchFacilityCyclesSuccess,
  fetchFacilityCyclesFailure,
  downloadDatafileRequest,
  downloadDatafileSuccess,
  downloadDatafileFailure,
  fetchDatafileCountRequest,
  fetchDatafileCountSuccess,
  fetchDatafileCountFailure,
  fetchInstrumentCountRequest,
  fetchInstrumentCountSuccess,
  fetchInstrumentCountFailure,
  fetchFacilityCycleCountRequest,
  fetchFacilityCycleCountSuccess,
  fetchFacilityCycleCountFailure,
  clearTable,
  loadFacilityName,
  configureStrings,
  loadUrls,
  settingsLoaded,
  fetchInvestigationDetailsRequest,
  fetchInvestigationDetailsSuccess,
  fetchInvestigationDetailsFailure,
  fetchInstrumentDetailsRequest,
  fetchInstrumentDetailsSuccess,
  fetchInstrumentDetailsFailure,
  fetchDatafileDetailsRequest,
  fetchDatafileDetailsSuccess,
  fetchDatafileDetailsFailure,
  fetchDownloadCartRequest,
  fetchDownloadCartSuccess,
  fetchDownloadCartFailure,
  addToCartRequest,
  addToCartSuccess,
  addToCartFailure,
  removeFromCartRequest,
  removeFromCartSuccess,
  removeFromCartFailure,
  fetchAllIdsRequest,
  fetchAllIdsSuccess,
  fetchAllIdsFailure,
  fetchDatasetSizeSuccess,
  fetchDatasetsRequest,
  fetchDatasetsSuccess,
  fetchDatasetsFailure,
  fetchDatasetDetailsRequest,
  fetchDatasetDetailsSuccess,
  fetchDatasetDetailsFailure,
  fetchInvestigationDatasetsCountRequest,
  fetchInvestigationDatasetsCountSuccess,
  fetchInvestigationDatasetsCountFailure,
  downloadDatasetRequest,
  downloadDatasetSuccess,
  downloadDatasetFailure,
  fetchDatasetCountRequest,
  fetchDatasetCountSuccess,
  fetchDatasetCountFailure,
  fetchInvestigationSizeRequest,
  fetchInvestigationSizeSuccess,
  fetchInvestigationSizeFailure,
  fetchInvestigationsRequest,
  fetchInvestigationsSuccess,
  fetchInvestigationsFailure,
  fetchInvestigationCountRequest,
  fetchInvestigationCountSuccess,
  fetchInvestigationCountFailure,
} from '../actions';

import {
  Investigation,
  Dataset,
  Datafile,
  Instrument,
  FacilityCycle,
  DownloadCart,
} from '../../app.types';

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
    expect(state.sort).toEqual({});

    let updatedState = DGCommonReducer(state, sortTable('test', 'asc'));
    expect(updatedState.sort).toEqual({ test: 'asc' });
  });

  it('should remove column from sort state when given a SortTable action with null order', () => {
    state.sort = {
      test: 'asc',
    };

    let updatedState = DGCommonReducer(state, sortTable('test', null));
    expect(updatedState.sort).toEqual({});
  });

  it('should set the filters state when given a FilterTable action', () => {
    expect(state.filters).toEqual({});

    let updatedState = DGCommonReducer(
      state,
      filterTable('test column', 'test filter')
    );
    expect(updatedState.filters).toEqual({
      'test column': 'test filter',
    });
  });

  it('should remove column from filter state when given a FilterTable action with null filter', () => {
    state.filters = {
      'test column': 'test filter',
    };

    let updatedState = DGCommonReducer(state, filterTable('test', null));
    expect(updatedState.sort).toEqual({});
  });

  it('should clear the table state when given a ClearTable action', () => {
    state = {
      ...initialState,
      data: [{ ID: 1, NAME: 'test' }],
      totalDataCount: 1,
      loading: true,
      downloading: true,
      error: 'test error',
      sort: { NAME: 'asc' },
      filters: { NAME: 't' },
    };

    let updatedState = DGCommonReducer(state, clearTable());
    expect(updatedState).toEqual({
      ...initialState,
      data: [],
      totalDataCount: 0,
      loading: false,
      downloading: false,
      error: null,
      sort: {},
      filters: {},
    });
  });

  describe('timestamps', () => {
    it('should ignore data requests with invalid timestamps', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationsRequest(invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore data successes with invalid timestamps', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchDatasetsSuccess([], invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore count requests with invalid timestamps', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchDatafileCountRequest(invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore count successes with invalid timestamps', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchInstrumentCountSuccess(1, invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore allIds requests with invalid timestamps', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchAllIdsRequest(invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore allIds successes with invalid timestamps', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchAllIdsSuccess([1], invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should update dataTimestamp when given a valid fetchDataRequest', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchDatafilesRequest(validTimestamp)
      );
      expect(updatedState.dataTimestamp).toBe(validTimestamp);
    });

    it('should update dataTimestamp when given a valid fetchDataSuccess', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchFacilityCyclesSuccess([], validTimestamp)
      );
      expect(updatedState.dataTimestamp).toBe(validTimestamp);
    });

    it('should update countTimestamp when given a valid fetchCountRequest', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchDatasetCountRequest(validTimestamp)
      );
      expect(updatedState.countTimestamp).toBe(validTimestamp);
    });

    it('should update countTimestamp when given a valid fetchCountSuccess', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationCountSuccess(1, validTimestamp)
      );
      expect(updatedState.countTimestamp).toBe(validTimestamp);
    });

    it('should update allIdsTimestamp when given a valid fetchAllIdsRequest', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchAllIdsRequest(validTimestamp)
      );
      expect(updatedState.allIdsTimestamp).toBe(validTimestamp);
    });

    it('should update allIdsTimestamp when given a valid fetchAllIdsSuccess', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchAllIdsSuccess([1], validTimestamp)
      );
      expect(updatedState.allIdsTimestamp).toBe(validTimestamp);
    });
  });

  it('should set settingsLoaded to true when SettingsLoaded action is sent', () => {
    expect(state.settingsLoaded).toBe(false);

    const updatedState = DGCommonReducer(state, settingsLoaded());

    expect(updatedState.settingsLoaded).toBe(true);
  });

  it('should set res property when configure strings action is sent', () => {
    expect(state).not.toHaveProperty('res');

    const updatedState = DGCommonReducer(
      state,
      configureStrings({ testSection: { testId: 'test' } })
    );

    expect(updatedState).toHaveProperty('res');
    expect(updatedState.res).toEqual({ testSection: { testId: 'test' } });
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

      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchInvestigationsSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          ID: 1,
          TITLE: 'Test 1',
          NAME: 'Test 1',
          VISIT_ID: '1',
          RB_NUMBER: '1',
          DOI: 'doi 1',
          SIZE: 1,
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-11',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          NAME: 'Test 1',
          VISIT_ID: '2',
          RB_NUMBER: '2',
          DOI: 'doi 2',
          SIZE: 10000,
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-12',
        },
      ];

      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationsSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInvestigationsFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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
      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationDetailsRequest()
      );
      expect(updatedState).toEqual(state);
    });

    it('should update the data state and reset error state when given a FetchInvestigationDetailsSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          ID: 1,
          TITLE: 'Test 1',
          NAME: 'Test 1',
          VISIT_ID: '1',
          RB_NUMBER: '1',
          DOI: 'doi 1',
          SIZE: 1,
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-11',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          NAME: 'Test 1',
          VISIT_ID: '2',
          RB_NUMBER: '2',
          DOI: 'doi 2',
          SIZE: 10000,
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-12',
        },
      ];

      state.data = mockData;

      const investigationDetails = {
        ...mockData[0],
        INVESTIGATIONUSER: [
          {
            ID: 3,
            INVESTIGATION_ID: 1,
            USER_ID: 4,
            ROLE: 'Investigator',
            USER_: { ID: 4, NAME: 'Louise' },
          },
        ],
      };

      const mockDataUpdated: Investigation[] = [
        investigationDetails,
        mockData[1],
      ];

      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationDetailsSuccess([investigationDetails])
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchInvestigationDetailsFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationDetailsFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInvestigationSize and FetchDatasetSize actions', () => {
    const mockData: Investigation[] = [
      {
        ID: 1,
        TITLE: 'Test 1',
        NAME: 'Test 1',
        VISIT_ID: '1',
        RB_NUMBER: '1',
        DOI: 'doi 1',
        STARTDATE: '2019-06-10',
        ENDDATE: '2019-06-11',
      },
      {
        ID: 2,
        TITLE: 'Test 2',
        NAME: 'Test 1',
        VISIT_ID: '2',
        RB_NUMBER: '2',
        DOI: 'doi 2',
        SIZE: 10000,
        STARTDATE: '2019-06-10',
        ENDDATE: '2019-06-12',
      },
    ];

    it('should have the same state when given a FetchSizeRequest', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationSizeRequest()
      );

      expect(updatedState).toEqual(state);
    });

    it('should set the data and investigationCache state when given a FetchInvestigationSize action', () => {
      state.data = mockData;

      const mockDataUpdated = [{ ...mockData[0], SIZE: 1 }, mockData[1]];
      const mockInvestigationCacheUpdated: EntityCache = {
        1: {
          childEntitySize: 1,
        },
      };

      let updatedState = DGCommonReducer(
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

      const mockDataUpdated = [mockData[0], { ...mockData[1], SIZE: 10000 }];
      const mockDatasetCacheUpdated: EntityCache = {
        2: {
          childEntitySize: 10000,
        },
      };

      let updatedState = DGCommonReducer(
        state,
        fetchDatasetSizeSuccess(2, 10000)
      );
      expect(updatedState.datasetCache).toEqual(mockDatasetCacheUpdated);
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchInvestigationSizeFailure action', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationSizeFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInvestigationCount actions', () => {
    it('should set the loading state when given a FetchInvestigationCountRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchInvestigationCountSuccess action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationCountSuccess(11, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(11);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInvestigationCountFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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

      let updatedState = DGCommonReducer(
        state,
        fetchDatasetsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchDatasetsSuccess action', () => {
      state.loading = true;
      const mockData: Dataset[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-11',
          INVESTIGATION_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-12',
          INVESTIGATION_ID: 1,
        },
      ];

      let updatedState = DGCommonReducer(
        state,
        fetchDatasetsSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatasetsFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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
      let updatedState = DGCommonReducer(state, fetchDatasetDetailsRequest());
      expect(updatedState).toEqual(state);
    });

    it('should update the data state and reset error state when given a FetchDatasetDetailsSuccess action', () => {
      state.loading = true;
      const mockData: Dataset[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-11',
          INVESTIGATION_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-12',
          INVESTIGATION_ID: 1,
        },
      ];

      state.data = mockData;

      const datasetDetails = {
        ...mockData[0],
        DATASETTYPE: {
          ID: 3,
          NAME: 'Test type',
        },
      };

      const mockDataUpdated: Dataset[] = [datasetDetails, mockData[1]];

      let updatedState = DGCommonReducer(
        state,
        fetchDatasetDetailsSuccess([datasetDetails])
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatasetDetailsFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchDatasetDetailsFailure('Test error message')
      );

      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasetCount actions', () => {
    it('should set the loading state when given a FetchDatasetCountRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGCommonReducer(
        state,
        fetchDatasetCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchDatasetCountSuccess action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchDatasetCountSuccess(12, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(12);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatasetCountFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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

      let updatedState = DGCommonReducer(
        state,
        downloadDatasetRequest(validTimestamp)
      );
      expect(updatedState.downloading).toBe(true);
    });

    it('should set the downloading state to false when given a DownloadDatasetSuccess action', () => {
      state.downloading = true;

      let updatedState = DGCommonReducer(state, downloadDatasetSuccess());
      expect(updatedState.downloading).toBe(false);
    });

    it('should set the error state and the downloading state to false when given a DownloadDatasetFailure action', () => {
      state.downloading = true;

      let updatedState = DGCommonReducer(
        state,
        downloadDatasetFailure('Test error message')
      );
      expect(updatedState.downloading).toBe(false);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInvestigationDatasetsCount actions', () => {
    it('should not affect state when given a FetchInvestigationDatasetsCountRequest action', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationDatasetsCountRequest(validTimestamp)
      );
      expect(updatedState).toEqual(state);
    });

    it('should set the data state and reset error and loading state when given a FetchInvestigationDatasetsCountSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          ID: 1,
          TITLE: 'Test 1',
          NAME: 'Test 1',
          VISIT_ID: '1',
          RB_NUMBER: '1',
          DOI: 'doi 1',
          SIZE: 1,
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-11',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          NAME: 'Test 2',
          VISIT_ID: '2',
          RB_NUMBER: '2',
          DOI: 'doi 2',
          SIZE: 10000,
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-12',
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Investigation[] = [
        { ...mockData[0], DATASET_COUNT: 2 },
        mockData[1],
      ];

      let updatedState = DGCommonReducer(
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
          ID: 3,
          TITLE: 'Test 3',
          VISIT_ID: '3',
          RB_NUMBER: '3',
          DOI: 'doi 3',
          SIZE: 1,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-10-08',
          ENDDATE: '2019-10-08',
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Investigation[] = [
        { ...mockData[0], DATASET_COUNT: 4 },
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
      let updatedState = DGCommonReducer(
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
      let updatedState = DGCommonReducer(
        state,
        fetchInvestigationDatasetsCountFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatafiles actions', () => {
    it('should set the loading state when given a FetchDatafilesRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGCommonReducer(
        state,
        fetchDatafilesRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchDatafilesSuccess action', () => {
      state.loading = true;
      const mockData: Datafile[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          LOCATION: '/test1',
          FILESIZE: 1,
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-10',
          DATASET_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          LOCATION: '/test2',
          FILESIZE: 2,
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-10',
          DATASET_ID: 1,
        },
      ];

      let updatedState = DGCommonReducer(
        state,
        fetchDatafilesSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatafilesFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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

      let updatedState = DGCommonReducer(
        state,
        fetchDatafileCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchDatafileCountSuccess action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchDatafileCountSuccess(13, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(13);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatafileCountFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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
      let updatedState = DGCommonReducer(state, fetchDatafileDetailsRequest());
      expect(updatedState).toEqual(state);
    });

    it('should update the data state and reset error state when given a FetchDatafileDetailsSuccess action', () => {
      state.loading = true;
      const mockData: Datafile[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          LOCATION: '/test1',
          FILESIZE: 1,
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-10',
          DATASET_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          LOCATION: '/test2',
          FILESIZE: 2,
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-10',
          DATASET_ID: 1,
        },
      ];

      state.data = mockData;

      const datafileDetails: Datafile = {
        ...mockData[0],
        DATAFILEPARAMETER: [
          {
            ID: 3,
            DATAFILE_ID: 1,
            PARAMETER_TYPE_ID: 4,
            PARAMETERTYPE: {
              ID: 4,
              NAME: 'Test parameter type',
              UNITS: 'Test unit',
              VALUE_TYPE: 'STRING',
            },
          },
        ],
      };

      const mockDataUpdated: Datafile[] = [datafileDetails, mockData[1]];

      let updatedState = DGCommonReducer(
        state,
        fetchDatafileDetailsSuccess([datafileDetails])
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatafileDetailsFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchDatafileDetailsFailure('Test error message')
      );

      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('DownloadDatafile actions', () => {
    it('should set the downloading state to true when given a DownloadDatafileRequest action', () => {
      expect(state.downloading).toBe(false);

      let updatedState = DGCommonReducer(
        state,
        downloadDatafileRequest(validTimestamp)
      );
      expect(updatedState.downloading).toBe(true);
    });

    it('should set the downloading state to false when given a DownloadDatafileSuccess action', () => {
      state.downloading = true;

      let updatedState = DGCommonReducer(state, downloadDatafileSuccess());
      expect(updatedState.downloading).toBe(false);
    });

    it('should set the error state and the downloading state to false when given a DownloadDatafileFailure action', () => {
      state.downloading = true;

      let updatedState = DGCommonReducer(
        state,
        downloadDatafileFailure('Test error message')
      );
      expect(updatedState.downloading).toBe(false);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasetDatafilesCount actions', () => {
    it('should not affect state when given a FetchDatasetDatafilesCountRequest action', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchDatasetDatafilesCountRequest(validTimestamp)
      );
      expect(updatedState).toEqual(state);
    });

    it('should set the data state and reset error and loading state when given a FetchDatasetDatafilesCountSuccess action', () => {
      state.loading = true;
      const mockData: Dataset[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-11',
          INVESTIGATION_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          MOD_TIME: '2019-06-10',
          CREATE_TIME: '2019-06-12',
          INVESTIGATION_ID: 1,
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Dataset[] = [
        { ...mockData[0], DATAFILE_COUNT: 2 },
        mockData[1],
      ];

      let updatedState = DGCommonReducer(
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
          ID: 1,
          NAME: 'Test 1',
          MOD_TIME: '2019-10-08',
          CREATE_TIME: '2019-10-08',
          INVESTIGATION_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          MOD_TIME: '2019-10-08',
          CREATE_TIME: '2019-10-08',
          INVESTIGATION_ID: 1,
        },
        {
          ID: 3,
          NAME: 'Test 3',
          MOD_TIME: '2019-10-08',
          CREATE_TIME: '2019-10-08',
          INVESTIGATION_ID: 1,
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Dataset[] = [
        mockData[0],
        mockData[1],
        { ...mockData[2], DATAFILE_COUNT: 99 },
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
      let updatedState = DGCommonReducer(
        state,
        fetchDatasetDatafilesCountSuccess(3, 99, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.datasetCache).toEqual(mockDatasetCacheUpdated);

      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatasetDatafilesCountFailure action', () => {
      let updatedState = DGCommonReducer(
        state,
        fetchDatasetDatafilesCountFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInstruments actions', () => {
    it('should set the loading state when given a FetchInstrumentsRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGCommonReducer(
        state,
        fetchInstrumentsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchInstrumentsSuccess action', () => {
      state.loading = true;
      const mockData: Instrument[] = [
        {
          ID: 1,
          NAME: 'Test 1',
        },
        {
          ID: 2,
          NAME: 'Test 2',
        },
      ];

      let updatedState = DGCommonReducer(
        state,
        fetchInstrumentsSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInstrumentsFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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

      let updatedState = DGCommonReducer(
        state,
        fetchInstrumentCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchInstrumentCountSuccess action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchInstrumentCountSuccess(14, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(14);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInstrumentCountFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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
      let updatedState = DGCommonReducer(
        state,
        fetchInstrumentDetailsRequest()
      );
      expect(updatedState).toEqual(state);
    });

    it('should update the data state and reset error state when given a FetchInstrumentDetailsSuccess action', () => {
      state.loading = true;
      const mockData: Instrument[] = [
        {
          ID: 1,
          NAME: 'Test 1',
        },
        {
          ID: 2,
          NAME: 'Test 2',
        },
      ];

      state.data = mockData;

      const instrumentDetails: Instrument = {
        ...mockData[0],
        INSTRUMENTSCIENTIST: [
          {
            ID: 3,
            INSTRUMENT_ID: 1,
            USER_ID: 4,
            USER_: { ID: 4, NAME: 'Louise' },
          },
        ],
      };

      const mockDataUpdated: Instrument[] = [instrumentDetails, mockData[1]];

      let updatedState = DGCommonReducer(
        state,
        fetchInstrumentDetailsSuccess([instrumentDetails])
      );
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchInstrumentDetailsFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchInstrumentDetailsFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchFacilityCycles actions', () => {
    it('should set the loading state when given a FetchFacilityCyclesRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGCommonReducer(
        state,
        fetchFacilityCyclesRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchFacilityCyclesSuccess action', () => {
      state.loading = true;
      const mockData: FacilityCycle[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          DESCRIPTION: 'Test 1',
          STARTDATE: '2019-07-03',
          ENDDATE: '2019-07-04',
        },
        {
          ID: 2,
          NAME: 'Test 2',
          DESCRIPTION: 'Test 2',
          STARTDATE: '2019-07-03',
          ENDDATE: '2019-07-04',
        },
      ];

      let updatedState = DGCommonReducer(
        state,
        fetchFacilityCyclesSuccess(mockData, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchFacilityCyclesFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
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

      let updatedState = DGCommonReducer(
        state,
        fetchFacilityCycleCountRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the totalDataCount state and reset error and loading state when given a FetchFacilityCycleCountSuccess action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchFacilityCycleCountSuccess(15, validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.totalDataCount).toEqual(15);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchFacilityCycleCountFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchFacilityCycleCountFailure('Test error message')
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

        let updatedState = DGCommonReducer(state, fetchDownloadCartRequest());
        expect(updatedState.loading).toBe(true);
      });

      it('should set the downloadCart state and reset loading state when given a FetchDownloadCartSuccess action', () => {
        state.loading = true;

        let updatedState = DGCommonReducer(
          state,
          fetchDownloadCartSuccess(mockData)
        );
        expect(updatedState.loading).toBe(false);
        expect(updatedState.cartItems).toEqual(mockData.cartItems);
      });

      it('should set the error state and reset loading state when given a FetchDownloadCartFailure action', () => {
        state.loading = true;

        let updatedState = DGCommonReducer(
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

        let updatedState = DGCommonReducer(state, addToCartRequest());
        expect(updatedState.loading).toBe(true);
      });

      it('should set the downloadCart state and reset loading state when given a AddToCartSuccess action', () => {
        state.loading = true;

        let updatedState = DGCommonReducer(state, addToCartSuccess(mockData));
        expect(updatedState.loading).toBe(false);
        expect(updatedState.cartItems).toEqual(mockData.cartItems);
      });

      it('should set the error state and reset loading state when given a AddToCartFailure action', () => {
        state.loading = true;

        let updatedState = DGCommonReducer(
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

        let updatedState = DGCommonReducer(state, removeFromCartRequest());
        expect(updatedState.loading).toBe(true);
      });

      it('should set the downloadCart state and reset loading state when given a RemoveFromCartSuccess action', () => {
        state.loading = true;

        let updatedState = DGCommonReducer(
          state,
          removeFromCartSuccess(mockData)
        );
        expect(updatedState.loading).toBe(false);
        expect(updatedState.cartItems).toEqual(mockData.cartItems);
      });

      it('should set the error state and reset loading state when given a RemoveFromCartFailure action', () => {
        state.loading = true;

        let updatedState = DGCommonReducer(
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

      let updatedState = DGCommonReducer(
        state,
        fetchAllIdsRequest(validTimestamp)
      );
      expect(updatedState.loading).toBe(true);
    });

    it('should set the allIds state and reset loading state when given a FetchAllIdsSuccess action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchAllIdsSuccess([1, 2, 3], validTimestamp)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.allIds).toEqual([1, 2, 3]);
    });

    it('should set the error state and reset loading state when given a FetchAllIdsFailure action', () => {
      state.loading = true;

      let updatedState = DGCommonReducer(
        state,
        fetchAllIdsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.error).toEqual('Test error message');
    });
  });
});
