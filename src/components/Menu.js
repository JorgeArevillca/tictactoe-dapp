import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { startListener } from 'api'

import WithContract from './WithContract'

import styles from './Menu.scss'

class Menu extends Component {
  constructor(props) {
    super(props)

    this.handleChangeJoinAddress = this.handleChangeJoinAddress.bind(this)
    this.handleClickChangeJoinAddress = this.handleClickChangeJoinAddress.bind(this)
    this.handleCreateGame = this.handleCreateGame.bind(this)
    this.handleManuallyJoinGame = this.handleManuallyJoinGame.bind(this)

    this.state = {
      joinAddress: '',
      gamesAvailable: [],
    }
  }

  componentDidMount() {
    const { deployed: { TicTacToeFactory: factoryInstance } } = this.props
    this.gameCreatedListener = startListener(factoryInstance, 'BroadCastTTTAddress')
    this.gameCreatedListener.addListener((txReceipt) => {
      const { args: { TTTGame } } = txReceipt
      if (this.state.gamesAvailable.indexOf(TTTGame) === -1) {
        this.setState({ gamesAvailable: [
          ...this.state.gamesAvailable,
          TTTGame
         ]})
        this.props.refresh()
      }
    })
  }

  componentWillUnmount() {
    this.gameCreatedListener.stop()
  }
  
  handleChangeJoinAddress = (e) => {
    this.setState({
      joinAddress: e.target.value,
    })
  }

  async handleClickChangeJoinAddress(e) {
    const addr = typeof e.target.innerHTML === 'string' ? e.target.innerHTML : e.target.innerHTML.toString()
    const { history, contracts: { TicTacToe } } = this.props
    
    try {
      const gameInstance = await TicTacToe.at(addr)

       history.push(`/${gameInstance.address}`)
    } catch (e) {
      console.log("failed to join game", e)
      alert("invalid game, could not join")
    }
  }

  async handleManuallyJoinGame(e) {
    const { history, contracts: { TicTacToe } } = this.props

    try {
      const gameInstance = await TicTacToe.at(this.state.joinAddress)

       history.push(`/${gameInstance.address}`)
    } catch (e) {
      console.log("failed to join game", e)
      alert("invalid game, could not join")
    }    
  }

  async handleCreateGame() {
    const { account, history, deployed: { TicTacToeFactory }, contracts: { TicTacToe } } = this.props
    const contract = await TicTacToeFactory.newGame({ from: account.toLowerCase(), gas: 999999 })
    
    const { receipt: { logs: [ { address } ] } } = contract

    const newInstance = await TicTacToe.at(address)
    
    this.setState({
      gameAddress: address,
      gamesAvailable: this.state.gamesAvailable.concat(address),
    })

    history.push(`/${address}`)
  }

  render() {
    const { instances: { TicTacToeFactory } } = this.props
    const { gamesAvailable, joinAddress } = this.state

    const hasGames = gamesAvailable.length > 0

    return (
      <div className={styles.gameMenu}>
        <p>Welcome to TicTacToe on the Blockchain. Make sure you're on the Testnet!</p>
        <hr />
        {hasGames ? (
          <div>
            <p>These games are available</p>
            {this.state.gamesAvailable.map((game) => {
              return (
                <div className={styles.gameAvailable} key={game}>
                  <Link to={`/${game}`}><pre>{game}</pre></Link>
                </div>
              )
            })}
            <p><button type="button" onClick={this.handleCreateGame}>Create a new Game</button></p>
            <p>Or manually join game (by address): <input type="text" value={joinAddress || ''} onChange={this.handleChangeJoinAddress} /><button type="button" onClick={this.handleManuallyJoinGame}>Join Game</button></p>
          </div>
        ) : (
          <div>
            <p><button type="button" onClick={this.handleCreateGame}>Create a new Game</button></p>
            <p>Or manually join game (by address): <input type="text" value={joinAddress || ''} onChange={this.handleChangeJoinAddress} /><button type="button" onClick={this.handleManuallyJoinGame}>Join Game</button></p>
          </div>
        )}
      </div>
    )
  }
}

export default withRouter(WithContract(['TicTacToeFactory', 'TicTacToe'])(Menu))