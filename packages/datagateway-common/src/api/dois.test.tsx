import { act, renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import log from 'loglevel';
import {
  handleDOIAPIError,
  useCheckUser,
  useDOI,
  useDeleteDraftVersion,
  useDraftVersionDOI,
  useGetDescendantTechniques,
  useIsCartMintable,
  usePublishDraftVersion,
  useSearchPANETTechniques,
} from '.';
import { ContributorType, DownloadCartItem } from '../app.types';
import {
  createBioPortalTerm,
  createReactQueryWrapper,
  createTestQueryClient,
} from '../setupTests';
import {
  InvalidateTokenType,
  NotificationType,
} from '../state/actions/actions.types';

vi.mock('loglevel');
vi.mock('../handleICATError');

describe('handleDOIAPIError', () => {
  const localStorageGetItemMock = vi.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );
  let events: CustomEvent<{
    detail: { type: string; payload?: unknown };
  }>[] = [];
  let error: AxiosError<{
    detail: { msg: string }[] | string;
  }>;

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(
        e as CustomEvent<{ detail: { type: string; payload?: unknown } }>
      );
      return true;
    };

    const headers = {} as AxiosHeaders;
    const config = {
      url: 'https://example.com',
      headers,
    };
    error = {
      isAxiosError: true,
      config,
      response: {
        data: { detail: [{ msg: 'Test error message (response data)' }] },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageGetItemMock.mockReset();
  });

  it('should handle 401 by broadcasting an invalidate token message with autologin being true', async () => {
    localStorageGetItemMock.mockImplementation((name) => {
      return name === 'autoLogin' ? 'true' : null;
    });

    handleDOIAPIError(error);

    expect(log.error).toHaveBeenCalledWith(
      error.response?.data?.detail?.[0]?.msg
    );
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: InvalidateTokenType,
      payload: {
        severity: 'error',
        message: 'Your session has expired, please reload the page',
      },
    });
  });

  it('should handle 401 by broadcasting an invalidate token message with autologin being false & not log if false logging condition given', async () => {
    localStorageGetItemMock.mockImplementation((name) => {
      return name === 'autoLogin' ? 'false' : null;
    });

    handleDOIAPIError(error, undefined, undefined, false);

    expect(log.error).not.toHaveBeenCalled();
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: InvalidateTokenType,
      payload: {
        severity: 'error',
        message: 'Your session has expired, please login again',
      },
    });
  });

  it('should handle other errors by not broadcasting a message & log if true logging condition given', async () => {
    if (error.response) {
      error.response.status = 400;
      error.response.data.detail =
        'Test error message (response data) (string detail)';
    }
    handleDOIAPIError(error, undefined, undefined, true);

    expect(log.error).toHaveBeenCalledWith(error.response.data.detail);
    expect(events.length).toBe(0);
  });

  it('should handle other errors by broadcasting a message if broadcast condition is true', async () => {
    error.response = undefined;

    handleDOIAPIError(error, undefined, undefined, false, true);

    expect(log.error).not.toHaveBeenCalled();
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Network Error, please reload the page or try again later',
      },
    });
  });
});

