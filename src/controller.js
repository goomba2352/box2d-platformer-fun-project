class Controller {

  static LEFT = "ArrowLeft";
  static RIGHT = "ArrowRight";
  static SPACE = " ";

  constructor() {
    this._keys_down = new Set();
    this._keys_held = new Set();
    this._keys_up = new Set();  
  }

  _key_down(e) {
    if (!this._keys_held.has(e.key)) {
      this._keys_down.add(e.key);
      this._keys_held.add(e.key);
    }
  }

  _key_up(e) {
    // Record key up events, and record that a key is no longer held
    this._keys_up.add(e.key);
    this._keys_held.delete(e.key);
  }

  left() {
    return this._keys_held.has(Controller.LEFT);
  }

  right() {
    return this._keys_held.has(Controller.RIGHT);
  }

  jump() {
    return this._keys_held.has(Controller.SPACE);
  }

  _update() {
    this._keys_down = new Set();
    this._keys_released = new Set();
  }

}

var controller = new Controller();