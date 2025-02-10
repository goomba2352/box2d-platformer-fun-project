class DrawableEntity {
  target;
  constructor(target) {
    this.target = target;
    this.target.__removekey=this;
  }

  draw(ctx) {
    this.target.draw(ctx);
  }

  _update(dt) {
    this.target._update(dt);
  }

}

class Camera {
  dx_ = 0;
  dy_ = 0;

  trackingspeed(dt, dx, dy) {
    let diff = Math.sqrt(dx ** 2 + dy ** 2);
    if (diff < 20) {
      return 0;
    }
    return (diff-20)*dt*1.5;
  }

  idealx() {
    return player.position().get_x() * UNITS - canvas.width / 2;
  }

  idealy() {
    return player.position().get_y() * UNITS - canvas.height / 2;
  }

  dx() {
    return Math.floor(this.dx_);
  }
  dy() {
    return Math.floor(this.dy_);
  }

  _update(dt) {
    let dx = this.dx_ - this.idealx();
    let dy = this.dy_ - this.idealy();
    let ts = this.trackingspeed(dt, dx, dy);
    let rad = Math.atan2(dy, dx);
    this.dx_ -= ts * Math.cos(rad);
    this.dy_ -= ts * Math.sin(rad);
  }
}

var camera = new Camera();

class EntityManager {
  constructor() {
    this.es = new Map();
    this.drawables = new Set();
    this.to_remove = []
  }

  Add(e) {
    return this.es.set(e.id, e);
  }

  AddDrawable(e) {
    this.es.set(e.id, e);
    this.drawables.add(new DrawableEntity(e));
  }


  AddById(e, id) {
    this.es.set(id, e);
  }

  Remove(e) {
    this.to_remove.push(e.id);
    this.es.has(e.id);
  }

  RemoveById(id) {
    this.to_remove.push(id);
    return this.es.has(id);
  }

  OrderHigher(drawable) {
    let previous = null;
    let swap_next = false;
    for (let t of this.drawables.values()) {
      if (swap_next) {
        let temp = t.target;
        let tempkey = t.target.__removekey;

        t.target.__removekey = previous.target.__removekey;
        t.target = previous.target;
        
        previous.target.__removekey = tempkey;
        previous.target = temp;

        break;
      }
      let id = t.target.id;
      if (drawable.target.id == id) {
        swap_next = true;
      }
      previous = t;
    }
  }

  PlayerOrder() {
    let result = 0;
    for (let i of this.drawables.values()) {
      if (i.target instanceof Player) {
        return result;
      }
      result++;
    }
    return -1;
  }

  OrderLower(drawable) {
    let previous = null;
    for (let t of this.drawables.values()) {
      let id = t.target.id;
      if (drawable.target.id == id) {
        if (previous == null) {
          return false;
        }
        let temp = t.target;
        let tempkey = t.target.__removekey;

        t.target.__removekey = previous.target.__removekey;
        t.target = previous.target;
        
        previous.target.__removekey = tempkey;
        previous.target = temp;

        
        break;
      }
      previous = t;
    }
  }

  DrawAll(ctx) {
    ctx.translate(-camera.dx(),-camera.dy());
    for (let drawable of this.drawables.values()) {
      drawable.draw(ctx);
    }
    ctx.translate(camera.dx(),camera.dy());
  }

  UpdateAll(dt) {
    camera._update(dt);
    for (let drawable of this.drawables.values()) {
      drawable._update(dt);
    }
  }

  size() {
    return this.es.size;
  }

  Get(id) {
    return this.es.has(id) ? this.es.get(id) : null;
  }

  _cleanup_now() {
    this._update();
  }

  _update() {
    for (id of this.to_remove) {
      let e = this.es.get(id);
      this.es.delete(id);
      this.drawables.delete(e.__removekey);
    }
    this.to_remove = [];
  }
}

class Tex {
  _canvas;
  _bits;
  _available_colors = new Map();
  _size;
  constructor(size) {
    this._size=size;
    this._canvas = document.createElement("canvas");
    this._canvas.width=2*this._size;
    this._canvas.height=2*this._size;
    this._bits = new Uint8Array(8);
    this._bits[0]=0b00110011;
    this._bits[1]=0b00110011;
    this._bits[2]=0b11001100;
    this._bits[3]=0b11001100;
    this._bits[4]=0b00110011;
    this._bits[5]=0b00110011;
    this._bits[6]=0b11001100;
    this._bits[7]=0b11001100;
  }

  context() {
    return this._canvas.getContext("2d");
  }

  updatePropertyCallback(k,v) {
    this.markUpdated();
  }

  markUpdated() {
    this._available_colors = new Map();
    this._canvas.width=2*this._size;
    this._canvas.height=2*this._size;
  }

  serialize() {
    return btoa(JSON.stringify({
      b: btoa(String.fromCharCode.apply(null, this._bits)),
      s: this._size
    }));
  }

  deserialize(serializedString) {
    const data = JSON.parse(atob(serializedString));
    this._bits = Uint8Array.from(atob(data.b), c => c.charCodeAt(0));
    this._size=data.s;
    this.markUpdated();
  }

  pattern(ctx, color) {
    if (!this._available_colors.has(color)) {
      let context = this.context();
      context.clearRect(0,0,16,16);
      for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 8; ++col) {
          if ((this._bits[row] >> col) & 1) {
            context.fillStyle = color;
          } else {
            context.fillStyle = "#00000000";
          }
          context.fillRect(2*col, 2*row, 2, 2);
        }
      }
      this._available_colors.set(color, ctx.createPattern(this._canvas, "repeat"));
    }
    return this._available_colors.get(color);
  }
}

class TexManager {
  texs = [];

  CreateTex(size) {
    this.texs.push(new Tex(size));
    return this.texs[this.texs.length-1];
  }

  GetTex(id) {
    return this.texs[id];
  }

  serialize() {
    let texsSerialized = [];
    this.texs.forEach(t => texsSerialized.push(t.serialize()));
    return btoa(JSON.stringify({
      t: texsSerialized,
    }));
  }

  deserialize(serializedString) {
    const data = JSON.parse(atob(serializedString));
    for (let i = 0;  i < data.t.length; i++) {
      if (this.texs.length<=i) {
        this.CreateTex(data.t[i].s);
      }
      this.texs[i].deserialize(data.t[i]);
    }
  }
}

class SerializableProperty {
  serialize() {
    return btoa(JSON.stringify(this));
  }

  from(serializedString) {
    const data = JSON.parse(atob(serializedString));
    console.log(data);  
    for (let k of Object.keys(data)) {
      this[k] = data[k];
    }
    return this;
  }
  
  static deserialize(serializedString) {
    let x = new SerializableProperty();
    return x.from(serializedString);
  }
}

class RenderProperty extends SerializableProperty {
  fc = "#FFFFFF"
  sc = "#000000"
  tc = "#000000"
  t = -1;
}

var entity_manager = new EntityManager();
var tex_manager = new TexManager();
var tex0 = tex_manager.CreateTex(8);
for (let i = 0; i < 10; i++) {
  tex_manager.CreateTex(8);
}
tex0.markUpdated();
var selectTex = new Tex(8);