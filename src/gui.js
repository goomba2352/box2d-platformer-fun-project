// Creates a new floating div.
var pe = null;
class GUIWindow {

  div = null;
  destroy() {
    pe = null;
    document.body.removeChild(this.div);
  }

  constructor(x = 10, y = 10, w = 320, h = 200, e) {
    pe = this;
    let div = document.createElement("div");
    this.div = div;
    div.classList.add("window");
    div.style.position = "fixed";
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = w + "px";
    div.style.height = h + "px";
    div.style.zIndex = "1000";
    let titleBar = document.createElement("div");
    titleBar.classList.add("title-bar");
    div.appendChild(titleBar);

    let titleText = document.createElement('div');
    titleText.classList.add("title-bar-text");
    titleText.textContent = "Editing " + e.constructor.name;
    titleText.style.userSelect = "none";
    titleBar.appendChild(titleText);

    let titleBarControls = document.createElement('div');
    titleBarControls.classList.add("title-bar-controls");
    titleBar.appendChild(titleBarControls);

    let closeButton = document.createElement("button");
    closeButton.ariaLabel = "Close";
    closeButton.addEventListener("click", () => {
      this.destroy();
    });
    titleBarControls.appendChild(closeButton);

    let contentArea = document.createElement('div');
    contentArea.classList.add("window-body");
    contentArea.style.height = (h - 30) + 'px';
    div.appendChild(contentArea);

    let props = e.editableProperties().Render();
    let destroyButton = document.createElement("button");
    let destroyButtonDiv = document.createElement("div");
    destroyButtonDiv.classList += "field-row";
    destroyButtonDiv.appendChild(destroyButton);
    props.appendChild(destroyButtonDiv);
    contentArea.appendChild(props);

    destroyButton.textContent = "Destroy";
    destroyButton.addEventListener("click", () => {
      if (e && e.destroy) {
        e.destroy();
        this.destroy();
      }
    });



    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.target === titleBar || e.target === titleText) { // Only start dragging on title bar or title text
        isDragging = true;
        offsetX = e.clientX - div.offsetLeft;
        offsetY = e.clientY - div.offsetTop;
        e.preventDefault();
      }
    });

    document.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (isDragging) {
        div.style.left = (e.clientX - offsetX) + "px";
        div.style.top = (e.clientY - offsetY) + "px";
        e.preventDefault();
      }
    });

    document.addEventListener("mouseup", (e) => {
      isDragging = false;
      e.preventDefault();
    });

    div.addEventListener('selectstart', function (e) {
      e.preventDefault();
      return false;
    });

    div.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    document.body.appendChild(div);
    return div;
  }
}

class SelectionWindow {
  
}

class ObjectWindow {
  constructor() {
    this.div = document.createElement("div");
    this.div.classList.add("window");
    this.div.style.position = "fixed";
    this.resize();

    let contentArea = document.createElement('div');
    contentArea.classList.add("window-body");
    contentArea.style.height = (h - 30) + 'px';
    this.div.appendChild(contentArea);

    document.body.appendChild(this.div);
  }

  resize() {
    this.div.style.left = 20 + "px";
    this.div.style.bottom = 20 + "px";
    this.div.style.right = 20 + "px";
    this.div.style.height = 64 + "px";
    this.div.style.zIndex = "999";
  }
}

class AbstractProperty {
  name = "";
  objectKey = "";
  parent_editor;
  value = null;
  static GLOBAL_ID = 0;

  constructor(name, objectKey) {
    this.name = name;
    this.objectKey = objectKey;
  }

  _Update(event) {
    this.parent_editor.parent[this.objectKey] = this.value;
    this.parent_editor.parent.updatePropertyCallback(this.objectKey, this.value);
  }

  _GetBaseLabel() {
    let label = document.createElement("label");
    label.textContent = this.name;
    return label
  }

  GetHTMLElement() {
    return this._GetBaseHTMLElement();
  }
}

