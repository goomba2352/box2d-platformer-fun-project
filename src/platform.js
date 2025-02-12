class Platform extends SensorBox {
  fillColor = "#008000";
  constructor(x, y, w, h) {
    super(x, y, w, h); 
    this.body.SetType(b2.b2_staticBody);
  }

  serialize() {
    return btoa(JSON.stringify({
      x: this.x(),
      y: this.y(),
      w: this.w(),
      h: this.h(), 
      fillColor: this.fillColor,
      s: this.strokeColor,
      t:this.tex,
      tc:this.texcolor,
      c: this.collision_on }));
  }

  static deserialize(serializedString) {
    const data = JSON.parse(atob(serializedString));
    let p = new Platform(data.x, data.y, data.w, data.h);
    p.fillColor = data.fillColor.length == 7 ? data.fillColor : "008000";
    p.strokeColor = data.s ? data.s : "#000000";
    p.tex = data.t!=null ? data.t : -1;
    p.texcolor = data.tc ? data.tc : "#000000";
    p.collision_on = data.c != null ? data.c : true;
    p.updatePropertyCallback("collision_on", p.collision_on);
    return p;
  }
}