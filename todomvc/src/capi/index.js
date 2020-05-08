import {todoRedactions} from './redactions';
import {todoSelectors} from './selectors';
import {todoThunks} from './thunks'
import {createAPI} from 'redux-capi'
export const todoAPISpec = {
  redactions: todoRedactions,
  selectors: todoSelectors,
  thunks: todoThunks
}
export const todoAPI = createAPI(todoAPISpec)
