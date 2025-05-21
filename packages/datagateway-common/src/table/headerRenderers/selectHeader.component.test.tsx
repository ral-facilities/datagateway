import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectCell from '../cellRenderers/selectCell.component';
import SelectHeader from './selectHeader.component';

describe('Select column header component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const setLastChecked = vi.fn();
  const onCheck = vi.fn();
  const onUncheck = vi.fn();
  const selectHeaderProps = {
    dataKey: 'test',
    selectedRows: [],
    totalRowCount: 3,
    onCheck,
    onUncheck,
    allIds: [1, 2, 3],
    loading: false,
    parentSelected: false,
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    setLastChecked.mockClear();
    onCheck.mockClear();
    onUncheck.mockClear();
  });

  it('renders correctly when unchecked', async () => {
    const { asFragment } = render(<SelectHeader {...selectHeaderProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when indeterminate', async () => {
    const { asFragment } = render(
      <SelectHeader {...selectHeaderProps} selectedRows={[1]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when checked', async () => {
    const { asFragment } = render(
      <SelectHeader {...selectHeaderProps} selectedRows={[1, 2, 3]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when selectedRows is undefined', async () => {
    const { asFragment } = render(
      <SelectHeader {...selectHeaderProps} selectedRows={undefined} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when loading is true', async () => {
    const { asFragment } = render(
      <SelectHeader
        {...selectHeaderProps}
        loading={true}
        selectedRows={undefined}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when selectedRows parentSelected is true', () => {
    const { asFragment } = render(
      <SelectCell
        {...selectHeaderProps}
        parentSelected={true}
        selectedRows={[1]}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onCheck when not all rows are selected and the checkbox is clicked', async () => {
    render(<SelectHeader {...selectHeaderProps} selectedRows={[1]} />);
    await user.click(await screen.findByRole('checkbox'));
    expect(onCheck).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('calls onUncheck when all rows are selected and the checkbox is clicked', async () => {
    render(<SelectHeader {...selectHeaderProps} selectedRows={[1, 2, 3]} />);
    await user.click(await screen.findByRole('checkbox'));
    expect(onUncheck).toHaveBeenCalledWith([1, 2, 3]);
  });
});
