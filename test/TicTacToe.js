const TTT = artifacts.require('TicTacToe')
const TTTF = artifacts.require('TicTacToeFactory')

const eventWatcher = (contract, event, args) => contract[event](args).watch((err, result) => err ? console.log(err) : console.log(result))

let tf
let tt

contract('DutchExchange', (accounts) => {
  const [master, seller1, seller2, buyer1] = accounts

  beforeEach(async () => {
    console.log(`
      ==> Running beforeEach HOOK...
    `)

    tf = await TTTF.deployed()
    tt = await TTT.deployed()
  })

  it('Creates new TicTacToe Contract', async () => {
    console.log(` 
      ==> TTTFactory Address = ${await tf.address}
    `)
    console.log(` 
      ==> Listening to TicTacToeFactory BroadCastTTTAddress ... 
    `)
    eventWatcher(tf, 'BroadCastTTTAddress', {})    

    const { receipt: { logs } } = await tf.newGame()

    console.log(`
      ==> New TTT Game Logs <==
=====================================
${JSON.stringify(logs, undefined, 2)}
=====================================
    `)
  })
})