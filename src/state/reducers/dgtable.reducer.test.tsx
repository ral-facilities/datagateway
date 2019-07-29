import DGTableReducer, { initialState } from './dgtable.reducer';
import {
  DGTableState,
  Investigation,
  Dataset,
  Datafile,
  Instrument,
  FacilityCycle,
} from '../app.types';
import {
  sortTable,
  fetchInvestigationsRequest,
  fetchInvestigationsSuccess,
  fetchInvestigationsFailure,
  filterTable,
  fetchDatasetsRequest,
  fetchDatasetsSuccess,
  fetchDatasetsFailure,
  fetchDatafilesRequest,
  fetchDatafilesSuccess,
  fetchDatafilesFailure,
  fetchDatasetCountRequest,
  fetchDatasetCountSuccess,
  fetchDatasetCountFailure,
  fetchDatafileCountRequest,
  fetchDatafileCountSuccess,
  fetchDatafileCountFailure,
  fetchInstrumentsRequest,
  fetchInstrumentsSuccess,
  fetchInstrumentsFailure,
  downloadDatafileRequest,
  downloadDatafileSuccess,
  downloadDatafileFailure,
  downloadDatasetRequest,
  downloadDatasetSuccess,
  downloadDatasetFailure,
  loadFeatureSwitches,
  configureStrings,
  loadUrls,
} from '../actions';
import {
  fetchFacilityCyclesRequest,
  fetchFacilityCyclesSuccess,
  fetchFacilityCyclesFailure,
} from '../actions/facilityCycles';

