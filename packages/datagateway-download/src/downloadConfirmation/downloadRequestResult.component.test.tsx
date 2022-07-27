import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import type DownloadRequestInfo from './DownloadRequestInfo';
import DownloadRequestResult from './downloadRequestResult.component';

const mockDownloadRequestInfo: DownloadRequestInfo = {
  emailAddress: 'test@email.com',
  downloadName: 'download-name',
  transport: 'https',
};

describe('DownloadRequestResult', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <DownloadRequestResult
        success
        closeDialog={jest.fn()}
        redirectToStatusTab={jest.fn()}
        requestInfo={mockDownloadRequestInfo}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should show failure message if download request has failed', async () => {
    render(
      <DownloadRequestResult
        success={false}
        closeDialog={jest.fn()}
        redirectToStatusTab={jest.fn()}
        requestInfo={null}
      />
    );

    expect(
      await screen.findByText('Your download request was unsuccessful', {
        exact: false,
      })
    ).toBeInTheDocument();
    // should not show view download button if failed
    expect(
      screen.queryByRole('button', {
        name: 'downloadConfirmDialog.view_my_downloads',
      })
    ).toBeNull();
  });

  it('should not show request info grid if null is given', async () => {
    render(
      <DownloadRequestResult
        success
        closeDialog={jest.fn()}
        redirectToStatusTab={jest.fn()}
        requestInfo={null}
      />
    );

    await waitFor(() => {
      expect(
        screen.queryByText('downloadConfirmDialog.confirmation_download_name')
      ).toBeNull();
      expect(
        screen.queryByText('downloadConfirmDialog.confirmation_email')
      ).toBeNull();
      expect(
        screen.queryByText('downloadConfirmDialog.confirmation_access_method')
      ).toBeNull();
    });
  });

  it('should not show email address info if none is given', async () => {
    render(
      <DownloadRequestResult
        success
        closeDialog={jest.fn()}
        redirectToStatusTab={jest.fn()}
        requestInfo={{
          emailAddress: '',
          downloadName: 'download-name',
          transport: 'httpd',
        }}
      />
    );

    await waitFor(() => {
      expect(
        screen.queryByText('downloadConfirmDialog.confirmation_email')
      ).toBeNull();
      expect(
        screen.queryByText(mockDownloadRequestInfo.emailAddress)
      ).toBeNull();
    });
  });

  it('should redirect to download status tab when user clicks on view download', async () => {
    const user = userEvent.setup();
    const mockRedirect = jest.fn();

    render(
      <DownloadRequestResult
        success
        closeDialog={jest.fn()}
        redirectToStatusTab={mockRedirect}
        requestInfo={{
          emailAddress: '',
          downloadName: 'download-name',
          transport: 'httpd',
        }}
      />
    );

    await user.click(
      await screen.findByRole('button', {
        name: 'downloadConfirmDialog.view_my_downloads',
      })
    );

    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});
