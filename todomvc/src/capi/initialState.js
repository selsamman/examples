import {SHOW_ACTIVE} from "./TodoFilters";

export const initialState = {
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
