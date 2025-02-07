var player;
var pls = [];
var ptime=performance.now();
var global_speed=2;
var object_box;
var frame = 0;
var debug_collisions=false;

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

  player = new Player(640, 500, 30, 30); 
  //loadPlatforms("eyJ4IjoyOSwieSI6NDQ2LjUsInciOjI4LCJoIjo3MTMsImZpbGxDb2xvciI6IiNlMjg1MDcifQ==;eyJ4IjoyNjUsInkiOjgxOCwidyI6MjQsImgiOjE1NiwiZmlsbENvbG9yIjoiIzNjZDhiNiJ9;eyJ4Ijo3NzUuNSwieSI6NDE3LCJ3IjoyNywiaCI6NzcwLCJmaWxsQ29sb3IiOiIjY2JiOTZlIn0=;eyJ4IjozNDQuNSwieSI6ODExLjUsInciOjQxLCJoIjoxMDMsImZpbGxDb2xvciI6IiMyMjdlM2IifQ==;eyJ4Ijo0MDAsInkiOjgwMCwidyI6ODAwLCJoIjozMCwiZmlsbENvbG9yIjoiIzE5YzAyOSJ9;eyJ4IjoxMzguNSwieSI6NzcyLjUsInciOjEyMSwiaCI6MjMzLCJmaWxsQ29sb3IiOiIjYzExMDVlIn0=;eyJ4IjozNTEsInkiOjg3NCwidyI6NzAyLCJoIjoxMzYsImZpbGxDb2xvciI6IiMxY2FiMDUifQ==;eyJ4Ijo1NjMuNSwieSI6NDA2LjUsInciOjMxLCJoIjo1MzcsImZpbGxDb2xvciI6IiMwODAifQ==;eyJ4IjozOTUsInkiOjEyLjUsInciOjc0MCwiaCI6MTMsImZpbGxDb2xvciI6IiNjNWNmMmYifQ==;eyJ4IjoyNSwieSI6NDMsInciOjIyLCJoIjo2MiwiZmlsbENvbG9yIjoiI2JkMmUwNyJ9");
  loadPlatforms("eyJwIjpbImV5SjRJam8wTVRZc0lua2lPalF4Tml3aWR5STZOelV5TENKb0lqbzNPRFFzSW1acGJHeERiMnh2Y2lJNklpTmpNMkl4T1RJaUxDSnpJam9pSXpBd01EQXdNQ0lzSW5RaU9qRXNJblJqSWpvaUkyVXdaRFE1WVNJc0ltTWlPbVpoYkhObGZRPT0iLCJleUo0SWpvek1pd2llU0k2TkRRNExDSjNJam96TWl3aWFDSTZOekl3TENKbWFXeHNRMjlzYjNJaU9pSWpaVEk0TlRBM0lpd2ljeUk2SWlNd01EQXdNREFpTENKMElqb3RNU3dpZEdNaU9pSWpNREF3TURBd0lpd2lZeUk2ZEhKMVpYMD0iLCJleUo0SWpveU56SXNJbmtpT2pnek1pd2lkeUk2TXpJc0ltZ2lPakUyTUN3aVptbHNiRU52Ykc5eUlqb2lJek5qWkRoaU5pSXNJbk1pT2lJak1EQXdNREF3SWl3aWRDSTZMVEVzSW5Saklqb2lJekF3TURBd01DSXNJbU1pT25SeWRXVjkiLCJleUo0SWpvek5USXNJbmtpT2pneE5pd2lkeUk2TkRnc0ltZ2lPakV4TWl3aVptbHNiRU52Ykc5eUlqb2lJekl5TjJVellpSXNJbk1pT2lJak1EQXdNREF3SWl3aWRDSTZMVEVzSW5Saklqb2lJekF3TURBd01DSXNJbU1pT25SeWRXVjkiLCJleUo0SWpvME1EQXNJbmtpT2pnd01Dd2lkeUk2T0RBd0xDSm9Jam96TWl3aVptbHNiRU52Ykc5eUlqb2lJMkpsT1RjNU55SXNJbk1pT2lJak5ETXpNak15SWl3aWRDSTZNQ3dpZEdNaU9pSWpaR0pqTjJNM0lpd2lZeUk2ZEhKMVpYMD0iLCJleUo0SWpvM09EUXNJbmtpT2pRek1pd2lkeUk2TXpJc0ltZ2lPamM0TkN3aVptbHNiRU52Ykc5eUlqb2lJMk5pWWprMlpTSXNJbk1pT2lJak1EQXdNREF3SWl3aWRDSTZMVEVzSW5Saklqb2lJekF3TURBd01DSXNJbU1pT25SeWRXVjkiLCJleUo0SWpveE5EUXNJbmtpT2pjNE5Dd2lkeUk2TVRJNExDSm9Jam95TkRBc0ltWnBiR3hEYjJ4dmNpSTZJaU5qTVRFd05XVWlMQ0p6SWpvaUl6QXdNREF3TUNJc0luUWlPaTB4TENKMFl5STZJaU13TURBd01EQWlMQ0pqSWpwMGNuVmxmUT09IiwiZXlKNElqbzFOellzSW5raU9qUXhOaXdpZHlJNk16SXNJbWdpT2pVME5Dd2labWxzYkVOdmJHOXlJam9pTURBNE1EQXdJaXdpY3lJNklpTXdNREF3TURBaUxDSjBJam90TVN3aWRHTWlPaUlqTURBd01EQXdJaXdpWXlJNmRISjFaWDA9IiwiZXlKNElqb3pOVElzSW5raU9qZzRNQ3dpZHlJNk56QTBMQ0pvSWpveE5EUXNJbVpwYkd4RGIyeHZjaUk2SWlNeFkyRmlNRFVpTENKeklqb2lJekF3TURBd01DSXNJblFpT2kweExDSjBZeUk2SWlNd01EQXdNREFpTENKaklqcDBjblZsZlE9PSIsImV5SjRJam8wTURBc0lua2lPakUyTENKM0lqbzNOVElzSW1naU9qRTJMQ0ptYVd4c1EyOXNiM0lpT2lJall6VmpaakptSWl3aWN5STZJaU13TURBd01EQWlMQ0owSWpvdE1Td2lkR01pT2lJak1EQXdNREF3SWl3aVl5STZkSEoxWlgwPSIsImV5SjRJam96TWl3aWVTSTZORGdzSW5jaU9qTXlMQ0pvSWpvMk5Dd2labWxzYkVOdmJHOXlJam9pSTJKa01tVXdOeUlzSW5NaU9pSWpNREF3TURBd0lpd2lkQ0k2TFRFc0luUmpJam9pSXpBd01EQXdNQ0lzSW1NaU9uUnlkV1Y5Il0sInQiOiJleUowSWpwYkltVjVTbWxKYW05cFVWWkdSbEZwT1RSUlZrWkdWVVJuT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBURE5rUjA5V1dsZFdiRnB0VlZWVk9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVkZod1VWUlljRVZVV0hBMlZGaGpPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFZGaHdVVlJZY0VWVVdIQTJWRmhqT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBWRmh3VVZSWWNFVlVXSEEyVkZoak9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVkZod1VWUlljRVZVV0hBMlZGaGpPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFZGaHdVVlJZY0VWVVdIQTJWRmhqT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBWRmh3VVZSWWNFVlVXSEEyVkZoak9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVkZod1VWUlljRVZVV0hBMlZGaGpPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFZGaHdVVlJZY0VWVVdIQTJWRmhqT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBWRmh3VVZSWWNFVlVXSEEyVkZoak9VbHBkMmxqZVVrMlQwZ3dQU0pkZlE9PSIsIm8iOjJ9");
  // Start the animation loop

  // TODO: Serialize these:
  object_box = new ObjectBox(500,700,30,30);
  animate();
}

