import { RenderResult, render } from '@testing-library/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import App, { ErrorFallback, QueryClientSettingsUpdaterContext } from './App';
import { flushPromises } from './setupTests';
import { mockedSettings } from './testData';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DownloadSettingsContext } from './ConfigProvider';

jest.mock('loglevel');
jest.mock('./ConfigProvider');

describe('App', () => {
  it('renders without crashing', async () => {
    const div = document.createElement('div');

    ReactDOM.render(<App />, div);

    await act(async () => {
      await flushPromises();
    });

    ReactDOM.unmountComponentAtNode(div);
  });
});

describe('ErrorFallback', () => {
  it('should should render an error message for when app fails catastrophically', () => {
    const { asFragment } = render(<ErrorFallback />);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('QueryClientSettingUpdaterContext', () => {
  let settings = mockedSettings;
  const renderComponent = (queryClient = new QueryClient()): RenderResult => {
    function Wrapper({
      children,
    }: React.PropsWithChildren<unknown>): JSX.Element {
      return (
        <DownloadSettingsContext.Provider value={settings}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </DownloadSettingsContext.Provider>
      );
    }
    return render(
      <QueryClientSettingsUpdaterContext queryClient={queryClient} />,
      {
        wrapper: Wrapper,
      }
    );
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    settings = mockedSettings;
  });

  it('syncs retry setting to query client when it updates', async () => {
    const queryClient = new QueryClient({
      // set random other option to check it doesn't get overridden
      defaultOptions: { queries: { staleTime: 300000 } },
    });
    const { rerender } = renderComponent(queryClient);

    settings.queryRetries = 0;

    rerender(<QueryClientSettingsUpdaterContext queryClient={queryClient} />);

    expect(queryClient.getDefaultOptions()).toEqual({
      queries: { staleTime: 300000, retry: 0 },
    });
  });
});
