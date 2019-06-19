import React from 'react';
import { TextField } from '@material-ui/core';

export default class NumberColumnFilter extends React.Component<
  {
    label: string;
    onChange: (value: { lt: number | null; gt: number | null }) => void;
  },
  { lessThan: number | null; greaterThan: number | null }
> {
  public constructor(props: {
    label: string;
    onChange: (value: { lt: number | null; gt: number | null }) => void;
  }) {
    super(props);
    this.state = {
      lessThan: null,
      greaterThan: null,
    };
    this.handleGreaterThanChange = this.handleGreaterThanChange.bind(this);
    this.handleLessThanChange = this.handleLessThanChange.bind(this);
  }

  private handleGreaterThanChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const greaterThan = parseInt(event.target.value) || null;
    this.props.onChange({ gt: greaterThan, lt: this.state.lessThan });
    this.setState({
      greaterThan,
    });
  }

  private handleLessThanChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const lessThan = parseInt(event.target.value) || null;
    this.props.onChange({ lt: lessThan, gt: this.state.greaterThan });
    this.setState({
      lessThan,
    });
  }

  public render(): React.ReactElement {
    return (
      <form>
        <TextField
          label="From"
          value={this.state.greaterThan || ''}
          onChange={this.handleGreaterThanChange}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        />
        <TextField
          label="To"
          value={this.state.lessThan || ''}
          onChange={this.handleLessThanChange}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
        />
      </form>
    );
  }
}
