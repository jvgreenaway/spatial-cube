import { Vector3 } from '@three'
import { Loop } from '@whs/core/Loop'
import snapLerp from 'snap-lerp'


export default function followMouse(world, box, mouse, onRotation) {

  // const t = 0.1
  // const rotationFactor = 1.5
  // const targetRotation = { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z }
  // 
  // const setRotationGeometry = (...args) => {
  //   // Geometric rotation
  //   targetRotation.x = args[0] * rotationFactor
  //   targetRotation.y = args[1] * rotationFactor
  //   targetRotation.z = args[2] * rotationFactor
    
  //   // Callback
  //   onRotation(args)
  // }
  // 
  // new Loop(() => {
  //   box.rotation.x = snapLerp(box.rotation.x, targetRotation.x, t)
  //   box.rotation.y = snapLerp(box.rotation.y, targetRotation.y, t)
  //   box.rotation.z = snapLerp(box.rotation.z, targetRotation.z, t)
  //   box.__dirtyRotation = true
  // }).start(world)
  // 
  // mouse.on('move', () => {
  //   setRotationGeometry(-mouse.y, mouse.x, 0)
  // })


  const velocityFactor = 4
  const targetVelocity = { x: 0, y: 0, z: 0 }

  const setRotationVelocity = (...args) => {
    // Velocity change
    targetVelocity.x = args[0] * velocityFactor
    targetVelocity.y = args[1] * velocityFactor
    targetVelocity.z = args[2] * velocityFactor
    
    // Callback
    onRotation(args)
  }

  new Loop(() => {
    // TODO: lerp angular velocity change
    box.setAngularVelocity(new Vector3(targetVelocity.x, targetVelocity.y, targetVelocity.z))
  }).start(world)

  mouse.on('move', () => {
    setRotationVelocity(-mouse.y, mouse.x, 0)
  })

  return Promise.resolve()
}
