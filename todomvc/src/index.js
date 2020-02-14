import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import App from './components/App'
import { reducer } from 'redux-capi'
import 'todomvc-app-css/index.css'
import { todoAPI } from './api'

const store = createStore(reducer)
todoAPI.mount(store);

render(
  <App />,
  document.getElementById('root')
)
