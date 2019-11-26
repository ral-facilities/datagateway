export const ToggleDatasetType = 'datagateway_search:toggle_dataset';
export const ToggleDatafileType = 'datagateway_search:toggle_datafile';
export const ToggleInvestigationType = 'datagateway_search:toggle_investigation';
export const SelectStartDateType = 'datagateway_search:select_startdate';
export const SelectEndDateType = 'datagateway_search:select_enddate';


export interface TogglePayload {
    toggleoption: boolean;
}

export interface SelectDatePayload {
    date : number;
}