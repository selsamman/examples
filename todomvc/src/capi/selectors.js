import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from './TodoFilters'
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
          case SHOW_ALL:
            return todos
          case SHOW_COMPLETED:
            return todos.filter(t => t.completed)
          case SHOW_ACTIVE:
            return todos.filter(t => !t.completed)
          default:
            throw new Error('Unknown filter: ' + visibilityFilter)
        }
    }
  ],
  completedCount: [
    (select, api) => select(api.todos),
    (todos) => todos.reduce((count, todo) => count + (todo.completed ? 1 : 0), 0)
  ],

  todosCount: [
    (select, api) => select(api.todos),
    (todos) => todos.reduce((count, todo) => count + 1, 0)
  ],

  activeCount: (state, api) => (api.todosCount - api.completedCount),
}
