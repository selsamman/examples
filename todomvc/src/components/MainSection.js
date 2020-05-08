import React from 'react'
import Footer from './Footer'
import TodoItem from './TodoItem'
import { todoAPI } from '../capi'

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
export default MainSection;
