import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
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
import TechniquesAndSubjects from './techniquesAndSubjects.component';

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

  let mockSearchResponse: Partial<BioPortalResponse>;
  let mockDescendantsResponse: Partial<BioPortalResponse>;

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
    user = userEvent.setup();

    props = {
      subjects: ['subject 1', 'subject 2'],
      setSubjects: vi.fn(),
      techniques: [createBioPortalTerm(1, ['1']), createBioPortalTerm(2)],
      setTechniques: vi.fn(),
      bioportalUrl: 'https://example.com/bioportal',
      disabled: false,
    };

    mockSearchResponse = {
      collection: [
        createBioPortalTerm(1, ['1']),
        createBioPortalTerm(2),
        createBioPortalTerm(3),
      ],
    };

    mockDescendantsResponse = {
      collection: [createBioPortalTerm(4, ['4']), createBioPortalTerm(5)],
    };

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/search.*/.test(url)) {
          return Promise.resolve({
            data: mockSearchResponse,
          });
        } else if (/\/descendants/.test(url)) {
          return Promise.resolve({
            data: mockDescendantsResponse,
          });
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
      'technique'
    );

    expect(
      screen.getByRole('combobox', {
        name: 'DOIGenerationForm.technique_selector_label',
      })
    ).toHaveValue('technique');

    // check dropdown loads
    expect(
      await screen.findByRole('listbox', {
        name: 'DOIGenerationForm.technique_selector_label',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
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
    expect(
      screen.getByRole('cell', {
        name: `${
          mockDescendantsResponse.collection?.[0].prefLabel
        } (${mockDescendantsResponse.collection?.[0].synonym?.join(', ')})`,
      })
    );
    expect(
      screen.getByRole('cell', {
        name: mockDescendantsResponse.collection?.[1]['@id'],
      })
    );

    // select descendant
    await user.click(
      screen.getByRole('cell', {
        name: mockDescendantsResponse.collection?.[1].prefLabel,
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
        name: mockDescendantsResponse.collection?.[1].prefLabel,
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
});
