import * as React from 'react';
import { render, screen } from '@testing-library/react';
import SearchTypeDropdown, { SearchType } from './searchTypeDropdown.component';
import userEvent from '@testing-library/user-event';

describe('Search type dropdown', () => {
  it('displays initial search type as selected', () => {
    render(<SearchTypeDropdown searchType="lucene" onChange={jest.fn()} />);
    const dropdownButton = screen.getByRole('button', { name: 'Search type' });
    expect(dropdownButton).toBeInTheDocument();
    expect(dropdownButton).toHaveTextContent('Lucene');
  });

  it('allows various search types to be selected', async () => {
    function TestComponent(): JSX.Element {
      const [searchType, setSearchType] = React.useState<SearchType>('lucene');
      return (
        <SearchTypeDropdown searchType={searchType} onChange={setSearchType} />
      );
    }

    const user = userEvent.setup();

    render(<TestComponent />);

    const dropdownButton = screen.getByRole('button', { name: 'Search type' });

    await user.click(dropdownButton);
    await user.click(screen.getByRole('option', { name: 'Semantic' }));
    expect(dropdownButton).toHaveTextContent('Semantic');

    await user.click(dropdownButton);
    await user.click(screen.getByRole('option', { name: 'Lexical' }));
    expect(dropdownButton).toHaveTextContent('Lexical');
  });
});
