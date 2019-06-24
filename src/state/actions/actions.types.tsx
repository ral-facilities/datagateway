export const SortTableType = 'datagateway_table:sort_table';

export interface SortTablePayload {
  column: string;
  order: 'ASC' | 'DESC';
}
