import { 
  app,
  controls,
  
  App,
  Box,
  Icosahedron,
  PointLight,
  AmbientLight,
} from 'whs';

import 'three'

import {
  WorldModule,
  BoxModule,
  CompoundModule,
  ConvexModule,
} from 'physics-module-ammonext';

const mouse = new app.VirtualMouseModule();

const world = new App([
  new app.ElementModule(),
  new app.SceneModule(),
  new app.CameraModule({
    position: new THREE.Vector3(0, 0, 200)
  }),
  new app.RenderingModule({
    bgColor: 0xFFFFFF,
    bgOpacity: 0,
    renderer: {
      alpha: true,
      antialias: true,
      shadowmap: {
        type: THREE.PCFSoftShadowMap
      }
    }
  }),
  new WorldModule({
    ammo: process.ammoPath,
    gravity: new THREE.Vector3(0, -200, 0),
    softbody: true,
  }),
  new controls.OrbitModule(),
  new app.ResizeModule(),
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

    material: new THREE.MeshNormalMaterial({
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 0.5
    }),
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

    box.setLinearFactor(new THREE.Vector3(0, 0, 0));
    box.setAngularFactor(new THREE.Vector3(0, 0, 0));

    const states = [];

    states.push(() => {
      // down
      world.setGravity(new THREE.Vector3(0, -200, 0));
    })

    states.push(() => {
      // left
      world.setGravity(new THREE.Vector3(-200, 0, 0));
    })

    states.push(() => {
      // up
      world.setGravity(new THREE.Vector3(0, 200, 0));
    })

    states.push(() => {
      // right
      world.setGravity(new THREE.Vector3(200, 0, 0));
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
    // new PHYSICS.SoftbodyModule({
    //   mass: 10000,
    //   margin: 1,
    // }),
    // new PHYSICS.SphereModule({
    //   mass: 10,
    //   restitution: 2,
    //   friction: 2,
    //   // scale: new THREE.Vector3(2, 10, 1)
    // }),
  ],

  material: new THREE.MeshNormalMaterial({
    shading: THREE.FlatShading
  }),

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
