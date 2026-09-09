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
import { createBioPortalTerm } from '../setupTests';
import DOIMetadataForm from './DOIMetadataForm.component';

describe('DOI generation form component', () => {
  let props: React.ComponentProps<typeof DOIMetadataForm>;

  const renderComponent = (): RenderResult =>
    render(<DOIMetadataForm {...props} />, {
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
      title: 'test',
      setTitle: vi.fn(),
      description: 'description',
      setDescription: vi.fn(),
      selectedUsers: [
        { id: 1, name: 'test', contributor_type: ContributorType.Creator },
      ],
      setSelectedUsers: vi.fn(),
      relatedIdentifiers: [
        {
          title: 'DOI Title',
          fullReference: '',
          identifier: 'doi',
          relatedIdentifierType: DOIIdentifierType.DOI,
          relatedItemType: DOIResourceType.Dataset,
          relationType: DOIRelationType.Cites,
        },
      ],
      subjects: ['subject 1', 'subject 2'],
      setSubjects: vi.fn(),
      samples: ['sample 1', 'sample 2'],
      setSamples: vi.fn(),
      techniques: [createBioPortalTerm(1, ['1']), createBioPortalTerm(2)],
      setTechniques: vi.fn(),
      setRelatedIdentifiers: vi.fn(),
      disableMintButton: false,
      onMintClick: vi.fn(),
      mintLoading: false,
      doiMinterUrl: 'https://example.com/doi-minter',
      dataCiteUrl: 'https://example.com/datacite',
      bioportalUrl: 'https://example.com/bioportal',
      doiHandleUrl: 'https://doi.org',
      localContactRole: 'local_contact|DataCollector',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call onChange handlers when user interacts with fields', async () => {
    renderComponent();

    expect(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' })
    ).toHaveValue('test');
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' }),
      '1'
    );

    expect(props.setTitle).toHaveBeenCalledWith('test1');

    expect(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' })
    ).toHaveValue('description');
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' }),
      '2'
    );

    expect(props.setDescription).toHaveBeenCalledWith('description2');
  });

  it('should call onMintClick when mint button pressed with no errors', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    );

    expect(props.onMintClick).toHaveBeenCalled();
  });

  it('should show errors and disable mint button at correct times', async () => {
    const { rerender } = renderComponent();

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).not.toBeDisabled();

    // selectedUsers is empty
    const prevSelectedUsers = props.selectedUsers;
    props.selectedUsers = [];
    rerender(<DOIMetadataForm {...props} />);

    // should be disabled without having to click the button to prompt errors
    // as no users indicates the list of users is loading
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();

    // title is empty
    props.selectedUsers = prevSelectedUsers;
    props.title = '';
    rerender(<DOIMetadataForm {...props} />);

    // click on button to show errors
    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    );

    // button should be disabled after initial click to trigger errors to show
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.title',
      })
    ).toHaveAttribute('aria-invalid', 'true');

    // description is empty
    props.title = 'test';
    props.description = '';
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.description',
      })
    ).toHaveAttribute('aria-invalid', 'true');

    // selectedUsers has empty contributor type
    props.selectedUsers = [{ id: 1, name: 'test', contributor_type: '' }];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();

    // relatedIdentifiers has empty relationtypes or relatedItemtypes
    props.selectedUsers = [
      { id: 1, name: 'test', contributor_type: ContributorType.Creator },
    ];
    props.relatedIdentifiers = [
      {
        title: 'DOI Title',
        identifier: 'doi',
        relatedIdentifierType: DOIIdentifierType.DOI,
        relatedItemType: DOIResourceType.Dataset,
        relationType: '',
      },
      {
        identifier: 'https://example.com',
        relatedIdentifierType: DOIIdentifierType.URL,
        relatedItemType: undefined,
        relationType: DOIRelationType.Cites,
      },
    ];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();

    // disableMintButton is set to true
    props.relatedIdentifiers = [
      {
        title: 'DOI Title',
        identifier: 'doi',
        relatedIdentifierType: DOIIdentifierType.DOI,
        relatedItemType: DOIResourceType.Dataset,
        relationType: DOIRelationType.Cites,
      },
    ];
    props.disableMintButton = true;
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();

    // empty subjects
    props.disableMintButton = false;
    props.subjects = [];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();

    // empty samples
    props.subjects = ['1'];
    props.samples = [];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();

    // empty techniques
    props.samples = ['sample 1'];
    props.techniques = [];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();
  }, 30_000);

  it('should disable mint button & all form fields when mintLoading is true', () => {
    props.mintLoading = true;
    renderComponent();

    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.review_metadata_button',
      })
    ).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' })
    ).toBeDisabled();
    expect(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.add_creator',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.delete_related_identifier',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.add_related_doi',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.add_related_other',
      })
    ).toBeDisabled();

    expect(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects_label' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_subject' })
    ).toBeDisabled();

    expect(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.samples' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_sample' })
    ).toBeDisabled();

    expect(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.techniques' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    ).toBeDisabled();
  });
});
