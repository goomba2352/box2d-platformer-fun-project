// Creates a new floating div.
class GUIWindow {

  constructor(x=10, y=10, w=320, h=200, e) {
    let div = document.createElement("div");
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
    titleText.textContent = "Window Title";
    titleText.style.userSelect = "none";
    titleBar.appendChild(titleText);

    let titleBarControls = document.createElement('div');
    titleBarControls.classList.add("title-bar-controls");
    titleBar.appendChild(titleBarControls);

    let closeButton = document.createElement("button");
    closeButton.ariaLabel = "Close";
    closeButton.addEventListener("click", () => {
      div.remove();
    });
    titleBarControls.appendChild(closeButton);

    let contentArea = document.createElement('div');
    contentArea.classList.add("window-body");
    contentArea.style.height = (h - 30) + 'px';
    div.appendChild(contentArea);
    document.body.appendChild(div);

    contentArea.appendChild(e.editableProperties().Render());

    let destroyButton = document.createElement("button");
    destroyButton.textContent = "Destroy";
    destroyButton.addEventListener("click", () => {
      if (e && e.destroy) {
        document.body.removeChild(div);
        e.destroy();
      }
    });
    contentArea.appendChild(destroyButton);


    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener("mousedown", (e) => {
      if (e.target === titleBar || e.target === titleText) { // Only start dragging on title bar or title text
        isDragging = true;
        offsetX = e.clientX - div.offsetLeft;
        offsetY = e.clientY - div.offsetTop;
        e.preventDefault();
      }
    });

    document.addEventListener("mousemove", (e) => {
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

    return div;
  }
}

class AbstractProperty {
  name = "";
  objectKey = "";
  parent_editor;
  value = null;

  constructor(name, objectKey) {
    this.name = name;
    this.objectKey = objectKey;
  }

  _Update(event) {
    this.value = event.target.value;
    this.parent_editor.parent[this.objectKey] = this.value;
    console.log(this.value);
  }

  _GetBaseHTMLElement() {
    let div = document.createElement("div");
    let label = document.createElement("label");
    label.textContent = this.name;
    div.appendChild(label);
    return div; 
  }

  GetHTMLElement() {
    return this._GetBaseHTMLElement();    
  }
}

class ColorProperty extends AbstractProperty {
  GetHTMLElement() {
    let base = this._GetBaseHTMLElement();
    let input = document.createElement("input");
    input.type = "color";
    input.value = this.value;
    input.onchange = (e) => { this._Update(e); }
    base.appendChild(input);

    return base;
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
    console.log(this.parent);
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