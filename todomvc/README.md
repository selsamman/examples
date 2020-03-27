# Redux TodoMVC Example

## Usage

This project template was built with [Create React App](https://github.com/facebookincubator/create-react-app), which provides a simple way to start React projects with no build configuration needed.

Projects built with Create-React-App include support for ES6 syntax, as well as several unofficial / not-yet-final forms of Javascript syntax such as Class Properties and JSX. See the list of [language features and polyfills supported by Create-React-App](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#supported-language-features-and-polyfills) for more information.

To run it:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


# The MVC todoList

This is a more extensive version of the simple todoList and as such as additional patterns that are useful to illustrate redux-capi.  We will go through it and compare it with the standard redux implementation.

### Stock Redux Actions and Reducers
In the standard example you have
* A list of constants for the 7 action types
* The 7 action functions
* A main reducer that combines the todo reducer an done for the visibility filter
* The two reducer files that have a switch statement for each reducer

As an example for adding a todo you would have the action constant:
```
export const ADD_TODO = 'ADD_TODO'
```
the action:
```
export const addTodo = text => ({ type: types.ADD_TODO, text })
```
and the reducer
```
    case ADD_TODO:
      return [
        ...state,
        {
          id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
          completed: false,
          text: action.text
        }
      ]
```
### Redux-capi addTodo
With redux-capi you have only the redaction:
```
addTodo: (text) => ({
    nextId: {
        set: (state) => state.nextId +1
    },
    todos: {
        append: (state) => ({text, completed: false, id: state.nextId}),
    }   
}),
```
It works a bit differently than the redux example in order to illustrate how a redaction can involve multiple state properties. Rather than spinning through all todos to find the highest id a high-water mark on ids is kept in the state and incremented as each todo is added.  
### Remaining redux-capi reactions

For deleting the todo the redaction expects the id to be injected in the context when the api is consumed by the component.  This is unpacked from the third parameter which is the context.  I then uses the where clause to select the todo with that id and deletes it.
```
  deleteTodo: () => ({
    todos: {
      where: (state, item, ix, {id}) => item.id === id,
      delete: true
    }
  }),
```
Editing also uses the id in the context and makes use of the assign function and the ES6 object shorthand to keep the code compact
```
  editTodo: (text) => ({
    todos: {
      where: (state, item, ix, {id}) => item.id === id,
      assign: () => ({text}),
    }
  }),
```
Completing the todo uses assign as well
```
  completeTodo: () => ({
    todos: {
      where: (state, item, ix, {id}) => item.id === id,
      assign: () => ({completed: true}),
    }
  }),
```
Deleting all the completed todos uses the where function to select completed todos and deletes them
```
  clearCompleted: () => ({
    todos: {
      where: (state, item) => item.completed,
      delete: true
    }
  }),
```
Finally the simplist redaction is for setting the filter:
```
  setFilter: (filter) => ({
    visibilityFilter: {
      set: () => filter,
    }
  }),
```
### Selectors and Thunks
The structure of actions, selectors and reducers in the redux example is a little different than the example in redux-capi.  In the standard redux example the todo list component is expected to select all the todos and then pass the data into child component which handles the todo list element.  It is also passed actions that it can call for editing.  This is a common pattern in React.  

With redux-capi you have the option to double the parent (todoList) component from the child (todoItem) component and pass in only the id.  Because the API is structured to allow section of and actions on an individual todo Item the todo Item concerns stay in the todoItem.

To accomodate this the selector for the todoItem refeferences the id from the context:
```
  todo: [
    (select, {id, todos}) => select(id, todos),
    (id, todos) => todos.find(t => t.id === id)
  ],
```
This is a memoized selector that references the id from the context as well as the todos selectors

The filteredTodos selector uses a simple selector for the todos

```
  todos: (state) => state.todos,
```
and builds on it with a memoized selector to select todos matching the filter criteria
```
  filteredTodos: [
    (select, {visibilityFilter, todos}) => select(visibilityFilter, todos),
    (visibilityFilter, todos) =>
        todos.filter(t => visibilityFilter === SHOW_ALL || 
                     t.completed === (visibilityFilter === SHOW_COMPLETED))
  ],
```
An finally there are some memoized selectors for counting todos that use the todos selector:
```
  completedCount: [
    (select, {todos}) => select(todos),
    (todos) => todos.reduce((count, todo) => count + (todo.completed ? 1 : 0), 0)
  ],

  todosCount: [
    (select, {todos}}) => select(todos),
    (todos) => todos.reduce((count, todo) => count + 1, 0)
  ],
```
The standard redux implementation has a reducer to set all todos to completed unles all todos are already completed in which case it resets their completed status.
```
    case COMPLETE_ALL_TODOS:
      const areAllMarked = state.every(todo => todo.completed)
      return state.map(todo => ({
        ...todo,
        completed: !areAllMarked
      }))
```
In redactions one does not have the ability to pre-compute values as you can with a standard reducer so instead simply use a thunk/redaction combination:
```
  thunks: {
    completeAllTodos: ({completedCount, todosCount, setCompleteOnAllTodos}) => () => {
        setCompleteOnAllTodos(completedCount ==! todosCount)
  },
  selectors: {
    setCompleteOnAllTodos: (completeValue) => ({
      todos: {
        where: (state, todo) => todo.completed != completeValue,
          assign: () => ({completed: completeValue}),
       }
    }),
  }
```
This also leverages the memoized selectors that already do the computation on whether the todos are already completed and it only mutates the todos that need mutation.

## Component Structure
With redux-capi there are fewer components because you don't use HOC components.  This would also be the case anyway with converting the application to use react-hooks.  The difference is that with using hooks you would likely create hooks files that served as the glue between the visual components and the selectors and actions.  With redux-capi this intermediary is not necessary.

The main section of the application (converted from the original redux example) uses function-based components for illustrative purposes:
```
const MainSection = () => {

  let {completedCount, todosCount, completeAllTodos, filteredTodos} = todoAPI();

  return (
    <section className="main">

      {todosCount > 0 &&
        <span>
          <input
            className="toggle-all"
            type="checkbox"
            checked={completedCount === todosCount}
            readOnly
          />
          <label onClick={completeAllTodos}/>
        </span>}

      <ul className="todo-list">
        {filteredTodos.map(todo =>
          <TodoItem id={todo.id} key={todo.id} />
        )}
      </ul>

      {todosCount > 0 &&
        <Footer />}

    </section>
  )
}
```
The first section is a checkbox that shows whether all todos are completed and a clickable label which will either set all todos as completed or set them all to incomplete.  The next section maps all of the items in the todoList but only passes the id into the TodoItem, leaving it to TodoItem to fully handle processing on and individual todo item.

The TodoItem component
```
const TodoItem = ({id}) => {

  const [editing, setEditing] = useState(false);
  const enableEditing = () => setEditing(true);
  const disableEditing = () => setEditing(false);

  const { todo, completeTodo, deleteTodo, updateTodo } = todoAPI({id: id, name: 'TodoItem'});

  return (
    <li className={classnames({
      completed: todo.completed,
      editing: editing
      })}>
      {editing ?
        <TodoTextInput text={todo.text}
                      editing={editing}
                      onSave={(text) => {updateTodo(text); disableEditing()}}
        />
        :
        <div className="view">
          <input className="toggle"
                 type="checkbox"
                 checked={todo.completed}
                 onChange={completeTodo} />
           <label onDoubleClick={enableEditing}>
            {todo.text}
           </label>
           <button className="destroy"
                   onClick={deleteTodo} />
        </div>
      }
    </li>
  )
}
```
The todoItem component uses local state to determine whether it is editing or not and uses the API for editing of the todo Item.  This keeps all editing concerns in the component rather than involving the parent component as in the standard implementation. 
