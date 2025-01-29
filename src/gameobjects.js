class ObjectBox extends SensorBox {
  fillColor="#ED4";

  Activate() {
    this.fillColor = "#860";
  }
}

class CircleObject {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;

    var fixDef = new b2.FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    fixDef.shape = new b2.CircleShape(r / UNITS);

    var bodyDef = new b2.BodyDef();
    bodyDef.type = b2.BodyType.b2_dynamicBody;
    bodyDef.position.x = x / SCALE;
    bodyDef.position.y = y / SCALE;

    this.body = world.CreateBody(bodyDef);
    this.body.CreateFixture(fixDef);
    this.id = this.body.a;
    entity_manager.Add(this);

  }

  _Collision(type) {

  }

  destroy() {
    entity_manager.Remove(this);
  }
}