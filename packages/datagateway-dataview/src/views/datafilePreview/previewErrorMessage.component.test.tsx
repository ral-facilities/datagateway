import { render, screen } from '@testing-library/react';
import * as React from 'react';
import PreviewErrorMessage from './previewErrorMessage.component';

describe('PreviewErrorMessage', () => {
  it('should show a user-facing error message with the given title and description', () => {
    render(
      <PreviewErrorMessage
        title="Test error"
        description="Test error description"
      />
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Test error description')).toBeInTheDocument();
  });

  it('should show a default error description if no error description is provided', () => {
    render(<PreviewErrorMessage title="Test error" />);

    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(
      screen.getByText('datafiles.preview.unexpected_error')
    ).toBeInTheDocument();
  });
});
