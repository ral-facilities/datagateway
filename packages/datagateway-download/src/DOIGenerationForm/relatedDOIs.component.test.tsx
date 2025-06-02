import { render, RenderResult, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DownloadSettingsContext } from '../ConfigProvider';
import { mockedSettings } from '../testData';
import { fetchDOI } from '../downloadApi';
import RelatedDOIs from './relatedDOIs.component';

jest.mock('../downloadApi', () => {
  const originalModule = jest.requireActual('../downloadApi');

  return {
    ...originalModule,

    fetchDOI: jest.fn(),
  };
});

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    // silence react-query errors
    logger: {
      log: console.log,
      warn: console.warn,
      error: jest.fn(),
    },
  });

describe('DOI generation form component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  let props: React.ComponentProps<typeof RelatedDOIs>;

  const TestComponent: React.FC = () => {
    const [relatedDOIs, changeRelatedDOIs] = React.useState(
      // eslint-disable-next-line react/prop-types
      props.relatedDOIs
    );

    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <RelatedDOIs
            relatedDOIs={relatedDOIs}
            changeRelatedDOIs={changeRelatedDOIs}
          />
        </DownloadSettingsContext.Provider>
      </QueryClientProvider>
    );
  };

  const renderComponent = (): RenderResult => render(<TestComponent />);

  beforeEach(() => {
    user = userEvent.setup();

    props = {
      relatedDOIs: [
        {
          title: 'Related DOI 1',
          fullReference: '',
          identifier: 'related.doi.1',
          relationType: '',
          relatedItemType: '',
        },
      ],
      changeRelatedDOIs: jest.fn(),
    };
    (fetchDOI as jest.MockedFunction<typeof fetchDOI>).mockResolvedValue({
      id: '2',
      type: 'DOI',
      attributes: {
        doi: 'related.doi.2',
        titles: [{ title: 'Related DOI 2' }],
        url: 'www.example.com',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should let the user add related dois (but not if fetchDOI fails) + lets you change the relation type + resource type', async () => {
    renderComponent();

    expect(
      within(
        screen.getByRole('table', { name: 'DOIGenerationForm.related_dois' })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(1);

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.related_doi' }),
      '2'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_related_doi' })
    );

    expect(
      within(
        screen.getByRole('table', { name: 'DOIGenerationForm.related_dois' })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);
    expect(
      screen.getByRole('cell', { name: 'related.doi.2' })
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', {
        name: /DOIGenerationForm.related_doi_relationship/i,
      })[0]
    );
    await user.click(await screen.findByRole('option', { name: 'IsCitedBy' }));

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('IsCitedBy')).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', {
        name: /DOIGenerationForm.related_doi_resource_type/i,
      })[0]
    );
    await user.click(await screen.findByRole('option', { name: 'Journal' }));

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('Journal')).toBeInTheDocument();

    // test errors with various API error responses
    (fetchDOI as jest.MockedFunction<typeof fetchDOI>).mockRejectedValueOnce({
      response: { data: { errors: [{ title: 'error msg' }] }, status: 404 },
    });

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.related_doi' }),
      '3'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_related_doi' })
    );

    expect(await screen.findByText('error msg')).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('table', { name: 'DOIGenerationForm.related_dois' })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);
  });

  it('should let the user delete related dois', async () => {
    renderComponent();

    expect(
      within(
        screen.getByRole('table', { name: 'DOIGenerationForm.related_dois' })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(1);
    expect(
      screen.getByRole('cell', { name: 'related.doi.1' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.delete_related_doi',
      })
    );

    expect(
      screen.queryByRole('table', { name: 'DOIGenerationForm.related_dois' })
    ).not.toBeInTheDocument();
  });

  it('should render dois as links and show title on hover', async () => {
    renderComponent();

    const doiLink = screen.getByRole('link', { name: 'related.doi.1' });

    expect(doiLink).toHaveAttribute('href', 'https://doi.org/related.doi.1');

    await user.hover(doiLink);

    expect(
      await screen.findByRole('tooltip', { name: 'Related DOI 1' })
    ).toBeInTheDocument();
  });
});
