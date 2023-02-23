/**
 * Metadata of a download request, e.g. transport method, download name, etc.
 */
interface DownloadRequestInfo {
  /**
   * Email address to send confirmation to.
   * An empty string means the user did not provide one.
   */
  emailAddress?: string;
  /**
   * A user-provided name for the download.
   * An empty string means the user did not provide one.
   */
  downloadName?: string;
  /**
   * The transport method that should be used for the download.
   */
  transport: string;
}

export default DownloadRequestInfo;
