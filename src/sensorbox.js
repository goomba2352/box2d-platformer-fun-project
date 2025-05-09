class Collidable {
  side;
  parent;
  id;
  collision_on = true;
}

class SensorInfo extends Collidable {
  side;
  parent;
  id;
  collision_on = false;

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

class GameObject extends Collidable {
  static SELECTED_FILL_COLOR = "#FFFF00";
  selected = false;
  destroy() { }

  editableProperties() { return new PropertyEditor(this); }

  updatePropertyCallback(prop) { }

  containsMouse(mx, my) { return false; }

  l() { }
  r() { }
  u() { }
  d() { }
  translate(x, y) { }
}

class SensorBox extends GameObject {
  static LEFT = 1;
  static RIGHT = 2;
  static TOP = 4;
  static BOTTOM = 8;
  static SELF = 16;
  static ENTER = 1;
  static LEAVE = 2;

  constructor(x, y, w, h) {
    super();
    w = grid(w, 16);
    h = grid(h, 16);
    x = x;
    y = y;
    this.side = SensorBox.SELF;
    this.parent = this;
    this._CreateBody(x, y, w, h);
    this.collisions_to_handle = [];
  }

  _CreateBody(x, y, w, h) {
    let update = this.body != null;
    let idsToUpdate = [];
    let newIds = [];
    if (!update) {
      this.tex = -1;
      this.fillColor = "#333333";
      this.texcolor = "#000000";
      this.strokeColor = '#000000';
    } else {
      idsToUpdate.push(this.id);
      for (let id of this.child_ids) {
        idsToUpdate.push(id);
      }
      world.DestroyBody(this.body);
    }
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
    this.fixture = f;
    this.id = f.a;
    newIds.push(this.id);
    this.child_ids = [];
    this.body.SetTransform(v2(x / UNITS, y / UNITS), 0)


    // Create sensor shapes for each direction
    const sensorSize = 10; // Percentage of width/height to extend
    this.left = this._CreateSensor(SensorBox.LEFT, -w / (2 * UNITS) - 8 / UNITS, 0, 6 / UNITS, h / (2 * UNITS) - 0.03);
    this.right = this._CreateSensor(SensorBox.RIGHT, w / (2 * UNITS) + 8 / UNITS, 0, 6 / UNITS, h / (2 * UNITS) - 0.03);
    this.top = this._CreateSensor(SensorBox.TOP, 0, -h / (2 * UNITS) - 8 / UNITS, w / (2 * UNITS) - 0.03, 6 / UNITS);
    this.bottom = this._CreateSensor(SensorBox.BOTTOM, 0, h / (2 * UNITS) + 8 / UNITS, w / (2 * UNITS) - 0.03, 6 / UNITS);
    for (let id of this.child_ids) {
      newIds.push(id);
    }

    if (!update) {
      entity_manager.AddDrawable(this);
    }
    for (let i = 0; i < idsToUpdate.length; i++) {
      entity_manager.IdUpdate(idsToUpdate[i], newIds[i]);
    }
    entity_manager._cleanup_now();
    this.sensor_map = new Map();
    this.sensor_map.set(1, new Set());
    this.sensor_map.set(2, new Set());
    this.sensor_map.set(4, new Set());
    this.sensor_map.set(8, new Set());
    this.sensor_map.set(16, new Set());
    this._w = w;
    this._h = h;
    this.updatePropertyCallback("collision_on", this.collision_on);
    this.CreateBodyExtension();
  }

  CreateBodyExtension() {

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
    if (side == SensorBox.SELF) { this.collisions_to_handle.push([type, other]) }
  }

  HandleCollision(type, other) { }

  draw(ctx) {
    this.draw_rect_shape(this.center, ctx);
    // this.draw_rect_shape(this.left, ctx);
    // this.draw_rect_shape(this.right, ctx);
    // this.draw_rect_shape(this.top, ctx);
    // this.draw_rect_shape(this.bottom, ctx);
  }

  _update(dt) {
    for (let i = this.collisions_to_handle.length - 1; i >= 0; i--) {
      let event = this.collisions_to_handle.pop();
      this.HandleCollision(event[0], event[1]);
    }
  }

