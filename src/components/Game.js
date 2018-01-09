import React, { Component } from 'react'
import WithContract from './WithContract'
import cn from 'classnames'

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
    console.log(x, y)
    console.log(gameInstance)

    console.time()
    const playerMove = await gameInstance.playerMove(x, y, { from: accounts[0]})
    console.timeEnd()
    console.log(playerMove)
/*    const c = await TicTacToe.at(gameAddress)*/

    const field = Array(9).fill(0)
    const fieldsResolvingPromises = Promise.all(field.map(async (_, index) => await gameInstance.field(index)))
    const fields = await fieldsResolvingPromises
    
    console.log(fields.map(f => f.toString()))
    
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
      fields,
      accounts,
      currentTurn,
      opponent,
      challenger,
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

      fieldArray[y][x] = field
    })

    const hasStarted = parseInt(currentTurn, 16) > 0
    const fieldStates = Object.keys(STATES)
    const myAccount = accounts[0].toLowerCase()
    const isMyTurn = hasStarted && currentTurn === myAccount
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
          {fieldArray.map((row, y) => (
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
      const field = Array(9).fill(0)

      const mapVariables = ['currentTurn', 'opponent', 'challenger']
      console.log(mapVariables)
      const callVars = {}
      await Promise.all(mapVariables.map(async (variable) => {
        console.log(variable, await instance[variable]())
        callVars[variable] = await instance[variable]()
      }))
      console.log("hallo?")
      console.log("getting variables from", instance, instance.address)
      const fieldsResolvingPromises = Promise.all(field.map(async (_, index) => await instance.field(index)))
      const fields = await fieldsResolvingPromises
      return {
        fields: fields.map(field => field.toString()),
        ...callVars
      }
    }
  },
  onError: (error, props) => {
    console.error(error)
    props.history.push('/')
  }
})(Game)