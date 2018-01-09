import React from 'react'
import { render } from 'react-dom'

import 'assets/scss/style.scss'

import Page from 'components/Page'
import Menu from 'components/Menu'
import Game from 'components/Game'
import InjectEvents from'components/InjectEventListener'

import { Router, Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'

render((
  <InjectEvents>
    <HashRouter>
      <Page>
        <Route exact path={'/'} component={Menu} />
        <Route path={'/:gameAddress'} component={Game} />
      </Page>
    </HashRouter>
  </InjectEvents>
), document.getElementById("root"))