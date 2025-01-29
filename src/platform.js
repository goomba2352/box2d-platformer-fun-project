class Platform extends SensorBox {
  fillColor = "#080";
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.body.SetType(b2.b2_staticBody);
  }

  containsMouse(mx, my) {
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