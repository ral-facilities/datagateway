import React from 'react';

function withIdCheck(checkingFunction: () => Promise<boolean>) {
  return function WithIdCheck<T>(
    Component: React.ComponentType<T>
  ): React.ComponentType<T> {
    return class WithIdCheckComponent extends React.Component<
      T,
      { loading: boolean; valid: boolean }
    > {
      public state = { loading: true, valid: false };

      public componentDidMount(): void {
        checkingFunction()
          .then(valid => {
            this.setState({ valid });
          })
          .catch(() => {
            this.setState({ valid: false });
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      }

      public render(): React.ReactElement {
        const { loading, valid } = this.state;
        if (loading) {
          return <div>Checking ids...</div>;
        } else {
          if (valid) {
            return <Component {...this.props} />;
          } else {
            return <div>Failed id check</div>;
          }
        }
      }
    };
  };
}

export default withIdCheck;
