import React, { Component } from 'react'
import cn from 'classnames'

import { eventWatcher, TTT } from 'api'

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

const Game = () =>
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

export default Game