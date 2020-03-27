import React from 'react'
import { render } from 'react-dom'
import { applyMiddleware, createStore, compose } from 'redux'
import App from './components/App'
import { reducer, trace } from 'redux-capi'
import 'todomvc-app-css/index.css'
import { todoAPI } from './api'
import { SHOW_ACTIVE } from './constants/TodoFilters'
import ReduxThunk from 'redux-thunk'
trace.log = (x) => {console.log(x)}
const initialState = {
  todos: [
    {
      text: 'Use Redux',
      completed: false,
      id: 0
    },
  ],
  nextId: 1,
  visibilityFilter: SHOW_ACTIVE
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, initialState, composeEnhancers(applyMiddleware(ReduxThunk)))
todoAPI.mount(store);

render(
  <App />,
  document.getElementById('root')
)
