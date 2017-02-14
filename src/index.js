import {
  VirtualMouseModule,
  ElementModule,
  SceneModule,
  CameraModule,
  RenderingModule,
  ResizeModule,
} from '@whs:app'

import { OrbitModule } from '@whs:controls/orbit'

import { App } from '@whs/core/App'
import { Loop } from '@whs/core/Loop'

import { AmbientLight } from '@whs+lights/AmbientLight'
import { PointLight } from '@whs+lights/PointLight'

import { Box } from '@whs+meshes/Box'
import { Icosahedron } from '@whs+meshes/Icosahedron'

import {
  Vector3,
  PCFSoftShadowMap,
  MeshNormalMaterial,
  FlatShading,
} from '@three'

import {
  WorldModule,
  BoxModule,
  CompoundModule,
  ConvexModule,
} from 'physics-module-ammonext'

import TWEEN from 'tween.js'
import snapLerp from 'snap-lerp'


const noop = () => {}

const boxWall = (attrs = {}, size = 100) => new Box({
  ...attrs,

  geometry: {
    width: size,
    height: size,
    depth: 0,
  },

  shadow: {
    cast: false,
    receive: false,
  },

  modules: [
    new BoxModule({
      mass: 100,
    })
  ],

  material: boxMaterial,
})


const ballMaterial = new MeshNormalMaterial({
  shading: FlatShading,
})

const boxMaterial = new MeshNormalMaterial({
  shading: FlatShading,
  transparent: true,
  opacity: 0.5,
})


export default function init(
  container, 
  { ammoPath, onGravity = noop, onRotation = noop }
) {

  function setGravity(...args) {
    world.setGravity(new Vector3(...args))
    onGravity(args)
  }

  const mouse = new VirtualMouseModule()

  const world = new App([
    new ElementModule({ container }),
    new SceneModule(),
    new CameraModule({
      position: new Vector3(0, 0, 200),
    }),
    new RenderingModule({
      bgColor: 0xFFFFFF,
      bgOpacity: 0,
      renderer: {
        alpha: true,
        antialias: true,
        shadowmap: {
          type: PCFSoftShadowMap,
        },
      },
    }),
    new WorldModule({
      ammo: ammoPath,
      gravity: new Vector3(0, -100, 0),
      // softbody: true,
    }),
    new ResizeModule(),
    // new OrbitModule(),
    mouse,
  ])

  // Ball
  new Icosahedron({
    geometry: {
      radius: 30,
      detail: 2,
    },

    modules: [
      new ConvexModule({
        mass: 1,
        restitution: 3.5,
        friction: 0,
      }),
    ],

    material: ballMaterial,

    position: [0, 20, 0],
  }).addTo(world)

  // Light
  new PointLight({
    light: {
      intensity: 1,
      distance: 1000,
    },

    shadow: {
      fov: 500,
    },

    position: [10, 10, 100],
  })
  .addTo(world)

  // Light
  new AmbientLight({
    light: {
      intensity: 0.5,
    },
  }).addTo(world)


  // Create wireframe box
  const box = new Box({
    geometry: {
      width: 100,
      height: 100,
      depth: 100,
    },

    shadow: {
      cast: false,
      receive: false,
    },

    modules: [
      new CompoundModule({
        mass: 100,
      }),
    ],

    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  }).defer((box) => {

    const makeBoxWall = (...params) => boxWall(...params).addTo(box)

    makeBoxWall({
      position: [0, 0, 50],
    })

    makeBoxWall({
      position: [0, 0, -50],
    })

    makeBoxWall({
      rotation: {x: -Math.PI / 2},
      position: [0, 50, 0],
    })

    makeBoxWall({
      rotation: {x: -Math.PI / 2},
      position: [0, -50, 0],
    })

    makeBoxWall({
      rotation: {y: -Math.PI / 2},
      position: [50, 0, 0],
    })

    makeBoxWall({
      rotation: {y: -Math.PI / 2},
      position: [-50, 0, 0],
    })

    box.addTo(world).then(() => {
      mouse.track(box)

      box.setLinearFactor(new Vector3(0, 0, 0))
      box.setAngularFactor(new Vector3(0, 0, 0))

      const states = []

      states.push(() => {
        setGravity(0, -200, 0) // down
      })

      states.push(() => {
        setGravity(-200, 0, 0) // left
      })

      states.push(() => {
        setGravity(0, 200, 0) // up
      })

      states.push(() => {
        setGravity(200, 0, 0) // right
      })

      let currentState = 0
      states[currentState]()

      const cycleStates = () => {
        currentState++
        if (currentState >= states.length) currentState = 0
        states[currentState]()
      }

      // Click box to change state
      box.on('click', cycleStates)

      const t = 0.1
      const min = 0.0001

      const rotationFactor = 1.5
      const targetRotation = { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z }

      const setRotationGeometry = (...args) => {
        // Geometric rotation
        targetRotation.x = args[0] * rotationFactor
        targetRotation.y = args[1] * rotationFactor
        targetRotation.z = args[2] * rotationFactor
        
        // Callback
        onRotation(args)
      }


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

      // Move box with mouse
      mouse.on('move', () => {
        // setRotationGeometry(-mouse.y, mouse.x, 0)
        setRotationVelocity(-mouse.y, mouse.x, 0)
      })

      // Update cube rotation geometry
      // new Loop(() => {
      //   box.rotation.x = snapLerp(box.rotation.x, targetRotation.x, t)
      //   box.rotation.y = snapLerp(box.rotation.y, targetRotation.y, t)
      //   box.rotation.z = snapLerp(box.rotation.z, targetRotation.z, t)
      //   box.__dirtyRotation = true
      // }).start(world)

      // Update cube roation velocity
      new Loop(() => {
        box.setAngularVelocity(new Vector3(targetVelocity.x, targetVelocity.y, targetVelocity.z))
      }).start(world)


      // new Loop((clock) => {
      //   TWEEN.update(clock.getElapsedTime())
      // }).start(world)
      
      // setTimeout(() => {
      //   function animate(time) {
      //     requestAnimationFrame(animate)
      //     TWEEN.update(time)
      //   }
      //   animate()
      //   tweenCube.start()
      // }, 1000)

      world.start()
    })
  })

  return function destory() {
    console.log('TODO: Destory spatial cube')
  }
}

