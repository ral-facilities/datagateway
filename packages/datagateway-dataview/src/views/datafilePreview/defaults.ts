/**
 * Default configuration for {@link DatafilePreviewer}
 */
const DATAFILE_PREVIEWER_DEFAULT = {
  /**
   * Whether the details pane should be shown by default.
   */
  showDetailsPane: true,

  /**
   * Default zoom level of the previewer in %.
   */
  zoomLevel: 100,

  /**
   * The increment/decrement step for changing zoom level, in %.
   */
  zoomLevelStep: 10,

  /**
   * The minimum zoom level that the datafile previewer will show
   */
  minZoomLevel: 10,
};

export default DATAFILE_PREVIEWER_DEFAULT;
