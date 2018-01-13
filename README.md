# Decentralised TicTacToe
## [View on andre-meyer.github.io](https://andre-meyer.github.io/tictactoe-dapp)


[![codecov](https://codecov.io/gh/andre-meyer/tictactoe-dapp/branch/master/graph/badge.svg)](https://codecov.io/gh/andre-meyer/tictactoe-dapp)


Created by [Andre](https://github.com/andre-meyer) and [David](https://github.com/w3stside)

# Features:
- Event Listening `MoveMade`, `GameHasChallenger`, `GameHasOpponent`
- React 16 Frontend
- CSS-Modules

## To Run

Clone this repositry, `npm install`, `npm run migrate`

Requires Metamask, Mist or any other [Web3.js](https://github.com/ethereum/web3.js/) compatible Wallet. Works locally with [TestRPC](https://www.npmjs.com/package/ethereumjs-testrpc) or [Ganache](https://github.com/trufflesuite/ganache-cli).

## To Develop

Install either Ganache(-cli)
`npm i ganache-cli -g`

or the old TestRPC
`npm i ethereum-testrpc -g`

Run in deterministic mode: `ganache-cli -d` or `testrpc -d`

Disable any web3 provider, to fallback to `http://localhost:8545` (default ganache-cli port)