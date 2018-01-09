import React from 'react'
import { render } from 'react-dom'

import 'assets/scss/style.scss'

import Page from 'components/Page'
import Menu from 'components/Menu'
import Game from 'components/Game'

import { Router, Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'

import TC from 'truffle-contract'
const TTTF = TC(require('../build/contracts/TicTacToeFactory.json'))

const callbackEvent = async () => {
  console.log('Andre is lame!')
  const { BroadCastTTTAddress: bcAdd } = await TTTF.deployed()

  bcAdd().watch((err, resp) => {
    if (err) throw new Error(err)
    console.log(resp)
  })
}

render((
  <HashRouter>
    <Page>
      <Route exact path={'/'} component={Menu} />
      <Route path={'/:gameAddress'} component={Game} />
    </Page>
  </HashRouter>
), document.getElementById("root"), callbackEvent)