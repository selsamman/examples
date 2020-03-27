import {todoRedactions} from './redactions';
import {todoSelectors} from './selectors';
import {createAPI} from 'redux-capi'

export const todoAPI = createAPI({
    redactions: todoRedactions,
    selectors: todoSelectors,
})
export const VisibilityFilters = {
    SHOW_ALL: 'SHOW_ALL',
    SHOW_COMPLETED: 'SHOW_COMPLETED',
    SHOW_ACTIVE: 'SHOW_ACTIVE'
}
