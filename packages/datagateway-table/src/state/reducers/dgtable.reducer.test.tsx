import DGTableReducer, { initialState } from './dgtable.reducer';
import { DGTableState, EntityCache } from '../app.types';
import {
  sortTable,
  filterTable,
  fetchInstrumentsRequest,
  fetchInstrumentsSuccess,
  fetchInstrumentsFailure,
  fetchFacilityCyclesRequest,
  fetchFacilityCyclesSuccess,
  fetchFacilityCyclesFailure,
  fetchInstrumentCountRequest,
  fetchInstrumentCountSuccess,
  fetchInstrumentCountFailure,
  fetchFacilityCycleCountRequest,
  fetchFacilityCycleCountSuccess,
  fetchFacilityCycleCountFailure,
  clearTable,
  loadFacilityName,
  loadFeatureSwitches,
  configureStrings,
  loadUrls,
  loadBreadcrumbSettings,
  settingsLoaded,
  fetchInstrumentDetailsRequest,
  fetchInstrumentDetailsSuccess,
  fetchInstrumentDetailsFailure,
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
} from '../actions';
import {
  Investigation,
  Dataset,
  Datafile,
  Instrument,
  FacilityCycle,
  DownloadCart,
} from 'datagateway-common';

describe('dgtable reducer', () => {
  let state: DGTableState;
  const invalidTimestamp = 0;
  let validTimestamp = 0;

  beforeEach(() => {
    state = { ...initialState };
    validTimestamp = Date.now() + 1000;
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

    let updatedState = DGTableReducer(state, clearTable());
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
    it('should ignore count successes with invalid timestamps', () => {
      let updatedState = DGTableReducer(
        state,
        fetchInstrumentCountSuccess(1, invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore allIds requests with invalid timestamps', () => {
      let updatedState = DGTableReducer(
        state,
        fetchAllIdsRequest(invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should ignore allIds successes with invalid timestamps', () => {
      let updatedState = DGTableReducer(
        state,
        fetchAllIdsSuccess([1], invalidTimestamp)
      );
      expect(updatedState).toBe(state);
    });

    it('should update dataTimestamp when given a valid fetchDataSuccess', () => {
      let updatedState = DGTableReducer(
        state,
        fetchFacilityCyclesSuccess([], validTimestamp)
      );
      expect(updatedState.dataTimestamp).toBe(validTimestamp);
    });

    it('should update allIdsTimestamp when given a valid fetchAllIdsRequest', () => {
      let updatedState = DGTableReducer(
        state,
        fetchAllIdsRequest(validTimestamp)
      );
      expect(updatedState.allIdsTimestamp).toBe(validTimestamp);
    });

    it('should update allIdsTimestamp when given a valid fetchAllIdsSuccess', () => {
      let updatedState = DGTableReducer(
        state,
        fetchAllIdsSuccess([1], validTimestamp)
      );
      expect(updatedState.allIdsTimestamp).toBe(validTimestamp);
    });
  });

  it('should set settingsLoaded to true when SettingsLoaded action is sent', () => {
    expect(state.settingsLoaded).toBe(false);

    const updatedState = DGTableReducer(state, settingsLoaded());

    expect(updatedState.settingsLoaded).toBe(true);
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

  it('should set facility name property when configure facility name action is sent', () => {
    expect(state.facilityName).toEqual('');

    const updatedState = DGTableReducer(state, loadFacilityName('Generic'));

    expect(updatedState.facilityName).toEqual('Generic');
  });

  it('should set feature switches property when configure feature switches action is sent', () => {
    expect(state.features).toEqual({});

    const updatedState = DGTableReducer(state, loadFeatureSwitches({}));

    expect(updatedState.features).toEqual({});
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

  it('should set breadcrumb settings property when configure breadcrumb settings action is sent', () => {
    expect(state.breadcrumbSettings).toEqual({});

    const updatedState = DGTableReducer(
      state,
      loadBreadcrumbSettings({
        test: {
          replaceEntityField: 'TITLE',
        },
      })
    );

    expect(updatedState.breadcrumbSettings).toEqual({
      test: {
        replaceEntityField: 'TITLE',
      },
    });
  });

  describe('FetchInvestigations actions', () => {
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
    });
  });

  it('should set the data state with cached dataset count and reset error and loading state when given a FetchInvestigationDatasetsCountSuccess action', () => {
    state.loading = true;

    state.investigationCache = {
      1: {
        childEntityCount: 3,
        childEntitySize: 2,
      },
      2: {
        childEntityCount: 5,
        childEntitySize: 1,
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
        childEntitySize: 4,
      },
      2: {
        childEntityCount: 5,
        childEntitySize: 3,
      },
      3: {
        childEntityCount: 4,
        childEntitySize: 6,
      },
    };

    it('should set the data state with cached datafile count and reset error and loading state when given a FetchDatasetDatafilesCountSuccess action', () => {
      state.loading = true;

      state.datasetCache = {
        1: {
          childEntityCount: 100,
          childEntitySize: 1,
        },
        2: {
          childEntityCount: 100,
          childEntitySize: 5,
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
          childEntitySize: 2,
        },
        2: {
          childEntityCount: 100,
          childEntitySize: 2,
        },
        3: {
          childEntityCount: 99,
          childEntitySize: 2,
        },
      };

      describe('FetchInstruments actions', () => {
        it('should set the loading state when given a FetchInstrumentsRequest action', () => {
          expect(state.loading).toBe(false);

          let updatedState = DGTableReducer(
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

          let updatedState = DGTableReducer(
            state,
            fetchInstrumentsSuccess(mockData, validTimestamp)
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

      describe('FetchInstrumentCount actions', () => {
        it('should set the loading state when given a FetchInstrumentCountRequest action', () => {
          expect(state.loading).toBe(false);

          let updatedState = DGTableReducer(
            state,
            fetchInstrumentCountRequest(validTimestamp)
          );
          expect(updatedState.loading).toBe(true);
        });

        it('should set the totalDataCount state and reset error and loading state when given a FetchInstrumentCountSuccess action', () => {
          state.loading = true;

          let updatedState = DGTableReducer(
            state,
            fetchInstrumentCountSuccess(14, validTimestamp)
          );
          expect(updatedState.loading).toBe(false);
          expect(updatedState.totalDataCount).toEqual(14);
          expect(updatedState.error).toBeNull();
        });

        it('should set the error state and reset loading and data state when given a FetchInstrumentCountFailure action', () => {
          state.loading = true;

          let updatedState = DGTableReducer(
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
          let updatedState = DGTableReducer(
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

          const mockDataUpdated: Instrument[] = [
            instrumentDetails,
            mockData[1],
          ];

          let updatedState = DGTableReducer(
            state,
            fetchInstrumentDetailsSuccess([instrumentDetails])
          );
          expect(updatedState.data).toEqual(mockDataUpdated);
          expect(updatedState.error).toBeNull();
        });

        it('should set the error state when given a FetchInstrumentDetailsFailure action', () => {
          state.loading = true;

          let updatedState = DGTableReducer(
            state,
            fetchInstrumentDetailsFailure('Test error message')
          );
          expect(updatedState.error).toEqual('Test error message');
        });
      });

      describe('FetchFacilityCycles actions', () => {
        it('should set the loading state when given a FetchFacilityCyclesRequest action', () => {
          expect(state.loading).toBe(false);

          let updatedState = DGTableReducer(
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

          let updatedState = DGTableReducer(
            state,
            fetchFacilityCyclesSuccess(mockData, validTimestamp)
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

      describe('FetchFacilityCycleCount actions', () => {
        it('should set the loading state when given a FetchFacilityCycleCountRequest action', () => {
          expect(state.loading).toBe(false);

          let updatedState = DGTableReducer(
            state,
            fetchFacilityCycleCountRequest(validTimestamp)
          );
          expect(updatedState.loading).toBe(true);
        });

        it('should set the totalDataCount state and reset error and loading state when given a FetchFacilityCycleCountSuccess action', () => {
          state.loading = true;

          let updatedState = DGTableReducer(
            state,
            fetchFacilityCycleCountSuccess(15, validTimestamp)
          );
          expect(updatedState.loading).toBe(false);
          expect(updatedState.totalDataCount).toEqual(15);
          expect(updatedState.error).toBeNull();
        });

        it('should set the error state and reset loading and data state when given a FetchFacilityCycleCountFailure action', () => {
          state.loading = true;

          let updatedState = DGTableReducer(
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

            let updatedState = DGTableReducer(
              state,
              fetchDownloadCartRequest()
            );
            expect(updatedState.loading).toBe(true);
          });

          it('should set the downloadCart state and reset loading state when given a FetchDownloadCartSuccess action', () => {
            state.loading = true;

            let updatedState = DGTableReducer(
              state,
              fetchDownloadCartSuccess(mockData)
            );
            expect(updatedState.loading).toBe(false);
            expect(updatedState.cartItems).toEqual(mockData.cartItems);
          });

          it('should set the error state and reset loading state when given a FetchDownloadCartFailure action', () => {
            state.loading = true;

            let updatedState = DGTableReducer(
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

            let updatedState = DGTableReducer(state, addToCartRequest());
            expect(updatedState.loading).toBe(true);
          });

          it('should set the downloadCart state and reset loading state when given a AddToCartSuccess action', () => {
            state.loading = true;

            let updatedState = DGTableReducer(
              state,
              addToCartSuccess(mockData)
            );
            expect(updatedState.loading).toBe(false);
            expect(updatedState.cartItems).toEqual(mockData.cartItems);
          });

          it('should set the error state and reset loading state when given a AddToCartFailure action', () => {
            state.loading = true;

            let updatedState = DGTableReducer(
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

            let updatedState = DGTableReducer(state, removeFromCartRequest());
            expect(updatedState.loading).toBe(true);
          });

          it('should set the downloadCart state and reset loading state when given a RemoveFromCartSuccess action', () => {
            state.loading = true;

            let updatedState = DGTableReducer(
              state,
              removeFromCartSuccess(mockData)
            );
            expect(updatedState.loading).toBe(false);
            expect(updatedState.cartItems).toEqual(mockData.cartItems);
          });

          it('should set the error state and reset loading state when given a RemoveFromCartFailure action', () => {
            state.loading = true;

            let updatedState = DGTableReducer(
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

          let updatedState = DGTableReducer(
            state,
            fetchAllIdsRequest(validTimestamp)
          );
          expect(updatedState.loading).toBe(true);
        });

        it('should set the allIds state and reset loading state when given a FetchAllIdsSuccess action', () => {
          state.loading = true;

          let updatedState = DGTableReducer(
            state,
            fetchAllIdsSuccess([1, 2, 3], validTimestamp)
          );
          expect(updatedState.loading).toBe(false);
          expect(updatedState.allIds).toEqual([1, 2, 3]);
        });

        it('should set the error state and reset loading state when given a FetchAllIdsFailure action', () => {
          state.loading = true;

          let updatedState = DGTableReducer(
            state,
            fetchAllIdsFailure('Test error message')
          );
          expect(updatedState.loading).toBe(false);
          expect(updatedState.error).toEqual('Test error message');
        });
      });
    });
  });
});
