import { fireEvent, render, screen } from '@testing-library/react';
import SearchButton from './searchButton.component';

vi.mock('loglevel');

describe('Search Button component tests', () => {
  const testInitiateSearch = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const view = render(<SearchButton initiateSearch={testInitiateSearch} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('initiates search when user clicks button', async () => {
    render(<SearchButton initiateSearch={testInitiateSearch} />);
    const button = await screen.findByLabelText(
      'searchBox.search_button_arialabel'
    );
    fireEvent.click(button);
    expect(testInitiateSearch).toHaveBeenCalled();
  });
});
