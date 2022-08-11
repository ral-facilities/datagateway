/**
 * Dispatch this action to toggle the appearace of details pane in ISIS Datafile previewer.
 * Payload is {@link ToggleDatafilePreviewerDetailsPanePayload}
 */

const ToggleDatafilePreviewerDetailsPaneType =
  'datagateway_dataview:toggle_datafile_previewer_details_pane';

/**
 * @see ToggleDatafilePreviewerDetailsPaneType
 */
interface ToggleDatafilePreviewerDetailsPanePayload {
  /**
   * Whether the details pane should be shown or now.
   */
  shouldShow: boolean;
}

export { ToggleDatafilePreviewerDetailsPaneType };
export type { ToggleDatafilePreviewerDetailsPanePayload };
