import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import singleSpaReact from 'single-spa-react';

function domElementGetter(): HTMLElement {
    // Make sure there is a div for us to render into
    let el = document.getElementById('datagateway-download');
    if (!el) {
        el = document.createElement('div');
    }

    return el;
}

const reactLifecycles = singleSpaReact({
    React,
    ReactDOM,
    rootComponent: App,
    domElementGetter,
});


/* eslint-disable @typescript-eslint/no-explicit-any */
// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: any): Promise<void> {
    return reactLifecycles.bootstrap(props);
}
  
export function mount(props: any): Promise<void> {
    return reactLifecycles.mount(props);
}
  
export function unmount(props: any): Promise<void> {
    return reactLifecycles.unmount(props);
}
/* eslint-enable @typescript-eslint/no-explicit-any */


if (process.env.NODE_ENV === `development`) {
    ReactDOM.render(<App />, document.getElementById('datagateway-download'));
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

document.dispatchEvent(
    new CustomEvent('daaas-frontend', {
        detail: {
            type: 'daaas:api:register_route',
            payload: {
                section: 'Test',
                link: '/browse',
                plugin: 'datagateway-download',
                displayName: 'DataGateway Download',
                order: 0,
                helpText: 'TODO: Write help text for user tour',
            }
        }
    })
);
