# reductions-capi

A replacement for react-redux which allows redactions (self-reducing actions), selectors and thunks to be packaged as an api and consumed by React components without the use of the HOC pattern (connect).

The HOC pattern is very powerful and allows presentation components to be separated from visual components.  It allows logic (thunks) to be packaged up with selectors and actions and then consumed by the visual component by pushing them all into a component's props. When state changes in the redux store these props are updated and this takes care of re-rendering changes when relavent parts of the store are changed.
  
  With the advent of hoods redux uses a completely different technique where actions, thunks and selectors are defined directly in the visual component and never manifest themselves as props.  A completely parallel mechanism is provided to re-render the component when selector values change.
   
 redux-capi allows you to completely seperate the state change logic (actions, thunks and selectors) from the component to allow for easy re-use.  You package everything related to a particular part of the state into an API specifically designed to be consumed by components using a single call to the API.  You can use some or all of the selectors, actions and thunks with a simple call like this.
 
 ```
 const { todo, completeTodo, deleteTodo, updateTodo } = todoAPI({id: props.id});
```

It also solves for the problem where you want to have a selector be dependent on property values and would normally use a closure since the selector is defined directly in the component.  It does this by providing an execution context for the API which is tied to the component instance (in this case id is set in the context and any of the selectors, thunks or actions can refer to it rather than having to pass in parameters.  There are also begin and end events you can define in the API that are fired only once per mount and and on dismount for allocating resources, reading files are other houskeeping chores.  All of that is hidden from the visual component.

redux-capi automatically re-renders the component when any of the selectors that you use in a component are changed.  It does this using getters to know which ones are being used.

Finally you don't need reducerts because the actions are self-reducing and simply define the state shape and what needs to be done and a master reducer takes care of all of the reducing logic for you:

```
  editTodo: (text) => ({
    todoList: {
      where: (state, item, {id}) => item.id === id,
      set: (item) => ({...item, text}),
    }
  }),
```
