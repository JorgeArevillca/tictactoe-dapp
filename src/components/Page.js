import React, { Component } from 'react'
import { getTTTContractInstance } from 'api'
import Game from './Game'
import Header from './Header'

import styles from './Page.scss'

class Page extends Component {
  render() {
    const { children } = this.props

    return (
      <div className={styles.page}>
        <Header />
        {children}
      </div>
    )
  }
}

export default Page