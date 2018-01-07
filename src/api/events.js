import { TTT } from 'api'

export const eventWatcher = async (eventName) => {
  if(!eventName) throw new Error('Event does not exist')

  const ttt = await TTT()

  console.log(ttt)

  ttt[eventName]().watch( (err, res) => {
    if(err) throw new Error (err)

    console.log(res)
  })
}
