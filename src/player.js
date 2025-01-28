class Player {
  static MAX_VELOCITY = 10;
  constructor(x, y, w, h) {
    // Create player body definition
    const bodyDef = new b2.b2BodyDef();
    bodyDef.set_type(b2.b2_dynamicBody);
    bodyDef.set_allowSleep(false);
    this.body = world.CreateBody(bodyDef);

    // Create fixture definition for a rectangle (size 50x50 pixels)
    this.shape = new b2.b2PolygonShape();
    this.shape.SetAsBox(w / (2 * UNITS), h / (2 * UNITS));
    // this.shape.SetAsEdge(new b2.b2Vec2(-w/(2*UNITS),-h/(2*UNITS)), new b2.b2Vec2(w/(2*UNITS),h/(2*UNITS)));
    const fixtureDef = new b2.b2FixtureDef();
    fixtureDef.set_shape(this.shape);
    fixtureDef.set_restitution(0.00); // Bounce effect
    this.body.CreateFixture(fixtureDef);
    this.body.SetTransform(new b2.b2Vec2(x / UNITS, y / UNITS), 0)
    this.velocityHistory = [];
    this.id = this.body.GetFixtureList().a; // wasm ptr address
    entity_manager.Add(this);
    this.movementState = new FallingState();
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

  draw(ctx) {
    if (!this.body) return;

    // Get the vertices of the player's body in world coordinates
    const vertices = [];
    // Convert to screen coordinates and scale appropriately
    for (let i = 0; i < this.shape.GetVertexCount(); i++) {
      const v = this.shape.GetVertex(i);
      vertices.push({
        x: UNITS * (this.body.GetPosition().get_x() + v.get_x()),
        y: UNITS * (this.body.GetPosition().get_y() + v.get_y())
      });
    }

    // Draw the polygon using the vertices
    ctx.beginPath();
    if (vertices.length > 0) {
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.closePath();
    }

    // Draw the outline
    ctx.strokeStyle = '#333';
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
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
    player.body.ApplyForce(new b2.b2Vec2(0, -400), player.body.GetPosition());
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

  update(player, dt) {
    const yVelocity = Math.abs(player.body.GetLinearVelocity().get_y());
    if (yVelocity < 0.01) {
      this.timeBelowGroundThreshold += dt;
    }
    if (this.timeBelowGroundThreshold > 0.02) {
      player.movementState = new GroundState();
    }
  }
}