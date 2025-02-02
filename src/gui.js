// Creates a new floating div.
class GUIWindow {

  constructor(x, y, w, h) {
    let div = document.createElement("div");
    div.style.position = "fixed";
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = w + "px";
    div.style.height = h + "px";
    div.style.backgroundColor = "#BBB";
    div.style.border = "1px solid black";
    div.style.zIndex = "1000";

    let titleBar = document.createElement("div");
    titleBar.style.height = "30px";
    titleBar.style.background = "linear-gradient(to right, #008, #77F)";
    titleBar.style.color = "white";
    titleBar.style.lineHeight = "30px";
    titleBar.style.padding = "0 5px";
    titleBar.style.display = "flex";
    titleBar.style.justifyContent = "space-between";
    titleBar.style.alignItems = "center";
    div.appendChild(titleBar);

    let title = document.createElement('span');
    title.textContent = "Window Title";
    title.style.userSelect = "none";
    titleBar.appendChild(title)

    let closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.color = "white";
    closeButton.style.fontSize = "16px";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", () => {
        div.remove();
    });
    titleBar.appendChild(closeButton);

    let contentArea = document.createElement('div');
    contentArea.style.height = (h - 30) + 'px';
    contentArea.style.backgroundColor = "#BBB";
    div.appendChild(contentArea);
          document.body.appendChild(div);
      
          let isDragging = false;
          let offsetX, offsetY;
      
    titleBar.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - div.offsetLeft;
            offsetY = e.clientY - div.offsetTop;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        div.style.left = (e.clientX - offsetX) + "px";
        div.style.top = (e.clientY - offsetY) + "px";
      e.preventDefault();
      }
    });

    titleBar.addEventListener("mouseup", (e) => {
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