describe('doi api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useCheckUser', () => {
    it('should check whether a user exists in ICAT', async () => {
      axios.get = vi
        .fn()
        .mockResolvedValue({ data: { id: 1, name: 'user 1' } });

      const { result } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ id: 1, name: 'user 1' });
      expect(axios.get).toHaveBeenCalledWith('/doi-minter/user/user 1', {
        headers: { Authorization: 'Bearer null' },
      });
    });

    it('should not retry 401 errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error.message);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry 404 errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 404,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error.message);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry 422 errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 422,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error.message);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should retry other errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 400,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error.message);
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
  });

  describe('useDraftVersionDOI', () => {
    const doiMetadata = {
      title: 'Test title',
      description: 'Test description',
      creators: [{ username: '1', contributor_type: ContributorType.Minter }],
      related_items: [],
    };
    const content = {
      datafile_ids: [1],
      dataset_ids: [2],
      investigation_ids: [3],
    };
    it('should send a post request with payload indicating the updated data', async () => {
      axios.post = vi.fn().mockResolvedValue({
        data: {
          version: {
            data_publication_id: '1',
            attributes: { doi: 'new.version.pid' },
          },
        },
      });

      const { result } = renderHook(() => useDraftVersionDOI(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({
          contentDataPublicationId: 'pid',
          content,
          doiMetadata,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        version: {
          data_publication_id: '1',
          attributes: { doi: 'new.version.pid' },
        },
      });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/draft/pid/version'),
        {
          metadata: {
            ...doiMetadata,
            resource_type: 'Collection',
          },
          investigation_ids: [3],
          dataset_ids: [2],
          datafile_ids: [1],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
    });

    it('handles errors correctly', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 500,
        },
      };
      axios.post = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useDraftVersionDOI(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({
          contentDataPublicationId: 'pid',
          content: { ...content, investigation_ids: [] },
          doiMetadata,
        });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error.message);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/draft/pid/version'),
        {
          metadata: {
            ...doiMetadata,
            resource_type: 'Dataset',
          },
          investigation_ids: [],
          dataset_ids: [2],
          datafile_ids: [1],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
    });
  });

  describe('usePublishDraftVersion', () => {
    it('should send a put request with a path of the draft version doi to publish', async () => {
      axios.put = vi.fn().mockResolvedValue({
        data: {
          concept: {
            data_publication_id: '1',
            attributes: { doi: 'pid' },
          },
          version: {
            data_publication_id: '2',
            attributes: { doi: 'new.version.pid' },
          },
        },
      });

      const queryClient = createTestQueryClient();
      const resetQueriesSpy = vi.spyOn(queryClient, 'resetQueries');

      const { result } = renderHook(() => usePublishDraftVersion(), {
        wrapper: createReactQueryWrapper(undefined, queryClient),
      });

      act(() => {
        result.current.mutate({
          contentDataPublicationId: 'pid',
          draftVersionDataPublicationId: 'new.version.pid',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        concept: {
          data_publication_id: '1',
          attributes: { doi: 'pid' },
        },
        version: {
          data_publication_id: '2',
          attributes: { doi: 'new.version.pid' },
        },
      });
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/draft/pid/version/new.version.pid/publish'),
        undefined,
        { headers: { Authorization: 'Bearer null' } }
      );
      expect(resetQueriesSpy).toHaveBeenCalled();
    });

    it('handles errors correctly', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 500,
        },
      };
      axios.put = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => usePublishDraftVersion(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({
          contentDataPublicationId: 'pid',
          draftVersionDataPublicationId: 'new.version.pid',
        });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error.message);
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/draft/pid/version/new.version.pid/publish'),
        undefined,
        { headers: { Authorization: 'Bearer null' } }
      );
    });
  });

  describe('useDeleteDraftVersion', () => {
    it('should send a delete request with a path of the draft version doi to delete', async () => {
      axios.delete = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteDraftVersion(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({
          contentDataPublicationId: 'pid',
          draftVersionDataPublicationId: 'new.version.pid',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(undefined);
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/draft/pid/version/new.version.pid'),
        { headers: { Authorization: 'Bearer null' } }
      );
    });

    it('handles errors correctly', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 500,
        },
      };
      axios.delete = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteDraftVersion(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({
          contentDataPublicationId: 'pid',
          draftVersionDataPublicationId: 'new.version.pid',
        });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error.message);
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/draft/pid/version/new.version.pid'),
        { headers: { Authorization: 'Bearer null' } }
      );
    });
  });

  describe('useIsCartMintable', () => {
    const mockCartItems: DownloadCartItem[] = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'INVESTIGATION 1',
        parentEntities: [],
      },
      {
        entityId: 2,
        entityType: 'investigation',
        id: 2,
        name: 'INVESTIGATION 2',
        parentEntities: [],
      },
      {
        entityId: 3,
        entityType: 'dataset',
        id: 3,
        name: 'DATASET 1',
        parentEntities: [],
      },
      {
        entityId: 4,
        entityType: 'datafile',
        id: 4,
        name: 'DATAFILE 1',
        parentEntities: [],
      },
    ];

    it('should check whether a cart is mintable', async () => {
      axios.post = vi.fn().mockResolvedValue({ data: undefined, status: 200 });

      const { result } = renderHook(
        () =>
          useIsCartMintable(mockCartItems, 'https://example.com/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(true);
      expect(axios.post).toHaveBeenCalledWith(
        `https://example.com/doi-minter/ismintable`,
        {
          investigation_ids: [1, 2],
          dataset_ids: [3],
          datafile_ids: [4],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
    });

    it('should be disabled if doiMinterUrl is not defined', async () => {
      const { result } = renderHook(
        () => useIsCartMintable(mockCartItems, undefined),
        { wrapper: createReactQueryWrapper() }
      );

      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should return false if cart is undefined', async () => {
      const { result } = renderHook(
        () => useIsCartMintable(undefined, 'https://example.com/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(false);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should return false if cart is empty', async () => {
      const { result } = renderHook(
        () => useIsCartMintable([], 'https://example.com/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(false);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should not log 403 errors or retry them', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 403,
        },
      };
      axios.post = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(
        () =>
          useIsCartMintable(mockCartItems, 'https://example.com/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).not.toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useDOI', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches DOI info from DataCite given a DOI', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: { data: { id: 1, attributes: { doi: 'doi' } } },
    });

    const { result } = renderHook(() => useDOI('doi'), {
      wrapper: createReactQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/datacite/dois/doi'
    );
    expect(result.current.data).toEqual({
      id: 1,
      attributes: { doi: 'doi' },
    });
  });

  it('is disabled if DOI is undefined', async () => {
    const { result } = renderHook(() => useDOI(undefined), {
      wrapper: createReactQueryWrapper(),
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.fetchStatus).toBe('idle');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('does not retry 404 errors', async () => {
    const error = {
      message: 'Test error message',
      response: {
        status: 404,
      },
    };
    axios.get = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useDOI('doi'), {
      wrapper: createReactQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('should retry other errors', async () => {
    const error = {
      message: 'Test error message',
      response: {
        status: 400,
      },
    };
    axios.get = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useDOI('doi'), {
      wrapper: createReactQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(axios.get).toHaveBeenCalledTimes(4);
  });
});

describe('BioPortal API functions', () => {
  const technique = createBioPortalTerm(1, ['1']);
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useSearchPANETTechniques', () => {
    it('fetches techniques info from BioPortal given a search string', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: {
          collection: [technique],
        },
      });

      const { result } = renderHook(
        () => useSearchPANETTechniques('1', 'https://example.com/bioportal'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/bioportal/search?ontology=PANET&subtree_root_id=http://purl.org/pan-science/PaNET/PaNET00001&include=prefLabel,synonym&suggest=true&q=1&pagesize=500&format=json&display_context=false'
      );
      expect(result.current.data).toEqual([technique]);
    });

    it('does not ask for suggestions if search string is empty', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: {
          collection: [],
        },
      });
      const { result } = renderHook(
        () => useSearchPANETTechniques('', 'https://example.com/bioportal'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/bioportal/search?ontology=PANET&subtree_root_id=http://purl.org/pan-science/PaNET/PaNET00001&include=prefLabel,synonym&q=&pagesize=500&format=json&display_context=false'
      );
      expect(result.current.data).toEqual([]);
    });

    it('is disabled if bioportal URL is not defined', async () => {
      const { result } = renderHook(
        () => useSearchPANETTechniques('test', undefined),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  describe('useGetDescendantTechniques', () => {
    it('fetches descendant techniques from BioPortal given a technique', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: {
          collection: [technique],
        },
      });

      const { result } = renderHook(
        () =>
          useGetDescendantTechniques(
            technique,
            'https://example.com/bioportal'
          ),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(axios.get).toHaveBeenCalledWith(
        `https://example.com/bioportal${
          new URL(technique.links.descendants).pathname
        }?pagesize=500&format=json&include=prefLabel,synonym&display_context=false`
      );
      expect(result.current.data).toEqual([technique]);
    });

    it('returns empty array if no collection is returned', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: {},
      });
      const { result } = renderHook(
        () =>
          useGetDescendantTechniques(
            technique,
            'https://example.com/bioportal'
          ),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(axios.get).toHaveBeenCalledWith(
        `https://example.com/bioportal${
          new URL(technique.links.descendants).pathname
        }?pagesize=500&format=json&include=prefLabel,synonym&display_context=false`
      );
      expect(result.current.data).toEqual([]);
    });

    it('is disabled if bioportal URL is not defined', async () => {
      const { result } = renderHook(
        () => useGetDescendantTechniques(technique, undefined),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('is disabled if no technique is passed', async () => {
      const { result } = renderHook(
        () => useGetDescendantTechniques(null, 'https://example.com/bioportal'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
});
