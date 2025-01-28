class Platform {
  constructor(x, y, w, h, fillColor = "#080") {
    const bodyDef = new b2.b2BodyDef();
    bodyDef.type = b2.b2_staticBody;

    // Create shape
    this.shape = new b2.b2PolygonShape();
    this.shape.SetAsBox(w / (2 * UNITS), h / (2 * UNITS));

    // Create fixture definition
    const fixtureDef = new b2.b2FixtureDef();
    fixtureDef.set_shape(this.shape);
    fixtureDef.set_restitution(0.0);

    // Create the body and add fixture
    this.body = world.CreateBody(bodyDef);
    this.body.SetTransform(new b2.b2Vec2(x / UNITS, y / UNITS), 0)
    this.body.CreateFixture(fixtureDef);
    this.id = this.body.GetFixtureList().a;
    entity_manager.Add(this);
    pls.push(this);
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
    this.fillColor = fillColor;
  }

  draw(ctx) {
    const vertices = [];
    // Convert to screen coordinates and scale appropriately
    for (let i = 0; i < this.shape.GetVertexCount(); i++) {
      const v = this.shape.GetVertex(i);
      vertices.push({
        x: UNITS*(this.body.GetPosition().get_x() + v.get_x()),
        y: UNITS*(this.body.GetPosition().get_y() + v.get_y())
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
    ctx.strokeStyle = '#111';
    ctx.fillStyle = this.fillColor;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  containsMouse(mx, my) {
    const vertices = [];
    for (let i = 0; i < this.shape.GetVertexCount(); i++) {
      const v = this.shape.GetVertex(i);
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

  serialize() {
    return btoa(JSON.stringify({ x: this.x, y: this.y, w: this.w, h: this.h, fillColor: this.fillColor }));
  }

  static deserialize(serializedString) {
    const data = JSON.parse(atob(serializedString));
    return new Platform(data.x, data.y, data.w, data.h, data.fillColor);
  }

  destroy() {
    world.DestroyBody(this.body);
    entity_manager.Remove(this);
    let index = pls.indexOf(this);
    pls.splice(index,1);
  }
}