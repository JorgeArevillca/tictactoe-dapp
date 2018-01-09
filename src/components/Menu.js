import React, { Component } from 'react'
import { withRouter } from 'react-router'

import WithContract from './WithContract'

import styles from './Menu.scss'

class Menu extends Component {
  constructor(props) {
    super(props)

    this.handleChangeJoinAddress = this.handleChangeJoinAddress.bind(this)
    this.handleClickChangeJoinAddress = this.handleClickChangeJoinAddress.bind(this)
    this.handleCreateGame = this.handleCreateGame.bind(this)

    this.state = {
      joinAddress: '',
      gamesAvailable: [],
    }
  }
  
  handleChangeJoinAddress = (e) => {
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
    const { history, deployed: { TicTacToeFactory }, contracts: { TicTacToe } } = this.props
    // call contract thing
    const accounts = await this.props.getAccounts()
    const contract = await TicTacToeFactory.newGame({ from: accounts[0] })
    
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
            {/*this.state.gamesAvailable.map((game) => {
              return (
                <div className={styles.gameAvailable} key={game}>
                  <pre>{JSON.stringify(game)}</pre>
                </div>
              )
            })*/}
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