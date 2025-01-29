var player;
var pls = [];
var ptime=performance.now();
var global_speed=2;

function initGame() {
  // Initialize your game here, e.g., create a new Box2D world
  world = new b2.b2World(new b2.b2Vec2(0, 20)); // Gravity is 10 m/s² downwards

  document.addEventListener('keydown', function (event) {
    controller._key_down(event);
  });
  document.addEventListener('keyup', function (event) {
    controller._key_up(event);
  });
  world.SetContactListener(new ContactListener());

  player = new Player(640, 500, 30, 30);loadPlatforms("eyJ4IjoyNjUsInkiOjgxOCwidyI6MjQsImgiOjE1NiwiZmlsbENvbG9yIjoiIzNjZDhiNiJ9;eyJ4IjozNDQuNSwieSI6ODExLjUsInciOjQxLCJoIjoxMDMsImZpbGxDb2xvciI6IiMyMjdlM2IifQ==;eyJ4Ijo0MDAsInkiOjgwMCwidyI6ODAwLCJoIjozMCwiZmlsbENvbG9yIjoiIzE5YzAyOSJ9;eyJ4IjoxMzguNSwieSI6NzcyLjUsInciOjEyMSwiaCI6MjMzLCJmaWxsQ29sb3IiOiIjYzExMDVlIn0=;eyJ4IjozNTEsInkiOjg3NCwidyI6NzAyLCJoIjoxMzYsImZpbGxDb2xvciI6IiMxY2FiMDUifQ==");
}



class ContactListener extends b2.JSContactListener {
  BeginContact = function(c) {
    let contact = Box2D.wrapPointer(c, b2.b2Contact);
    let a = entity_manager.Get(contact.GetFixtureA().a);
    let b = entity_manager.Get(contact.GetFixtureB().a);
    if (!(a instanceof SensorBox || b instanceof SensorBox)) { return; }
    if (a instanceof SensorInfo && b.constructor.name != "SensorInfo") {
      a.parent._CollisionEnter(a.side, b);
    } else if (b instanceof SensorInfo && a.constructor.name != "SensorInfo") {
      b.parent._CollisionEnter(b.side, a);
    }
  }

  EndContact = function(c) {
    let contact = Box2D.wrapPointer(c, b2.b2Contact);
    let a = entity_manager.Get(contact.GetFixtureA().a);
    let b = entity_manager.Get(contact.GetFixtureB().a);
    if (!(a instanceof SensorBox || b instanceof SensorBox)) { return; }
    if (a instanceof SensorInfo && b.constructor.name != "SensorInfo") {
      a.parent._CollisionLeave(a.side, b);
    } else if (b instanceof SensorInfo && a.constructor.name != "SensorInfo") {
      b.parent._CollisionEnter(b.side, a);
    }
  }

  PreSolve = function(c,d) {}
  PostSolve = function(c,d) {}
}

let isDrawingPlatform = false;
let startDrawX, startDrawY;
let new_pl = null;

document.addEventListener('mousedown', function (event) {
  if (event.button != 0) return;
  isDrawingPlatform = true;
  startDrawX = event.clientX;
  startDrawY = event.clientY;
});

document.addEventListener('mousemove', function (event) {
  if (!isDrawingPlatform) return;
  let endDrawX = event.clientX;
  let endDrawY = event.clientY;

  // Remove the previous platform
  if (new_pl != null) {
    new_pl.destroy();
    entity_manager._cleanup_now();
  }

  // Create a new platform
  let width = Math.abs(endDrawX - startDrawX);
  let height = Math.abs(endDrawY - startDrawY);
  let x = Math.min(startDrawX, endDrawX) + width / 2;
  let y = Math.min(startDrawY, endDrawY) + height / 2;
  new_pl = new Platform(x, y, width, height);
});

document.addEventListener('mouseup', function (event) {
  isDrawingPlatform = false;
  new_pl = null;
});

