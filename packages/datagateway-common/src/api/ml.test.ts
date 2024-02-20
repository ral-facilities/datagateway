import { MLSearchResults, useMLSearch } from './ml';
import axios from 'axios';
import { renderHook } from '@testing-library/react-hooks';
import { createReactQueryWrapper } from '../setupTests';

describe('ML APIs', () => {
  describe('ML search', () => {
    const mockSearchResults: MLSearchResults = [
      {
        score: 0.1,
        id: 1,
        visitId: '1',
        name: 'Mock investigation 1 name',
        title: 'Mock investigation 1',
        summary: 'Mock investigation 1 summary',
      },
      {
        score: 0.2,
        id: 2,
        visitId: '2',
        name: 'Mock investigation 2 name',
        title: 'Mock investigation 2',
        summary: 'Mock investigation 2 summary',
      },
      {
        score: 0.15,
        id: 3,
        visitId: '3',
        name: 'Mock investigation 3 name',
        title: 'Mock investigation 3',
        summary: 'Mock investigation 3 summary',
      },
    ];

    it('allows semantic search to be performed', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: mockSearchResults,
      });

      const { result, waitFor } = renderHook(
        () => useMLSearch({ query: 'Test query', type: 'semantic' }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual([
        {
          score: 0.2,
          id: 2,
          visitId: '2',
          name: 'Mock investigation 2 name',
          title: 'Mock investigation 2',
          summary: 'Mock investigation 2 summary',
        },
        {
          score: 0.15,
          id: 3,
          visitId: '3',
          name: 'Mock investigation 3 name',
          title: 'Mock investigation 3',
          summary: 'Mock investigation 3 summary',
        },
        {
          score: 0.1,
          id: 1,
          visitId: '1',
          name: 'Mock investigation 1 name',
          title: 'Mock investigation 1',
          summary: 'Mock investigation 1 summary',
        },
      ]);
    });
  });
});