function updateGame() {
  frame=frame+1;
  // ================== UPDATE ==================
  let now = performance.now();
  let dt = global_speed * (now - ptime) / 1000;

  entity_manager._update(dt);
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
  controller._update(dt);
  entity_manager.UpdateAll(dt);


  // ================== DRAW ==================
  const context = document.getElementById('myCanvas').getContext('2d');
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  // Draw your game objects here
  entity_manager.DrawAll(context);

  // Debuging info
  drawDebug(context);
}

function drawDebug(ctx) {
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`Velocity: (${player.body.GetLinearVelocity().get_x().toFixed(2)}, ${player.body.GetLinearVelocity().get_y().toFixed(2)})`, 10, 30);
  ctx.fillText(`Entities: ${entity_manager.size()} Drawables: ${entity_manager.drawables.size}`, 10, 50);
  ctx.fillText(`MovementState: ${player.movementState.constructor.name}`, 10, 70);
  if (debug_collisions) {
    const debugLines = player.debuginfo().split('\n');
    let y = 90;
    for (let line of debugLines) {
      ctx.fillText(line.trim(), 10, y);
      y += 20; // Space each line 20 pixels apart
    }
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
}

class ContactListener extends b2.JSContactListener {
  static ColideEvent = function (c, type) {
    let contact = Box2D.wrapPointer(c, b2.b2Contact);
    let a = entity_manager.Get(contact.GetFixtureA().a);
    let b = entity_manager.Get(contact.GetFixtureB().a);
    if (a instanceof SensorInfo && b instanceof SensorInfo) { return; }
    if (debug_collisions) {
      console.log((type == 1 ? "Enter" : "Leave") + " on frame " + frame);
      console.log(a);
      console.log(b);
      console.log("-------------");
    }
    if (a instanceof Collidable) {
      a._Collision(type, a.side, b);
    }
    if (b instanceof Collidable) {
      b._Collision(type, b.side, a);
    }
  }

