import {
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ContributorType,
  DataPublication,
  DataPublicationUser,
  dGCommonInitialState,
  DOIRelationType,
  DOIResourceType,
} from 'datagateway-common';
import { createMemoryHistory, History } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { generatePath, Router } from 'react-router-dom';
import DLSDataPublicationEditForm from './dlsDataPublicationEditForm.component';
import axios, { AxiosResponse } from 'axios';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import { paths } from '../../../page/pageContainer.component';

setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
});

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('DOI generation form component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={createTestQueryClient()}>
            <DLSDataPublicationEditForm dataPublicationId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  let user: ReturnType<typeof userEvent.setup>;

  let initialData: DataPublication;

  const users = [
    {
      id: 1,
      contributorType: ContributorType.Minter,
      fullName: 'John Smith',
      user: {
        id: 1,
        name: 'John1',
      },
      email: 'user1@example.com',
      affiliations: [{ id: 1, name: 'Example Uni' }],
    },
    {
      id: 2,
      contributorType: ContributorType.Creator,
      fullName: 'Jane Smith',
    },
    {
      id: 3,
      contributorType: ContributorType.Editor,
      fullName: 'Jesse Smith',
    },
  ] satisfies DataPublicationUser[];

  const investigationInstrument = [
    {
      id: 1,
      instrument: {
        id: 3,
        name: 'Beamline 1',
      },
    },
  ];

  const investigation = {
    id: 1,
    title: 'Title 1',
    name: 'Name 1',
    summary: 'foo bar',
    visitId: '1',
    doi: 'doi 1',
    size: 1,
    investigationInstruments: investigationInstrument,
    startDate: '2023-07-20',
    endDate: '2023-07-21',
  };

  beforeEach(() => {
    initialData = {
      id: 1,
      pid: 'doi 1',
      description: 'foo bar',
      title: 'Title',
      users: users,
      content: {
        id: 9,
        dataCollectionInvestigations: [
          {
            id: 8,
            investigation: investigation,
          },
        ],
        dataCollectionDatasets: [
          {
            id: 15,
            dataset: {
              id: 2,
              name: 'ds',
              modTime: '2024-01-01',
              createTime: '2024-01-01',
            },
          },
        ],
        dataCollectionDatafiles: [
          {
            id: 16,
            datafile: {
              id: 3,
              name: 'df',
              modTime: '2024-01-01',
              createTime: '2024-01-01',
            },
          },
        ],
      },
      type: { id: 13, name: 'Dataset' },
      relatedItems: [
        {
          id: 11,
          identifier: 'doi 3',
          relationType: DOIRelationType.IsSupplementedBy,
          relatedItemType: DOIResourceType.Book,
          createTime: '2024-01-02 12:00:00',
        },
        {
          id: 14,
          identifier: 'doi 6',
          relationType: DOIRelationType.IsContinuedBy,
          relatedItemType: DOIResourceType.DataPaper,
          createTime: '2024-01-06 12:00:00',
        },
        {
          id: 12,
          identifier: 'doi 4',
          relationType: DOIRelationType.IsVersionOf,
          relatedItemType: DOIResourceType.Dataset,
          createTime: '2024-01-02 12:00:00',
        },
      ],
      publicationDate: '2023-07-20',
    };

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    history = createMemoryHistory({
      initialEntries: [
        {
          pathname: generatePath(
            paths.landing.dlsDataPublicationLanding + '/edit',
            {
              dataPublicationId: '1',
            }
          ),
          state: { fromEdit: true },
        },
      ],
    });

    user = userEvent.setup();

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/datapublications$/.test(url)) {
          return Promise.resolve({
            data: [initialData],
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });

    axios.put = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/mint\/version\/update\/.*/.test(url)) {
          return Promise.resolve({
            data: {
              concept: { data_publication: 'new', doi: initialData.pid },
              version: {
                data_publication: 'new_version',
                doi: 'new.version.pid',
              },
            },
          });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect back to landing page if user directly accesses the url', async () => {
    history = createMemoryHistory();
    renderComponent();

    expect(history.location).toMatchObject({
      pathname: generatePath(paths.landing.dlsDataPublicationLanding, {
        dataPublicationId: '1',
      }),
    });
  });

  it('should default fill the form with existing info and let the user change these and submit a mint request', async () => {
    renderComponent();

    // wait for data publication to load
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', { name: 'DOIGenerationForm.title' })
      ).toHaveValue('Title')
    );
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.title' }),
      '1'
    );

    expect(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' })
    ).toHaveValue('foo bar');
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.description' }),
      '2'
    );

    // editing related DOIs

    expect(
      within(
        screen.getByRole('table', { name: 'DOIGenerationForm.related_dois' })
      )
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);
    expect(screen.getByRole('cell', { name: 'doi 3' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'doi 6' })).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: DOIRelationType.IsSupplementedBy,
      })
    );
    await user.click(
      await screen.findByRole('option', { name: DOIRelationType.IsCitedBy })
    );

    await user.click(
      screen.getAllByRole('button', {
        name: 'DOIGenerationForm.delete_related_doi',
      })[1]
    );
    expect(
      screen.queryByRole('cell', { name: 'doi 6' })
    ).not.toBeInTheDocument();

    // editing users
    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
    expect(
      screen.getByRole('cell', { name: 'user1@example.com' })
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', {
        name: 'DOIGenerationForm.delete_creator',
      })[1]
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);

    await user.click(
      screen.getByRole('button', {
        name: ContributorType.Editor,
      })
    );
    await user.click(
      await screen.findByRole('option', { name: ContributorType.ProjectLeader })
    );

    // submit edited data publication

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.generate_DOI' })
    );

    expect(axios.put).toHaveBeenCalledWith(
      expect.any(String),
      {
        datafile_ids: [3],
        dataset_ids: [2],
        investigation_ids: [1],
        metadata: {
          title: 'Title1',
          description: 'foo bar2',
          creators: [
            users[0],
            { ...users[2], contributorType: ContributorType.ProjectLeader },
          ].map((user) => ({
            username: user.user?.name ?? user.fullName,
            contributor_type: user.contributorType,
          })),
          related_items: [
            {
              ...initialData.relatedItems?.[0],
              relationType: DOIRelationType.IsCitedBy,
            },
          ].map((ri) => ({
            fullReference: ri.fullReference ?? '',
            title: ri.title ?? '',
            identifier: ri.identifier,
            relatedItemType: ri.relatedItemType,
            relationType: ri.relationType,
          })),
          resource_type: 'Collection',
        },
      },
      expect.any(Object)
    );

    expect(
      await screen.findByRole('dialog', {
        name: 'DOIConfirmDialog.dialog_title',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'DOIConfirmDialog.view_data_publication',
      })
    ).toHaveAttribute(
      'href',
      generatePath(paths.landing.dlsDataPublicationLanding, {
        dataPublicationId: 'new_version',
      })
    );
  });
});