class ColorProperty extends AbstractProperty {
  GetHTMLElement() {
    let base = document.createElement("div");
    base.classList += "field-row";
    let input = document.createElement("input");
    input.type = "color";
    input.value = this.value;
    input.id = "input-" + AbstractProperty.GLOBAL_ID++;
    input.onchange = (e) => {
      this.value = event.target.value; this._Update(e);
    }
    let label = this._GetBaseLabel();
    label.htmlFor = input.id;
    base.appendChild(input);
    base.appendChild(label);
    let button = document.createElement("button");
    button.onclick = (e) => {
      this.value="#00000000";
      this._Update(e);
    }
    button.innerText = "Hide";
    base.appendChild(button);

    return base;
  }
}

class BoolProperty extends AbstractProperty {
  GetHTMLElement() {
    let base = document.createElement("div");
    let input = document.createElement("input");
    base.classList += "field-row";
    input.type = "checkbox";
    input.id = "input-" + AbstractProperty.GLOBAL_ID++;
    input.checked = this.value;
    input.onchange = (e) => { this.value = input.checked; this._Update(e); }
    let label = this._GetBaseLabel();
    label.htmlFor = input.id;
    base.appendChild(input);
    base.appendChild(label);

    return base;
  }
}

var te = null;

class SelectProperty extends AbstractProperty {
  constructor(name, objectKey, options, values) {
    super(name, objectKey);
    if (options.length != values.length) {
      throw Exception("options and values different sizes");
    }
    this.options = options;
    this.values = values;
  }
  GetHTMLElement() {
    let base = document.createElement("div");    base.classList += "field-row";
    let input = document.createElement("select");
    for (let i = 0; i < this.options.length; i++) {
      let option = document.createElement("option");
      option.innerText = this.options[i]; 
      option.value = this.values[i];
      input.appendChild(option);
    }
    input.onchange = (e) => { this.value = parseInt(e.target.value); this._Update(e); }
    let label = this._GetBaseLabel();
    label.htmlFor = input.id;
    input.value = this.parent_editor.parent[this.objectKey];
    base.appendChild(input);
    base.appendChild(label);

    return base;
  }
}


class TexProperty extends AbstractProperty {
  GetHTMLElement() {
    let base = document.createElement("div");    base.classList += "field-row";
    let input = document.createElement("select");
    let notex = document.createElement("option");
    notex.value = -1;
    notex.innerText="No Texture";
    input.appendChild(notex);
    for (let i = 0; i < tex_manager.texs.length; i++) {
      let option = document.createElement("option");
      option.innerText = "Texture " + i;
      option.value = i;
      input.appendChild(option);
    }
    input.onchange = (e) => { this.value = parseInt(e.target.value); this._Update(e); }
    let label = this._GetBaseLabel();
    label.htmlFor = input.id;
    input.value = this.parent_editor.parent.tex;
    let edit = document.createElement("button");
    edit.innerText="Edit"
    edit.onclick = function (e) {
      if (input.value < 0) return;
      if (te != null) {
        te.destroy();
        te = null;
      }
      te = new TexEditor(input.value);
    }
    edit.style.minWidth="25px";
    base.appendChild(input);
    base.appendChild(edit);
    base.appendChild(label);

    return base;
  }
}

