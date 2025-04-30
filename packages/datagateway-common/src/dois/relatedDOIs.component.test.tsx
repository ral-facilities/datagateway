import { render, RenderResult, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import RelatedDOIs from './relatedDOIs.component';
import axios, { AxiosResponse } from 'axios';

setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
});

jest.mock('loglevel');

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('DOI generation form component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  let props: React.ComponentProps<typeof RelatedDOIs>;

  let mockDOIResponse;

  const TestComponent: React.FC = () => {
    const [relatedDOIs, changeRelatedDOIs] = React.useState(
      // eslint-disable-next-line react/prop-types
      props.relatedDOIs
    );

    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <RelatedDOIs
          relatedDOIs={relatedDOIs}
          changeRelatedDOIs={changeRelatedDOIs}
          dataCiteUrl="example.com"
        />
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
      dataCiteUrl: 'example.com',
    };

    mockDOIResponse = {
      data: {
        id: '2',
        type: 'DOI',
        attributes: {
          doi: 'related.doi.2',
          titles: [{ title: 'Related DOI 2' }],
          url: 'www.example.com',
        },
      },
    };

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/dois\/.*/.test(url)) {
          return Promise.resolve({
            data: mockDOIResponse,
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
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
    (axios.get as jest.Mock).mockRejectedValueOnce({
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
