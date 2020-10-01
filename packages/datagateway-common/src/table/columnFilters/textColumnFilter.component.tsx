import React from 'react';
import { Input } from '@material-ui/core';
import debounce from 'lodash.debounce';

export default class TextColumnFilter extends React.Component<
  { label: string; onChange: (value: string) => void },
  { value: string }
> {
  public constructor(props: {
    label: string;
    onChange: (value: string) => void;
  }) {
    super(props);
    this.state = {
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateValue = this.updateValue.bind(this);
  }

  // Debounce the updating of the column filter by 250 milliseconds.
  private updateValue = debounce((value: string) => {
    this.props.onChange(value);
  }, 250);

  private handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.updateValue(event.target.value);
    this.setState({
      value: event.target.value,
    });
  }

  public render(): React.ReactElement {
    return (
      <div>
        <Input
          id={`${this.props.label} filter`}
          placeholder="Contains..."
          value={this.state.value}
          onChange={this.handleChange}
          aria-label={`Filter by ${this.props.label}`}
          fullWidth={true}
          color="secondary"
        />
      </div>
    );
  }
}
