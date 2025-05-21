import React from 'react'
import {createRoot} from 'react-dom/client'
import {applyMiddleware, compose, createStore} from 'redux'
import {Provider} from 'react-redux'
import {BrowserRouter, Route, Routes} from 'react-router-dom'

import thunkMiddleware from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import {createLogger} from 'redux-logger'
import asyncDispatchMiddleware from './util/asyncDispatch'

import App from './App'
import reducers from './reducers'

export const configureReduxMiddleware = () => {
    const middleware = [
        thunkMiddleware,
        promiseMiddleware,
        asyncDispatchMiddleware
    ]

    if (process.env.NODE_ENV === 'development' || window.localStorage.debug) {
        middleware.push(createLogger());
    }
    return middleware;
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(reducers(), {}, composeEnhancers(applyMiddleware(...configureReduxMiddleware())))

export const dispatch = (action) => {
    if (store) {
        store.dispatch(action);
    }
}

const root = createRoot(document.getElementById('root'))

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<App />}/>
            </Routes>
        </BrowserRouter>
    </Provider>
)
