# redux-capi

An alternative to react-redux which packages up actions, selectors and thunks as an API designed to be consumed by components. Unlike the HOC pattern (connect) or hooks, API is fully independent of any particular component.  A component may consume all or part of the API. 

To consume the API you invoke it and unpack any of the selectors, thunks or actions you may need.  Generally this would be done in the render() function.
 ```
 const { todo, completeTodo, deleteTodo, updateTodo } = todoAPI({todoId: props.id});
```
redux-capi automatically re-renders the component when the value of any of the selectors that you use changes because the state is mutated.  You may also supply additional properties (id: props.id) as context that the API may use to action or select specific data appropriate to the component instance.

For mutating state you don't need reducers because the actions themselves are self-reducing and define the state shape and what needs to be done and a master reducer takes care of all of the reducing logic for you:

```
  editTodo: (text) => ({
    todoList: {
      where: (state, item, {todoId}) => item.id === todoId,
      set: (item) => ({...item, text}),
    }
  }),
```
The actions are functions which are self-dispatched and passed any arbitrary parameters and return a graph of the state slice to be mutated along with directives such as which element of an array (todoList) is to be mutated and fuction that is to return the new value for one particular element of the state.
