// Creates a new floating div.
var pe = null;
class GUIWindow {

  div = null;
  destroy() {
    pe = null;
    document.body.removeChild(this.div);
  }

  constructor(x=10, y=10, w=320, h=200, e) {
    pe = this;
    let div = document.createElement("div");
    this. div = div;
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
    document.body.appendChild(div);

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

    div.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });

    return div;
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
    console.log(input.value);
    input.id = "input-" + AbstractProperty.GLOBAL_ID++;
    input.onchange = (e) => {
      this.value = event.target.value; this._Update(e);
    }
    let label = this._GetBaseLabel();
    label.htmlFor = input.id;
    base.appendChild(input);
    base.appendChild(label);

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

class PropertyEditor {
  properties = [];
  parent = null;

  constructor(parent) {
    console.log(parent);
    this.parent = parent;
  }

  AddProperty(p) {
    p.parent_editor = this;
    p.value = this.parent[p.objectKey];
    console.log(this.parent[p.objectKey]);
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