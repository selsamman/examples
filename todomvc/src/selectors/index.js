import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'
export const todoSelectors = {

  todos: ({}, state) => state.todos,

  todo: ({id, todos}) => todos.filter(t => t.id == id),

  visibilityFilter: ({}, state) => state.visibilityFilter,

  visibleTodos: ({visibilityFilter, todos}) => {
    switch (visibilityFilter) {
        case SHOW_ALL:
          return todos
        case SHOW_COMPLETED:
          return todos.filter(t => t.completed)
        case SHOW_ACTIVE:
          return todos.filter(t => !t.completed)
        default:
          throw new Error('Unknown filter: ' + visibilityFilter)
      }
  },

  completedTodoCount: ({todos}) =>
    todos.reduce((count, todo) =>
        todo.completed ? count + 1 : count,
      0
    ),
}
