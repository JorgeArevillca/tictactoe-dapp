import React, { Component } from 'react'
import WithContract from './WithContract'
import cn from 'classnames'

import styles from './Game.scss'

const STATES = {
  EMPTY: 'empty',
  CIRCLE: 'circle',
  CROSS: 'cross',
}

const Field = ({ state = STATES.EMPTY }) => {
  return (
    <div className={cn(styles.gameField, styles[`gameField--${state}`])} />
  )
}

class Game extends Component {
  constructor(props) {
    super(props)
    this.handleClickField = this.handleClickField.bind(this)
  }

  handleClickField() {

  }

  render() {
    const gameAddress = this.props.match.params.gameAddress
    const {
      fields,
      accounts,
      currentTurn,
      hasStarted,
      instances: {
        TicTacToe: {
          [gameAddress]: gameInstance
        }
      }
    } = this.props

    const fieldArray = [[], [], []]
    fields.forEach((field, index) => {
      const x = index % 3
      const y = Math.floor(index / 3)

      fieldArray[x][y] = field
    })

    const fieldStates = Object.keys(STATES)
    const isMyTurn = hasStarted && currentTurn === accounts[0]

    return (
      <div>
        <p>Your game's address is <code>{gameInstance.address}</code></p>
        {hasStarted ? (
          <p>{isMyTurn ? 'It\'s your turn' : `'It's your opponent's turn: ${currentTurn}`}</p>
        ) : (
          <p>The game has not started yet. Please wait for an opponent.</p>
        )}
        <div className={styles.game}>
          {fieldArray.map((row, y) => (
            <div className={cn(styles.gameFieldRow, {
              [styles.gameFieldRowDisabled]: !isMyTurn
            })} key={`row_${y}`}>
              {row.map((fieldState, x) => (
                <Field x={x} y={y} onClick={this.handleClickField} state={STATES[fieldStates[fieldState]]} key={`cell_${x}`} />
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
      const field = Array(9).fill(0)

      const currentTurn = await instance.currentTurn()
      const hasStarted = await instance.hasStarted()

      const fieldsResolvingPromises = Promise.all(field.map(async (_, index) => await instance.field.call(index)))
      const fields = await fieldsResolvingPromises
      return {
        fields: fields.map(field => field.toString()),
        currentTurn,
        hasStarted,
      }
    }
  },
  onError: (error, props) => {
    //console.error(error)
    props.history.push('/')
  }
})(Game)