# Decentralised TicTacToe
## [View on andre-meyer.github.io](https://andre-meyer.github.io/tictactoe-dapp)


[![codecov](https://codecov.io/gh/andre-meyer/tictactoe-dapp/branch/master/graph/badge.svg)](https://codecov.io/gh/andre-meyer/tictactoe-dapp)

This is an example TicTacToe Smart-Contract Application, running fully decentralised on Kovan. As part of a [Gnosis](https://gnosis.pm) Company Developer Challenge.


Created by [Andre Meyer](https://github.com/andre-meyer) and [David Sato](https://github.com/w3stside)

# Features:
- Event Listening `MoveMade`, `GameHasChallenger`, `GameHasOpponent`
- React 16 Frontend
- CSS-Modules
- React HoC `WithContract`
- Eventlistener API

## Known Problems
- Sometimes Metamask [forgets about Event Logging (metamask-extension/#2393)](https://github.com/MetaMask/metamask-extension/issues/2393), if this happen the application will stop updating automatically and you need to refresh your browserpage, after every turn (and your opponents turn). To fix this, restart your browser completely.
- Starting a game is very expensive 🙈

## To Play
Play on github.io [andre-meyer.github.io/tictactoe-dapp](https://andre-meyer.github.io/tictactoe-dapp)

## To Run

Clone this repositry, `npm install`, `npm run migrate`

Requires [Metamask](https://metamask.io/), [Mist](https://github.com/ethereum/mist) or any other [Web3.js](https://github.com/ethereum/web3.js/) compatible Wallet. Works locally with [TestRPC](https://www.npmjs.com/package/ethereumjs-testrpc) or [Ganache](https://github.com/trufflesuite/ganache-cli).

## To Develop

Install either Ganache(-cli)
`npm i ganache-cli -g`

or the old TestRPC
`npm i ethereum-testrpc -g`

Run in deterministic mode: `ganache-cli -d` or `testrpc -d`

Disable any web3 provider, to fallback to `http://localhost:8545` (default ganache-cli port)

