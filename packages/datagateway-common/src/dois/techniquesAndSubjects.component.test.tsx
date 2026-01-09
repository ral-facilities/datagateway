import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render,
  RenderResult,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import React from 'react';
import { BioPortalResponse } from '../api/dois';
import { createBioPortalTerm } from '../setupTests';
import TechniquesAndSubjects, {
  AUTOCOMPLETE_DEBOUNCE_DELAY,
} from './techniquesAndSubjects.component';

vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });

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

describe('Techniques & Subjects selector component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  let props: React.ComponentProps<typeof TechniquesAndSubjects>;

  let mockSearchResponse: Promise<
    Partial<AxiosResponse<Partial<BioPortalResponse>>>
  >;
  let mockDescendantsResponse: Promise<
    Partial<AxiosResponse<Partial<BioPortalResponse>>>
  >;

  const TestComponent: React.FC = () => {
    // eslint-disable-next-line react/prop-types
    const [subjects, setSubjects] = React.useState(props.subjects);
    // eslint-disable-next-line react/prop-types
    const [techniques, setTechniques] = React.useState(props.techniques);

    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <TechniquesAndSubjects
          {...props}
          subjects={subjects}
          setSubjects={setSubjects}
          techniques={techniques}
          setTechniques={setTechniques}
        />
      </QueryClientProvider>
    );
  };

  const renderComponent = (): RenderResult => render(<TestComponent />);

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    props = {
      subjects: ['subject 1', 'subject 2'],
      setSubjects: vi.fn(),
      techniques: [createBioPortalTerm(1, ['1']), createBioPortalTerm(2)],
      setTechniques: vi.fn(),
      bioportalUrl: 'https://example.com/bioportal',
      disabled: false,
    };

    mockSearchResponse = Promise.resolve({
      data: {
        collection: [
          createBioPortalTerm(1, ['1']),
          createBioPortalTerm(2),
          createBioPortalTerm(3),
        ],
      },
    });

    mockDescendantsResponse = Promise.resolve({
      data: {
        collection: [createBioPortalTerm(4, ['4']), createBioPortalTerm(5)],
      },
    });

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        // only return terms when query is filled to test the debouncing
        if (/\/search.*q=\w+.*/.test(url)) {
          return mockSearchResponse;
        } else if (/\/search.*/.test(url)) {
          return Promise.resolve({
            data: { collection: [] },
          });
        } else if (/\/descendants/.test(url)) {
          return mockDescendantsResponse;
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
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'subject 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'subject 2' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.techniques' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'technique 1 (1)' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'technique 2' })
    ).toBeInTheDocument();
  });

  it('renders everything as disabled when passed the disabled prop', () => {
    props.disabled = true;
    renderComponent();
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

  it('lets you edit subjects', async () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'subject 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'subject 2' })
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      '{backspace}'
    );

    expect(
      screen.queryByRole('button', { name: 'subject 2' })
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      'subject 3'
    );

    expect(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' })
    ).toHaveValue('subject 3');

    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.subjects' }),
      '{enter}'
    );

    expect(
      screen.getByRole('button', { name: 'subject 3' })
    ).toBeInTheDocument();
  });

  it('lets you delete techniques', async () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'technique 1 (1)' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'technique 2' })
    ).toBeInTheDocument();

    // assert that we can't type into the technique selector
    await user.type(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.techniques' }),
      'xyz'
    );
    expect(
      screen.getByRole('combobox', { name: 'DOIGenerationForm.techniques' })
    ).not.toHaveValue('xyz');

    // delete existing techniques using clear button
    await user.click(
      within(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        screen.getByRole('combobox', { name: 'DOIGenerationForm.techniques' })
          .parentElement!
      ).getByLabelText('Clear')
    );
    expect(
      screen.queryByRole('button', { name: 'technique 1 (1)' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'technique 2' })
    ).not.toBeInTheDocument();
  });

  it('lets you add techniques', async () => {
    renderComponent();

    // add a new technique
    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    expect(
      await screen.findByRole('dialog', {
        name: 'DOIGenerationForm.technique_dialog_title',
      })
    ).toBeVisible();

    await user.type(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      't'
    );

    expect(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      })
    ).toHaveValue('t');

    // test we debounce properly
    expect(
      await screen.queryByRole('option', {
        name: 'technique 1 (1)',
      })
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_DELAY);
    });

    expect(
      await screen.findByRole('option', {
        name: 'technique 1 (1)',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'technique 3',
      })
    ).toBeInTheDocument();

    // select initial technique
    await user.click(
      screen.getByRole('option', {
        name: 'technique 3',
      })
    );

    // check descendants table loads
    expect(
      screen.getByText(
        'DOIGenerationForm.technique_dialog_select_technique_help'
      )
    ).toBeInTheDocument();
    const descendantsResponse = (await mockDescendantsResponse)?.data;
    expect(
      screen.getByRole('cell', {
        name: `${
          descendantsResponse?.collection?.[0].prefLabel
        } (${descendantsResponse?.collection?.[0].synonym?.join(', ')})`,
      })
    );
    expect(
      screen.getByRole('cell', {
        name: descendantsResponse?.collection?.[1]['@id'],
      })
    );

    // select descendant
    await user.click(
      screen.getByRole('cell', {
        name: descendantsResponse?.collection?.[1].prefLabel,
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'DOIGenerationForm.technique_dialog_confirm_button',
      })
    );

    await waitForElementToBeRemoved(() =>
      screen.queryByRole('dialog', {
        name: 'DOIGenerationForm.technique_dialog_title',
      })
    );

    expect(
      screen.getByRole('button', {
        name: descendantsResponse?.collection?.[1].prefLabel,
      })
    ).toBeInTheDocument();
  });

  it('displays error message on technique selector autocomplete when bioportal url is not defined', async () => {
    props.bioportalUrl = undefined;
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    expect(
      await screen.findByText(
        "Can't fetch techniques as BioPortal API URL not specified"
      )
    ).toBeVisible();
  });

  it('displays error message on technique selector autocomplete when bioportal api returns an error', async () => {
    // need to catch promise to handle Vitest complaining about unhandled promise rejection
    mockSearchResponse = Promise.reject('error').catch((e) => {
      return e;
    });
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    await user.type(
      await screen.findByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      't'
    );

    expect(
      await screen.findByText('DOIGenerationForm.bioportal_search_error')
    ).toBeVisible();
  });

  it('displays error message on technique selector autocomplete when bioportal api returns an error', async () => {
    // need to catch promise to handle Vitest complaining about unhandled promise rejection
    mockDescendantsResponse = Promise.reject('error').catch((e) => {
      return e;
    });
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'DOIGenerationForm.add_technique' })
    );

    await user.type(
      await screen.findByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      }),
      't'
    );

    await user.click(
      await screen.findByRole('option', {
        name: 'technique 3',
      })
    );

    expect(
      await screen.findByText('DOIGenerationForm.bioportal_descendant_error')
    ).toBeVisible();
  });
});
