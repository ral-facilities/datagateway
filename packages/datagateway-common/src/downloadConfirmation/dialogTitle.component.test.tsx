import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import DialogTitle from './dialogTitle.component';

describe('DialogTitle', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <DialogTitle id="dialog-title" onClose={jest.fn()}>
        Title
      </DialogTitle>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should call dialog close callback when the close button is clicked', async () => {
    const user = userEvent.setup();
    const mockCloseDialog = jest.fn();

    render(
      <DialogTitle id="dialog-title" onClose={mockCloseDialog}>
        Title
      </DialogTitle>
    );

    await user.click(
      await screen.findByRole('button', {
        name: 'downloadConfirmDialog.close_arialabel',
      })
    );

    expect(mockCloseDialog).toHaveBeenCalledTimes(1);
  });
});