  draw_rect_shape(shape, ctx) {
    // Get the vertices of the player's body in world coordinates
    const vertices = [];
    // Convert to screen coordinates and scale appropriately
    for (let i = 0; i < shape.GetVertexCount(); i++) {
      const v = shape.GetVertex(i);
      vertices.push({
        x: UNITS * (v.get_x()),
        y: UNITS * (v.get_y())
      });
    }

    let tx = this.body.GetPosition().get_x() * UNITS;
    let ty = this.body.GetPosition().get_y() * UNITS;
    ctx.translate(tx, ty);
    ctx.rotate(this.body.GetAngle());

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
    ctx.strokeStyle = this.selected ? GameObject.SELECTED_FILL_COLOR : this.strokeColor;
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    if (this.tex >= 0) {
      ctx.fillStyle = tex_manager.GetTex(this.tex).pattern(ctx, this.texcolor);
      ctx.fill();
    }
    if (this.selected) {
      ctx.fillStyle = selectTex.pattern(ctx, GameObject.SELECTED_FILL_COLOR);
      ctx.fill();
    }
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.rotate(-this.body.GetAngle());
    ctx.translate(-tx, -ty);
  }

  destroy(removeThis = true) {
    world.DestroyBody(this.body);
    for (let id of this.child_ids) {
      if (!entity_manager.RemoveById(id)) { }
    }
    if (removeThis) {
      entity_manager.Remove(this);
    }
  }

  containsMouse(mx, my) {
    mx += camera.dx();
    my += camera.dy();
    const vertices = [];
    for (let i = 0; i < this.center.GetVertexCount(); i++) {
      const v = this.center.GetVertex(i);
      vertices.push({
        x: UNITS * (this.body.GetPosition().get_x() + v.get_x()),
        y: UNITS * (this.body.GetPosition().get_y() + v.get_y())
      });
    }

    // Check if the mouse position is inside the polygon using ray casting
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;

      // Check if the ray intersects with the edge
      if (((yi > my) !== (yj > my)) && (mx < ((xj - xi) * (my - yi) / (yj - yi)) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  updatePropertyCallback(objectKey, value) {
    if (objectKey == "collision_on") {
      this.fixture.SetSensor(!value);
    }
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
        const entries = Array.from(this.sensor_map.get(value)).map(entity => entity == null ? "NULL!" : entity.constructor.name);
        result += `${key}: ${entries.join(', ')}\n`;
      }
    }
    return result;
  }

  editableProperties() {
    return new PropertyEditor(this)
      .AddProperty(new ColorProperty("Color", "fillColor"), "Colors")
      .AddProperty(new ColorProperty("Texture Color", "texcolor"), "Colors")
      .AddProperty(new ColorProperty("Stroke Color", "strokeColor"), "Colors")
      .AddProperty(new BoolProperty(" Collision On/Off", "collision_on"), "Physics")
      .AddProperty(new TexProperty("Texture", "tex"), "Colors")
      .AddProperty(new DestroyButton(), "Physics");
  }

  static MOVE_BY = 8;

  w() {
    return this._w;
  }
  h() {
    return this._h;
  }
  x() {
    return this.body.GetPosition().get_x() * UNITS;
  }

  y() {
    return this.body.GetPosition().get_y() * UNITS;
  }

  l() {
    this.translate(-SensorBox.MOVE_BY / UNITS, 0);
  }
  r() {
    this.translate(SensorBox.MOVE_BY / UNITS, 0);
  }
  u() {
    this.translate(0, -SensorBox.MOVE_BY / UNITS);
  } this
  d() {
    this.translate(0, SensorBox.MOVE_BY / UNITS);
  }

  deltawidth(dw) {
    this._CreateBody(this.x(), this.y(), this.w() + dw, this.h());
  }

  deltaheight(dh) {
    this._CreateBody(this.x(), this.y(), this.w(), this.h() + dh);
  }

  translate(dx, dy) {
    let t = this.body.GetPosition();
    this.body.SetTransform(v2(t.get_x() + dx, t.get_y() + dy), 0);
  }
}