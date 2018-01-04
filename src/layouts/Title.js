import React from 'react'

const Title = ({ children, ...props }) => (
  <h1 {...props}>{children}</h1>
)

export default Title