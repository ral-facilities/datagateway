import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';

type DatePickerType = Date | 'Invalid Date' | null;

interface DateFilterState {
  fromDate: DatePickerType;
  toDate: DatePickerType;
}

class DateFilter extends React.Component<IFilterParams, DateFilterState> {
  public constructor(props: IFilterParams) {
    super(props);
    this.state = {
      fromDate: null,
      toDate: null,
    };
  }

  public isFilterActive(): boolean {
    return this.state.fromDate !== null || this.state.toDate !== null;
  }

  public doesFilterPass(params: IDoesFilterPassParams): boolean {
    const cellDate = this.props.valueGetter(params.node);
    const { fromDate, toDate } = this.state;
    if (fromDate === 'Invalid Date' || toDate === 'Invalid Date') {
      return true;
    }
    if (fromDate && toDate) {
      return cellDate >= fromDate && cellDate <= toDate;
    } else if (fromDate) {
      return cellDate >= fromDate;
    } else if (toDate) {
      return cellDate <= toDate;
    } else {
      return true;
    }
  }

  public getModel(): { fromDate: DatePickerType; toDate: DatePickerType } {
    return {
      fromDate: this.state.fromDate,
      toDate: this.state.toDate,
    };
  }

  public setModel(model: {
    fromDate: DatePickerType;
    toDate: DatePickerType;
  }): void {
    this.setState(model);
  }

  public render(): React.ReactElement {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDateTimePicker
            value={this.state.fromDate}
            onChange={date =>
              this.setState({ fromDate: date }, () =>
                this.props.filterChangedCallback()
              )
            }
            format="yyyy-MM-dd"
            placeholder="From"
            clearable
          />
        </MuiPickersUtilsProvider>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDateTimePicker
            value={this.state.toDate}
            onChange={date =>
              this.setState({ toDate: date }, () =>
                this.props.filterChangedCallback()
              )
            }
            format="yyyy-MM-dd"
            placeholder="To"
            clearable
          />
        </MuiPickersUtilsProvider>
        <div className="ag-filter-apply-panel">
          <button
            type="button"
            onClick={e =>
              this.setState({ fromDate: null, toDate: null }, () =>
                this.props.filterChangedCallback()
              )
            }
          >
            Clear Filter
          </button>
        </div>
      </div>
    );
  }
}

export default DateFilter;
