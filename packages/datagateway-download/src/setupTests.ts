import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

// below required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
function noOp(): void { }

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

export const flushPromises = (): Promise<void> => new Promise(setImmediate);

// Mock lodash.debounce to return the function we want to call.
jest.mock('lodash.debounce', () => (fn: Function) => fn);
