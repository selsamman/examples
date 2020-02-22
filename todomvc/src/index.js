import React from 'react'
import { render } from 'react-dom'
import { applyMiddleware, createStore } from 'redux'
import App from './components/App'
import { reducer } from './redux-capi'
import 'todomvc-app-css/index.css'
import { todoAPI } from './api'
import { SHOW_ACTIVE } from './constants/TodoFilters'
import ReduxThunk from 'redux-thunk'

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

const store = createStore(reducer, initialState, applyMiddleware(ReduxThunk))
todoAPI.mount(store);

render(
  <App />,
  document.getElementById('root')
)
