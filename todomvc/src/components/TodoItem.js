import React, { useState } from 'react'
import classnames from 'classnames'
import TodoTextInput from './TodoTextInput'
import { todoAPI } from '../api'

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
export default TodoItem;
