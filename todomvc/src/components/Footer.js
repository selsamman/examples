import React from 'react'
import PropTypes from 'prop-types'
import FilterLink from '../containers/FilterLink'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'
import { todoAPI } from '../api'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed'
}

const Footer = () => {
  const { activeCount, completedCount, onClearCompleted } = todoAPI();
  const itemWord = activeCount === 1 ? 'item' : 'items'
  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
      <ul className="filters">
        {Object.keys(FILTER_TITLES).map(filter =>
          <li key={filter}>
            <FilterLink filter={filter}>
              {FILTER_TITLES[filter]}
            </FilterLink>
          </li>
        )}
      </ul>
      {
        !!completedCount &&
        <button
          className="clear-completed"
          onClick={onClearCompleted}
        >Clear completed</button>

      }
    </footer>
  )
}

Footer.propTypes = {
  completedCount: PropTypes.number.isRequired,
  activeCount: PropTypes.number.isRequired,
  onClearCompleted: PropTypes.func.isRequired,
}

export default Footer
