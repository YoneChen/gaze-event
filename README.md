# gaze-event

Gaze event listeners for webvr threejs project.

It observe basic gaze actions for mesh targets in your three.js project,such as `gazeEnter`,`gazeLeave` and `gazeTrigger`.

- gazeEnter: Emit in first animation frame when target is gazed;

- gazeLeave: Emit in last animation frame when target is gazed;

- gazeTrigger: Emit in each animation frame when target is gazed;

[See the example.](https://yonechen.github.io/gaze-event/example)

## Installation

First,Make sure you have included the three.js for your project.

1. `yarn add gaze-event` or `npm install --save gaze-event`

1. `import GazeEvent from 'gaze-event'` or `const gazeEvent = require('gaze-event)` in project with module bundler.

Of course,You can also use `<script src="gaze-event/index.js"></script>` without module bundler.

## How to use

```javascript
// init scene, camera, renderer
...
// create crosshair here
// camera.add(createCrosshair());
// create cube
var cube = new THREE.Mesh( geometry, material );
scene.add(cube);

// Step1: init gazeEvent
var gazeEvent = new GazeEvent();

// Step2: add event listener for the cube
gazeEvent.on(cube, 'gazeEnter', function(target) {
    target.material.opacity = 0.5; // emit in first frame when the cube is gazed
});
gazeEvent.on(cube, 'gazeLeave', function(target) {
    target.material.opacity = 1; // emit in last frame when the cube isn't gazed
});
gazeEvent.on(cube, 'gazeTrigger', function(target) {
    target.rotation.y += 0.02; // emite in each frame when the cube is gazed
});

// Step3: update gazeEvent to observe the cube in each animation frame
function animateLoop() { // animate loop for requestAnimationFrame
    ...
    // update gazeEvent
    gazeEvent.update(camera);
    renderer.render(scene, camera);
}
```

## API

### constructor

create a GazeEvent instance.

```javascript
var gazeEvent = new GazeEvent();
```

### on(target,actionType,callback)

add a gaze action listener for a mesh target, `actionType` can be `'gazeEnter'||'gazeLeave'||'gazeTrigger'`

```javascript
gazeEvent.on(target,'gazeEnter')
```

### off(target,actionType)

remove a gaze action listener for a mesh target.

```javascript
gazeEvent.off(mesh,'gazeEnter');
```

### clear()

remove all gaze listeners.

```javascript
gazeEvent.clear();
```

## Need Help

Ask questions [here](https://github.com/yonechen/gaze-event/issues).

## Any Advise

PR welcome [here](https://github.com/yonechen/gaze-event/pulls).

## Contributors

YoneChen <yorkchan94@gmail.com>

## License

MIT

Please Star this Project if you like it! Following would also be appreciated!