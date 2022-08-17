import type { UserEvent } from '@testing-library/user-event/setup/setup';
import { Datafile } from 'datagateway-common';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PreviewDatafileButton from './previewDatafileButton.component';
import { mockDatafile } from './testData';

describe('PreviewDatafileButton', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('given a supported datafile', () => {
    it('should be enabled', () => {
      render(
        <MemoryRouter>
          <PreviewDatafileButton datafile={mockDatafile} />
        </MemoryRouter>
      );
      expect(
        screen.getByRole('link', { name: 'datafiles.preview.preview_datafile' })
      ).toBeEnabled();
    });

    it('should show a tooltip indicating that this button opens the preview of the datafile when hovered over', async () => {
      render(
        <MemoryRouter>
          <PreviewDatafileButton datafile={mockDatafile} />
        </MemoryRouter>
      );

      await user.hover(
        screen.getByRole('link', { name: 'datafiles.preview.preview_datafile' })
      );

      expect(
        await screen.findByText('datafiles.preview.preview_datafile')
      ).toBeInTheDocument();
    });
  });

  describe('given an unsupported datafile', () => {
    const unsupportedDatafile: Datafile = {
      ...mockDatafile,
      name: 'Datafile.exe',
    };

    it('should be disabled', async () => {
      render(
        <MemoryRouter>
          <PreviewDatafileButton datafile={unsupportedDatafile} />
        </MemoryRouter>
      );
      // toBeDisabled does not support aria-disabled
      // https://github.com/testing-library/jest-dom/issues/144
      expect(
        screen.getByRole('link', {
          name: 'datafiles.preview.preview_datafile',
        })
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('should show a tooltip indicating that this datafile cannot be previewed when hovered over', async () => {
      render(
        <MemoryRouter>
          <PreviewDatafileButton datafile={unsupportedDatafile} />
        </MemoryRouter>
      );

      // link cannot be hovered directly because it is disabled
      // we find its container div by its label (which is the same as the tooltip text)
      await user.hover(
        screen.getByLabelText('datafiles.preview.preview_unsupported')
      );

      expect(
        await screen.findByText('datafiles.preview.preview_unsupported')
      ).toBeInTheDocument();
    });
  });
});
