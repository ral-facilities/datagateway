import MyDataCheckBox from './myDataCheckBox.component';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('myDataCheckbox', () => {
  it('renders correctly', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <MyDataCheckBox checked onChange={jest.fn()} />
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'check_boxes.my_data',
    });

    expect(checkbox).toBeChecked();

    // check if tooltip is working
    await user.hover(checkbox);
    expect(
      await screen.findByText('searchBox.my_data_tooltip')
    ).toBeInTheDocument();

    rerender(<MyDataCheckBox checked={false} onChange={jest.fn()} />);

    expect(
      screen.getByRole('checkbox', {
        name: 'check_boxes.my_data',
      })
    ).not.toBeChecked();
  });

  it('calls onChange callback when checkbox is toggled', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();

    const { rerender } = render(
      <MyDataCheckBox checked onChange={mockOnChange} />
    );

    await user.click(
      screen.getByRole('checkbox', { name: 'check_boxes.my_data' })
    );

    expect(mockOnChange).toHaveBeenLastCalledWith(false);

    rerender(<MyDataCheckBox checked={false} onChange={mockOnChange} />);

    await user.click(
      screen.getByRole('checkbox', { name: 'check_boxes.my_data' })
    );

    expect(mockOnChange).toHaveBeenLastCalledWith(true);
  });
});
