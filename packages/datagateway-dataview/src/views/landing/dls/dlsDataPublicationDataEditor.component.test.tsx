import * as React from 'react';
import DLSDataPublicationDataEditor from './dlsDataPublicationDataEditor.component';
import {
  render,
  within,
  type RenderResult,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('DataPublication Data editor component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let props: React.ComponentProps<typeof DLSDataPublicationDataEditor>;
  const renderComponent = (): RenderResult =>
    render(<DLSDataPublicationDataEditor {...props} />);

  beforeEach(() => {
    user = userEvent.setup();
    props = {
      content: [
        { id: 1, label: 'df1', entityType: 'datafile' },
        { id: 2, label: 'ds1', entityType: 'dataset' },
        { id: 3, label: 'i1', entityType: 'investigation' },
      ],
      unselectedContent: [
        { id: 4, label: 'df2', entityType: 'datafile' },
        { id: 5, label: 'ds2', entityType: 'dataset' },
        { id: 6, label: 'i2', entityType: 'investigation' },
      ],
      changeContent: jest.fn(),
      changeUnselectedContent: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders content table & tabs correctly', async () => {
    renderComponent();

    // check renders investigation tab when all 3 entities are present
    expect(
      screen.getByRole('table', {
        name: 'investigation datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'i1' })).toBeInTheDocument();

    await user.click(
      screen.getByRole('tab', {
        name: 'breadcrumbs.dataset_other',
      })
    );

    expect(
      screen.getByRole('table', {
        name: 'dataset datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ds1' })).toBeInTheDocument();

    await user.click(
      screen.getByRole('tab', {
        name: 'breadcrumbs.datafile_other',
      })
    );

    expect(
      screen.getByRole('table', {
        name: 'datafile datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'df1' })).toBeInTheDocument();

    await user.click(
      screen.getByRole('tab', {
        name: 'breadcrumbs.investigation_other',
      })
    );

    expect(
      screen.getByRole('table', {
        name: 'investigation datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();
  });

  it('renders no tab if no data for corresponding entity type exists', async () => {
    props.content = [];
    props.unselectedContent = [];
    renderComponent();

    // check renders investigation tab when all 3 entities are present

    expect(
      screen.queryByRole('tab', {
        name: 'breadcrumbs.investigation_other',
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', {
        name: 'breadcrumbs.dataset_other',
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', {
        name: 'breadcrumbs.datafile_other',
      })
    ).not.toBeInTheDocument();
  });

  it('can add items to the selection', async () => {
    props.content = [
      { id: 1, label: 'df1', entityType: 'datafile' },
      { id: 2, label: 'df2', entityType: 'datafile' },
    ];
    props.unselectedContent = [
      { id: 3, label: 'df3', entityType: 'datafile' },
      { id: 4, label: 'df4', entityType: 'datafile' },
      { id: 5, label: 'df5', entityType: 'datafile', disabled: true },
    ];

    renderComponent();

    // test that it correctly sets the default tab to datafile when it's the only one present
    expect(
      screen.getByRole('table', {
        name: 'datafile datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.edit_data_label',
      })
    );

    // chosen and choices list should be rendered
    const chosen = await screen.findByRole('list', {
      name: 'datapublications.edit.chosen',
    });
    const choices = screen.getByRole('list', {
      name: 'datapublications.edit.choices',
    });

    expect(
      await within(chosen).findByRole('listitem', {
        name: 'df1',
      })
    ).toBeInTheDocument();
    expect(
      within(chosen).getByRole('listitem', {
        name: 'df2',
      })
    ).toBeInTheDocument();

    expect(
      within(choices).getByRole('listitem', {
        name: 'df3',
      })
    ).toBeInTheDocument();
    expect(
      within(choices).getByRole('listitem', {
        name: 'df4',
      })
    ).toBeInTheDocument();
    expect(
      within(choices).getByRole('listitem', {
        name: 'df5',
      })
    ).toBeInTheDocument();

    const choicesSelectAllBox = screen.getByRole('checkbox', {
      name: 'datapublications.edit.select_all datapublications.edit.choices',
    });
    expect(choicesSelectAllBox).not.toBeChecked();
    await user.click(choicesSelectAllBox);

    expect(choicesSelectAllBox).toBeChecked();

    expect(screen.getByRole('checkbox', { name: 'df3' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'df4' })).toBeChecked();
    // select all should ignore disabled items
    expect(screen.getByRole('checkbox', { name: 'df5' })).not.toBeChecked();

    await user.click(
      within(choices).getByRole('listitem', {
        name: 'df3',
      })
    );

    expect(screen.getByRole('checkbox', { name: 'df3' })).not.toBeChecked();

    expect(choicesSelectAllBox).toHaveAttribute('data-indeterminate', 'true');

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.move_right',
      })
    );

    expect(
      await within(chosen).findByRole('listitem', {
        name: 'df4',
      })
    ).toBeInTheDocument();
    expect(
      within(chosen).queryByRole('listitem', {
        name: 'df3',
      })
    ).not.toBeInTheDocument();
    expect(
      within(chosen).queryByRole('listitem', {
        name: 'df5',
      })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.done',
      })
    );

    expect(
      screen.getByRole('table', {
        name: 'datafile datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();

    expect(props.changeContent).toHaveBeenCalledWith([
      { id: 1, label: 'df1', entityType: 'datafile' },
      { id: 2, label: 'df2', entityType: 'datafile' },
      { id: 4, label: 'df4', entityType: 'datafile' },
    ]);

    expect(props.changeUnselectedContent).toHaveBeenCalledWith([
      { id: 3, label: 'df3', entityType: 'datafile' },
      { id: 5, label: 'df5', entityType: 'datafile', disabled: true },
    ]);
  });

  it('can remove items from the selection', async () => {
    props.content = [
      { id: 1, label: 'df1', entityType: 'datafile' },
      { id: 2, label: 'df2', entityType: 'datafile' },
    ];
    props.unselectedContent = [
      { id: 3, label: 'df3', entityType: 'datafile' },
      { id: 4, label: 'df4', entityType: 'datafile' },
    ];

    renderComponent();

    // test that it correctly sets the default tab to datafile when it's the only one present
    expect(
      screen.getByRole('table', {
        name: 'datafile datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.edit_data_label',
      })
    );

    // chosen and choices list should be rendered
    const chosen = await screen.findByRole('list', {
      name: 'datapublications.edit.chosen',
    });
    const choices = screen.getByRole('list', {
      name: 'datapublications.edit.choices',
    });

    expect(
      await within(chosen).findByRole('listitem', {
        name: 'df1',
      })
    ).toBeInTheDocument();
    expect(
      within(chosen).getByRole('listitem', {
        name: 'df2',
      })
    ).toBeInTheDocument();

    expect(
      within(choices).getByRole('listitem', {
        name: 'df3',
      })
    ).toBeInTheDocument();
    expect(
      within(choices).getByRole('listitem', {
        name: 'df4',
      })
    ).toBeInTheDocument();

    const chosenSelectAllBox = screen.getByRole('checkbox', {
      name: 'datapublications.edit.select_all datapublications.edit.chosen',
    });
    expect(chosenSelectAllBox).not.toBeChecked();

    await user.click(chosenSelectAllBox);

    expect(chosenSelectAllBox).toBeChecked();

    await user.click(chosenSelectAllBox);

    expect(chosenSelectAllBox).not.toBeChecked();

    await user.click(
      within(chosen).getByRole('listitem', {
        name: 'df1',
      })
    );

    expect(screen.getByRole('checkbox', { name: 'df1' })).toBeChecked();

    expect(chosenSelectAllBox).toHaveAttribute('data-indeterminate', 'true');

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.move_left',
      })
    );

    expect(
      await within(choices).findByRole('listitem', {
        name: 'df1',
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.done',
      })
    );

    expect(
      screen.getByRole('table', {
        name: 'datafile datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();

    expect(props.changeContent).toHaveBeenCalledWith([
      { id: 2, label: 'df2', entityType: 'datafile' },
    ]);

    expect(props.changeUnselectedContent).toHaveBeenCalledWith([
      { id: 3, label: 'df3', entityType: 'datafile' },
      { id: 4, label: 'df4', entityType: 'datafile' },
      { id: 1, label: 'df1', entityType: 'datafile' },
    ]);
  });

  it('renders disabled items as disabled with a hover tooltip', async () => {
    props.content = [{ id: 1, label: 'ds1', entityType: 'dataset' }];
    props.unselectedContent = [
      { id: 2, label: 'ds2', entityType: 'dataset' },
      { id: 3, label: 'ds3', entityType: 'dataset', disabled: true },
    ];

    renderComponent();

    // test that it correctly sets the default tab to datafile when it's the only one present
    expect(
      screen.getByRole('table', {
        name: 'dataset datapublications.edit.content_table_aria_label',
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'datapublications.edit.edit_data_label',
      })
    );

    // expect can't click on disabled item
    await expect(
      async () =>
        await user.click(
          await screen.findByRole('checkbox', {
            name: 'ds3',
          })
        )
    ).rejects.toThrow();

    await user.hover(
      // need to hover on the parent span as listitem itself is disabled and so isn't listening to mouse events
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      screen.getByRole('listitem', {
        name: 'ds3',
      }).parentElement!
    );

    expect(
      await screen.findByRole('tooltip', {
        name: 'datapublications.edit.disabled_tooltip',
      })
    ).toBeInTheDocument();
  });
});