class TexEditor {
  destroy() {
    document.body.removeChild(this.div);
    document.removeEventListener("mouseup", this.removeMe);
    te=null;
  }
  constructor(tex) {
    let div = document.createElement("div");
    this.div = div;
    this.div.classList.add("window");
    this.div.style.position = "fixed";
    this.div.style.left = 10 + "px";
    this.div.style.top = 10 + "px";
    this.div.style.width = 320 + "px";
    this.div.style.height = 240 + "px";
    this.div.style.zIndex = "1001";
    let titleBar = document.createElement("div");
    titleBar.classList.add("title-bar");
    div.appendChild(titleBar);

    let titleText = document.createElement('div');
    titleText.classList.add("title-bar-text");
    titleText.textContent = "Texture Editor";
    titleText.style.userSelect = "none";
    titleBar.appendChild(titleText);

    let titleBarControls = document.createElement('div');
    titleBarControls.classList.add("title-bar-controls");
    titleBar.appendChild(titleBarControls);

    let closeButton = document.createElement("button");
    closeButton.ariaLabel = "Close";
    closeButton.addEventListener("click", () => {
      this.destroy();
    });
    titleBarControls.appendChild(closeButton);

    let contentArea = document.createElement('div');
    contentArea.classList.add("window-body");
    contentArea.style.height = (h - 30) + 'px';
    div.appendChild(contentArea);

    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.target === titleBar || e.target === titleText) { // Only start dragging on title bar or title text
        isDragging = true;
        offsetX = e.clientX - div.offsetLeft;
        offsetY = e.clientY - div.offsetTop;
        e.preventDefault();
      }
    });

    document.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (isDragging) {
        div.style.left = (e.clientX - offsetX) + "px";
        div.style.top = (e.clientY - offsetY) + "px";
        e.preventDefault();
      }
    });

    document.addEventListener("mouseup", (e) => {
      isDragging = false;
      e.preventDefault();
    });

    div.addEventListener('selectstart', function (e) {
      e.preventDefault();
      return false;
    });

    div.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    // Edits bits in the 8x8 bits below
    // bits is a Uint8Array of size 8
    let bits = tex_manager.GetTex(tex)._bits;

    let pixelEditor = document.createElement("canvas");
    pixelEditor.width = 128;
    pixelEditor.height = 128;

    let draw = function(ctx) {
      for (let i = 0; i < bits.length; i++) {
        for (let j = 0; j < 8; j++) {
          ctx.fillStyle = "#FFF"
          if (bits[i] >> j & 1) {
            ctx.fillStyle = "#000"
          }
          ctx.fillRect(16*j,16*i,16,16);
        }
      }
      for (let i = 0; i < bits.length; i++) {
        ctx.strokeStyle = "#808080";
        ctx.beginPath();
        ctx.moveTo(0, 16 * i);
        ctx.lineTo(128, 16 * i);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16 * i, 0);
        ctx.lineTo(16 * i, 128);
        ctx.stroke();
      }
    }
    draw(pixelEditor.getContext("2d"));
    let down = false;
    let unset = false;
    let lasti = -1;
    let lastj = -1;

    pixelEditor.addEventListener("mousedown", function(e) {
      down = true;
      lasti = Math.floor(e.offsetY/16);
      lastj = Math.floor(e.offsetX/16);
      unset = bits[lasti] >> lastj & 1;
      if (unset) {
        bits[lasti] = bits[lasti] - (1<<lastj);
      } else {
        bits[lasti] |= 1 << lastj;
      }
      draw(pixelEditor.getContext("2d"));
      tex_manager.GetTex(tex).markUpdated();
    });

    pixelEditor.addEventListener("mousemove", function (e) {
      e.preventDefault();
      if (!down) { return; }
      let ti = Math.floor(e.offsetY/16);
      let tj = Math.floor(e.offsetX/16);
      if (ti==lasti && tj==lastj) { return; }
      lasti=ti;
      lastj=tj;
      let is_set = bits[lasti] >> lastj & 1;
      let update=false;
      if (unset && is_set) {
        bits[lasti] = bits[lasti] - (1<<lastj);
        update=true;
      } else if (!unset && !is_set) {
        bits[lasti] |= 1 << lastj;
        update=true;
      }
      if (update) {
        draw(pixelEditor.getContext("2d"));
        tex_manager.GetTex(tex).markUpdated();
      }
    })
    this.removeMe = function(e) {
      down = false;
      lasti = -1;
      lastj = -1;
    }
    pixelEditor.addEventListener("mouseup", this.removeMe);
    document.addEventListener("mouseup", this.removeMe)
    div.appendChild(pixelEditor);

    let props = new PropertyEditor(tex_manager.GetTex(tex))
      .AddProperty(new SelectProperty("Texture size", "_size", ["7x7", "8x8"], [7, 8]))
    div.appendChild(props.Render());

    document.body.appendChild(div);
  }
}


class PropertyEditor {
  properties = [];
  parent = null;

  constructor(parent) {
    this.parent = parent;
  }

  AddProperty(p) {
    p.parent_editor = this;
    p.value = this.parent[p.objectKey];
    this.properties.push(p);
    return this;
  }

  Render() {
    let div = document.createElement("div");
    for (let p of this.properties) {
      div.appendChild(p.GetHTMLElement());
    }
    return div;
  }
}