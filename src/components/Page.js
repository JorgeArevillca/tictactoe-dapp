import React, { Component } from 'react'
import { getTTTContractInstance } from 'api'
import Game from './Game'
import Header from './Header'

import styles from './Page.scss'

class Page extends Component {
  constructor(props) {
    super(props)
    this.state = {
      contractLoaded: false
    }
  }
  async componentDidMount() {
    const ttt = await getTTTContractInstance()
    this.contractInstance = ttt
    this.setState({ contractLoaded: true })
  }

  render() {
    const hasContractAndConnection = this.state.contractLoaded && this.contractInstance
    return (
      <div className={styles.page}>
        <Header />
        {hasContractAndConnection ? 
          <Game contract={this.contractInstance} /> : 
          <span>Loading Game Contract</span>
        }
      </div>
    )
  }
}

export default Page