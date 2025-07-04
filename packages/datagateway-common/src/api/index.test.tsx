import {
  getApiParams,
  nestedValue,
  parseQueryToSearch,
  parseSearchToQuery,
  useCustomFilter,
  useIds,
  usePushFilter,
  usePushFilters,
  usePushPage,
  usePushResults,
  useSort,
  useUpdateView,
  useCustomFilterCount,
  usePushSearchText,
  usePushSearchToggles,
  usePushSearchEndDate,
  usePushSearchStartDate,
  useUpdateQueryParam,
  usePushQueryParams,
  useSingleSort,
  usePushSearchRestrict,
} from './index';
import {
  FiltersType,
  Investigation,
  QueryParams,
  SortType,
} from '../app.types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMemoryHistory, History } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import axios from 'axios';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import type { MockInstance } from 'vitest';

vi.mock('../handleICATError');

describe('generic api functions', () => {
  afterEach(() => {
    vi.mocked(handleICATError).mockClear();
    vi.mocked(axios.get).mockClear();
  });

  describe('nestedValue', () => {
    it('nestedValue returns correct nested data', () => {
      const investigation: Investigation = {
        id: 0,
        name: 'test',
        title: 'Investigation title',
        visitId: '1',
        facility: {
          id: 1,
          name: 'Test Facility',
        },
      };
      expect(nestedValue(investigation, 'facility.name')).toEqual(
        'Test Facility'
      );
    });

    it('nestedValue returns correct nested data including array indices', () => {
      const investigation: Investigation = {
        id: 0,
        name: 'test',
        title: 'Investigation title',
        visitId: '1',
        investigationInstruments: [
          {
            id: 0,
            instrument: {
              id: 1,
              name: 'Instrument 1',
            },
          },
        ],
      };
      expect(
        nestedValue(
          investigation,
          'investigationInstruments[0].instrument.name'
        )
      ).toEqual('Instrument 1');
    });

    it('nestedValue returns empty string when provided with a falsy entry', () => {
      const investigation: Investigation = {
        id: 0,
        name: 'test',
        title: 'Investigation title',
        visitId: '1',
      };
      expect(nestedValue(investigation, 'summary')).toEqual('');
    });
  });

  describe('parseSearchToQuery', () => {
    it('parses query string successfully', () => {
      const query =
        '?view=table&search=test&page=1&results=10&filters={"name"%3A{"value"%3A"test"%2C"type"%3A"include"}}&sort={"name"%3A"asc"}';

      expect(parseSearchToQuery(query)).toEqual({
        view: 'table',
        search: 'test',
        page: 1,
        restrict: false,
        results: 10,
        filters: { name: { value: 'test', type: 'include' } },
        sort: { name: 'asc' },
        searchText: null,
        dataset: true,
        datafile: true,
        investigation: true,
        startDate: null,
        endDate: null,
        currentTab: 'investigation',
      });
    });

    it('parses query string with search parameters successfully', () => {
      const query =
        'view=table&searchText=testText&datafile=false&startDate=2021-10-17&endDate=2021-10-25&restrict=true';

      expect(parseSearchToQuery(query)).toEqual({
        view: 'table',
        search: null,
        page: null,
        restrict: true,
        results: null,
        filters: {},
        sort: {},
        searchText: 'testText',
        dataset: true,
        datafile: false,
        investigation: true,
        startDate: new Date('2021-10-17T00:00:00Z'),
        endDate: new Date('2021-10-25T00:00:00Z'),
        currentTab: 'investigation',
      });
    });

    it('parses query string with invalid search parameters successfully', () => {
      const query =
        'view=table&searchText=testText&datafile=false&startDate=2021-10-34&endDate=2021-14-25';

      //Use JSON.stringify so wont fail due to startDate/endDate not being the same instance
      expect(JSON.stringify(parseSearchToQuery(query))).toEqual(
        JSON.stringify({
          view: 'table',
          search: null,
          page: null,
          results: null,
          filters: {},
          sort: {},
          searchText: 'testText',
          dataset: true,
          datafile: false,
          investigation: true,
          startDate: new Date(NaN),
          endDate: new Date(NaN),
          currentTab: 'investigation',
          restrict: false,
        })
      );
    });

    it('logs errors if filter or search params are wrong', () => {
      console.error = vi.fn();

      const query = '?filters={"name"%3A"test"&sort=["name","asc"';
      parseSearchToQuery(query);

      expect(console.error).toHaveBeenCalledWith(
        'Filter query provided in an incorrect format.'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Sort query provided in an incorrect format.'
      );
    });
  });

  describe('parseQueryToSearch', () => {
    it('parses query object successfully', () => {
      const query: QueryParams = {
        view: 'table',
        search: 'test',
        page: 1,
        results: 10,
        restrict: false,
        filters: { name: { value: 'test', type: 'include' } },
        sort: { name: 'asc' },
        searchText: null,
        dataset: true,
        datafile: true,
        investigation: true,
        startDate: null,
        endDate: null,
        currentTab: 'investigation',
      };

      const params = new URLSearchParams(
        '?view=table&search=test&page=1&results=10&filters=%7B%22name%22%3A%7B%22value%22%3A%22test%22%2C%22type%22%3A%22include%22%7D%7D&sort=%7B%22name%22%3A%22asc%22%7D'
      );

      expect(parseQueryToSearch(query).toString()).toEqual(params.toString());
    });

    it('parses query object with search parameters successfully', () => {
      const query: QueryParams = {
        view: 'table',
        search: null,
        page: null,
        restrict: true,
        results: null,
        filters: {},
        sort: {},
        searchText: 'testText',
        dataset: true,
        datafile: false,
        investigation: true,
        startDate: new Date('2021-10-17T00:00:00Z'),
        endDate: new Date('2021-10-25T00:00:00Z'),
        currentTab: 'investigation',
      };

      const params = new URLSearchParams(
        '?view=table&restrict=true&searchText=testText&datafile=false&startDate=2021-10-17&endDate=2021-10-25'
      );

      expect(parseQueryToSearch(query).toString()).toEqual(params.toString());
    });

    it('parses query object with invalid search parameters successfully', () => {
      const query: QueryParams = {
        view: 'table',
        search: null,
        page: null,
        restrict: false,
        results: null,
        filters: {},
        sort: {},
        searchText: 'testText',
        dataset: true,
        datafile: false,
        investigation: true,
        startDate: new Date('2021-10-34T00:00:00Z'),
        endDate: new Date('2021-14-25T00:00:00Z'),
        currentTab: 'investigation',
      };

      const params = new URLSearchParams(
        '?view=table&searchText=testText&datafile=false&startDate=Invalid+Date&endDate=Invalid+Date'
      );

      expect(parseQueryToSearch(query).toString()).toEqual(params.toString());
    });
  });

  describe('getApiParams', () => {
    it('parses all filter types to api params successfully', () => {
      const sortAndFilters: { sort: SortType; filters: FiltersType } = {
        filters: {
          name: { value: "test'", type: 'include' },
          title: { value: "test'", type: 'exclude' },
          doi: { value: "test'", type: 'exact' },
          startDate: {
            startDate: '2021-08-05',
            endDate: '2021-08-06',
          },
          type: ['1', '2', '3'],
        },
        sort: { name: 'asc' },
      };

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('name asc'));
      params.append('order', JSON.stringify('id asc'));
      params.append('where', JSON.stringify({ name: { ilike: "test''" } }));
      params.append('where', JSON.stringify({ title: { nilike: "test''" } }));
      params.append('where', JSON.stringify({ doi: { eq: "test''" } }));
      params.append(
        'where',
        JSON.stringify({ startDate: { gte: '2021-08-05 00:00:00' } })
      );
      params.append(
        'where',
        JSON.stringify({ startDate: { lte: '2021-08-06 23:59:59' } })
      );
      params.append('where', JSON.stringify({ type: { in: ['1', '2', '3'] } }));

      expect(getApiParams(sortAndFilters).toString()).toEqual(
        params.toString()
      );
    });

    it('parses all filter types to api params successfully when ignoreIDSort is true', () => {
      const sortAndFilters: { sort: SortType; filters: FiltersType } = {
        filters: {
          name: { value: 'test', type: 'include' },
          title: { value: 'test', type: 'exclude' },
          doi: { value: 'test', type: 'exact' },
          startDate: {
            startDate: '2021-08-05',
            endDate: '2021-08-06',
          },
          type: ['1', '2', '3'],
        },
        sort: { name: 'asc' },
      };

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('name asc'));
      params.append('where', JSON.stringify({ name: { ilike: 'test' } }));
      params.append('where', JSON.stringify({ title: { nilike: 'test' } }));
      params.append('where', JSON.stringify({ doi: { eq: 'test' } }));
      params.append(
        'where',
        JSON.stringify({ startDate: { gte: '2021-08-05 00:00:00' } })
      );
      params.append(
        'where',
        JSON.stringify({ startDate: { lte: '2021-08-06 23:59:59' } })
      );
      params.append('where', JSON.stringify({ type: { in: ['1', '2', '3'] } }));

      expect(getApiParams(sortAndFilters, true).toString()).toEqual(
        params.toString()
      );
    });
  });

  describe('push functions', () => {
    let history: History;
    let wrapper: React.JSXElementConstructor<{
      children: React.ReactElement;
    }>;
    let pushSpy: MockInstance<typeof history.push>;
    let replaceSpy: MockInstance<typeof history.replace>;
    beforeEach(() => {
      history = createMemoryHistory();
      pushSpy = vi.spyOn(history, 'push');
      replaceSpy = vi.spyOn(history, 'replace');
      const newWrapper: React.JSXElementConstructor<{
        children: React.ReactElement;
      }> = ({ children }) => <Router history={history}>{children}</Router>;
      wrapper = newWrapper;
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.resetModules();
      window.history.pushState({}, 'Test', '/');
      vi.doUnmock('./index.tsx');
    });

    describe('useSort', () => {
      it('returns callback that can push a new sort to the url query', () => {
        const { result } = renderHook(() => useSort(), {
          wrapper,
        });

        act(() => {
          result.current('name', 'asc', 'push');
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?sort=${encodeURIComponent('{"name":"asc"}')}`,
        });
      });

      it('returns callback that can replace the sort with a new one in the url query', () => {
        const { result } = renderHook(() => useSort(), {
          wrapper,
        });

        act(() => {
          result.current('name', 'asc', 'replace');
        });

        expect(replaceSpy).toHaveBeenCalledWith({
          search: `?sort=${encodeURIComponent('{"name":"asc"}')}`,
        });
      });

      it('returns callback that when called removes a null sort from the url query', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?sort=%7B%22name%22%3A%22asc%22%7D'),
        }));

        const { result } = renderHook(() => useSort(), {
          wrapper,
        });

        act(() => {
          result.current('name', null, 'push');
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?',
        });
      });

      it('returns callback that, when called without shift modifier, replaces sort with the new one', () => {
        window.history.pushState(
          {},
          'Test',
          '?sort=%7B%22name%22%3A%22asc%22%7D'
        );
        const { result } = renderHook(() => useSort(), {
          wrapper,
        });

        act(() => {
          result.current('title', 'asc', 'push', false);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?sort=${encodeURIComponent('{"title":"asc"}')}`,
        });
      });

      it('returns callback that, when called with shift modifier, appends new sort to the existing one', () => {
        window.history.pushState(
          {},
          'Test',
          '?sort=%7B%22name%22%3A%22asc%22%7D'
        );

        const { result } = renderHook(() => useSort(), {
          wrapper,
        });

        act(() => {
          result.current('title', 'asc', 'push', true);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?sort=${encodeURIComponent('{"name":"asc","title":"asc"}')}`,
        });
      });
    });

    describe('usePushFilter', () => {
      it('returns callback that when called pushes a new filter to the url query', () => {
        const { result } = renderHook(() => usePushFilter(), {
          wrapper,
        });

        act(() => {
          result.current('name', { value: 'test', type: 'include' });
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?filters=${encodeURIComponent(
            '{"name":{"value":"test","type":"include"}}'
          )}`,
        });
      });

      it('returns callback that when called removes a null sort from the url query', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(
            () =>
              '?filters=%7B%22name%22%3A%7B%22value%22%3A%22test%22%2C%22type%22%3A%22include%22%7D%7D'
          ),
        }));

        const { result } = renderHook(() => usePushFilter(), {
          wrapper,
        });

        act(() => {
          result.current('name', null);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?',
        });
      });

      it('can pass a filter prefix to the callback', () => {
        const { result } = renderHook(() => usePushFilter('prefix.'), {
          wrapper,
        });

        act(() => {
          result.current('name', { value: 'test', type: 'include' });
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?filters=${encodeURIComponent(
            '{"prefix.name":{"value":"test","type":"include"}}'
          )}`,
        });

        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(
            () =>
              '?filters=%7B%22prefix.name%22%3A%7B%22value%22%3A%22test%22%2C%22type%22%3A%22include%22%7D%7D'
          ),
        }));

        act(() => {
          result.current('name', null);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?',
        });
      });
    });

    describe('usePushFilters', () => {
      it('returns callback that when called pushes multiple new filters to the url query', () => {
        const { result } = renderHook(() => usePushFilters(), {
          wrapper,
        });

        act(() => {
          result.current([
            { filterKey: 'name', filter: { value: 'test', type: 'include' } },
            { filterKey: 'title', filter: { value: 'test2', type: 'include' } },
          ]);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?filters=${encodeURIComponent(
            '{"name":{"value":"test","type":"include"},"title":{"value":"test2","type":"include"}}'
          )}`,
        });
      });

      it('returns callback that when called removes multiple null filters from the url query', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(
            () =>
              '?filters=%7B%22name%22%3A%7B%22value%22%3A%22test%22%2C%22type%22%3A%22include%22%7D%2C%22title%22%3A%7B%22value%22%3A%22test2%22%2C%22type%22%3A%22include%22%7D%7D'
          ),
        }));

        const { result } = renderHook(() => usePushFilters(), {
          wrapper,
        });

        act(() => {
          result.current([
            { filterKey: 'name', filter: null },
            { filterKey: 'title', filter: null },
          ]);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?',
        });
      });
    });

    describe('usePushPage', () => {
      it('returns callback that when called pushes a new page to the url query', () => {
        const { result } = renderHook(() => usePushPage(), {
          wrapper,
        });

        act(() => {
          result.current(1);
        });

        expect(pushSpy).toHaveBeenCalledWith('?page=1');
      });
    });

    describe('usePushResults', () => {
      it('returns callback that when called pushes a new page to the url query', () => {
        const { result } = renderHook(() => usePushResults(), {
          wrapper,
        });

        act(() => {
          result.current(10);
        });

        expect(pushSpy).toHaveBeenCalledWith('?results=10');
      });
    });

    describe('useUpdateQueryParam', () => {
      it('returns callback that when called removes all filters from the url query (push)', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?'),
        }));

        const { result } = renderHook(
          () => useUpdateQueryParam('filters', 'push'),
          {
            wrapper,
          }
        );

        act(() => {
          result.current({
            name: { value: 'test', type: 'include' },
            title: { value: 'test2', type: 'include' },
          });
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search:
            '?filters=%7B%22name%22%3A%7B%22value%22%3A%22test%22%2C%22type%22%3A%22include%22%7D%2C%22title%22%3A%7B%22value%22%3A%22test2%22%2C%22type%22%3A%22include%22%7D%7D',
        });
      });

      it('returns callback that when called removes all sorts from the url query (push)', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?'),
        }));

        const { result } = renderHook(
          () => useUpdateQueryParam('sort', 'push'),
          {
            wrapper,
          }
        );

        act(() => {
          result.current({ name: 'asc' });
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?sort=%7B%22name%22%3A%22asc%22%7D',
        });
      });

      it('returns callback that when called removes page number from the url query (push)', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?'),
        }));

        const { result } = renderHook(
          () => useUpdateQueryParam('page', 'push'),
          {
            wrapper,
          }
        );

        act(() => {
          result.current(2);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?page=2',
        });
      });

      it('returns callback that when called removes results number from the url query (push)', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?'),
        }));

        const { result } = renderHook(
          () => useUpdateQueryParam('results', 'push'),
          {
            wrapper,
          }
        );

        act(() => {
          result.current(10);
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?results=10',
        });
      });

      it('returns callback that when called removes all filters from the url query (replace)', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?'),
        }));

        const { result } = renderHook(
          () => useUpdateQueryParam('filters', 'replace'),
          {
            wrapper,
          }
        );

        act(() => {
          result.current({
            name: { value: 'test', type: 'include' },
            title: { value: 'test2', type: 'include' },
          });
        });

        expect(replaceSpy).toHaveBeenCalledWith({
          search:
            '?filters=%7B%22name%22%3A%7B%22value%22%3A%22test%22%2C%22type%22%3A%22include%22%7D%2C%22title%22%3A%7B%22value%22%3A%22test2%22%2C%22type%22%3A%22include%22%7D%7D',
        });
      });

      it('returns callback that when called removes all sorts from the url query (replace)', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?'),
        }));

        const { result } = renderHook(
          () => useUpdateQueryParam('sort', 'replace'),
          {
            wrapper,
          }
        );

        act(() => {
          result.current({ name: 'asc' });
        });

        expect(replaceSpy).toHaveBeenCalledWith({
          search: '?sort=%7B%22name%22%3A%22asc%22%7D',
        });
      });

      it('returns callback that when called removes page number from the url query (replace)', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?'),
        }));

        const { result } = renderHook(
          () => useUpdateQueryParam('page', 'replace'),
          {
            wrapper,
          }
        );

        act(() => {
          result.current(2);
        });

        expect(replaceSpy).toHaveBeenCalledWith({
          search: '?page=2',
        });
      });

      it('returns callback that when called removes results number from the url query (replace)', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?'),
        }));

        const { result } = renderHook(
          () => useUpdateQueryParam('results', 'replace'),
          {
            wrapper,
          }
        );

        act(() => {
          result.current(10);
        });

        expect(replaceSpy).toHaveBeenCalledWith({
          search: '?results=10',
        });
      });
    });

    describe('useUpdateView', () => {
      it('returns callback that when called pushes a new view to the url query', () => {
        const { result } = renderHook(() => useUpdateView('push'), {
          wrapper,
        });

        act(() => {
          result.current('table');
        });

        expect(pushSpy).toHaveBeenCalledWith('?view=table');
      });

      it('returns callback that when called replaces the current view with a new one in the url query', () => {
        const { result } = renderHook(() => useUpdateView('replace'), {
          wrapper,
        });

        act(() => {
          result.current('table');
        });

        expect(replaceSpy).toHaveBeenCalledWith('?view=table');
      });
    });

    describe('usePushSearchText', () => {
      it('returns callback that when called pushes search text to the url query', () => {
        const { result } = renderHook(() => usePushSearchText(), {
          wrapper,
        });

        act(() => {
          result.current('test');
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?searchText=test',
        });
      });
    });

    describe('usePushSearchToggles', () => {
      it('returns callback that when called pushes search toggles to the url query', () => {
        const { result } = renderHook(() => usePushSearchToggles(), {
          wrapper,
        });

        act(() => {
          result.current(false, false, false);
        });

        expect(pushSpy).toHaveBeenCalledWith(
          '?dataset=false&datafile=false&investigation=false'
        );
      });
    });

    describe('usePushStartDate', () => {
      it('returns callback that when called pushes startDate to the url query', () => {
        const { result } = renderHook(() => usePushSearchStartDate(), {
          wrapper,
        });

        act(() => {
          result.current(new Date('2021-10-17T00:00:00Z'));
        });

        expect(pushSpy).toHaveBeenCalledWith(
          expect.stringContaining('?startDate=2021-10-17')
        );
      });
      it('returns callback that when called with null can remove startDate from the url query', () => {
        const { result } = renderHook(() => usePushSearchStartDate(), {
          wrapper,
        });

        act(() => {
          result.current(new Date('2021-10-17T00:00:00Z'));
          result.current(null);
        });

        expect(pushSpy).toHaveBeenLastCalledWith('?');
      });
    });

    describe('usePushEndDate', () => {
      it('returns callback that when called pushes endDate to the url query', () => {
        const { result } = renderHook(() => usePushSearchEndDate(), {
          wrapper,
        });

        act(() => {
          result.current(new Date('2021-10-25T00:00:00Z'));
        });

        expect(pushSpy).toHaveBeenCalledWith(
          expect.stringContaining('?endDate=2021-10-25')
        );
      });
      it('returns callback that when called with null can remove endDate from the url query', () => {
        const { result } = renderHook(() => usePushSearchEndDate(), {
          wrapper,
        });

        act(() => {
          result.current(new Date('2021-10-25T00:00:00Z'));
          result.current(null);
        });

        expect(pushSpy).toHaveBeenLastCalledWith('?');
      });
    });

    describe('usePushQueryParams', () => {
      it('returns callback that when called pushes query params to the url query', () => {
        history.replace({
          search:
            '?view=table&searchText=testText&datafile=false&startDate=2021-10-17&endDate=2021-10-25',
        });
        replaceSpy.mockClear();

        const { result } = renderHook(() => usePushQueryParams(), {
          wrapper,
        });

        act(() => {
          result.current({
            view: 'card',
            restrict: true,
            searchText: 'newText',
            dataset: false,
            datafile: true,
            investigation: false,
            startDate: null,
            currentTab: 'dataset',
          });
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search:
            '?view=card&searchText=newText&dataset=false&investigation=false&endDate=2021-10-25&currentTab=dataset&restrict=true',
        });
      });
    });

    describe('useSingleSort', () => {
      it('returns callback that can push a new sort to the url query', () => {
        const { result } = renderHook(() => useSingleSort(), {
          wrapper,
        });

        act(() => {
          result.current('name', 'asc', 'push');
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: `?sort=${encodeURIComponent('{"name":"asc"}')}`,
        });
      });

      it('returns callback that can replace the sort with a new one in the url query', () => {
        const { result } = renderHook(() => useSingleSort(), {
          wrapper,
        });

        act(() => {
          result.current('name', 'asc', 'replace');
        });

        expect(replaceSpy).toHaveBeenCalledWith({
          search: `?sort=${encodeURIComponent('{"name":"asc"}')}`,
        });
      });

      it('returns callback that when called removes a null sort from the url query', () => {
        vi.doMock('./index.tsx', async () => ({
          ...(await vi.importActual('./index.tsx')),
          parseSearchToQuery: vi.fn(() => '?sort=%7B%22name%22%3A%22asc%22%7D'),
        }));

        const { result } = renderHook(() => useSingleSort(), {
          wrapper,
        });

        act(() => {
          result.current('name', null, 'push');
        });

        expect(pushSpy).toHaveBeenCalledWith({
          search: '?',
        });
      });
    });

    describe('usePushSearchRestrict', () => {
      it('returns callback that when called pushes search restrict to the url query', () => {
        const { result } = renderHook(() => usePushSearchRestrict(), {
          wrapper,
        });

        act(() => {
          result.current(true);
        });

        expect(pushSpy).toHaveBeenCalledWith('?restrict=true');
      });
    });
  });

  describe('useIds', () => {
    it('sends axios request to fetch ids and returns successful response', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });

      const { result } = renderHook(
        () =>
          useIds('investigation', [
            { filterType: 'distinct', filterValue: '"name"' },
          ]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('order', JSON.stringify('id asc'));
      params.append('distinct', JSON.stringify(['name', 'id']));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual([1, 2, 3]);
    });

    it('does not send axios request to fetch ids when set to disabled', async () => {
      const { result } = renderHook(
        () => useIds('investigation', undefined, false),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');

      expect(axios.get).not.toHaveBeenCalled();
    });

    it('sends axios request to fetch ids and calls handleICATError on failure', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useIds('investigation'), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useCustomFilter', () => {
    it('sends axios request to fetch filters and returns successful response', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: [{ title: '1' }, { title: '2' }, { title: '3' }],
      });

      const { result } = renderHook(
        () =>
          useCustomFilter('investigation', 'title', [
            { filterType: 'distinct', filterValue: '"name"' },
          ]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('distinct', JSON.stringify(['name', 'title']));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(['1', '2', '3']);
    });

    it('sends axios request to fetch filters and calls handleICATError on failure', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(
        () => useCustomFilter('investigation', 'title'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useCustomFilterCount', () => {
    it('sends axios request to fetch filter counts and returns successful response', async () => {
      const filterKey = 'title';
      vi.mocked(axios.get).mockImplementation((url, options) =>
        Promise.resolve({
          data: JSON.parse(options.params.get('where'))[filterKey].eq ?? 0,
        })
      );

      const { result } = renderHook(
        () => useCustomFilterCount('investigation', 'title', ['1', '2', '3']),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() =>
        expect(result.current.every((query) => query.isSuccess)).toBe(true)
      );

      const params = new URLSearchParams();
      params.append(
        'where',
        JSON.stringify({
          [filterKey]: { eq: '1' },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        'https://example.com/api/investigations/count',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );

      params.set(
        'where',
        JSON.stringify({
          [filterKey]: { eq: '2' },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/investigations/count',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[1][1].params.toString()).toBe(
        params.toString()
      );

      params.set(
        'where',
        JSON.stringify({
          [filterKey]: { eq: '3' },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        3,
        'https://example.com/api/investigations/count',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[2][1].params.toString()).toBe(
        params.toString()
      );

      expect(result.current.map((query) => query.data)).toEqual([
        '1',
        '2',
        '3',
      ]);
    });

    it('sends axios request to fetch filter counts and calls handleICATError on failure', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        message: 'Test error',
      });

      const { result } = renderHook(
        () => useCustomFilterCount('investigation', 'title', ['1', '2', '3']),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() =>
        expect(result.current.every((query) => query.isError)).toBe(true)
      );

      expect(handleICATError).toHaveBeenCalledTimes(3);
      expect(result.current.map((query) => query.error)).toEqual(
        Array(3).fill({ message: 'Test error' })
      );
    });
  });
});
