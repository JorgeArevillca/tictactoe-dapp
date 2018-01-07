import React from 'react'

import Game from './Game'
import Header from './Header'

import styles from './Page.scss'

const Page = () => 
  <div className={styles.page}>
    <Header />
    <Game />
  </div>

export default Page