class Player extends SensorBox {
  static MAX_VELOCITY = 10;
  velocityHistory = [];

  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.body.SetType(b2.b2_dynamicBody);
    this.body.SetSleepingAllowed(false);
    this.movementState = new FallingState(this);
  }

  vx() {
    return this.body.GetLinearVelocity().get_x();
  }

  vy() {
    return this.body.GetLinearVelocity().get_y();
  }

  position() {
    return this.body.GetPosition();
  }

  HandleCollision(type, other) {
    if (type == SensorBox.LEAVE) { return; }
    if (other instanceof ObjectBox) {
      if (this.sensor_map.get(SensorBox.TOP).has(other)) { other.Activate(); }
    }
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
    super._update(dt);
    // Keep track of player.vy() in this.velocityHistory
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
  StopableCollision(side) {
    for (let entry of player.sensor_map.get(side)) {
      if (entry instanceof Collidable && entry.collision_on) {
        return true;
      }
    }
    return false;
  }
  left(player) {
    if (player.vx() < -Player.MAX_VELOCITY) return;
    player.body.ApplyForce(v2(-10, 0), player.position());
  }

  right(player) {
    if (player.vx() > Player.MAX_VELOCITY) return;
    player.body.ApplyForce(v2(10, 0), player.position());
  }

  jump(player) {

  }

  update(player, dt) { }
}

class GroundState extends MovementState {
  constructor(player) {
    super();
    player.body.SetGravityScale(1);
    player.fillColor = "#333";
  }
  jump(player) {
    player.body.ApplyLinearImpulse(v2(0, -15), player.position());
    player.movementState = new FallingState(player);
  }

  update(player, dt) {
    const yVelocity = Math.abs(player.vy());
    if (yVelocity > 0.01) {
      player.movementState = new FallingState(player);
    }
  }
}

class FallingState extends MovementState {
  timeBelowGroundThreshold = 0.0
  timeElapsed = 0;
  pvx = 0;

  constructor(player) {
    super();
    player.body.SetGravityScale(1);
    player.fillColor = "#AA4";
    this.pvx = player.vx();
  }

  update(player, dt) {
    let vx = player.vx();
    let self_sensor = this.StopableCollision(SensorBox.SELF);
    let left_sensor = this.StopableCollision(SensorBox.LEFT);
    let right_sensor = this.StopableCollision(SensorBox.RIGHT);
    if (((right_sensor && controller.right()) || (left_sensor && controller.left())) && self_sensor) {
      if (Math.abs(vx) < 0.1 && Math.abs(this.pvx) > 2) {
        player.movementState = new WallJumpState(player, this.pvx);
        return;
      }
    }

    this.timeElapsed += dt;
    this.pvx = vx;
    if (this.timeElapsed < 0.1) { return; }
    let bottom_sensor = this.StopableCollision(SensorBox.BOTTOM);
    if (bottom_sensor && self_sensor) {
      player.movementState = new GroundState(player);
      return;
    }

  }
}

class WallJumpState extends MovementState {
  timeElapsed = 0;
  pvx = 0
  constructor(player, pvx) {
    super();
    //player.body.SetGravityScale(0.2);
    this.pvx = pvx;
    player.fillColor = "#A66";
  }

  jump() {
    if (!controller.jumpPressed()) { return; }
    let xforce = -Math.sign(this.pvx);
    let yforce = -15;
    let abspvx = Math.abs(this.pvx);
    if (abspvx > 9) {
      xforce *= 5
      yforce = -12;
    } else if (abspvx > 6) {
      xforce *= 4
      yforce = -13.5;
    } else {
      xforce *= 3
    }
    player.body.ApplyLinearImpulse(v2(xforce, yforce), player.position());
    player.movementState = new FallingState(player);
  }

  update(player, dt) {
    this.timeElapsed += dt;
    if (player.vy() > 4) {
      player.body.ApplyLinearImpulse(v2(0, -2.5), player.position());
    } else if (player.vy() > 1) {
      player.body.ApplyLinearImpulse(v2(0, -0.8), player.position());
    } else if (player.vy() < 1) {
      player.body.ApplyLinearImpulse(v2(0, 0.2), player.position());
    }
    if (this.timeElapsed > 1.5) {
      player.movementState = new FallingState(player);
      return;
    }
    let self_sensor = this.StopableCollision(SensorBox.SELF);
    if (!self_sensor) {
      player.movementState = new FallingState(player);
      return;
    }
    let bottom_sensor = this.StopableCollision(SensorBox.BOTTOM);
    if (bottom_sensor && self_sensor) {
      player.movementState = new GroundState(player);
      return;
    }
  }
}