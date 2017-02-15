import { Loop } from '@whs/core/Loop'
import { Vector3 } from '@three'

import TWEEN from 'tween.js'
import snapLerp from 'snap-lerp'

function degreesToRadians(degrees) {
  return degrees * Math.PI /180
}
function radiansToDegrees(radians) {
  return radians * 180 / Math.PI
}

function findVFOV(height, depth) {
  var angleRadians = 2 * Math.atan(height / (2*depth) )
  var angleDegrees = radiansToDegrees(angleRadians)
  return angleDegrees
}

function findHeight(distance, vFOV) {
  return 2 * distance * Math.tan(degreesToRadians(vFOV)/2)
}


function dollyZoom(camera, focalPoint, screenHeight, destination, duration) {
  const currentDistance = camera.position.distanceTo(focalPoint)
  const newDistance = destination.distanceTo(focalPoint)
  const easing = TWEEN.Easing.Circular.InOut

  const newX = destination.x
  const newy = destination.y
  const newZ = destination.z

  const tweenIncrementors = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  }

  const tween = new TWEEN.Tween(tweenIncrementors)
    .to({
      x: newX,
      y: newy,
      z: newZ
    }, duration)
    .easing(easing)
    .onUpdate(() => {
      camera.position.set(tweenIncrementors.x, tweenIncrementors.y, tweenIncrementors.z)
      camera.lookAt(focalPoint)

      const newVFOV = findVFOV(screenHeight, camera.position.distanceTo(focalPoint))

      camera.fov = newVFOV
      camera.updateProjectionMatrix()
    })
  
  return tween
}

export default function addDollyZoom(world, box) {
  return new Promise((resolve) => {
    const camera = world.$camera._native
    const focalPoint = box.position
    const screenHeight = findHeight(camera.position.distanceTo(focalPoint), camera.fov)

    const dollyOut = dollyZoom(
      camera,
      focalPoint,
      screenHeight,
      new Vector3(0, 0, 10000),
      2000,
    )

    const startTween = new Loop((clock) => {
      startTween.stop(world)
      dollyOut.repeat(Infinity).yoyo(true).start()
      resolve()
    })

    startTween.start(world)
  })
}