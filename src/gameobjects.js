class ObjectBox extends SensorBox {
  fillColor = "#ED4";

  Activate() {
    this.fillColor = "#860";
    last_cir = new CircleObject(
      this.body.GetPosition().get_x() * UNITS,
      this.body.GetPosition().get_y() * UNITS - 2 * this.h,
      this.h / 2);
  }
}

var last_cir;

class CircleObject extends Collidable {
  constructor(x, y, r) {
    super();
    this.parent = this;
    this.r = r;
    this.side = SensorBox.SELF;
    var fixDef = new b2.b2FixtureDef();
    let shape = new b2.b2CircleShape(r/UNITS);
    shape.set_m_radius(r/UNITS);
    fixDef.set_shape(shape);
    fixDef.set_restitution(.9);
    fixDef.set_density(.1);

    var bodyDef = new b2.b2BodyDef();
    bodyDef.set_type(b2.b2_dynamicBody);

    this.body = world.CreateBody(bodyDef);
    this.body.SetTransform(v2(x / UNITS, y / UNITS), 0);
    let f = this.body.CreateFixture(fixDef);
    this.id = f.a;
    entity_manager.AddDrawable(this);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.body.GetPosition().get_x() * UNITS,
      this.body.GetPosition().get_y() * UNITS, 
      this.r, 0, 2 * Math.PI);
    ctx.fillStyle = "#69F";
    ctx.fill();

  }

  _Collision(type) {

  }

  containsMouse(mx, my) {
    mx+=camera.dx();
    my+=camera.dy();
    let r = this.r;
    let x = this.body.GetPosition().get_x() * UNITS;
    let y = this.body.GetPosition().get_y() * UNITS;
    return Math.sqrt((mx - x) ** 2 + (my - y) ** 2) <= r;
  }

  _update(dt) { }

  destroy() {
    world.DestroyBody(this.body);
    entity_manager.Remove(this);
  }
}