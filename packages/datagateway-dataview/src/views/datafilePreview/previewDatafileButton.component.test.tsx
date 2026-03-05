import { RenderResult, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  dGCommonInitialState,
  readSciGatewayToken,
  type Datafile,
  type StateType,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PreviewDatafileButton, {
  PreviewDatafileButtonProps,
} from './previewDatafileButton.component';
import { mockDatafile } from './testData';

vi.mock('datagateway-common', async () => ({
  ...(await vi.importActual('datagateway-common')),
  readSciGatewayToken: vi
    .fn()
    .mockReturnValue({ sessionId: 'abcdef', username: 'test' }),
}));

describe('PreviewDatafileButton', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let user: ReturnType<typeof userEvent.setup>;

  function renderComponent(props: PreviewDatafileButtonProps): RenderResult {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <PreviewDatafileButton {...props} />
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: {}, //Dont need to fill, since not part of the test
        dgcommon: {
          ...dGCommonInitialState,
        },
      })
    );
  });

  describe('given a supported datafile', () => {
    it('should be enabled', () => {
      renderComponent({ datafile: mockDatafile });
      expect(
        screen.getByRole('link', { name: 'datafiles.preview.preview_datafile' })
      ).toBeEnabled();
    });

    it('should show a tooltip indicating that this button opens the preview of the datafile when hovered over', async () => {
      renderComponent({ datafile: mockDatafile });

      await user.hover(
        screen.getByRole('link', { name: 'datafiles.preview.preview_datafile' })
      );

      expect(
        await screen.findByText('datafiles.preview.preview_datafile')
      ).toBeInTheDocument();
    });
  });

  describe('given an unsupported datafile', () => {
    const unsupportedDatafile: Datafile = {
      ...mockDatafile,
      name: 'Datafile.exe',
    };

    it('should be disabled', async () => {
      renderComponent({ datafile: unsupportedDatafile });

      // toBeDisabled does not support aria-disabled
      // https://github.com/testing-library/jest-dom/issues/144
      expect(
        screen.getByRole('link', {
          name: 'datafiles.preview.preview_datafile',
        })
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('should show a tooltip indicating that this datafile cannot be previewed when hovered over', async () => {
      renderComponent({ datafile: unsupportedDatafile });

      // link cannot be hovered directly because it is disabled
      // we find its container div by its label (which is the same as the tooltip text)
      await user.hover(
        screen.getByLabelText('datafiles.preview.preview_unsupported')
      );

      expect(
        await screen.findByText('datafiles.preview.preview_unsupported')
      ).toBeInTheDocument();
    });
  });

  it('renders as disabled when logged in as anon and disableAnonDownload is true', async () => {
    state.dgcommon.features = { disableAnonDownload: true };
    vi.mocked(readSciGatewayToken).mockReturnValue({
      sessionId: 'abcdef',
      username: 'anon/anon',
    });

    renderComponent({ datafile: mockDatafile });

    const previewButton = screen.getByRole('link', {
      name: 'datafiles.preview.preview_datafile',
    });

    expect(
      screen.getByRole('link', {
        name: 'datafiles.preview.preview_datafile',
      })
    ).toHaveAttribute('aria-disabled', 'true');

    // eslint-disable-next-line testing-library/no-node-access
    await user.hover(previewButton.parentElement!);

    expect(
      await screen.findByText('buttons.disallow_anon_tooltip')
    ).toBeInTheDocument();
  });
});
