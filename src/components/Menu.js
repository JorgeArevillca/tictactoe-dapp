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
    this.handleManuallyJoinGame = this.handleManuallyJoinGame.bind(this)

    this.state = {
      joinAddress: '',
      gamesAvailable: [],
    }
  }
  
  // async componentDidMount() {
  //   const {deployed: { TicTacToeFactory, TicTacToeFactory: { newGame, BroadCastTTTAddress } } } = this.props
  //   const returnV = await BroadCastTTTAddress()
  //   returnV.watch((err, resp) => {
  //     if(err) throw new Error(err)

  //     console.log(resp)
  //   })
  // }

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
    console.log(`using account ${account}`)
    console.log(TicTacToeFactory)
    const contract = await TicTacToeFactory.newGame({ from: account.toLowerCase(), gas: 999999 })
    
    console.log(contract)
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