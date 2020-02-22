import { SHOW_ACTIVE, SHOW_COMPLETED } from '../constants/TodoFilters'

export const todoRedactions = {

  addTodo: (text) => ({
    nextId: {
      set: (state) => state.nextId +1
    },
    todos: {
      append: (state) => ({text, completed: false, id: state.nextId}),
    },
    visibilityFilter: {
      set: ({visibilityFilter}) => visibilityFilter === SHOW_COMPLETED ? SHOW_ACTIVE : visibilityFilter
    }
  }),

  deleteTodo: () => ({
    todos: {
      where: (state, item, ix, {id}) => item.id === id,
      delete: true
    }
  }),

  editTodo: (text) => ({
    todos: {
      where: (state, item, ix, {id}) => item.id === id,
      set: (state, item) => ({...item, text}),
    }
  }),

  completeTodo: () => ({
    todos: {
      where: (state, item, ix, {id}) => item.id === id,
      set: (state, item) => ({...item, completed: true}),
    }
  }),

  completeAllTodos: () => ({
    todos: {
      where: true,
      set: (state, item) => ({...item, completed: true}),
    }
  }),

  clearCompleted: () => ({
    todos: {
      where: (state, item) => item.completed,
      delete: true
    }
  }),

  setFilter: (filter) => ({
    visibilityFilter: {
      set: () => filter,
    }
  }),
}
