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

import followMouse from './follow-mouse'
import dollyZoom from './dolly-zoom'
import cycleStates from './cycle-states'
import gyroController from './gyro-controller'


const boxSize = 120

const noop = () => {}

const boxWall = (attrs = {}, size = boxSize) => new Box({
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

  const mouse = new VirtualMouseModule()

  const world = new App([
    new ElementModule({ container }),
    new SceneModule(),
    new CameraModule({
      position: new Vector3(0, 0, 200),
      far: 11000,
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
        mass: 3,
        restitution: 3.2,
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
  new Box({
    geometry: {
      width: boxSize,
      height: boxSize,
      depth: boxSize,
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
    const walls = [
      {
        position: [0, 0, boxSize/2],
      },
      {
        position: [0, 0, -boxSize/2],
      },
      {
        rotation: { x: -Math.PI / 2 },
        position: [0, boxSize/2, 0],
      },
      {
        rotation: { x: -Math.PI / 2 },
        position: [0, -boxSize/2, 0],
      },
      {
        rotation: { y: -Math.PI / 2 },
        position: [boxSize/2, 0, 0],
      },
      {
        rotation: { y: -Math.PI / 2 },
        position: [-boxSize/2, 0, 0],
      },
    ]

    walls.forEach(wall => makeBoxWall(wall))

    box.addTo(world).then(() => {
      box.setLinearFactor(new Vector3(0, 0, 0))
      box.setAngularFactor(new Vector3(0, 0, 0))

      dollyZoom(world, box).then(() => {
        // cycleStates(world, box, mouse, onGravity)

        gyroController(world, box, onRotation)
          .catch(() => followMouse(world, box, mouse, onRotation))
      })

      // new Loop((clock) => {
      //   TWEEN.update(clock.getElapsedTime())
      // }).start(world)


      setTimeout(() => {
        function animate(time) {
          requestAnimationFrame(animate)
          TWEEN.update(time)
        }
        animate()
      }, 100)


      world.start()
    })

  })

  return function destory() {
    console.log('TODO: Destory spatial cube')
  }
}

