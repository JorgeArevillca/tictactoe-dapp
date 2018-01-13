const TTT = artifacts.require('TicTacToe')
const TTTF = artifacts.require('TicTacToeFactory')

const waitForEvent = (contract, event, args = {}) => new Promise((resolve, reject) => {
  const timeoutTimer = setTimeout(() => {
    clearTimeout(timeoutTimer)
    reject(new Error('Timeout'))
  }, 1000)
  const watcher = contract[event](args)
  watcher.watch((err, res) => {
    clearTimeout(timeoutTimer)
    watcher.stopWatching()
    
    if (err) {
      reject(err)
    } else {
      resolve(res)
    }
  })
})

let tf
let theGame

contract('TicTacToeFactory', (accounts) => {
  it('Created TicTacToeFactory Contract', async () => {
    tf = await TTTF.deployed()
    console.log(` 
      ==> TTTFactory Address = ${await tf.address}
    `)
    assert.isDefined(tf)
  })

})

contract('TicTacToe', (accounts) => {
  const [challenger, opponent] = accounts

  it('Creates a new Game via the Factory', async () => {
    await tf.newGame({ from: challenger })
    const { args: { TTTGame } } = await waitForEvent(tf, 'BroadCastTTTAddress')

    console.log(`
      ==> Created a new Game = ${TTTGame}
    `)
    theGame = await TTT.at(TTTGame)
    assert.isDefined(theGame)
  })

  it('Joins the game', async () => {
    await theGame.joinAndStartGame({ from: opponent })
    let logs = await waitForEvent(theGame, 'GameHasOpponent')

    try {
      logs = await waitForEvent(theGame, 'GameHasOpponent')
    } catch (err) {
      console.log(err)
      assert.fail('Couldn\'t get Event')
    }

    assert.isOk(logs, 'Received GameStarted Event')

    assert.equal(await theGame.opponent(), opponent)
  })

  it('Starts the game with the opponent as first turn', async () => {
    const currentPlayer = await theGame.currentPlayer()
    assert.equal(currentPlayer, opponent)
  })

  it('Can do a move at position 0, 1', async () => {
    const txReceipt = await theGame.playerMove(0, 1, {from: opponent})
    console.log(`
      GameField:
      |   |   |   |
      - - - - - - -
      | X |   |   |
      - - - - - - -
      |   |   |   |
    `)
    const log = await waitForEvent(theGame, 'MoveMade')
    assert.isDefined(txReceipt)
  })

  it('Changed the current player', async () => {
    const currentPlayer = await theGame.currentPlayer()
    assert.equal(currentPlayer, challenger, `${currentPlayer} is the current player`)
  })

  it('Can do another move at position 1, 1', async () => {
    const txReceipt = await theGame.playerMove(1, 1, {from: challenger})
    console.log(`
      GameField:
      |   |   |   |
      - - - - - - -
      | X | O |   |
      - - - - - - -
      |   |   |   |
    `)
    assert.isDefined(txReceipt)
  })

  it('Can\'t occupy a field twice', async () => {
    theGame.playerMove(1, 1, { from: opponent })
      .then(() => {
        assert.ok(false, 'Did not throw an error')
      })
      .catch((err) => {
        assert.ok(true, 'Move was rejected')
      })
  })

  it('Doesn\'t change the activePlayer if the move failed', async () => {
    const currentPlayer = await theGame.currentPlayer()

    assert.equal(currentPlayer, opponent, `${currentPlayer} is the active player`)
  })

  it('Can reach a winning condition', async () => {
    await theGame.playerMove(0, 0, {from: opponent})
    console.log(`
      GameField:
      | X |   |   |
      - - - - - - -
      | X | O |   |
      - - - - - - -
      |   |   |   |
    `)
    await waitForEvent(theGame, 'MoveMade')

    await theGame.playerMove(2, 1, {from: challenger})
    console.log(`
      GameField:
      | X |   |   |
      - - - - - - -
      | X | O | O |
      - - - - - - -
      |   |   |   |
    `)
    await waitForEvent(theGame, 'MoveMade')

    await theGame.playerMove(0, 2, {from: opponent})
    console.log(`
      GameField:
      | X |   |   |
      - - - - - - -
      | X | O |   |
      - - - - - - -
      | X |   |   |
    `)
    await waitForEvent(theGame, 'MoveMade')

    const winner = await theGame.winner()
    assert.equal(winner, opponent, `${winner} won the game`)
  })
})