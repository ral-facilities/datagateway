// this is a general reducer builder, it needs to accept different types
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Action {
  type: string;
  payload?: any;
}

function createReducer<S>(
  initialState: S,
  handlers: {
    [id: string]: (state: S, payload?: any) => S;
  }
): (state: S | undefined, action: Action) => S {
  return function reducer(state: S = initialState, action: Action) {
    if (action && Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action.payload);
    }
    return state;
  };
}

export default createReducer;
/* eslint-enable @typescript-eslint/no-explicit-any */
