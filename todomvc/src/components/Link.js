import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { todoAPI } from '../api'

const Link = ({ active, children, filter }) => {
  const {setFilter} = todoAPI({name: 'Link'});
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      className={classnames({ selected: active })}
      style={{ cursor: 'pointer' }}
      onClick={() => setFilter(filter)}
    >
      {children}
    </a>
  )
}

Link.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
}

export default Link
