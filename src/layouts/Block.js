import React from 'react'

const Block = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)

export default Block