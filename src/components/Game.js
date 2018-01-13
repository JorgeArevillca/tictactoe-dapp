import React, { Component } from 'react'
import WithContract from './WithContract'
import cn from 'classnames'
import { startListener } from 'api'

import styles from './Game.scss'

const STATES = {
  EMPTY: 'empty',
  CIRCLE: 'circle',
  CROSS: 'cross',
}

const Field = ({ state = STATES.EMPTY, onClick, disabled, x, y }) => {
  return (
    <button disabled={disabled} className={cn(styles.gameField, styles[`gameField--${state}`])} onClick={() => !disabled && onClick(x, y)} />
  )
}

const GameField = ({ field, enabled, onMakeMove }) => {
  return (
    <div className={
        cn(styles.game, {
          [styles.gameDisabled]: !enabled
        })
      }
    >
    {field.map((row, y) => (
      <div className={styles.gameFieldRow} key={`row_${y}`}>
        {row.map((fieldState, x) => (
          <Field x={x} y={y} disabled={!enabled} onClick={onMakeMove} state={fieldState} key={`cell_${x}`} />
        ))}
      </div>
    ))}
  </div>
  )
}

const GameStatus = ({
  account,
  currentPlayer,
  winner,
  turnCount,
  opponent,
  challenger,
  onJoinGame
}) => {
  const hasWinner =  parseInt(winner, 16) > 0
  const hasStarted = parseInt(currentPlayer, 16) > 0 
  const hasOpponent = parseInt(opponent, 16) > 0
  const isWinner = account === winner
  const isPlaying = account === opponent || account == challenger
  const isRunning = turnCount < 10 && !hasWinner

  // Game has not started yet, current user is not ingame and game has no opponent
  if (!hasStarted && !isPlaying && !hasOpponent) {
    return (
      <p>There is no opponent. <button type="button" onClick={onJoinGame}>Join as Opponent</button></p>
    )
  }

  // Game running and current user is participating, show turn info
  if (isPlaying && isRunning) {
    const isMyTurn = currentPlayer === account
    return (
      <p>It's {isMyTurn ? 'your' : 'your opponent\'s'} turn</p>
    )
  }

  // Game is running, current user is not participating, show uncontextual turn info
  if (isRunning && !isPlaying) {
    const isOpponentsTurn = currentPlayer === opponent
    return (
      <p>It's {isOpponentsTurn ? 'the opponent\'s' : 'the challenger\'s'} turn</p>
    )
  }

  // Game has ended, game has a winner and current user is participating, show winner info
  if (isPlaying && !isRunning) {
    return (
      <p>{isWinner ? 'You won! Congratulations!' : 'You lost! Boo :('}</p>
    )
  }

  // Game has ended, game has no winner, show tie
  if (!isRunning && !hasWinner) {
    return (
      <p>The game ended in a tie. Everyone is a loser :(</p>
    )
  }

  return null
}

class Game extends Component {
  constructor(props) {
    super(props)
    this.handleJoinGame = this.handleJoinGame.bind(this)
    this.handleMakeMove = this.handleMakeMove.bind(this)
  }

  componentDidMount() {
    const gameAddress = this.props.match.params.gameAddress
    const {
      instances: {
        TicTacToe: {
          [gameAddress]: gameInstance
        }
      },
      contracts: {
        TicTacToe,
      }
    } = this.props
    
    this.moveMadeListener = startListener(gameInstance, 'MoveMade')
    this.moveMadeListener.addListener(() => this.props.refresh())

    this.opponentJoinedListener = startListener(gameInstance, 'GameHasOpponent')
    this.opponentJoinedListener.addListener(() => this.props.refresh())
  }

  async componentWillUnmount() {
    this.moveMadeListener.stop()
    this.opponentJoinedListener.stop()
  }

  async handleMakeMove(x, y) {
    const gameAddress = this.props.match.params.gameAddress
    const {
      instances: {
        TicTacToe: {
          [gameAddress]: gameInstance
        }
      },
      contracts: {
        TicTacToe
      },
      account,
    } = this.props

    const playerMove = await gameInstance.playerMove(x, y, { from: account })
    await this.props.refresh()
  }

  async handleJoinGame() {
    const gameAddress = this.props.match.params.gameAddress
    const {
      instances: {
        TicTacToe: {
          [gameAddress]: gameInstance
        }
      },
      account,
    } = this.props

    await gameInstance.joinAndStartGame({ from: account })
    await this.props.refresh()
  }

  render() {
    const gameAddress = this.props.match.params.gameAddress
    const {
      gameField,
      account,
      currentPlayer,
      opponent,
      challenger,
      turnCount,
      winner,
      instances: {
        TicTacToe: {
          [gameAddress]: gameInstance
        }
      }
    } = this.props

    const myAccount = account.toLowerCase()
    const hasWinner = parseInt(winner, 16) > 0
    const hasFinished = turnCount > 9 || hasWinner
    const isPlaying = myAccount == opponent || myAccount == challenger
    const isMyTurn = currentPlayer === myAccount
    
    return (
      <div>
        <p>This games' address is <code>{gameInstance.address}</code></p>
        <GameStatus
          account={myAccount}
          currentPlayer={currentPlayer}
          turnCount={turnCount}
          winner={winner}
          opponent={opponent}
          challenger={challenger}
          onJoinGame={this.handleJoinGame}
        />
        <GameField
          field={gameField}
          enabled={isMyTurn && !hasFinished}
          onMakeMove={this.handleMakeMove}
        />
      </div>
    )
  }
}

const CONTRACT_SETUP = {
  loadInstances: (props) => {
    return {
      TicTacToe: [props.match.params.gameAddress]
    }
  },
  mapContractInstancesToProps: async (contractName, instance, props) => {
    const gameAddress = props.match.params.gameAddress
    if (contractName === 'TicTacToe' && instance.address === gameAddress) {
      const mapVariables = ['gameField', 'turnCount', 'winner', 'currentPlayer', 'opponent', 'challenger']
      
      const fields = {}
      await Promise.all(mapVariables.map(async (variable) => {
        if (typeof instance[variable] !== 'function') {
          throw new Error(`Could not find ${variable} in Contract ${instance.constructor.name}@${instance.address}`)
        }
        
        try {
          fields[variable] = await instance[variable]()
        } catch (e) {
          fields[variable] = undefined
        }

        return Promise.resolve()
      }))
      const { gameField, ...otherFields } = fields

      const gameFieldArray = [
        [...Array(3).fill(STATES.EMPTY)], 
        [...Array(3).fill(STATES.EMPTY)], 
        [...Array(3).fill(STATES.EMPTY)],
      ]
      
      gameFieldArray.forEach((column, x) => {
        column.forEach((_, y) => {
          const position = (x % 3) + (y * 3)
          const occupation = gameField >> (position * 2) & 3
          
          if (occupation > 0) {
            gameFieldArray[y][x] = occupation === 1 ? STATES.CIRCLE : STATES.CROSS
          }
        })
      })

      return {
        ...otherFields,
        gameField: gameFieldArray,
      }
    }
  },
  onError: (error, props) => {
    console.error(error)
    props.history.push('/')
  }
}

export default WithContract('TicTacToe', CONTRACT_SETUP)(Game)