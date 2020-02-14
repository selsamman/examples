export const todoRedactions = {

  addTodo: (text) => ({
    todoList: {
      append: () => ({text, completed: false}),
    }
  }),

  deleteTodo: () => ({
    todoList: {
      where: (state, item, {id}) => item.id === id,
      delete: true
    }
  }),

  editTodo: (text) => ({
    todoList: {
      where: (state, item, {id}) => item.id === id,
      set: (item) => ({...item, text}),
    }
  }),

  completeTodo: () => ({
    todoList: {
      where: (state, item, ix, {id}) => item.id === id,
      set: (item) => ({...item, completed: true}),
    }
  }),

  completeAllTodos: () => ({
    todoList: {
      where: true,
      set: (state, item) => ({...item, completed: true}),
    }
  }),

  clearCompleted: () => ({
    todoList: {
      where: (sate, item) => item.completed,
      delete: true
    }
  }),

  setVisibilityFilter: (filter) => ({
    visibilityFilter: {
      set: () => filter,
    }
  }),
}
