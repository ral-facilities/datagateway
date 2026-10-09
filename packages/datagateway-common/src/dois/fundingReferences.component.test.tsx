import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RenderResult,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { ROR } from '../app.types';
import FundingReferences from './fundingReferences.component';

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

describe('Funding references form component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  let props: React.ComponentProps<typeof FundingReferences>;

  let mockROR: ROR;

  const TestComponent: React.FC = () => {
    const [fundingReferences, changeFundingReferences] = React.useState(
      props.fundingReferences
    );

    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <FundingReferences
          {...props}
          fundingReferences={fundingReferences}
          changeFundingReferences={changeFundingReferences}
        />
      </QueryClientProvider>
    );
  };

  const renderComponent = (): RenderResult => render(<TestComponent />);

  beforeEach(() => {
    user = userEvent.setup();

    props = {
      fundingReferences: [
        {
          funderName: 'Funder 1',
          awardNumber: ':unas',
          funderIdentifier: 'ror.1',
          funderIdentifierType: 'ROR',
        },
      ],
      changeFundingReferences: vi.fn(),
      fundersList: [
        {
          funderName: 'Funder 1',
          awardNumber: ':unas',
          funderIdentifier: 'ror.1',
          funderIdentifierType: 'ROR',
        },
        {
          funderName: 'Funder 2',
          awardNumber: ':unas',
          funderIdentifier: 'ror.2',
          funderIdentifierType: 'ROR',
        },
      ],
      rorApiUrl: 'example.com/ror',
      disabled: false,
      fundingReferencesError: false,
    };

    mockROR = {
      id: 'ror.3',
      names: [{ types: ['ror_display'], value: 'Funder 3' }],
    };

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/ror\/.*/.test(url)) {
          return Promise.resolve({ data: mockROR });
        } else {
          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderComponent();
    expect(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Funder 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_by_ror' })
    ).toBeInTheDocument();
  });

  it('should disable all inputs when disabled prop is true', () => {
    props.disabled = true;
    renderComponent();

    expect(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_by_ror' })
    ).toBeDisabled();
  });

  it('lets you edit funders via the autocomplete', async () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Funder 1' })
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      }),
      '{backspace}'
    );

    expect(
      screen.queryByRole('button', { name: 'Funder 1' })
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      }),
      '2'
    );

    await user.click(
      screen.getByRole('option', {
        name: 'Funder 2',
      })
    );

    expect(
      screen.getByRole('button', { name: 'Funder 2' })
    ).toBeInTheDocument();
  });

  it('correctly handles the no funder option', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      })
    );

    expect(
      await screen.findByRole('option', {
        name: 'DOIGenerationForm.no_funder_option',
      })
    ).toHaveAttribute('aria-disabled', 'true');

    await user.type(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      }),
      '{backspace}'
    );

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      })
    );

    await user.click(
      screen.getByRole('option', {
        name: 'DOIGenerationForm.no_funder_option',
      })
    );

    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.no_funder_option' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      })
    );

    expect(
      await screen.findByRole('option', {
        name: 'Funder 1',
      })
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('lets you add a funder via the add by ROR button & dialog', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_by_ror' })
    );

    expect(
      await screen.findByRole('dialog', {
        name: 'DOIGenerationForm.ror_dialog_title',
      })
    ).toBeVisible();

    await user.type(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.ror',
      }),
      'ror'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.verify_ror' })
    );

    expect(
      screen.getByText('DOIGenerationForm.confirm_ror_text {rorName:Funder 3}')
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.ror_dialog_confirm_button',
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', {
        name: 'DOIGenerationForm.ror_dialog_title',
      })
    );

    expect(
      screen.getByRole('button', { name: 'Funder 3' })
    ).toBeInTheDocument();

    // check you can remove an ROR added value
    await user.type(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      }),
      '{backspace}'
    );

    expect(
      screen.queryByRole('button', { name: 'Funder 3' })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.funding_reference_autocomplete',
      })
    );

    expect(
      screen.queryByRole('option', {
        name: 'Funder 3',
      })
    ).not.toBeInTheDocument();
  });

  it('handles errors from ror api correctly', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_by_ror' })
    );

    expect(
      await screen.findByRole('dialog', {
        name: 'DOIGenerationForm.ror_dialog_title',
      })
    ).toBeVisible();

    vi.mocked(axios.get).mockRejectedValueOnce({
      response: {
        data: { errors: ['Test error'] },
        status: 404,
      },
    });

    await user.type(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.ror',
      }),
      'ror'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.verify_ror' })
    );

    expect(await screen.findByText('Test error')).toBeVisible();

    expect(
      screen.queryByText(
        'DOIGenerationForm.confirm_ror_text {rorName:Funder 3}'
      )
    ).not.toBeInTheDocument();
  });

  it('handles duplicates from ror api correctly', async () => {
    mockROR = {
      id: props.fundingReferences[0].funderIdentifier ?? '',
      names: [{ types: [], value: props.fundingReferences[0].funderName }],
    };
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Funder 1' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_by_ror' })
    );

    expect(
      await screen.findByRole('dialog', {
        name: 'DOIGenerationForm.ror_dialog_title',
      })
    ).toBeVisible();

    await user.type(
      screen.getByRole('textbox', {
        name: 'DOIGenerationForm.ror',
      }),
      'ror'
    );

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.verify_ror' })
    );

    expect(
      screen.getByText('DOIGenerationForm.confirm_ror_text {rorName:Funder 1}')
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.ror_dialog_confirm_button',
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', {
        name: 'DOIGenerationForm.ror_dialog_title',
      })
    );

    expect(screen.getAllByRole('button', { name: 'Funder 1' })).toHaveLength(1);
  });
});
