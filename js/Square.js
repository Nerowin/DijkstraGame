export class Square {
    constructor(context, x, y) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.top = false;
        this.right = false;
        this.bottom = false;
        this.left = false;
        this.elem = this.createElement();
    }

    createElement() {
        let elem = document.createElement("div");
        elem.className = "square";
        elem.dataset.x = String(this.x);
        elem.dataset.y = String(this.y);
        return elem;
    }

    resize() {
        let size = this.context.config.getSquareSize();
        Object.assign(this.elem.style, {
            width: `${size}px`,
            height: `${size}px`,
        });
    }

    draw() {
        this.context.elem.appendChild(this.elem);
        Object.assign(this.elem.style, {
            gridColumn: this.x + 1,
            gridRow: this.y + 1,
        });
        this.resize();
        this.drawDirections();
    }

    canGoRight() {
        return this.right && this.context.getSquare(this.x + 1, this.y);
    }

    canGoTop() {
        return this.top && this.context.getSquare(this.x, this.y - 1);
    }

    canGoLeft() {
        return this.left && this.context.getSquare(this.x - 1, this.y);
    }

    canGoBottom() {
        return this.bottom && this.context.getSquare(this.x, this.y + 1);
    }

    drawDirections() {
        // Avoid duplicating direction elements on redraw
        this.elem.querySelectorAll(".middle, .direction").forEach((n) => n.remove());

        let elem = document.createElement("div");
        elem.className = "middle";
        this.elem.appendChild(elem);
        ["right", "top", "left", "bottom"].forEach(direction => {
            let elem = document.createElement("div");
            let active = this['canGo' + direction.charAt(0).toUpperCase() + direction.slice(1)]();
            elem.className = `direction ${direction}`;
            elem.dataset.direction = direction;
            if (active) {
                elem.classList.add("active");
            }
            this.elem.appendChild(elem);
        })
    }
}

class Grass extends Square {

}