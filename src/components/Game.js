import React, { Component } from 'react'
import WithContract from './WithContract'
import cn from 'classnames'

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
  console.log(gameField)
  field.forEach((column, x) => {
    column.forEach((_, y) => {
      const position = (x % 3) + (y * 3)
      const occupation = gameField >> (position * 2) | 3

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
      accounts,
    } = this.props

    const playerMove = await gameInstance.playerMove(x, y, { from: accounts[0]})
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
      accounts,
    } = this.props

    await gameInstance.joinAndStartGame({ from: accounts[0] })
    await this.props.refresh()
  }

  render() {
    const gameAddress = this.props.match.params.gameAddress
    const {
      gameField,
      accounts,
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

    const hasStarted = parseInt(currentPlayer, 16) > 0
    const fieldStates = Object.keys(STATES)
    const myAccount = accounts[0].toLowerCase()
    const isMyTurn = hasStarted && currentPlayer === myAccount
    const isInGame = myAccount === opponent || myAccount === challenger
    const gameIsOpen = !hasStarted

    return (
      <div>
        <p>Your game's address is <code>{gameInstance.address}</code></p>
        {hasStarted ? (
          <p>{isMyTurn ? 'It\'s your turn' : 'It\'s your opponent\'s turn'}</p>
        ) : (
          isInGame ? (
            <p>The game has not started yet. Please wait for an opponent.</p>
          ) : (
            <p>There is no opponent. <button type="button" onClick={this.handleJoinGame}>Join as Opponent</button></p>
          )
        )}
        <div className={cn(styles.game, {
            [styles.gameDisabled]: !isMyTurn
          })}
        >
          {fields.map((row, y) => (
            <div className={styles.gameFieldRow} key={`row_${y}`}>
              {row.map((fieldState, x) => (
                <Field x={x} y={y} disabled={!isMyTurn} onClick={this.handleClickField} state={STATES[fieldStates[fieldState]]} key={`cell_${x}`} />
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
      console.log(instance)
      
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
      console.log("finish fetch")

      return fields
    }
  },
  onError: (error, props) => {
    console.error(error)
    props.history.push('/')
  }
})(Game)