import React from 'react';
import { TextField } from '@material-ui/core';

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
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.props.onChange(event.target.value);
    this.setState({
      value: event.target.value,
    });
  }

  public render(): React.ReactElement {
    return (
      <TextField
        label={this.props.label}
        value={this.state.value}
        onChange={this.handleChange}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
      />
    );
  }
}
