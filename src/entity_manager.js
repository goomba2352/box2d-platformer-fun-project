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

  trackingspeed() {
    let diff = Math.sqrt((this.dx_ - this.idealx()) ** 2  + (this.dy_ - this.idealy()) ** 2);
    if (diff < 20) {
      return 0;
    }
    return (diff-20)/30;
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
    let ts = this.trackingspeed();
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
        t.target = previous.target;
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

  OrderLower(drawable) {
    let previous = null;
    for (let t of this.drawables.values()) {
      let id = t.target.id;
      if (drawable.target.id == id) {
        if (previous == null) {
          return false;
        }
        let temp = t.target;
        t.target = previous.target;
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

var entity_manager = new EntityManager();