document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  for (let i = pls.length - 1; i >= 0; i--) {
    let platform = pls[i];
    if (platform.containsMouse(mouseX, mouseY)) {
      platform.destroy();
      break;
    }
  }
});

document.addEventListener('wheel', function (event) {
  event.preventDefault();
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  for (let i = pls.length - 1; i >= 0; i--) {
    let platform = pls[i];
    if (platform.containsMouse(mouseX, mouseY)) {
      if (event.deltaY < 0) { // scroll up
        if (i > 0) {
          // swap with the previous platform
          let temp = pls[i - 1];
          pls[i - 1] = platform;
          pls[i] = temp;
        }
      } else if (event.deltaY > 0) { // scroll down
        if (i < pls.length - 1) {
          // swap with the next platform
          let temp = pls[i + 1];
          pls[i + 1] = platform;
          pls[i] = temp;
        }
      }
      break;
    }
  }
});

document.addEventListener('auxclick', function (event) { // middle click
  event.preventDefault();
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  for (let i = pls.length - 1; i >= 0; i--) {
    let platform = pls[i];
    if (platform.containsMouse(mouseX, mouseY)) {
      let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      platform.fillColor = randomColor; // set a new fill color for the platform
      break;
    }
  }
});


function updateGame() { 
  // Update game logic here, e.g., step the physics world
  let now = performance.now();
  let dt = global_speed * (now - ptime) / 1000;

  player._update(dt);
  entity_manager._update(dt);
  controller._update(dt);
  ptime = now

  if (controller.jump()) {
    player.jump();
  }
  if (controller.left()) {
    player.moveLeft();
  }
  if (controller.right()) {
    player.moveRight();
  }
  world.Step(dt, 8, 3);

  // Clear canvas and redraw all objects
  const context = document.getElementById('myCanvas').getContext('2d');
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  // Draw your game objects here
  player.draw(context);
  for (const pl of pls) {
    pl.draw(context);
  }

  // Debuging info
  drawDebug(context);
}

function drawDebug(ctx) {
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`Velocity: (${player.body.GetLinearVelocity().get_x().toFixed(2)}, ${player.body.GetLinearVelocity().get_y().toFixed(2)})`, 10, 30);
  ctx.fillText(`Entities: ${entity_manager.size()}`, 10, 50);
  ctx.fillText(`MovementState: ${player.movementState.constructor.name}`, 10, 70);
  // const debugLines = player.debuginfo().split('\n');
  // let y = 90;
  // for (let line of debugLines) {
  //   ctx.fillText(line.trim(), 10, y);
  //   y += 20; // Space each line 20 pixels apart
  // }
  // const velocityHistory = player.velocityHistory;
  // if (velocityHistory.length > 0) {
  //   const graphHeight = 100;
  //   ctx.beginPath();
  //   ctx.moveTo(10, window.innerHeight - 200 - (velocityHistory[0] / 10) * graphHeight);
  //   for (let i = 0; i < velocityHistory.length; i++) {
  //     const x = 10 + i * 2;
  //     const y = window.innerHeight - 200 - (velocityHistory[i] / 10) * graphHeight;
  //     ctx.lineTo(x, y);
  //   }
  //   ctx.strokeStyle = 'red';
  //   ctx.stroke();
  // }
}

function savePlatforms() {
  return pls.map(pl => pl.serialize()).join(";");
}

function loadPlatforms(str) {
  // Destroy all platforms in pl
  for (let i = pls.length - 1; i >= 0; i--) {
    pls[i].destroy();
  }
  entity_manager._cleanup_now();

  // Deserialize the ones created by savePlatforms
  let platformStrings = str.split(";");
  for (let i = 0; i < platformStrings.length; i++) {
    Platform.deserialize(platformStrings[i]);
  }

}

function animate() {
  updateGame();
  requestAnimationFrame(animate);
}

// Initialize the game when the canvas is resized
resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

resizeCanvas();

window.addEventListener('resize', resizeCanvas);


initGame();


// Start the animation loop
animate();