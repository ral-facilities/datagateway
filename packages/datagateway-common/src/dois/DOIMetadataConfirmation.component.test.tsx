import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from '@tanstack/react-query';
import { RenderResult, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import * as React from 'react';
import { useStaticDataciteMetadata } from '../api';
import {
  ContributorType,
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

  const staticMetadata: ReturnType<
    typeof useStaticDataciteMetadata
  > extends UseQueryResult<infer X>
    ? X
    : never = {
    publisher: {
      name: 'test',
      publisherIdentifier: '234',
      publisherIdentifierScheme: '2345',
      schemeURI: 'https://example.com/publisher',
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
  };

  beforeEach(() => {
    user = userEvent.setup();

    props = {
      title: 'test',
      description: 'description',
      selectedUsers: [
        {
          id: 1,
          name: 'test',
          affiliation: 'test university',
          fullName: 'Test',
          email: 'test@example.com',
          contributor_type: ContributorType.Minter,
        },
        {
          id: 2,
          name: 'test2',
          fullName: 'Test 2',
          contributor_type: ContributorType.ContactPerson,
        },
      ],
      relatedDOIs: [
        {
          title: 'DOI Title',
          fullReference: '',
          identifier: 'doi',
          relatedItemType: DOIResourceType.Dataset,
          relationType: DOIRelationType.Cites,
        },
      ],
      onBackClick: vi.fn(),
      onConfirmClick: vi.fn(),
      doiMinterUrl: 'https://example.com/doi-minter',
    };

    axios.get = vi.fn().mockResolvedValue({ data: staticMetadata });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display the provided metadata and the static metadata', async () => {
    renderComponent();

    // expect loading spinner when waiting to fetch static metadata
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText(`DOIGenerationForm.title: ${props.title}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`DOIGenerationForm.description: ${props.description}`)
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `DOIGenerationForm.creator_name: ${props.selectedUsers[0].fullName}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `DOIGenerationForm.creator_email: ${props.selectedUsers[0].email}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `DOIGenerationForm.creator_type: ${props.selectedUsers[1].contributor_type}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `DOIGenerationForm.publisher: ${staticMetadata.publisher.name}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `DOIGenerationForm.publisherIdentifier: ${staticMetadata.publisher.publisherIdentifier}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `DOIGenerationForm.publicationYear: ${staticMetadata.publicationYear}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `DOIGenerationForm.date: ${staticMetadata.dates[0].date}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `DOIGenerationForm.dateInformation: ${staticMetadata.dates[0].dateInformation}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `DOIGenerationForm.resourceType: ${staticMetadata.types.resourceType}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `DOIGenerationForm.resourceTypeGeneral: ${staticMetadata.types.resourceTypeGeneral}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `DOIGenerationForm.rights: ${staticMetadata.rightsList[0].rights}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `DOIGenerationForm.rightsIdentifierScheme: ${staticMetadata.rightsList[0].rightsIdentifierScheme}`
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `DOIGenerationForm.geoLocationPlace: ${staticMetadata.geoLocations[0].geoLocationPlace}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `DOIGenerationForm.geoLocationPoint: ${staticMetadata.geoLocations[0].geoLocationPoint.pointLatitude}, ${staticMetadata.geoLocations[0].geoLocationPoint.pointLongitude}`
      )
    ).toBeInTheDocument();
    // check that if incomplete co-ords don't render
    expect(
      screen.getAllByText('DOIGenerationForm.geoLocationPoint', {
        exact: false,
      })
    ).toHaveLength(1);

    expect(
      screen.getByText(
        `DOIGenerationForm.funderName: ${staticMetadata.fundingReferences[0].funderName}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `DOIGenerationForm.awardNumber: ${staticMetadata.fundingReferences[0].awardNumber}`
      )
    ).toBeInTheDocument();
  });

  it('should call onConfirmClick when generate DOI button is clicked', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'DOIGenerationForm.generate_DOI',
      })
    );

    expect(props.onConfirmClick).toHaveBeenCalled();
  });

  it('should call onBackClick when back button is clicked', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'DOIGenerationForm.back_button',
      })
    );

    expect(props.onBackClick).toHaveBeenCalled();
  });
});
