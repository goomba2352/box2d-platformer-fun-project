class Platform {
  constructor(x, y, w, h) {
    // Create body definition for platform
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
    ctx.fillStyle = "#080";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}