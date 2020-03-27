export const todoThunks = {
  updateTodo: ({deleteTodo, editTodo}) => (text) => {
    if (text.length === 0) {
      deleteTodo()
    } else {
      editTodo(text)
    }
  },
  completeAllTodos: ({completedCount, todosCount, setCompleteOnAllTodos}) => () => {
    setCompleteOnAllTodos(completedCount !== todosCount)
  }
}
