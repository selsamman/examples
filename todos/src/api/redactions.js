export const todoRedactions = {

    addTodo: (text) => ({
        nextId: {
            set: (state) => state.nextId +1
        },
        todos: {
            append: (state) => ({text, completed: false, id: state.nextId}),
        },
    }),

    toggleTodo: () => ({
        todos: {
            where: (state, item, ix, {id}) => item.id === id,
            assign: (state, todo) => ({completed: !todo.completed}),
        }
    }),

    setVisibilityFilter: (filter) => ({
        visibilityFilter: {
            set: () => filter,
        }
    }),
}

