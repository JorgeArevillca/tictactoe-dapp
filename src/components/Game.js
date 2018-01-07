import React, { Component } from 'react'
import { getWeb3, getContract, getTTTFactoryContractInstance } from 'api'
import cn from 'classnames'

import { eventWatcher } from 'api'

import styles from './Game.scss'

const STATES = {
  CIRCLE: 'circle',
  CROSS: 'cross',
  EMPTY: 'empty'
}

const Field = ({ state = STATES.EMPTY }) => {
  return (
    <div className={cn(styles.gameField, styles[`gameField--${state}`])} />
  )
}

class Game extends Component {
  constructor(props) {
    super(props)
    this.handleCreateGame = this.handleCreateGame.bind(this)
    this.state = {
      gameFactoryReady: false,
      gameAddress: undefined,
      gamesAvailable: []
    }
  }

  async componentDidMount() {
    this.web3 = await getWeb3()
    this.gameFactory = await getTTTFactoryContractInstance()
    
    this.setState({
      gameFactoryReady: true
    })
  }

  async handleCreateGame() {
    // call contract thing
    const accounts = await (new Promise((resolve, reject) => {
      this.web3.eth.getAccounts((err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        } 
      })
    }))
    
    const contract = await this.gameFactory.newGame({ from: accounts[0] })

    const { receipt: { logs: [ { address } ] } } = contract
    
    this.contractClass = await getContract('TicTacToe')
    this.contract = await this.contractClass.at(address)

    this.setState({
      gameAddress: address
    })
  }

  renderMenu() {
    const hasGames = this.state.gamesAvailable.length
    return (
      <div className={styles.gameMenu}>
        <p>Welcome to TicTacToe on the Blockchain. Make sure you're on the Testnet!</p>
        <hr />
        {hasGames ? (
          <div>
            {this.state.gamesAvailable.map((game) => {
              return (
                <div className={styles.gameAvailable}>
                  <pre>{JSON.stringify(game)}</pre>
                </div>
              )
            })}
          </div>
        ) : (
          <span>No games available... {this.state.gameFactoryReady && <button type="button" onClick={this.handleCreateGame}>Create a new Game</button>}</span>
        )}
      </div>
    )
  }

  render() {
    if (!this.state.gameAddress) {
      return this.renderMenu()
    }

    return (
      <div className={styles.game}>
        <div className={styles.gameFieldRow}>
          <Field state={STATES.CIRCLE} />
          <Field state={STATES.CIRCLE} />
          <Field state={STATES.CIRCLE} />
        </div>
        <div className={styles.gameFieldRow}>
          <Field state={STATES.EMTPY} />
          <Field state={STATES.CROSS} />
          <Field state={STATES.EMTPY} />
        </div>
        <div className={styles.gameFieldRow}>
          <Field state={STATES.EMTPY} />
          <Field state={STATES.EMTPY} />
          <Field state={STATES.EMTPY} />
        </div>
      </div>
    )
  }
}

export default Game