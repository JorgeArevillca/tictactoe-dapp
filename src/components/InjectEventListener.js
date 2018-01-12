import React, { Component } from 'react'
import { getContract, waitForEventOnce } from 'api'

class InjectEventListener extends Component {
  state = {
    logs: []
  }

  async componentWillMount() {
    const TTTF = await getContract('TicTacToeFactory')
    const factory = await TTTF.deployed()
    
    //await waitForEventOnce(factory, 'BroadCastTTTAddress')
  }
  render () {
    const {children} = this.props
    return children
  }
}

export default InjectEventListener
