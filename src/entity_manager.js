class EntityManager {
  constructor() {
    this.es = new Map();
  }

  Add(e) {
    return this.es.set(e.id,e);
  }

  Remove(e) {
    return this.es.Remove(e.id);
  }

  RemoveById(id) {
    return this.es.Remove(this.Get(id));
  }

  Get(id) {
    return this.es.has(id) ? this.es.get(id) : null;
  }
}

var entity_manager = new EntityManager();