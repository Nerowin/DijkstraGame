export class Player {
    constructor(context) {
        this.context = context;
        this.config = this.context.config;
        this.elem = this.createElement();
        this.randomizePos();
    }

    createElement() {
        const elem = document.createElement("div");
        elem.innerHTML = "";
        elem.id = "player";
        elem.className = "layer";
        return elem;
    }

    resize() {
        let playerSize = this.config.getPlayerSize();
        let margin = this.config.getSquareSize() / 2;
        Object.assign(this.elem.style, {
            width: `${playerSize}px`,
            height: `${playerSize}px`,
            marginLeft: `${margin}px`,
            marginTop: `${margin}px`,
        });
    }

    draw() {
        this.context.elem.appendChild(this.elem);
        this.resize();
        this.relocate();
    }

    relocate() {
        this.moveTo(this.getX(), this.getY())
        if (this.config.screen.centerOnPlayer) {
            this.context.center(this);
        }
    }

    moveTo(x, y) {
        Object.assign(this.elem.style, {
            left: `${x}px`,
            top: `${y}px`,
        });
    }

    moveRight() {
        if (this.context.getSquare(this.x, this.y).canGoRight()) {
            this.x++;
            this.relocate();
        }
    }

    moveLeft() {
        if (this.context.getSquare(this.x, this.y).canGoLeft()) {
            this.x--;
            this.relocate();
        }
    }

    moveTop() {
        if (this.context.getSquare(this.x, this.y).canGoTop()) {
            this.y--;
            this.relocate();
        }
    }

    moveBottom() {
        if (this.context.getSquare(this.x, this.y).canGoBottom()) {
            this.y++;
            this.relocate();
        }
    }

    moveDirection(direction) {
        switch (direction) {
            case "left":
                return this.moveLeft()
            case "right":
                return this.moveRight()
            case "up":
                return this.moveTop()
            case "down":
                return this.moveBottom()
        }
    }

    getX() {
        let squareSize = this.config.getSquareSize();
        return this.x * squareSize;
    }

    getY() {
        let squareSize = this.config.getSquareSize();
        return this.y * squareSize;
    }

    reset() {
        this.randomizePos();
        this.draw();
    }

    randomizePos() {
        this.x = Math.floor(Math.random() * this.config.size);
        this.y = Math.floor(Math.random() * this.config.size);
    }
}