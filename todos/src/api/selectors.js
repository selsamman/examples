import { VisibilityFilters } from '../api'
export const todoSelectors = {

    todos: (state) => state.todos,

    visibilityFilter: (state) => state.visibilityFilter,

    todo: [
        (select, {id, todos}) => select(id, todos),
        (id, todos) => todos.find(t => t.id === id)
    ],

    filteredTodos: [
        (select, {visibilityFilter, todos}) => select(visibilityFilter, todos),
        (visibilityFilter, todos) => {
            switch (visibilityFilter) {
                case VisibilityFilters.SHOW_ALL:
                    return todos
                case  VisibilityFilters.SHOW_COMPLETED:
                    return todos.filter(t => t.completed)
                case VisibilityFilters.SHOW_ACTIVE:
                    return todos.filter(t => !t.completed)
                default:
                    throw new Error('Unknown filter: ' + visibilityFilter)
            }
        }
    ],
 }
