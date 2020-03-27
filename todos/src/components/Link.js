import React from 'react'
import { todoAPI } from '../api'

const Link = ({ filter, children }) => {
    const { visibilityFilter, setVisibilityFilter } = todoAPI();
    return (
        <button
           onClick={() => setVisibilityFilter(filter)}
           disabled={filter === visibilityFilter}
           style={{
               marginLeft: '4px',
           }}
        >
          {children}
        </button>
    )
}
export default Link
