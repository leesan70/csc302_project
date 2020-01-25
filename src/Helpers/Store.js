import { History } from 'Helpers'
import { applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'connected-react-router';
import thunkMiddleware from 'redux-thunk';
import rootReducer from 'Reducers';

const loggerMiddleware = createLogger();

export function configureStore(preloadedState) {
    const store = createStore(
      rootReducer(History), // root reducer with router state
      preloadedState,
      compose(
        applyMiddleware(
          routerMiddleware(History), // for dispatching history actions
          loggerMiddleware,
          thunkMiddleware
        ),
      ),      
    );
  
    return store;
}