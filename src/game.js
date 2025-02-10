var player;
var pls = [];
var ptime=performance.now();
var global_speed=2;
var object_box;
var frame = 0;
var debug_collisions=false;
var moveMode = document.getElementById("moveModeImage")

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
  loadPlatforms("eyJwIjpbImV5SjRJam8wTVRZc0lua2lPalF4Tml3aWR5STZOelV5TENKb0lqbzNPRFFzSW1acGJHeERiMnh2Y2lJNklpTmpNMkl4T1RJaUxDSnpJam9pSXpBd01EQXdNQ0lzSW5RaU9qRXNJblJqSWpvaUkyVXdaRFE1WVNJc0ltTWlPbVpoYkhObGZRPT0iLCJleUo0SWpveE9EUTRMQ0o1SWpvNU5USXNJbmNpT2pNMk5qUXNJbWdpT2pFNE56SXNJbVpwYkd4RGIyeHZjaUk2SWlOa01XUTVaVEFpTENKeklqb2lJekF3TURBd01DSXNJblFpT2kweExDSjBZeUk2SWlNd01EQXdNREFpTENKaklqcG1ZV3h6WlgwPSIsImV5SjRJam94TURjeUxDSjVJam8yTWpRc0luY2lPakk0T0N3aWFDSTZNeklzSW1acGJHeERiMnh2Y2lJNklpTTVOVFkxTmpVaUxDSnpJam9pSXpaaU5tSTJZaUlzSW5RaU9qTXNJblJqSWpvaUl6VXdNelF6TkNJc0ltTWlPbVpoYkhObGZRPT0iLCJleUo0SWpveE1EY3lMQ0o1SWpvM01qQXNJbmNpT2pJNE9Dd2lhQ0k2TVRZd0xDSm1hV3hzUTI5c2IzSWlPaUlqWkdKaE9XRTVJaXdpY3lJNklpTTFORFUwTlRRaUxDSjBJam93TENKMFl5STZJaU5oTURaaE5tRWlMQ0pqSWpwbVlXeHpaWDA9IiwiZXlKNElqb3hNRGN5TENKNUlqbzNOVElzSW5jaU9qWTBMQ0pvSWpvNU5pd2labWxzYkVOdmJHOXlJam9pSXpGaE1XRXhZU0lzSW5NaU9pSWpObU16WkROa0lpd2lkQ0k2TkN3aWRHTWlPaUlqTTJRelpETmtJaXdpWXlJNlptRnNjMlY5IiwiZXlKNElqb3hNRGd3TENKNUlqbzVNakFzSW5jaU9qWTFOaXdpYUNJNk1URXlMQ0ptYVd4c1EyOXNiM0lpT2lJak9XUTJOVFJrSWl3aWN5STZJaU0wWWpNeU1EY2lMQ0owSWpvMUxDSjBZeUk2SWlOaU9EbGxPRGtpTENKaklqcDBjblZsZlE9PSIsImV5SjRJam96TWl3aWVTSTZORFE0TENKM0lqb3pNaXdpYUNJNk56SXdMQ0ptYVd4c1EyOXNiM0lpT2lJalpUSTROVEEzSWl3aWN5STZJaU13TURBd01EQWlMQ0owSWpvdE1Td2lkR01pT2lJak1EQXdNREF3SWl3aVl5STZkSEoxWlgwPSIsImV5SjRJam95TnpJc0lua2lPamd6TWl3aWR5STZNeklzSW1naU9qRTJNQ3dpWm1sc2JFTnZiRzl5SWpvaUl6TmpaRGhpTmlJc0luTWlPaUlqTURBd01EQXdJaXdpZENJNkxURXNJblJqSWpvaUl6QXdNREF3TUNJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam96TlRJc0lua2lPamd4Tml3aWR5STZORGdzSW1naU9qRXhNaXdpWm1sc2JFTnZiRzl5SWpvaUl6SXlOMlV6WWlJc0luTWlPaUlqTURBd01EQXdJaXdpZENJNkxURXNJblJqSWpvaUl6QXdNREF3TUNJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam94TkRRc0lua2lPamM0TkN3aWR5STZNVEk0TENKb0lqb3lOREFzSW1acGJHeERiMnh2Y2lJNklpTmpNVEV3TldVaUxDSnpJam9pSXpBd01EQXdNQ0lzSW5RaU9pMHhMQ0owWXlJNklpTXdNREF3TURBaUxDSmpJanAwY25WbGZRPT0iLCJleUo0SWpvMU56WXNJbmtpT2pReE5pd2lkeUk2TXpJc0ltZ2lPalUwTkN3aVptbHNiRU52Ykc5eUlqb2lJMFJFTVRFeU1pSXNJbk1pT2lJak1EQXdNREF3SWl3aWRDSTZMVEVzSW5Saklqb2lJekF3TURBd01DSXNJbU1pT25SeWRXVjkiLCJleUo0SWpvME1EQXNJbmtpT2pFMkxDSjNJam8zTlRJc0ltZ2lPakUyTENKbWFXeHNRMjlzYjNJaU9pSWpZelZqWmpKbUlpd2ljeUk2SWlNd01EQXdNREFpTENKMElqb3RNU3dpZEdNaU9pSWpNREF3TURBd0lpd2lZeUk2ZEhKMVpYMD0iLCJleUo0SWpvek1pd2llU0k2TkRnc0luY2lPak15TENKb0lqbzJOQ3dpWm1sc2JFTnZiRzl5SWpvaUkySmtNbVV3TnlJc0luTWlPaUlqTURBd01EQXdJaXdpZENJNkxURXNJblJqSWpvaUl6QXdNREF3TUNJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam94TURjeUxDSjVJam8xTlRJc0luY2lPakU1TWl3aWFDSTZNVFlzSW1acGJHeERiMnh2Y2lJNklpTTVaRE01TXpraUxDSnpJam9pSXpBd01EQXdNQ0lzSW5RaU9qTXNJblJqSWpvaUl6QXdNREF3TUNJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam94TURjeUxDSjVJam8xTXpZc0luY2lPakUyTUN3aWFDSTZNVFlzSW1acGJHeERiMnh2Y2lJNklpTmlaVFZpTldJaUxDSnpJam9pSXpBd01EQXdNQ0lzSW5RaU9qTXNJblJqSWpvaUl6QXdNREF3TUNJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam94TURjeUxDSjVJam8zTWpBc0luY2lPalkwTENKb0lqb3hOaXdpWm1sc2JFTnZiRzl5SWpvaUl6VXhORFF3TmlJc0luTWlPaUlqTlRNell6TmpJaXdpZENJNk5pd2lkR01pT2lJak16Y3lNekJpSWl3aVl5STZabUZzYzJWOSIsImV5SjRJam94TURjeUxDSjVJam8xTmpnc0luY2lPakkxTml3aWFDSTZNVFlzSW1acGJHeERiMnh2Y2lJNklpTTVaRE01TXpraUxDSnpJam9pSXpBd01EQXdNQ0lzSW5RaU9qTXNJblJqSWpvaUl6QXdNREF3TUNJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam94TURjeUxDSjVJam8xTURRc0luY2lPak15TENKb0lqb3hOaXdpWm1sc2JFTnZiRzl5SWpvaUkyUmtZV05oWXlJc0luTWlPaUlqWVRoaE9HRTRJaXdpZENJNk15d2lkR01pT2lJalpEWmtObVEySWl3aVl5STZabUZzYzJWOSIsImV5SjRJam8wTURBc0lua2lPamd3TUN3aWR5STZPREF3TENKb0lqb3pNaXdpWm1sc2JFTnZiRzl5SWpvaUkySmxPVGM1TnlJc0luTWlPaUlqTkRNek1qTXlJaXdpZENJNk5Dd2lkR01pT2lJalpHSmpOMk0zSWl3aVl5STZkSEoxWlgwPSIsImV5SjRJam94TURjeUxDSjVJam8xTWpBc0luY2lPakV5T0N3aWFDSTZNVFlzSW1acGJHeERiMnh2Y2lJNklpTmtPRGRrTjJRaUxDSnpJam9pSXpBd01EQXdNQ0lzSW5RaU9qTXNJblJqSWpvaUl6QXdNREF3TUNJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam94TVRVeUxDSjVJam8zTURRc0luY2lPak15TENKb0lqb3lNalFzSW1acGJHeERiMnh2Y2lJNklpTmxPR1U0WlRnaUxDSnpJam9pSXpjd056QTNNQ0lzSW5RaU9qSXNJblJqSWpvaUkyRXhZVEZoTVNJc0ltTWlPbVpoYkhObGZRPT0iLCJleUo0SWpveE16VXlMQ0o1SWpvNE5UWXNJbmNpT2pFMkxDSm9Jam8wT0N3aVptbHNiRU52Ykc5eUlqb2lJekF3T0RBd01DSXNJbk1pT2lJak1EQXdNREF3SWl3aWRDSTZMVEVzSW5Saklqb2lJekF3TURBd01DSXNJbU1pT21aaGJITmxmUT09IiwiZXlKNElqb3hNVEV5TENKNUlqbzJNalFzSW5jaU9qRTJMQ0pvSWpvek1pd2labWxzYkVOdmJHOXlJam9pSXpBd1kyTXdNQ0lzSW5NaU9pSWpNREE0TlRCbUlpd2lkQ0k2T0N3aWRHTWlPaUlqT0Roa1pEazVJaXdpWXlJNlptRnNjMlY5IiwiZXlKNElqb3hNekEwTENKNUlqbzROVFlzSW5jaU9qRTJMQ0pvSWpvME9Dd2labWxzYkVOdmJHOXlJam9pSXpBd09EQXdNQ0lzSW5NaU9pSWpNREF3TURBd0lpd2lkQ0k2TFRFc0luUmpJam9pSXpBd01EQXdNQ0lzSW1NaU9tWmhiSE5sZlE9PSIsImV5SjRJam81T1RJc0lua2lPamN3TkN3aWR5STZNeklzSW1naU9qSXlOQ3dpWm1sc2JFTnZiRzl5SWpvaUkyVmlaV0psWWlJc0luTWlPaUlqTm1JMllqWmlJaXdpZENJNk1pd2lkR01pT2lJallUaGhPR0U0SWl3aVl5STZabUZzYzJWOSIsImV5SjRJam94TURjeUxDSjVJam8yTWpRc0luY2lPakUyTENKb0lqb3pNaXdpWm1sc2JFTnZiRzl5SWpvaUl6QXdNV1ZtWmlJc0luTWlPaUlqTURBeFlqZzFJaXdpZENJNk9Dd2lkR01pT2lJak9HRTNZMlkwSWl3aVl5STZabUZzYzJWOSIsImV5SjRJam94TURnd0xDSjVJam80T0RBc0luY2lPalkxTml3aWFDSTZNeklzSW1acGJHeERiMnh2Y2lJNklpTXdNRGd3TURBaUxDSnpJam9pSXpCaU5URXdOaUlzSW5RaU9qVXNJblJqSWpvaUl6RXlObVV4TXlJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam8wTURBc0lua2lPamc1Tml3aWR5STZOelk0TENKb0lqb3hOakFzSW1acGJHeERiMnh2Y2lJNklpTTVOelkxTkdRaUxDSnpJam9pSXpSaU16SXdOeUlzSW5RaU9qVXNJblJqSWpvaUkySTRPV1U0T1NJc0ltTWlPblJ5ZFdWOSIsImV5SjRJam94TVRVeUxDSjVJam8yTWpRc0luY2lPakUyTENKb0lqb3pNaXdpWm1sc2JFTnZiRzl5SWpvaUkyUXdNREV3TVNJc0luTWlPaUlqTlRjd01EQXdJaXdpZENJNk9Dd2lkR01pT2lJalptWTRaamhtSWl3aVl5STZabUZzYzJWOSIsImV5SjRJam94TkRnd0xDSjVJam8yTURnc0luY2lPakUwTkN3aWFDSTZOek0yTENKbWFXeHNRMjlzYjNJaU9pSWpZakJpTUdJd0lpd2ljeUk2SWlNd01EQXdNREFpTENKMElqbzBMQ0owWXlJNklpTmxObVUxWlRVaUxDSmpJanAwY25WbGZRPT0iLCJleUo0SWpvNU9USXNJbmtpT2pZeU5Dd2lkeUk2TVRZc0ltZ2lPak15TENKbWFXeHNRMjlzYjNJaU9pSWpabVl3TURBd0lpd2ljeUk2SWlNNE1EQXdNREFpTENKMElqbzRMQ0owWXlJNklpTm1aamRoTjJFaUxDSmpJanBtWVd4elpYMD0iLCJleUo0SWpveE1ETXlMQ0o1SWpvMk1qUXNJbmNpT2pFMkxDSm9Jam96TWl3aVptbHNiRU52Ykc5eUlqb2lJMk5sWWpjeU1pSXNJbk1pT2lJallXVTVZVEV6SWl3aWRDSTZPQ3dpZEdNaU9pSWpaV05rWmpSaUlpd2lZeUk2Wm1Gc2MyVjkiLCJleUo0SWpvNU5USXNJbmtpT2pZeU5Dd2lkeUk2TVRZc0ltZ2lPak15TENKbWFXeHNRMjlzYjNJaU9pSWpNREJqWXpBd0lpd2ljeUk2SWlNd1pUZGhNREFpTENKMElqbzRMQ0owWXlJNklpTTFObVkxT1dJaUxDSmpJanBtWVd4elpYMD0iLCJleUo0SWpveE1EY3lMQ0o1SWpvMU9USXNJbmNpT2pNeU1Dd2lhQ0k2TXpJc0ltWnBiR3hEYjJ4dmNpSTZJaU01WkRNNU16a2lMQ0p6SWpvaUl6QXdNREF3TUNJc0luUWlPallzSW5Saklqb2lJekF3TURBd01DSXNJbU1pT21aaGJITmxmUT09IiwiZXlKNElqb3hNVGt5TENKNUlqbzJNalFzSW5jaU9qRTJMQ0pvSWpvek1pd2labWxzYkVOdmJHOXlJam9pSTJJM1lqRXdNU0lzSW5NaU9pSWpOMlEzT1RBNElpd2lkQ0k2T0N3aWRHTWlPaUlqWlRKa016TXlJaXdpWXlJNlptRnNjMlY5IiwiZXlKNElqb3hNRGN5TENKNUlqbzFPRFFzSW5jaU9qTTFNaXdpYUNJNk1UWXNJbVpwYkd4RGIyeHZjaUk2SWlNNFl6TXhNekVpTENKeklqb2lJekF3TURBd01DSXNJblFpT2pNc0luUmpJam9pSXpBd01EQXdNQ0lzSW1NaU9uUnlkV1Y5IiwiZXlKNElqb3hNRGN5TENKNUlqbzRNeklzSW5jaU9qTTFNaXdpYUNJNk5qUXNJbVpwYkd4RGIyeHZjaUk2SWlOa01tSTJZallpTENKeklqb2lJelEyTXprek9TSXNJblFpT2pRc0luUmpJam9pSTJVNVpHUmtaQ0lzSW1NaU9uUnlkV1Y5Il0sInQiOiJleUowSWpwYkltVjVTbWxKYW05cFRIcG9SRlZZWkcxUFJsWkVVVzVqT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBURE5rUjA5V1dsZFdiRnB0VlZWVk9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVVd4T1RsSnJiRE5XVjNCRFZUQXdPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFVWWkJORkZZUm01U1F6bENVakZyT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBUSHBTUkZGWFpGRlBSV3hFVVZkak9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVTFWR1NsVldSa0pSVlZaS1VWVlZPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFRIcFZOV05xYkdwUldIQkNWVVJuT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBVVlYwUWxNd1JrdFJWM1JDVTFWRk9VbHBkMmxqZVVrMlQwZ3dQU0lzSW1WNVNtbEphbTlwVFROa1JVNHdSazlQUlVWeVpEQkZPVWxwZDJsamVVazJUMGd3UFNJc0ltVjVTbWxKYW05cFZGaHdVVlJZY0VWVVdIQTJWRmhqT1VscGQybGplVWsyVDBnd1BTSXNJbVY1U21sSmFtOXBWRmh3VVZSWWNFVlVXSEEyVkZoak9VbHBkMmxqZVVrMlQwZ3dQU0pkZlE9PSIsIm8iOjIwfQ==");
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

  if (selected.length > 0) {
    if (controller.pressed(Controller.LEFT)) {
      for (let o of selected) {
        o.l();
      }
    }
    if (controller.pressed(Controller.RIGHT)) {
      for (let o of selected) {
        o.r();
      }
    }
    if (controller.pressed(Controller.UP)) {
      for (let o of selected) {
        o.u();
      }
    }
    if (controller.pressed(Controller.DOWN)) {
      for (let o of selected) {
        o.d();
      }
    }
    if (controller.pressed(Controller.DELETE)) {
      for (let o of selected) {
        o.destroy();
      }
      selected = [];
      moveMode.style.display="none";
    }
    if (controller.pressed(Controller.ESCAPE)) {
      for (let o of selected) {
        o.selected = false;
      }
      selected = [];
      moveMode.style.display="none";
    }
  } else {
    if (controller.jump()) {
      player.jump();
    }
    if (controller.left()) {
      player.moveLeft();
    }
    if (controller.right()) {
      player.moveRight();
    } 
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

// ========================= Mouse stuff =============================
let startDrawX, startDrawY;
let new_pl = null;
let isDrawingPlatform = false;
let selected = [];
let mouseMoved = false;
let pmx = 0;
let pmy = 0;

canvas.addEventListener('mousedown', function (event) {
  if (event.button != 0) return;
  isDrawingPlatform = true;
  startDrawX = grid(event.clientX + camera.dx(), 16);
  startDrawY = grid(event.clientY + camera.dy(), 16);
  pmx = event.clientX + camera.dx();
  pmy = event.clientY + camera.dy()
  mouseMoved = false;
});

canvas.addEventListener('mousemove', function (event) {
  mouseMoved=true;
  let mx = event.clientX + camera.dx();
  let my = event.clientY + camera.dy();
  if (!isDrawingPlatform) return;
  if (selected.length > 0) {
    for (let o of selected) {
      o.translate((mx-pmx)/UNITS,(my-pmy)/UNITS)
    }
  }
  pmx=mx;
  pmy=my;
  if (selected.length>0) {
    return;
  }

  let endDrawX = grid(mx, 16);
  let endDrawY = grid(my, 16);

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
  if (!mouseMoved) {
    let lastObject = null;
    for (let object of entity_manager.drawables.values()) {
      if (object.target.containsMouse(event.clientX, event.clientY)) {
        lastObject = object.target;
      }
    }
    if (lastObject != null) {
      let wasinselected = selected.indexOf(lastObject) != -1;
      if (!controller.shift()) {
        for (let o of selected) {
          o.selected = false;
          moveMode.style.display="none";
          selected = [];
        }
      }
      if (!wasinselected) {
        selected.push(lastObject);
        moveMode.style.display="";
        lastObject.selected = true;
      } else {
        lastObject.selected = false;
        selected.splice(selected.indexOf(lastObject), 1);
      }
    } else if (selected.length>0) {
      for (let o of selected) {
        o.selected = false;
      }
      moveMode.style.display="none";
      selected = [];
    }
  }
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

// Start

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
initGame();
