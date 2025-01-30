class Platform extends SensorBox {
  fillColor = "#080";
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.body.SetType(b2.b2_staticBody);
  }

  serialize() {
    return btoa(JSON.stringify({ x: this.x, y: this.y, w: this.w, h: this.h, fillColor: this.fillColor }));
  }

  static deserialize(serializedString) {
    const data = JSON.parse(atob(serializedString));
    let p = new Platform(data.x, data.y, data.w, data.h);
    p.fillColor = data.fillColor;
    return p;
  }
}