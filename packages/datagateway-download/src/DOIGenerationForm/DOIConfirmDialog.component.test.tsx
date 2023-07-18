import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, MemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router-dom';
import DOIConfirmDialog from './DOIConfirmDialog.component';

describe('Download cart table component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let props: React.ComponentProps<typeof DOIConfirmDialog>;

  const renderComponent = (): RenderResult & { history: MemoryHistory } => {
    const history = createMemoryHistory();
    return {
      history,
      ...render(
        <Router history={history}>
          <DOIConfirmDialog {...props} />
        </Router>
      ),
    };
  };

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      open: true,
      mintingStatus: 'loading',
      data: undefined,
      error: null,
      setClose: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading indicator when mintingStatus is loading', async () => {
    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.getByText('DOIConfirmDialog.mint_loading')
    ).toBeInTheDocument();

    // expect user can't close the dialog
    await user.type(screen.getByRole('dialog'), '{Esc}');
    expect(
      screen.queryByRole('button', {
        name: 'downloadConfirmDialog.close_arialabel',
      })
    ).not.toBeInTheDocument();
    expect(props.setClose).not.toHaveBeenCalled();
  });

  it('should show success indicators when mintingStatus is success and allow user to view their data publication', async () => {
    props.mintingStatus = 'success';
    props.data = { data_publication: '123456', doi: 'test_doi' };
    const { history } = renderComponent();

    expect(
      screen.getByText('DOIConfirmDialog.mint_success')
    ).toBeInTheDocument();
    expect(screen.getByText('test_doi', { exact: false })).toBeInTheDocument();

    await user.click(
      screen.getByRole('link', {
        name: 'DOIConfirmDialog.view_data_publication',
      })
    );
    expect(history.location).toMatchObject({
      pathname: `/browse/dataPublication/${props.data.data_publication}`,
    });
  });

  it('should show error indicators when mintingStatus is error and allow user to close the dialog', async () => {
    props.mintingStatus = 'error';
    props.error = { response: { data: { detail: 'error msg' } } };
    renderComponent();

    expect(screen.getByText('DOIConfirmDialog.mint_error')).toBeInTheDocument();
    expect(screen.getByText('error msg', { exact: false })).toBeInTheDocument();

    // use Esc to close dialog
    await user.type(screen.getByRole('dialog'), '{Esc}');
    expect(props.setClose).toHaveBeenCalled();
  });
});
