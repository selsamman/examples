import React from 'react'
import PropTypes from 'prop-types'
import Footer from './Footer'
import VisibleTodoList from '../containers/VisibleTodoList'
import TodoItem from './TodoItem'
import { todoAPI } from '../api'

export default () => {

  const {completedCount, todosCount, completeAllTodos, clearCompleted, filteredTodos} = todoAPI();

  return (
    <section className="main">

      todosCount > 0 &&
        <span>
          <input
            className="toggle-all"
            type="checkbox"
            checked={completedCount === todosCount}
            readOnly
          />
          <label onClick={completeAllTodos}/>
        </span>

      <ul className="todo-list">
        {filteredTodos.map(todo =>
          <TodoItem key={todo.id} />
        )}
      </ul>

     todosCount > 0 &&
      <Footer
        completedCount={completedCount}
        activeCount={todosCount - completedCount}
        onClearCompleted={clearCompleted}
      />

    </section>
  )
}
