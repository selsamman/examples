import {todoRedactions} from '../redactions';
import {todoSelectors} from '../selectors';
import {todoThunks} from '../thunks'
import {createAPI} from '../redux-capi'

export const todoAPI = createAPI({
  actions: todoRedactions,
  selectors: todoSelectors,
  thunks: todoThunks
})
