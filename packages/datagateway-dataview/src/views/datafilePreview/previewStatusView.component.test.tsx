import * as React from 'react';
import { render, screen } from '@testing-library/react';
import PreviewStatusView from './previewStatusView.component';

describe('PreviewStatusView', () => {
  it('should show a progress indicator showing the current progress if given status is loading content', async () => {
    render(
      <PreviewStatusView
        status={{
          loadingContent: { progress: 30 },
        }}
      />
    );

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('should show a message saying datafile metadata is unavailable when the given status indicates such', async () => {
    render(
      <PreviewStatusView
        status={{
          metadataUnavailable: {
            errorMessage: 'Metadata unavailable',
          },
        }}
      />
    );

    expect(
      await screen.findByText('datafiles.preview.cannot_load_metadata')
    ).toBeInTheDocument();
    expect(screen.getByText('Metadata unavailable')).toBeInTheDocument();
  });

  it('should show a message saying the datafile does not have an extension when the given status indicates such', async () => {
    render(
      <PreviewStatusView
        status={{
          unknownExtension: true,
        }}
      />
    );

    expect(
      await screen.findByText('datafiles.preview.cannot_preview')
    ).toBeInTheDocument();
    expect(
      screen.getByText('datafiles.preview.unknown_type')
    ).toBeInTheDocument();
  });

  it('should show a message saying the content of the datafile is unavailable when the given status indicates such', async () => {
    render(
      <PreviewStatusView
        status={{
          contentUnavailable: {
            errorMessage: 'Cannot download',
          },
        }}
      />
    );

    expect(
      await screen.findByText('datafiles.preview.cannot_load_content')
    ).toBeInTheDocument();
    expect(screen.getByText('Cannot download')).toBeInTheDocument();
  });

  it('should show a message saying the datafile cannot be previewed when the given status indicates the extension is unsupported', async () => {
    render(
      <PreviewStatusView
        status={{
          unsupportedExtension: {
            extension: 'dmg',
          },
        }}
      />
    );

    expect(
      await screen.findByText('datafiles.preview.cannot_preview')
    ).toBeInTheDocument();
    expect(
      screen.getByText('datafiles.preview.unsupported')
    ).toBeInTheDocument();
  });
});
