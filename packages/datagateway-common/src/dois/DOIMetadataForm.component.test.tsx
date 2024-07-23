import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import {
  ContributorType,
  DOIRelationType,
  DOIResourceType,
} from '../app.types';
import DOIMetadataForm from './DOIMetadataForm.component';
import { QueryClient, QueryClientProvider } from 'react-query';

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
      setTitle: jest.fn(),
      description: 'description',
      setDescription: jest.fn(),
      selectedUsers: [
        { id: 1, name: 'test', contributor_type: ContributorType.Minter },
      ],
      setSelectedUsers: jest.fn(),
      relatedDOIs: [
        {
          title: 'DOI Title',
          fullReference: '',
          identifier: 'doi',
          relatedItemType: DOIResourceType.Dataset,
          relationType: DOIRelationType.Cites,
        },
      ],
      setRelatedDOIs: jest.fn(),
      disableMintButton: false,
      onMintClick: jest.fn(),
      doiMinterUrl: 'https://example.com/doi-minter',
      dataCiteUrl: 'https://example.com/datacite',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('should disable mint button button at correct times', () => {
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

    // relatedDOIs has empty relationtypes or relatedItemtypes
    props.selectedUsers = [
      { id: 1, name: 'test', contributor_type: ContributorType.Minter },
    ];
    props.relatedDOIs = [
      {
        title: 'DOI Title',
        fullReference: '',
        identifier: 'doi',
        relatedItemType: DOIResourceType.Dataset,
        relationType: '',
      },
      {
        title: 'DOI Title 2',
        fullReference: '',
        identifier: 'doi2',
        relatedItemType: '',
        relationType: DOIRelationType.Cites,
      },
    ];
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();

    // disableMintButton is set to true
    props.relatedDOIs = [
      {
        title: 'DOI Title',
        fullReference: '',
        identifier: 'doi',
        relatedItemType: DOIResourceType.Dataset,
        relationType: DOIRelationType.Cites,
      },
    ];
    props.disableMintButton = true;
    rerender(<DOIMetadataForm {...props} />);

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    ).toBeDisabled();
  });
});
