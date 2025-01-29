class Player extends SensorBox {
  static MAX_VELOCITY = 10;
  velocityHistory = [];

  constructor(x,y,w,h) {
    super(x,y,w,h);
    this.body.SetSleepingAllowed(false);
  }

  jump() {
    this.movementState.jump(this);
  }

  moveLeft() {
    this.movementState.left(this);
  }

  moveRight() {
    this.movementState.right(this);
  }

  _update(dt) {
    // Keep track of player.body.GetLinearVelocity().get_y() in this.velocityHistory
    // Max 100 records. Old records get deleted.
    const currentVelocity = this.body.GetLinearVelocity().get_y();
    if (this.velocityHistory.length >= 400) {
      this.velocityHistory.shift(); // remove the oldest record
    }
    this.velocityHistory.push(currentVelocity);
    this.movementState.update(player, dt);
  }
}

class MovementState {
  left(player) {
    if (player.body.GetLinearVelocity().get_x() < -Player.MAX_VELOCITY) return;
    player.body.ApplyForce(new b2.b2Vec2(-10, 0), player.body.GetPosition());
  }

  right(player) {
    if (player.body.GetLinearVelocity().get_x() > Player.MAX_VELOCITY) return;
    player.body.ApplyForce(new b2.b2Vec2(10, 0), player.body.GetPosition());
  }

  jump(player) {

  }

  update(player, dt) { }
}

class GroundState extends MovementState {
  jump(player) {
    player.body.ApplyLinearImpulse(new b2.b2Vec2(0, -15), player.body.GetPosition());
    player.movementState = new FallingState();
  }

  update(player, dt) {
    const yVelocity = Math.abs(player.body.GetLinearVelocity().get_y());
    if (yVelocity > 0.01) {
      player.movementState = new FallingState();
    }
  }
}

class FallingState extends MovementState {
  timeBelowGroundThreshold = 0.0
  timeElapsed = 0;

  update(player, dt) {
    this.timeElapsed+=dt;
    if (this.timeElapsed<0.1) { return; }
    let bottom_sensor = false;
    for (let entry of player.sensor_map.get(SensorBox.BOTTOM)) {
      if (entry instanceof Platform) {
        bottom_sensor = true;
        break;
      }
    }
    if (!bottom_sensor) { return; }
    for (let entry of player.sensor_map.get(SensorBox.SELF)) {
      if (entry instanceof Platform) {
        player.movementState = new GroundState();
        return;
      }
    }
  }
}