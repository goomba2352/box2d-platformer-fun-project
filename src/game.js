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
  pls.push(new Platform(400, 800, 800, 30));
}

class CollisionDebug extends b2.JSContactFilter {
  ShouldCollide = function(id_a, id_b) {
    let a = entity_manager.Get(id_a);
    let b = entity_manager.Get(id_b);
    return true;
  }
}

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
  controller._update();
}

function drawDebug(ctx) {
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`Velocity: (${player.body.GetLinearVelocity().get_x().toFixed(2)}, ${player.body.GetLinearVelocity().get_y().toFixed(2)})`, 10, 30);  const velocityHistory = player.velocityHistory;
  const graphHeight = 100;
  ctx.beginPath();
  ctx.moveTo(10, window.innerHeight - 10);
  for (let i = 0; i < velocityHistory.length; i++) {
    const x = 10 + i * 2;
    const y = window.innerHeight - 200 - (velocityHistory[i] / 10) * graphHeight;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'red';
  ctx.stroke();
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