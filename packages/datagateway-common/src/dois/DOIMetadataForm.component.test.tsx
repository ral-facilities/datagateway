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
        { id: 1, name: 'test', contributor_type: ContributorType.Minter },
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
      techniques: [createBioPortalTerm(1, ['1']), createBioPortalTerm(2)],
      setTechniques: vi.fn(),
      setRelatedIdentifiers: vi.fn(),
      disableMintButton: false,
      onMintClick: vi.fn(),
      mintLoading: false,
      doiMinterUrl: 'https://example.com/doi-minter',
      dataCiteUrl: 'https://example.com/datacite',
      bioportalUrl: 'https://example.com/bioportal',
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

  it('should disable mint button at correct times', () => {
    const { rerender } = renderComponent();

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).not.toBeDisabled();

    // title is empty
    props.title = '';
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    // description is empty
    props.title = 'test';
    props.description = '';
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    // selectedUsers is empty
    props.description = 'test';
    props.selectedUsers = [];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    // selectedUsers has empty contributor type
    props.selectedUsers = [{ id: 1, name: 'test', contributor_type: '' }];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    // relatedIdentifiers has empty relationtypes or relatedItemtypes
    props.selectedUsers = [
      { id: 1, name: 'test', contributor_type: ContributorType.Minter },
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
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
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
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    // empty subjects
    props.disableMintButton = false;
    props.subjects = [];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    // empty techniques
    props.subjects = ['1'];
    props.techniques = [];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();
  });

  it('should disable mint button & all form fields when mintLoading is true', () => {
    props.mintLoading = true;
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
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
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' })
    ).toBeDisabled();

    expect(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.techniques' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    ).toBeDisabled();
  });
});
