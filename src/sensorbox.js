class Collidable {
  side;
  parent;
  id;
}

class SensorInfo extends Collidable {
  side;
  parent;
  id;

  constructor(side, parent, id) {
    super();
    this.side = side;
    this.parent = parent;
    this.id = id;
  }
  _Collision(type, side, other) {
    this.parent._Collision(type, side, other)
  }
}

class SensorBox extends Collidable {
  static LEFT = 1;
  static RIGHT = 2;
  static TOP = 4;
  static BOTTOM = 8;
  static SELF = 16;
  static ENTER = 1;
  static LEAVE = 2;

  constructor(x, y, w, h) {
    super();
    this.side = SensorBox.SELF;
    this.parent = this;
    pls.push(this);
    // Create player body definition
    const bodyDef = new b2.b2BodyDef();
    bodyDef.set_type(b2.b2_staticBody);
    bodyDef.set_allowSleep(false);
    this.body = world.CreateBody(bodyDef);

    this.center = new b2.b2PolygonShape();
    this.center.SetAsBox(w / (2 * UNITS), h / (2 * UNITS));
    // this.shape.SetAsEdge(new b2.b2Vec2(-w/(2*UNITS),-h/(2*UNITS)), new b2.b2Vec2(w/(2*UNITS),h/(2*UNITS)));
    const centerDef = new b2.b2FixtureDef();
    centerDef.set_shape(this.center);
    centerDef.set_restitution(0.00); // Bounce effect
    let f = this.body.CreateFixture(centerDef);
    this.id = f.a;
    this.child_ids=[];
    this.body.SetTransform(new b2.b2Vec2(x / UNITS, y / UNITS), 0)


    // Create sensor shapes for each direction
    const sensorSize = 10; // Percentage of width/height to extend
    this.left = this._CreateSensor(SensorBox.LEFT, -w / (2 * UNITS) - 8 / UNITS, 0, 6 / UNITS, h / (2 * UNITS) - 0.03);
    this.right = this._CreateSensor(SensorBox.RIGHT, w / (2 * UNITS) + 8 / UNITS, 0, 6 / UNITS, h / (2 * UNITS) - 0.03);
    this.top = this._CreateSensor(SensorBox.TOP, 0, -h / (2 * UNITS) - 8 / UNITS, w / (2 * UNITS) - 0.03, 6 / UNITS);
    this.bottom = this._CreateSensor(SensorBox.BOTTOM, 0, h / (2 * UNITS) + 8 / UNITS, w / (2 * UNITS) - 0.03, 6 / UNITS);

    entity_manager.Add(this);
    this.sensor_map = new Map();
    this.sensor_map.set(1, new Set());
    this.sensor_map.set(2, new Set());
    this.sensor_map.set(4, new Set());
    this.sensor_map.set(8, new Set());
    this.sensor_map.set(16, new Set());
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
    this.fillColor="#333";
    this.collisions_to_handle = [];
  }

  _CreateSensor(side, x, y, w, h) {
    const sideShape = new b2.b2PolygonShape();
    sideShape.SetAsBox(w, h, new b2.b2Vec2(x, y), 0);

    const sideDef = new b2.b2FixtureDef();
    sideDef.set_shape(sideShape);  // Error: "shape" is not defined
    sideDef.set_isSensor(true);
    let f = this.body.CreateFixture(sideDef);

    let sensor = new SensorInfo(side, this, f.a);
    entity_manager.Add(sensor)
    this.child_ids.push(sensor.id);
    return sideShape;
  }

  _Collision(type, side, other) {
    if (type == SensorBox.ENTER) {
      this.sensor_map.get(side).add(other);
    } else {
      this.sensor_map.get(side).delete(other);
    }
    if (side==SensorBox.SELF) { this.collisions_to_handle.push([type, other]) }
  }

  HandleCollision(type, other) { }

  draw(ctx) {
    this.draw_rect_shape(this.center, ctx, this.fillColor);
    // this.draw_rect_shape(this.left, ctx, '#990');
    // this.draw_rect_shape(this.right, ctx, '#990');
    // this.draw_rect_shape(this.top, ctx, '#990');
    // this.draw_rect_shape(this.bottom, ctx, '#990');
  }

  _update(dt) {
    for (let i = this.collisions_to_handle.length - 1; i >= 0; i--) {
      let event = this.collisions_to_handle.pop();
      this.HandleCollision(event[0], event[1]);
    }
  }

  draw_rect_shape(shape, ctx, color) {
    // Get the vertices of the player's body in world coordinates
    const vertices = [];
    // Convert to screen coordinates and scale appropriately
    for (let i = 0; i < shape.GetVertexCount(); i++) {
      const v = shape.GetVertex(i);
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
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  destroy() {
    let index = pls.indexOf(this);
    pls.splice(index, 1);
    world.DestroyBody(this.body);
    for (let id of this.child_ids) {
      if (!entity_manager.RemoveById(id)) {}
    }
    entity_manager.Remove(this);
  }

  debuginfo() {
    let result = "Sensor Map:\n";
    const sensors = {
        Left: SensorBox.LEFT,
        Right: SensorBox.RIGHT,
        Top: SensorBox.TOP,
        Bottom: SensorBox.BOTTOM,
        Self: SensorBox.SELF
    };
    
    for (const [key, value] of Object.entries(sensors)) {
        if (this.sensor_map.has(value)) {
            const entries = Array.from(this.sensor_map.get(value)).map(entity => entity.constructor.name);
            result += `${key}: ${entries.join(', ')}\n`;
        }
    }
    return result;
  }
}