class EntityManager {
  constructor() {
    this.es = new Map();
    this.to_remove = []
  }

  Add(e) {
    return this.es.set(e.id,e);
  }

  Remove(e) {
    this.to_remove.push(e.id);
  }

  RemoveById(id) {
    this.to_remove.push(id);
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
      this.es.delete(id);
    }
    this.to_remove = [];
  }
}

var entity_manager = new EntityManager();