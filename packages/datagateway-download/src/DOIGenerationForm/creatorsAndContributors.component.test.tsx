import { render, RenderResult, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DownloadSettingsContext } from '../ConfigProvider';
import { mockedSettings } from '../testData';
import { checkUser, ContributorType } from '../downloadApi';
import CreatorsAndContributors from './creatorsAndContributors.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    readSciGatewayToken: jest.fn(() => ({
      username: '1',
    })),
  };
});

jest.mock('../downloadApi', () => {
  const originalModule = jest.requireActual('../downloadApi');

  return {
    ...originalModule,

    checkUser: jest.fn(),
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

  let props: React.ComponentProps<typeof CreatorsAndContributors>;

  const TestComponent: React.FC = () => {
    const [selectedUsers, changeSelectedUsers] = React.useState(
      // eslint-disable-next-line react/prop-types
      props.selectedUsers
    );

    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <CreatorsAndContributors
            selectedUsers={selectedUsers}
            changeSelectedUsers={changeSelectedUsers}
          />
        </DownloadSettingsContext.Provider>
      </QueryClientProvider>
    );
  };

  const renderComponent = (): RenderResult => render(<TestComponent />);

  beforeEach(() => {
    user = userEvent.setup();

    props = {
      selectedUsers: [
        {
          id: 1,
          name: '1',
          fullName: 'User 1',
          email: 'user1@example.com',
          affiliation: 'Example Uni',
          contributor_type: ContributorType.Creator,
        },
        {
          id: 2,
          name: '2',
          fullName: 'User 2',
          email: 'user2@example.com',
          affiliation: 'Example 2 Uni',
          contributor_type: ContributorType.Creator,
        },
      ],
      changeSelectedUsers: jest.fn(),
    };
    (checkUser as jest.MockedFunction<typeof checkUser>).mockResolvedValue({
      id: 3,
      name: '3',
      fullName: 'User 3',
      email: 'user3@example.com',
      affiliation: 'Example 3 Uni',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should let the user delete users (but not delete the logged in user)', async () => {
    renderComponent();

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);
    expect(
      screen.getByRole('cell', { name: 'user2@example.com' })
    ).toBeInTheDocument();

    const userDeleteButtons = screen.getAllByRole('button', {
      name: 'DOIGenerationForm.delete_creator',
    });
    expect(userDeleteButtons[0]).toBeDisabled();

    await user.click(userDeleteButtons[1]);

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1)
    ).toHaveLength(1);
    expect(
      screen.getByRole('cell', { name: 'Example Uni' })
    ).toBeInTheDocument();
  });

  it('should let the user add creators (but not duplicate users or if checkUser fails)', async () => {
    renderComponent();

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '3'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
    expect(screen.getByRole('cell', { name: 'User 3' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'Creator' }).length).toBe(3);

    // test errors on duplicate user
    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '3'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
    expect(screen.getByText('Cannot add duplicate user')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' })
    ).toHaveValue('');

    // test errors with various API error responses
    (checkUser as jest.MockedFunction<typeof checkUser>).mockRejectedValueOnce({
      response: { data: { detail: 'error msg' }, status: 404 },
    });

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '4'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(await screen.findByText('error msg')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);

    (checkUser as jest.MockedFunction<typeof checkUser>).mockRejectedValue({
      response: { data: { detail: [{ msg: 'error msg 2' }] }, status: 404 },
    });
    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(await screen.findByText('error msg 2')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);

    (checkUser as jest.MockedFunction<typeof checkUser>).mockRejectedValueOnce({
      response: { status: 422 },
    });
    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_creator' })
    );

    expect(await screen.findByText('Error')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
  });

  it('should let the user add contributors & select their contributor type', async () => {
    renderComponent();

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(2);

    await user.type(
      screen.getByRole('textbox', { name: 'DOIGenerationForm.username' }),
      '3'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_contributor' })
    );

    expect(
      within(screen.getByRole('table', { name: 'DOIGenerationForm.creators' }))
        .getAllByRole('row')
        .slice(1) // ignores the header row
    ).toHaveLength(3);
    expect(screen.getByRole('cell', { name: 'User 3' })).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /DOIGenerationForm.creator_type/i,
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /DOIGenerationForm.creator_type/i,
      })
    );
    await user.click(
      await screen.findByRole('option', { name: 'DataCollector' })
    );

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // check that the option is actually selected in the table even after the menu closes
    expect(screen.getByText('DataCollector')).toBeInTheDocument();
  });
});
