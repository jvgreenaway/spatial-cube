import { Vector3 } from '@three'


export default function cycleStates(world, target, mouse, onGravity) {

  const setGravity = (...args) => {
    world.setGravity(new Vector3(...args))
    onGravity(args)
  }

  const states = [
    () => {
      setGravity(0, -200, 0) // down
    },
    () => {
      setGravity(-200, 0, 0) // left
    },
    () => {
      setGravity(0, 200, 0) // up
    },
    () => {
      setGravity(200, 0, 0) // right
    },
  ]

  let currentState = 0
  states[currentState]()

  const cycleStates = () => {
    currentState++
    if (currentState >= states.length) currentState = 0
    states[currentState]()
  }


  mouse.track(target)
  target.on('click', cycleStates)
}