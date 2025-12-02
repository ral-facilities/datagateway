import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderResult, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import {
  ContributorType,
  DOIIdentifierType,
  DOIRelationType,
  DOIResourceType,
} from '../app.types';
import DOIMetadataConfirmation from './DOIMetadataConfirmation.component';

describe('DOI metadata confirmation component', () => {
  let props: React.ComponentProps<typeof DOIMetadataConfirmation>;

  const renderComponent = (): RenderResult =>
    render(<DOIMetadataConfirmation {...props} />, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      ),
    });

  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();

    props = {
      draftMetadata: {
        doi: 'doi',
        titles: [{ title: 'test' }],
        descriptions: [
          { description: 'description', descriptionType: 'descriptionType' },
        ],
        creators: [
          {
            name: 'Test',
            nameType: 'nameType',
            givenName: 'Testy',
            familyName: 'McTestface',
            nameIdentifiers: [
              {
                nameIdentifier: '123',
                nameIdentifierScheme: 'other',
                schemeUri: null,
              },
            ],
            affiliations: [
              {
                affiliation: 'test university',
                affiliationIdentifier: null,
                affiliationIdentifierScheme: null,
                schemeUri: null,
              },
            ],
          },
        ],
        contributors: [
          {
            name: 'Test 2',
            nameType: 'nameType',
            givenName: 'John',
            familyName: 'Doe',
            nameIdentifiers: [
              {
                nameIdentifier: 'https://orcid.org/123',
                nameIdentifierScheme: 'ORCID',
                schemeUri: null,
              },
            ],
            affiliations: [],
            contributorType: ContributorType.ContactPerson,
          },
        ],
        relatedIdentifiers: [
          {
            relatedIdentifier: 'related.doi',
            relatedIdentifierType: DOIIdentifierType.DOI,
            relationType: DOIRelationType.Cites,
            resourceTypeGeneral: DOIResourceType.Dataset,
            relatedMetadataScheme: null,
            schemeUri: null,
            schemeType: null,
          },
          {
            relatedIdentifier: 'https://example.com/related-url',
            relatedIdentifierType: DOIIdentifierType.URL,
            relationType: DOIRelationType.IsCompiledBy,
            resourceTypeGeneral: DOIResourceType.ComputationalNotebook,
            relatedMetadataScheme: null,
            schemeUri: null,
            schemeType: null,
          },
          {
            relatedIdentifier: '12345',
            relatedIdentifierType: DOIIdentifierType.ISBN,
            relationType: DOIRelationType.IsDocumentedBy,
            resourceTypeGeneral: DOIResourceType.Book,
            relatedMetadataScheme: null,
            schemeUri: null,
            schemeType: null,
          },
        ],
        publisher: {
          name: 'test',
          publisherIdentifier: '234',
          publisherIdentifierScheme: '2345',
          schemeUri: 'https://example.com/publisher',
        },
        publicationYear: 2025,
        dates: [
          {
            date: '2025-09-01',
            dateType: 'Created',
            dateInformation: 'date info',
          },
          {
            date: '2025-09-02',
            dateType: 'Minted',
            dateInformation: null,
          },
        ],
        types: {
          resourceType: 'Experimental Datasets',
          resourceTypeGeneral: 'Other',
        },
        rightsList: [
          {
            rights: 'cc by',
            rightsUri: 'https://example.com/rights',
            rightsIdentifier: '12',
            rightsIdentifierScheme: '1234',
            schemeUri: 'https://example.com/rights-scheme',
          },
          {
            rights: 'other rights',
            rightsUri: null,
            rightsIdentifier: null,
            rightsIdentifierScheme: null,
            schemeUri: null,
          },
        ],
        geoLocations: [
          {
            geoLocationPlace: 'DLS',
            geoLocationPoint: {
              pointLatitude: 51.57452869855099,
              pointLongitude: -1.3108818134944835,
            },
          },
          {
            geoLocationPlace: null,
            geoLocationPoint: {
              pointLatitude: null,
              pointLongitude: 1,
            },
          },
        ],
        fundingReferences: [
          {
            funderName: 'test',
            funderIdentifier: '123',
            funderIdentifierType: 'Other',
            schemeUri: 'https://example.com/funder',
            awardUri: 'https://example.com/award',
            awardTitle: 'test 1',
            awardNumber: '1',
          },
          {
            funderName: 'null test',
            funderIdentifier: null,
            funderIdentifierType: null,
            schemeUri: null,
            awardUri: null,
            awardTitle: null,
            awardNumber: '2',
          },
        ],
        url: 'https://example.com',
        identifiers: [],
        subjects: [],
        alternateIdentifiers: [],
        language: 'en-GB',
        sizes: ['1 B'],
        formats: [],
        version: '1',
        relatedItems: [],
      },
      onBackClick: vi.fn(),
      onConfirmClick: vi.fn(),
      deleteLoading: false,
      publishLoading: false,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display the provided draft metadata', () => {
    const { asFragment } = renderComponent();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should display loading spinner when draft metadata is undefined', () => {
    props.draftMetadata = undefined;
    renderComponent();

    // expect loading spinner when waiting to fetch static metadata
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(
      screen.queryByText(`DOIGenerationForm.title`)
    ).not.toBeInTheDocument();
  });

  it('should call onConfirmClick when generate DOI button is clicked', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.generate_DOI',
      })
    );

    expect(props.onConfirmClick).toHaveBeenCalled();
  });

  it('should call onBackClick when back button is clicked', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.back_button',
      })
    );

    expect(props.onBackClick).toHaveBeenCalled();
  });

  it('should disable both buttons when publishLoading is true', () => {
    props.publishLoading = true;
    renderComponent();

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.generate_DOI',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.back_button',
      })
    ).toBeDisabled();
  });

  it('should disable both buttons when deleteLoading is true', () => {
    props.deleteLoading = true;
    renderComponent();

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.generate_DOI',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.back_button',
      })
    ).toBeDisabled();
  });
});
