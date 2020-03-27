import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { reducer } from 'redux-capi'
import App from './components/App'
import {todoAPI, VisibilityFilters} from './api'

const store = createStore(reducer, {todos: [], visibilityFilter: VisibilityFilters.SHOW_ALL, nextId: 0})
todoAPI.mount(store);
render(
  <App />,
  document.getElementById('root')
)
