import config from './config.js'
import { Frame } from './frame.js'
import { Player } from './player.js'

var frame = new Frame(config);
var player = new Player(frame);

frame.draw();
player.draw();
frame.randomize();
setViewMethod(config.screen.viewMethod);

function setViewMethod(method) {
    config.screen.viewMethod = method;
    const span = document.getElementById("screen").querySelector("span");
    if (span) {
        span.textContent = config.screen.viewMethods[method];
    }
}
function nextViewMethod() {
    const keys = Object.keys(config.screen.viewMethods);
    const currentIndex = keys.indexOf(config.screen.viewMethod);
    setViewMethod(keys[(currentIndex + 1) % keys.length]);
}
document.body.addEventListener("click", (e) => {
    // 0) clic sur un bouton d'action (sidebar)
    const actionButton = e.target?.closest?.(".action");
    if (actionButton) {
        e.preventDefault();
        e.stopPropagation();

        switch (actionButton.id) {
            case "screen":
                nextViewMethod();
                frame.center();
                break;
            case "center":
                setViewMethod("frame");
                frame.center(true);
                break;
            case "reload":
                player.reset();
                frame.randomize();
                frame.center();
                break;
        }

        return;
    }

    // 1) clic sur une direction -> inverse le mur (ancien comportement)
    const directionElem = e.target?.closest?.(".direction");
    if (directionElem) {
        e.preventDefault();
        e.stopPropagation();

        const squareElem = directionElem.closest(".square");
        if (!squareElem) return;

        const x = Number(squareElem.dataset.x);
        const y = Number(squareElem.dataset.y);
        const dir = directionElem.dataset.direction;
        if (!Number.isFinite(x) || !Number.isFinite(y) || !dir) return;

        const square = frame.getSquare(x, y);
        if (!square || typeof square[dir] !== "boolean") return;

        square[dir] = !square[dir];
        square.drawDirections();
        return;
    }

    // 2) clic sur div.middle -> calcule le chemin et déplace le joueur
    const isMiddle = e.target?.classList?.contains?.("middle");
    if (!isMiddle) return;

    e.preventDefault();
    e.stopPropagation();

    const middleElem = e.target;
    const squareElem = middleElem.closest(".square");
    if (!squareElem) return;

    const x = Number(squareElem.dataset.x);
    const y = Number(squareElem.dataset.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    const actions = frame.dijkstra(player.x, player.y, x, y);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const playActions = async (actions) => {
        for (const action of actions) {
            const direction = action?.direction ?? action;
            player.moveDirection(direction);
            frame.center();
            await sleep(config.player.speed);
        }
    };

    playActions(actions);
});

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowRight":
            e.preventDefault()
            player.moveRight()
            break
        case "ArrowLeft":
            e.preventDefault()
            player.moveLeft()
            break
        case "ArrowUp":
            e.preventDefault()
            player.moveTop()
            break
        case "ArrowDown":
            e.preventDefault()
            player.moveBottom()
            break
    }
    frame.center();
});

window.addEventListener("wheel", (e) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    config.screen.ratio = Math.min(3, Math.max(0.3, config.screen.ratio * zoomFactor))
    frame.resize()
    frame.relocate()
    player.resize()
    player.relocate()
}, { passive: false })

document.body.addEventListener("pointerdown", (e) => {
    if (e.button !== 1) return;
  
    e.preventDefault();
  
    config.dragState.active = true;
    config.dragState.pointerId = e.pointerId;
    config.dragState.lastX = e.clientX;
    config.dragState.lastY = e.clientY;
  
    document.body.style.cursor = "move";
  
    document.body.setPointerCapture(e.pointerId);
  });

document.body.addEventListener("pointermove", (e) => {
    if (!config.dragState.active) return;
    if (config.dragState.pointerId !== e.pointerId) return;

    setViewMethod("frame");

    const dx = e.clientX - config.dragState.lastX;
    const dy = e.clientY - config.dragState.lastY;

    config.dragState.lastX = e.clientX;
    config.dragState.lastY = e.clientY;

    const left = parseFloat(getComputedStyle(frame.elem).left);
    const top = parseFloat(getComputedStyle(frame.elem).top);

    frame.moveTo(left + dx, top + dy);
});

function endDrag(e) {
    if (!config.dragState.active) return;
    if (config.dragState.pointerId !== e.pointerId) return;
    
    config.dragState.active = false;
    config.dragState.pointerId = null;
  
    document.body.style.cursor = "";
  }

document.body.addEventListener("pointerup", endDrag);
document.body.addEventListener("pointercancel", endDrag);
