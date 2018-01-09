import React, { Component } from 'react'

import Web3 from 'web3'
import TC from 'truffle-contract'

Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
const TTTF = TC(require('../../build/contracts/TicTacToeFactory.json'))
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

class InjectEventListener extends Component {
  state = {
    logs: []
  }

  async componentWillMount() {
    console.log('Andre is nicht sehr lame! Aber er ist viel viel geile!')
    
    await TTTF.setProvider(web3.currentProvider)
    const { BroadCastTTTAddress: bcAdd } = await TTTF.deployed()
    bcAdd().watch((err, resp) => {
      const { args: { TTTGame } } = resp
      const { logs } = this.state
      if (err) throw new Error(err)
      console.log(TTTGame)
      
      this.setState({
        logs: [...logs, TTTGame]
      })
    })
  }
  render () {
    const {children} = this.props
    return children
  }
}

export default InjectEventListener
