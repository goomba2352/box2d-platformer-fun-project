class Player extends SensorBox {
  static MAX_VELOCITY = 10;
  velocityHistory = [];

  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.CreateBodyExtension();
  }

  CreateBodyExtension() {
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
    this.movementState.update(this, dt);
  }
}

class MovementState {
  StopableCollision(p, side) {
    for (let entry of p.sensor_map.get(side)) {
      if (entry instanceof Collidable && entry.collision_on) {
        return true;
      }
    }
    return false;
  }
  left(p) {
    if (p.vx() < -Player.MAX_VELOCITY) return;
    p.body.ApplyForce(v2(-10, 0), p.position());
  }

  right(p) {
    if (p.vx() > Player.MAX_VELOCITY) return;
    p.body.ApplyForce(v2(10, 0), p.position());
  }

  jump(p) {

  }

  update(p, dt) { }
}

class GroundState extends MovementState {
  constructor(p) {
    super();
    p.body.SetGravityScale(1);
    p.fillColor = "#333";
  }
  jump(p) {
    p.body.ApplyLinearImpulse(v2(0, -15), p.position());
    p.movementState = new FallingState(p);
  }

  update(p, dt) {
    const yVelocity = Math.abs(p.vy());
    if (yVelocity > 0.01) {
      p.movementState = new FallingState(p);
    }
  }
}

class FallingState extends MovementState {
  timeBelowGroundThreshold = 0.0
  timeElapsed = 0;
  pvx = 0;

  constructor(p) {
    super();
    p.body.SetGravityScale(1);
    p.fillColor = "#AA4";
    this.pvx = p.vx();
  }

  update(p, dt) {
    let vx = p.vx();
    let self_sensor = this.StopableCollision(p, SensorBox.SELF);
    let left_sensor = this.StopableCollision(p, SensorBox.LEFT);
    let right_sensor = this.StopableCollision(p, SensorBox.RIGHT);
    if (((right_sensor && controller.right()) || (left_sensor && controller.left())) && self_sensor) {
      if (Math.abs(vx) < 0.1 && Math.abs(this.pvx) > 2) {
        p.movementState = new WallJumpState(p, this.pvx);
        return;
      }
    }

    this.timeElapsed += dt;
    this.pvx = vx;
    if (this.timeElapsed < 0.1) { return; }
    let bottom_sensor = this.StopableCollision(p, SensorBox.BOTTOM);
    if (bottom_sensor && self_sensor) {
      p.movementState = new GroundState(p);
      return;
    }

  }
}

class WallJumpState extends MovementState {
  timeElapsed = 0;
  pvx = 0
  constructor(p, pvx) {
    super();
    //player.body.SetGravityScale(0.2);
    this.pvx = pvx;
    p.fillColor = "#A66";
  }

  jump(p) {
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
    p.body.ApplyLinearImpulse(v2(xforce, yforce), p.position());
    p.movementState = new FallingState(p);
  }

  update(p, dt) {
    this.timeElapsed += dt;
    if (p.vy() > 4) {
      p.body.ApplyLinearImpulse(v2(0, -2.5), p.position());
    } else if (p.vy() > 1) {
      p.body.ApplyLinearImpulse(v2(0, -0.8), p.position());
    } else if (p.vy() < 1) {
      p.body.ApplyLinearImpulse(v2(0, 0.2), p.position());
    }
    if (this.timeElapsed > 1.5) {
      p.movementState = new FallingState(p);
      return;
    }
    let self_sensor = this.StopableCollision(p, SensorBox.SELF);
    if (!self_sensor) {
      p.movementState = new FallingState(p);
      return;
    }
    let bottom_sensor = this.StopableCollision(p, SensorBox.BOTTOM);
    if (bottom_sensor && self_sensor) {
      p.movementState = new GroundState(p);
      return;
    }
  }
}