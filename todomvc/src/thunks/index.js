export const todoThunks = {
  updateTodo: (text) => ({deleteTodo, editTodo, id}) => {
    if (text.length === 0) {
      deleteTodo(id)
    } else {
      editTodo(id, text)
    }
  }
}
