import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderResult, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { DOIIdentifierType, DataCiteResponse } from '../app.types';
import RelatedIdentifiers from './relatedIdentifiers.component';

vi.mock('loglevel');

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
      error: vi.fn(),
    },
  });

describe('Related identifiers form component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  let props: React.ComponentProps<typeof RelatedIdentifiers>;

  let mockDOIResponse: DataCiteResponse;

  const TestComponent: React.FC = () => {
    const [relatedIdentifiers, changeRelatedIdentifiers] = React.useState(
      props.relatedIdentifiers
    );

    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <RelatedIdentifiers
          {...props}
          relatedIdentifiers={relatedIdentifiers}
          changeRelatedIdentifiers={changeRelatedIdentifiers}
        />
      </QueryClientProvider>
    );
  };

  const renderComponent = (): RenderResult => render(<TestComponent />);

  beforeEach(() => {
    user = userEvent.setup();

    props = {
      relatedIdentifiers: [
        {
          title: 'Related DOI 1',
          fullReference: '',
          identifier: 'related.doi.1',
          relationType: '',
          relatedItemType: undefined,
          relatedIdentifierType: DOIIdentifierType.DOI,
        },
      ],
      changeRelatedIdentifiers: vi.fn(),
      dataCiteUrl: 'example.com',
      disabled: false,
    };

    mockDOIResponse = {
      data: {
        id: '2',
        type: 'DOI',
        attributes: {
          doi: 'related.doi.2',
          titles: [{ title: 'Related DOI 2' }],
          url: 'www.example.com',
          publisher: {
            name: '',
            publisherIdentifier: null,
            publisherIdentifierScheme: null,
            schemeUri: null,
          },
          publicationYear: 2025,
          dates: [],
          types: {
            resourceType: '',
            resourceTypeGeneral: '',
          },
          rightsList: [],
          geoLocations: [],
          fundingReferences: [],
          identifiers: [],
          creators: [],
          subjects: [],
          contributors: [],
          language: null,
          alternateIdentifiers: [],
          relatedIdentifiers: [],
          sizes: [],
          formats: [],
          version: '',
          descriptions: [],
          relatedItems: [],
        },
        relationships: undefined,
      },
    };

    axios.get = vi
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
    vi.clearAllMocks();
  });

  it('should let the user add related dois (but not if fetchDOI fails) + lets you change the relation type + resource type', async () => {
    renderComponent();

    expect(
      within(
        screen.getByRole('table', {
          name: 'DOIGenerationForm.related_identifiers',
        })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(1);

    await user.type(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.related_identifier',
      }),
      '2'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_related_doi' })
    );

    expect(
      within(
        screen.getByRole('table', {
          name: 'DOIGenerationForm.related_identifiers',
        })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);
    expect(
      screen.getByRole('cell', { name: 'related.doi.2' })
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_relationship',
      })[0]
    );
    // assert banned relations don't appear
    await screen.findByRole('option', { name: 'IsCitedBy' });
    expect(
      screen.queryByRole('option', { name: /Version/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: /Part/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: /Collect/i })
    ).not.toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: 'IsCitedBy' }));

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('IsCitedBy')).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_resource_type',
      })[0]
    );
    await user.click(await screen.findByRole('option', { name: 'Journal' }));

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('Journal')).toBeInTheDocument();

    // test errors with various API error responses
    vi.mocked(axios.get).mockRejectedValueOnce({
      response: { data: { errors: [{ title: 'error msg' }] }, status: 404 },
    });

    await user.type(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.related_identifier',
      }),
      '3'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_related_doi' })
    );

    expect(await screen.findByText('error msg')).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('table', {
          name: 'DOIGenerationForm.related_identifiers',
        })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);
  });

  it('should let the user add related non-dois + lets you change the relation type + resource type + identifier type', async () => {
    props.relatedIdentifiers = [];
    renderComponent();

    await user.type(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.related_identifier',
      }),
      'non.doi'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.add_related_other',
      })
    );

    expect(
      within(
        screen.getByRole('table', {
          name: 'DOIGenerationForm.related_identifiers',
        })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(1);

    expect(screen.getByRole('cell', { name: 'non.doi' })).toBeInTheDocument();

    // check that it defaults to URL
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'non.doi' })).toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_relationship',
      })
    );
    await user.click(
      await screen.findByRole('option', { name: 'IsSupplementedBy' })
    );

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('IsSupplementedBy')).toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_resource_type',
      })
    );
    await user.click(
      await screen.findByRole('option', { name: 'ComputationalNotebook' })
    );

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('ComputationalNotebook')).toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_identifier_type',
      })
    );
    await user.click(await screen.findByRole('option', { name: 'ISBN' }));

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('ISBN')).toBeInTheDocument();

    // expect to not render as a link anymore
    expect(
      screen.queryByRole('link', { name: 'non.doi' })
    ).not.toBeInTheDocument();
  });

  it('should let the user delete related identifiers', async () => {
    renderComponent();

    expect(
      within(
        screen.getByRole('table', {
          name: 'DOIGenerationForm.related_identifiers',
        })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(1);
    expect(
      screen.getByRole('cell', { name: 'related.doi.1' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.delete_related_identifier',
      })
    );

    expect(
      screen.queryByRole('table', {
        name: 'DOIGenerationForm.related_identifiers',
      })
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

  it('should render urls as links', async () => {
    props.relatedIdentifiers[0] = {
      title: 'URL 1',
      fullReference: '',
      identifier: 'https://example.com',
      relationType: '',
      relatedItemType: undefined,
      relatedIdentifierType: DOIIdentifierType.URL,
    };

    renderComponent();

    const urlLink = screen.getByRole('link', { name: 'https://example.com' });

    expect(urlLink).toHaveAttribute('href', 'https://example.com');
  });

  it('should disable all inputs when disabled prop is true', () => {
    props.disabled = true;
    renderComponent();

    expect(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.related_identifier',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_related_doi' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.add_related_other',
      })
    ).toBeDisabled();

    expect(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_resource_type',
      })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.related_identifier_relationship',
      })
    ).toHaveAttribute('aria-disabled', 'true');
  });
});
