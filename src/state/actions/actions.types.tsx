// parent app actions
export const RegisterRouteType = 'daaas:api:register_route';
export const RequestPluginRerenderType = 'daaas:api:plugin_rerender';

// internal actions
export const SortTableType = 'datagateway_table:sort_table';

export interface SortTablePayload {
  column: string;
  order: 'ASC' | 'DESC';
}
