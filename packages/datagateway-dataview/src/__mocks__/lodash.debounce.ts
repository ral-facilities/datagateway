// TODO: move __mocks__ folder back to package root once facebook/create-react-app#7539 is fixed

const func = <A, T>() => (fn: (args: A) => T): ((args: A) => T) => fn;

export default func;
