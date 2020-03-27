import React from 'react'
import Link from '../components/Link'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'
import { todoAPI } from '../api'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed'
}

const Footer = () => {
  const { activeCount, completedCount, clearCompleted, visibilityFilter } = todoAPI({name: 'Footer'});
  const itemWord = activeCount === 1 ? 'item' : 'items'
  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
      <ul className="filters">
        {Object.keys(FILTER_TITLES).map(linkFilter =>
          <li key={linkFilter}>
            <Link filter={linkFilter} active={visibilityFilter === linkFilter}>
              {FILTER_TITLES[linkFilter]}
            </Link>
          </li>
        )}
      </ul>
      {
        !!completedCount &&
        <button
          className="clear-completed"
          onClick={clearCompleted}
        >Clear completed</button>

      }
    </footer>
  )
}
export default Footer
