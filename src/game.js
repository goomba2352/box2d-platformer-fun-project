var player;
var pls = [];

function initGame() {
  // Initialize your game here, e.g., create a new Box2D world
  world = new b2.b2World(new b2.b2Vec2(0, 10)); // Gravity is 10 m/s² downwards

  var controller = this.controller; // Capture the controller variable
  document.addEventListener('keydown', function (event) {
    controller._key_down(event);
  });
  document.addEventListener('keyup', function (event) {
    controller._key_up(event);
  });
  let callback = new CollisionDebug();
  world.SetContactFilter(callback);

  player = new Player(640, 500, 30, 30);
  new Platform(400, 800, 800, 30);
}

class CollisionDebug extends b2.JSContactFilter {
  ShouldCollide = function (id_a, id_b) {
    let a = entity_manager.Get(id_a);
    let b = entity_manager.Get(id_b);
    console.log(a);
    console.log(b);
    return true;
  }
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

  for (let i = 0; i < pls.length; i++) {
    let platform = pls[i];
    if (platform.containsMouse(mouseX, mouseY)) {
      platform.destroy();
      break;
    }
  }
});



function updateGame() {
  if (controller.jump()) {
    player.jump();
  }
  if (controller.left()) {
    player.moveLeft();
  }
  if (controller.right()) {
    player.moveRight();
  }


  // Update game logic here, e.g., step the physics world
  world.Step(1 / 60, 8, 3);

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

  player._update();
  entity_manager._update();
  controller._update();
}

function drawDebug(ctx) {
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`Velocity: (${player.body.GetLinearVelocity().get_x().toFixed(2)}, ${player.body.GetLinearVelocity().get_y().toFixed(2)})`, 10, 30);
  ctx.fillText(`Entities: ${entity_manager.size()}`, 10, 50);
  const velocityHistory = player.velocityHistory;
  if (velocityHistory.length > 0) {
    const graphHeight = 100;
    ctx.beginPath();
    ctx.moveTo(10, window.innerHeight - 200 - (velocityHistory[0] / 10) * graphHeight);
    for (let i = 0; i < velocityHistory.length; i++) {
      const x = 10 + i * 2;
      const y = window.innerHeight - 200 - (velocityHistory[i] / 10) * graphHeight;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'red';
    ctx.stroke();
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
initGame();


// Start the animation loop
animate();