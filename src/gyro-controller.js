import { Vector3 } from '@three'
import { Loop } from '@whs/core/Loop'
import { GyroNorm } from 'gyronorm';


export default function gyroController(world, box, onRotation) {

  const gn = new GyroNorm();

  const factor = 0.1
  const initial = { x: 0, y: 0, z: 0 }
  const current = { x: 0, y: 0, z: 0 }
  let first = true;


  const init = (...args) => {
    // Velocity change
    initial.x = args[0]
    initial.y = args[1]
    initial.z = args[2]
    
    // Callback
    onRotation(args)
  }

  
  const update = (...args) => {
    // Velocity change
    current.x = args[0]
    current.y = args[1]
    current.z = args[2]
    
    // Callback
    onRotation(args)
  }


  // Update world
  new Loop(() => {
    box.setAngularVelocity(new Vector3(
      -(initial.x - current.x) * factor,
      -(initial.y - current.y) * factor,
      0, // -(initial.z - current.z) * factor,
    ))
  }).start(world)


  return gn.init().then(() => {
    gn.start(({ do: { alpha, beta, gamma } }) => {
      if (first && (alpha || beta || gamma)) {
        first = false
        return init(beta, gamma, alpha)
      }
      return update(beta, gamma, alpha);
    });
  });
}