  BeginContact = function(c) { ContactListener.ColideEvent(c, SensorBox.ENTER);}
  EndContact = function(c) { ContactListener.ColideEvent(c, SensorBox.LEAVE);}
  PreSolve = function(c,d) {}
  PostSolve = function(c,d) {}
}


function savePlatforms() {
  let platforms = entity_manager
    .drawables
    .values()
    .filter(d => d.target instanceof Platform)
    .map(d => d.target.serialize())
    .toArray();
  return btoa(JSON.stringify({
    p: platforms,
    t: tex_manager.serialize(),
    o: entity_manager.PlayerOrder()
  }));
}

function loadPlatforms(str) {
  for (let drawable of entity_manager.drawables.values()) {
    if (drawable.target instanceof Platform) {
      drawable.target.destroy();
    }
  }
  entity_manager._cleanup_now();

  // Deserialize the ones created by savePlatforms
  const data = JSON.parse(atob(str));
  for (let i = 0; i < data.p.length; i++) {
    Platform.deserialize(data.p[i]);
  }
  tex_manager.deserialize(data.t);
  for (let i = 0; i < data.o; i++) {
    entity_manager.OrderHigher(player.__removekey);
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

// ========================= Mouse stuff =============================
let startDrawX, startDrawY;
let new_pl = null;
let isDrawingPlatform = false;

canvas.addEventListener('mousedown', function (event) {
  if (event.button != 0) return;
  isDrawingPlatform = true;
  startDrawX = grid(event.clientX + camera.dx(),16);
  startDrawY = grid(event.clientY + camera.dy(),16);
});

canvas.addEventListener('mousemove', function (event) {
  if (!isDrawingPlatform) return;
  let endDrawX = grid(event.clientX + camera.dx(),16);
  let endDrawY = grid(event.clientY + camera.dy(),16);

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

canvas.addEventListener('mouseup', function (event) {
  isDrawingPlatform = false;
  new_pl = null;
});

canvas.addEventListener('contextmenu', function (event) {
  event.preventDefault();
  let mouseX = event.clientX;
  let mouseY = event.clientY;
  let lastObject = null;
  for (let object of entity_manager.drawables.values()) {
    if (object.target.containsMouse(mouseX, mouseY)) {
      lastObject = object.target;
    }
  }
  if (lastObject) {
    if (pe != null) { pe.destroy(); }
    new GUIWindow(mouseX + 20, mouseY + 20, 320, 200, lastObject);
  }
});

canvas.addEventListener('wheel', function (event) {
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  let lastObject = null;
  for (let object of entity_manager.drawables.values()) {
    if (object.target.containsMouse(mouseX, mouseY)) {
      lastObject = object;
    }
  }
  if (lastObject) {
    if (event.deltaY < 0) {
      entity_manager.OrderLower(lastObject);
    } else if (event.deltaY > 0) {
      entity_manager.OrderHigher(lastObject);
    }
  }
});

canvas.addEventListener('auxclick', function (event) { // middle click
  event.preventDefault();
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  
  let lastObject = null;
  for (let object of entity_manager.drawables.values()) {
    if (object.target.containsMouse(mouseX, mouseY)) {
      lastObject = object.target;
    }
  }
  if (lastObject != null) {
  }
});