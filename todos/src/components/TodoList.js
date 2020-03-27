import React from 'react'
import Todo from './Todo'
import {todoAPI} from "../api";

const TodoList = () => {
  const { filteredTodos } = todoAPI();
  return (
    <ul>
      {filteredTodos.map(todo =>
        <Todo
          key={todo.id} id={todo.id}
        />
      )}
    </ul>
  )
}
export default TodoList