describe('dgtable reducer', () => {
  let state: DGTableState;

  beforeEach(() => {
    state = { ...initialState };
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGTableReducer(state, { type: 'irrelevant action' });

    expect(updatedState).toBe(state);
  });

  it('should set the sort state when given a SortTable action with asc or desc order', () => {
    expect(state.sort).toEqual({});

    let updatedState = DGTableReducer(state, sortTable('test', 'asc'));
    expect(updatedState.sort).toEqual({ test: 'asc' });
  });

  it('should remove column from sort state when given a SortTable action with null order', () => {
    state.sort = {
      test: 'asc',
    };

    let updatedState = DGTableReducer(state, sortTable('test', null));
    expect(updatedState.sort).toEqual({});
  });

  it('should set the filters state when given a FilterTable action', () => {
    expect(state.filters).toEqual({});

    let updatedState = DGTableReducer(
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

    let updatedState = DGTableReducer(state, filterTable('test', null));
    expect(updatedState.sort).toEqual({});
  });

  it('should set res property when configure strings action is sent', () => {
    expect(state).not.toHaveProperty('res');

    const updatedState = DGTableReducer(
      state,
      configureStrings({ testSection: { testId: 'test' } })
    );

    expect(updatedState).toHaveProperty('res');
    expect(updatedState.res).toEqual({ testSection: { testId: 'test' } });
  });

  it('should set feature switches property when configure feature switches action is sent', () => {
    expect(state.features.investigationGetSize).toBeFalsy();

    const updatedState = DGTableReducer(
      state,
      loadFeatureSwitches({
        ...state.features,
        investigationGetSize: true,
      })
    );

    expect(updatedState.features.investigationGetSize).toBeTruthy();
  });

  it('should set urls property when configure urls action is sent', () => {
    expect(state.urls.apiUrl).toEqual('');

    const updatedState = DGTableReducer(
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

      let updatedState = DGTableReducer(state, fetchInvestigationsRequest());
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchInvestigationsSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          ID: 1,
          TITLE: 'Test 1',
          VISIT_ID: '1',
          RB_NUMBER: '1',
          DOI: 'doi 1',
          SIZE: 1,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-11',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          VISIT_ID: '2',
          RB_NUMBER: '2',
          DOI: 'doi 2',
          SIZE: 10000,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-12',
        },
      ];

      let updatedState = DGTableReducer(
        state,
        fetchInvestigationsSuccess(mockData)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInvestigationsFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchInvestigationsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasets actions', () => {
    it('should set the loading state when given a FetchDatasetsRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchDatasetsRequest());
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

      let updatedState = DGTableReducer(state, fetchDatasetsSuccess(mockData));
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatasetsFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchDatasetsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('DownloadDataset actions', () => {
    it('should set the downloading state to true when given a DownloadDatasetRequest action', () => {
      expect(state.downloading).toBe(false);

      let updatedState = DGTableReducer(state, downloadDatasetRequest());
      expect(updatedState.downloading).toBe(true);
    });

    it('should set the downloading state to false when given a DownloadDatasetSuccess action', () => {
      state.downloading = true;

      let updatedState = DGTableReducer(state, downloadDatasetSuccess());
      expect(updatedState.downloading).toBe(false);
    });

    it('should set the error state and the downloading state to false when given a DownloadDatasetFailure action', () => {
      state.downloading = true;

      let updatedState = DGTableReducer(
        state,
        downloadDatasetFailure('Test error message')
      );
      expect(updatedState.downloading).toBe(false);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatasetCount actions', () => {
    it('should not affect state when given a FetchDatasetCountRequest action', () => {
      let updatedState = DGTableReducer(state, fetchDatasetCountRequest());
      expect(updatedState).toEqual(state);
    });

    it('should set the data state and reset error and loading state when given a FetchDatasetCountSuccess action', () => {
      state.loading = true;
      const mockData: Investigation[] = [
        {
          ID: 1,
          TITLE: 'Test 1',
          VISIT_ID: '1',
          RB_NUMBER: '1',
          DOI: 'doi 1',
          SIZE: 1,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-11',
        },
        {
          ID: 2,
          TITLE: 'Test 2',
          VISIT_ID: '2',
          RB_NUMBER: '2',
          DOI: 'doi 2',
          SIZE: 10000,
          INSTRUMENT: {
            NAME: 'LARMOR',
          },
          STARTDATE: '2019-06-10',
          ENDDATE: '2019-06-12',
        },
      ];

      state.data = mockData;

      const mockDataUpdated: Investigation[] = [
        { ...mockData[0], DATASET_COUNT: 2 },
        mockData[1],
      ];

      let updatedState = DGTableReducer(state, fetchDatasetCountSuccess(1, 2));
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatasetCountFailure action', () => {
      let updatedState = DGTableReducer(
        state,
        fetchDatasetCountFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatafiles actions', () => {
    it('should set the loading state when given a FetchDatafilesRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchDatafilesRequest());
      expect(updatedState.loading).toBe(true);
    });

    it('should set the data state and reset error and loading state when given a FetchDatafilesSuccess action', () => {
      state.loading = true;
      const mockData: Datafile[] = [
        {
          ID: 1,
          NAME: 'Test 1',
          LOCATION: '/test1',
          SIZE: 1,
          MOD_TIME: '2019-06-10',
          DATASET_ID: 1,
        },
        {
          ID: 2,
          NAME: 'Test 2',
          LOCATION: '/test2',
          SIZE: 2,
          MOD_TIME: '2019-06-10',
          DATASET_ID: 1,
        },
      ];

      let updatedState = DGTableReducer(state, fetchDatafilesSuccess(mockData));
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchDatafilesFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchDatafilesFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('DownloadDatafile actions', () => {
    it('should set the downloading state to true when given a DownloadDatafileRequest action', () => {
      expect(state.downloading).toBe(false);

      let updatedState = DGTableReducer(state, downloadDatafileRequest());
      expect(updatedState.downloading).toBe(true);
    });

    it('should set the downloading state to false when given a DownloadDatafileSuccess action', () => {
      state.downloading = true;

      let updatedState = DGTableReducer(state, downloadDatafileSuccess());
      expect(updatedState.downloading).toBe(false);
    });

    it('should set the error state and the downloading state to false when given a DownloadDatafileFailure action', () => {
      state.downloading = true;

      let updatedState = DGTableReducer(
        state,
        downloadDatafileFailure('Test error message')
      );
      expect(updatedState.downloading).toBe(false);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchDatafileCount actions', () => {
    it('should not affect state when given a FetchDatafileCountRequest action', () => {
      let updatedState = DGTableReducer(state, fetchDatafileCountRequest());
      expect(updatedState).toEqual(state);
    });

    it('should set the data state and reset error and loading state when given a FetchDatafileCountSuccess action', () => {
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

      let updatedState = DGTableReducer(state, fetchDatafileCountSuccess(1, 2));
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockDataUpdated);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state when given a FetchDatafileCountFailure action', () => {
      let updatedState = DGTableReducer(
        state,
        fetchDatafileCountFailure('Test error message')
      );
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchInstruments actions', () => {
    it('should set the loading state when given a FetchInstrumentsRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchInstrumentsRequest());
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

      let updatedState = DGTableReducer(
        state,
        fetchInstrumentsSuccess(mockData)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchInstrumentsFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchInstrumentsFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });

  describe('FetchFacilityCycles actions', () => {
    it('should set the loading state when given a FetchFacilityCyclesRequest action', () => {
      expect(state.loading).toBe(false);

      let updatedState = DGTableReducer(state, fetchFacilityCyclesRequest());
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

      let updatedState = DGTableReducer(
        state,
        fetchFacilityCyclesSuccess(mockData)
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual(mockData);
      expect(updatedState.error).toBeNull();
    });

    it('should set the error state and reset loading and data state when given a FetchFacilityCyclesFailure action', () => {
      state.loading = true;

      let updatedState = DGTableReducer(
        state,
        fetchFacilityCyclesFailure('Test error message')
      );
      expect(updatedState.loading).toBe(false);
      expect(updatedState.data).toEqual([]);
      expect(updatedState.error).toEqual('Test error message');
    });
  });
});
