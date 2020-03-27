import React from 'react'
import {todoAPI} from "../api";

const Todo = ({ id }) => {
    const {toggleTodo, todo } = todoAPI({id: id});
    return (
      <li
        onClick={toggleTodo}
        style={{
          textDecoration: todo.completed ? 'line-through' : 'none'
        }}
      >
        {todo.text}
      </li>
    )
}
export default Todo
