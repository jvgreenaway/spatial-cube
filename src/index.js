import {
  VirtualMouseModule,
  ElementModule,
  SceneModule,
  CameraModule,
  RenderingModule,
  ResizeModule,
} from '@whs:app';

import { OrbitModule } from '@whs:controls/orbit';

import { App } from '@whs/core/App';

import { AmbientLight } from '@whs+lights/AmbientLight';
import { PointLight } from '@whs+lights/PointLight';

import { Box } from '@whs+meshes/Box';
import { Icosahedron } from '@whs+meshes/Icosahedron';

import {
  Vector3,
  PCFSoftShadowMap,
  MeshNormalMaterial,
  FlatShading,
  banana,
} from '@three';

import {
  WorldModule,
  BoxModule,
  CompoundModule,
  ConvexModule,
} from 'physics-module-ammonext';


export default function init(container, { ammoPath, onGravity = () => {} }) {
  const setGravity = (...args) => {
    world.setGravity(new Vector3(...args));
    onGravity(args);
  }


  const ballMaterial = new MeshNormalMaterial({
    shading: FlatShading,
  });

  const boxMaterial = new MeshNormalMaterial({
    shading: FlatShading,
    transparent: true,
    opacity: 0.5,
  });


  const mouse = new VirtualMouseModule();

  const world = new App([
    new ElementModule({ container }),
    new SceneModule(),
    new CameraModule({
      position: new Vector3(0, 0, 200)
    }),
    new RenderingModule({
      bgColor: 0xFFFFFF,
      bgOpacity: 0,
      renderer: {
        alpha: true,
        antialias: true,
        shadowmap: {
          type: PCFSoftShadowMap
        }
      }
    }),
    new WorldModule({
      ammo: ammoPath,
      gravity: new Vector3(0, -100, 0),
      // softbody: true,
    }),
    new ResizeModule(),
    // new OrbitModule(),
    mouse
  ]);


  // Create all sides of the box
  function boxWall(attrs = {}, size = 100) {
    return new Box({
      ...attrs,

      geometry: {
        width: size,
        height: size,
        depth: 0
      },

      shadow: {
        cast: false,
        receive: false
      },

      modules: [
        new BoxModule({
          mass: 100,
        })
      ],

      material: boxMaterial,
    });
  }

  // Create wireframe box
  const box = new Box({
    geometry: {
      width: 100,
      height: 100,
      depth: 100
    },

    shadow: {
      cast: false,
      receive: false,
    },

    modules: [
      new CompoundModule({
        mass: 100
      })
    ],

    position: [0, 0, 0],
    rotation: [0, Math.PI, 0]
  }).defer(box => {

    const makeBoxWall = (...params) => boxWall(...params).addTo(box);

    makeBoxWall({
      position: [0, 0, 50]
    });

    makeBoxWall({
      position: [0, 0, -50]
    });

    makeBoxWall({
      rotation: {x: -Math.PI / 2},
      position: [0, 50, 0]
    });

    makeBoxWall({
      rotation: {x: -Math.PI / 2},
      position: [0, -50, 0]
    });

    makeBoxWall({
      rotation: {y: -Math.PI / 2},
      position: [50, 0, 0]
    });

    makeBoxWall({
      rotation: {y: -Math.PI / 2},
      position: [-50, 0, 0]
    });

    box.addTo(world).then(() => {
      mouse.track(box);

      box.setLinearFactor(new Vector3(0, 0, 0));
      box.setAngularFactor(new Vector3(0, 0, 0));

      const states = [];

      states.push(() => {
        // down
        setGravity(0, -200, 0);
      })

      states.push(() => {
        // left
        setGravity(-200, 0, 0);
      })

      states.push(() => {
        // up
        setGravity(0, 200, 0);
      })

      states.push(() => {
        // right
        setGravity(200, 0, 0);
      })

      let currentState = 0;
      states[currentState]();

      const cycleStates = () => {
        currentState++;
        if (currentState >= states.length) currentState = 0;
        states[currentState]();
      }

      // Click box to change state
      box.on('click', cycleStates)

      // Move box with mouse
      mouse.on('move', () => {
        box.rotation.x = -mouse.y
        box.rotation.y = mouse.x
        box.__dirtyRotation = true;
      });
    });
  });


  // Create a ball
  new Icosahedron({
    geometry: {
      radius: 30,
      detail: 2
    },

    modules: [
      new ConvexModule({
        mass: 10,
        restitution: 3,
        friction: 1
      }),
    ],

    material: ballMaterial,

    position: [0, 30, 0]
  }).defer(ball => {
    ball.addTo(world);
  });

  new PointLight({
    light: {
      intensity: 1,
      distance: 1000
    },

    shadow: {
      fov: 500
    },

    position: [10, 10, 100]
  })
  .addTo(world);

  new AmbientLight({
    light: {
      intensity: 0.5
    }
  }).addTo(world);

  world.start();

  return function destory() {
    console.log('TODO: Destory spatial cube');
  }
}

