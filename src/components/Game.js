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

const convertGameFieldToArray = (gameField) => {
  const field = [
    [...Array(3).fill(STATES.EMPTY)], 
    [...Array(3).fill(STATES.EMPTY)], 
    [...Array(3).fill(STATES.EMPTY)],
  ]
  
  field.forEach((column, x) => {
    column.forEach((_, y) => {
      const position = (x % 3) + (y * 3)
      const occupation = gameField >> (position * 2) & 3
      
      if (occupation > 0) {
        field[y][x] = occupation === 1 ? STATES.CIRCLE : STATES.CROSS
      }
    })
  })

  return field
}

const Field = ({ state = STATES.EMPTY, onClick, disabled, x, y }) => {
  return (
    <button disabled={disabled} className={cn(styles.gameField, styles[`gameField--${state}`])} onClick={() => !disabled && onClick(x, y)} />
  )
}

class Game extends Component {
  constructor(props) {
    super(props)
    this.handleClickField = this.handleClickField.bind(this)
    this.handleJoinGame = this.handleJoinGame.bind(this)
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
    this.moveMadeListener.addListener((err, result) => {
      this.props.refresh()
    })

    this.opponentJoinedListener = startListener(gameInstance, 'GameHasOpponent')
    this.opponentJoinedListener.addListener((err, result) => {
      this.props.refresh()
    })
  }

  componentWillUnmount() {
    this.moveMadeListener.stop()
    this.opponentJoinedListener.stop()
  }

  async handleClickField(x, y) {
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

    const fields = convertGameFieldToArray(gameField)

    const myAccount = account.toLowerCase()
    
    const isInGame = myAccount === opponent || myAccount === challenger
    const isWinner = myAccount === winner
    
    const hasWinner = parseInt(winner, 16) > 0
    const hasFinished = turnCount > 9 || hasWinner
    const hasStarted = !hasFinished && parseInt(currentPlayer, 16) > 0
    const hasOpponent = parseInt(opponent, 16) > 0

    const isMyTurn = hasStarted && currentPlayer === myAccount
    const isOpponentsTurn = currentPlayer === opponent
    
    return (
      <div>
        <p>You are <code>{myAccount}</code></p>
        <p>Your game's address is <code>{gameInstance.address}</code></p>
        {hasStarted && (
          isInGame ? (
            <p>It's {isMyTurn ? 'your' : 'your opponent\'s'} turn</p>
          ) : (
            <p>It's {isOpponentsTurn ? 'the opponent\'s' : 'the challenger\'s'} turn</p>
          )
        )}
        {!hasStarted && !hasFinished && !hasOpponent && (
          isInGame ? (
            <p>The game has not started yet. Please wait for an opponent.</p>
          ) : (
            <p>There is no opponent. <button type="button" onClick={this.handleJoinGame}>Join as Opponent</button></p>
          )
        )}
        {hasFinished && (
          isInGame ? (
            <p>{isWinner ? 'Congratulations! You won!' : 'Sorry, you lost! :('}</p>
          ) : (
            <p>{winner} won!</p>
          )
        )}
        <div className={cn(styles.game, {
            [styles.gameDisabled]: !isMyTurn || hasFinished
          })}
        >
          {fields.map((row, y) => (
            <div className={styles.gameFieldRow} key={`row_${y}`}>
              {row.map((fieldState, x) => (
                <Field x={x} y={y} disabled={!isMyTurn} onClick={this.handleClickField} state={fieldState} key={`cell_${x}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default WithContract('TicTacToe', {
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

      return fields
    }
  },
  onError: (error, props) => {
    console.error(error)
    props.history.push('/')
  }
})(Game)