import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import  { History, configureStore } from 'Helpers';
import { App } from 'App';
import * as serviceWorker from 'Utils/serviceWorker';
import { ConnectedRouter } from 'connected-react-router';

const Store = configureStore({});

// Needed for Hot Module Replacement
if(typeof(module.hot) !== 'undefined') { // eslint-disable-line no-undef  
    module.hot.accept(); // eslint-disable-line no-undef  
}

render(
    <Provider store={Store}>
        <ConnectedRouter history={History}>
            <App />
        </ConnectedRouter>        
    </Provider>,
    document.getElementById('app')
);

// // If you want your app to work offline and load faster, you can change
// // unregister() to register() below. Note this comes with some pitfalls.
// // Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();