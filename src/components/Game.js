import React, { Component } from 'react'
import { getWeb3, getContract, getTTTContractInstance, getTTTFactoryContractInstance } from 'api'
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
    this.handleManuallyJoinGame = this.handleManuallyJoinGame.bind(this)
    this.handleChangeJoinAddress = this.handleChangeJoinAddress.bind(this)
    this.handleClickChangeJoinAddress = this.handleClickChangeJoinAddress.bind(this)
    this.state = {
      gameFactoryReady: false,
      gameAddress: undefined,
      gamesAvailable: []
    }
  }

  async componentDidMount() {
    try {
      this.web3 = await getWeb3()
      this.gameFactory = await getTTTFactoryContractInstance()

      eventWatcher(this.gameFactory, 'BroadCastTTTAddress', {})        

      this.setState({
        gameFactoryReady: true,
      })
    } catch(e) {
      throw new Error(e)
    }
  }

  async handleManuallyJoinGame() {
    const { joinAddress } = this.state
    try {
      this.contractClass = await getContract('TicTacToe')
      this.contract = await this.contractClass.at(joinAddress)

      this.setState({
        gameAddress: joinAddress,
        gamesAvailable: this.state.gamesAvailable.filter(games => games != joinAddress),
      })
    } catch (e) {
      console.log("failed to join game", e)
      alert("invalid game, could not join")
    }
  }

  handleChangeJoinAddress(e) {
    this.setState({
      joinAddress: e.target.value,
    })
  }

  async handleClickChangeJoinAddress(e) {
    const addr = typeof e.target.innerHTML === 'string' ? e.target.innerHTML : e.target.innerHTML.toString()
    
    try {
      this.contractClass = await getContract('TicTacToe')
      this.contract = await this.contractClass.at(addr)

      this.setState({
        gameAddress: addr,
        gamesAvailable: this.state.gamesAvailable.filter(games => games != addr),
      })
    } catch (e) {
      console.log("failed to join game", e)
      alert("invalid game, could not join")
    }
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
      gameAddress: address,
      gamesAvailable: this.state.gamesAvailable.concat(address),
    })
  }

  renderOtherGamesMenu() {
    const hasGames = this.state.gamesAvailable.length
    return (
      <div className={styles.gameMenu}>
        {hasGames ? (
          <div>
            <p>Available Games!</p>
            {this.state.gamesAvailable.map((game) => {
              return (
                <div className={styles.gameAvailable} key={game}>
                  <pre
                    className={styles.hoverable}
                    onClick={this.handleClickChangeJoinAddress}
                  >{game}</pre>
                </div>
              )
            })}
            <p>{this.state.gameFactoryReady && <button type="button" onClick={this.handleCreateGame}>Create a new Game</button>}</p>
            <p>Or manually join game (by address): <input type="text" value={this.state.joinAddress || ''} onChange={this.handleChangeJoinAddress} /><button type="button" onClick={this.handleManuallyJoinGame}>Join Game</button></p>
          </div>
        ) : (
          <div>
            <p>{this.state.gameFactoryReady && <button type="button" onClick={this.handleCreateGame}>Create a new Game</button>}</p>
            <p>Or manually join game (by address): <input type="text" value={this.state.joinAddress || ''} onChange={this.handleChangeJoinAddress} /><button type="button" onClick={this.handleManuallyJoinGame}>Join Game</button></p>
          </div>
        )}
      </div>
    )  
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
                <div className={styles.gameAvailable} key={game}>
                  <pre>{JSON.stringify(game)}</pre>
                </div>
              )
            })}
            <p>{this.state.gameFactoryReady && <button type="button" onClick={this.handleCreateGame}>Create a new Game</button>}</p>
            <p>Or manually join game (by address): <input type="text" value={this.state.joinAddress || ''} onChange={this.handleChangeJoinAddress} /><button type="button" onClick={this.handleManuallyJoinGame}>Join Game</button></p>
          </div>
        ) : (
          <div>
            <p>{this.state.gameFactoryReady && <button type="button" onClick={this.handleCreateGame}>Create a new Game</button>}</p>
            <p>Or manually join game (by address): <input type="text" value={this.state.joinAddress || ''} onChange={this.handleChangeJoinAddress} /><button type="button" onClick={this.handleManuallyJoinGame}>Join Game</button></p>
          </div>
        )}
      </div>
    )
  }

  render() {
    if (!this.state.gameAddress) {
      return this.renderMenu()
    }

    return (
      <div>
        <p>Your game's address is <code>{this.state.gameAddress}</code></p>
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
        {this.renderOtherGamesMenu()}
      </div>
    )
  }
}

export default Game