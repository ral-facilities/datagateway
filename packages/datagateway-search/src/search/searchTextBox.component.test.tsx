import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import SearchTextBox from './searchTextBox.component';

vi.mock('loglevel');

describe('Search text box component tests', () => {
  const testInitiateSearch = vi.fn();
  const handleChange = vi.fn();

  const createWrapper = (): RenderResult => {
    return render(
      <SearchTextBox
        searchText=""
        initiateSearch={testInitiateSearch}
        onChange={handleChange}
      />
    );
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const view = createWrapper();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('initiates search when user presses enter key', async () => {
    createWrapper();
    const input = await screen.findByLabelText(
      'searchBox.search_text_arialabel'
    );
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
    expect(testInitiateSearch).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(testInitiateSearch).toHaveBeenCalled();
  });
});
