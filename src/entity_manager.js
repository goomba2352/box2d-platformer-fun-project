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
    for (let drawable of this.drawables.values()) {
      drawable.draw(ctx);
    }
  }

  UpdateAll(dt) {
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