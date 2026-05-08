import { Square } from './square.js'

export class Frame {
    constructor(config) {
        this.config = config
        this.elem = this.createElement()
        this.nodes = []
        this.init()
    }

    init() {
        for (let y = 0; y < this.config.size; y++) {
            for (let x = 0; x < this.config.size; x++) {
                this.nodes.push(new Square(this, x, y))
            }
        }
    }

    createElement() {
        const elem = document.createElement("div");
        elem.innerHTML = "";
        elem.id = "frame";
        return elem;
    }

    setGrid(bool = false) {
        this.elem.classList.toggle("grid", bool)
    }

    draw() {
        document.body.appendChild(this.elem);
        this.setGrid(this.config.grid);
        this.nodes.forEach(square => square.draw());
        this.center();
    }

    moveTo(x, y) {
        Object.assign(this.elem.style, {
            left: `${x}px`,
            top: `${y}px`,
        })
    }

    relocate() {

    }

    // à faire dans un autre objet
    center(force = false) {
        const player = document.getElementById("player");
        const squareSize = this.config.getSquareSize();
        const marge = squareSize / 2;
        const screenMiddleX = this.elem.parentElement.offsetWidth / 2;
        const screenMiddleY = this.elem.parentElement.offsetHeight / 2;
        const frameWidth = this.elem.offsetWidth;
        const frameHeight = this.elem.offsetHeight;
        const frameMiddleX = frameWidth / 2;
        const frameMiddleY = frameHeight / 2;
        const playerX = parseFloat(player?.style.left) | 0;
        const playerY = parseFloat(player?.style.top) | 0;
        switch (this.config.screen.viewMethod) {
            case "player":
                this.moveTo(
                    screenMiddleX + frameMiddleX - playerX - marge,
                    screenMiddleY + frameMiddleY - playerY - marge,
                )
                break;
            case "default":
                this.moveTo(
                    screenMiddleX - (playerX - frameMiddleX) * 0.5 - marge / 2,
                    screenMiddleY - (playerY - frameMiddleY) * 0.5 - marge / 2,
                )
                break;
        }
        if (force) {
            this.moveTo(
                screenMiddleX,
                screenMiddleY,
            )
        }
    }

    resize() {
        this.nodes.forEach(square => square.resize())
    }

    getSquare(x, y) {
        return this.nodes.find(square => square.x === x && square.y === y)
    }

    randomize() {
        const size = this.config.size;
        const pOpen = this.config.square.pOpen;
        const pMirror = this.config.square.pMirror;

        // Randomly open edges, while keeping symmetry between neighbors
        this.nodes.forEach((square) => {
            const { x, y } = square

            // Right edge (mirror to neighbor's left)
            if (x < size - 1) {
                const open = Math.random() < pOpen
                const mirror = open && Math.random() < pMirror
                square.right = open
                const neighbor = this.getSquare(x + 1, y)
                if (neighbor) neighbor.left = mirror
            }

            // Bottom edge (mirror to neighbor's top)
            if (y < size - 1) {
                const open = Math.random() < pOpen
                const mirror = open && Math.random() < pMirror
                square.bottom = open
                const neighbor = this.getSquare(x, y + 1)
                if (neighbor) neighbor.top = mirror
            }
        })

        // Redraw directions if already rendered
        this.nodes.forEach((square) => square.drawDirections())
    }

    dijkstra(startX, startY, targetX, targetY) {
        const size = this.config.size;
        const n = size * size;

        const idx = (x, y) => y * size + x;

        const inBounds = (x, y) => x >= 0 && x < size && y >= 0 && y < size;
        if (!inBounds(startX, startY)) return [];
        if (!inBounds(targetX, targetY)) return [];

        const start = idx(startX, startY);
        const target = idx(targetX, targetY);

        const INF = Number.POSITIVE_INFINITY;
        const dist = new Array(n).fill(INF);
        const prev = new Array(n).fill(-1);
        const prevAction = new Array(n).fill(null);
        const visited = new Array(n).fill(false);

        dist[start] = 0;

        for (let iter = 0; iter < n; iter++) {
            // node u with smallest dist among unvisited nodes
            let u = -1;
            let best = INF;
            for (let i = 0; i < n; i++) {
                if (!visited[i] && dist[i] < best) {
                    best = dist[i];
                    u = i;
                }
            }

            if (u === -1) break;
            if (u === target) break;

            visited[u] = true;

            const ux = u % size;
            const uy = (u / size) | 0;
            const square = this.getSquare(ux, uy);
            if (!square) continue;

            // Explore neighbors based on square boolean directions
            const tryRelax = (nx, ny, action) => {
                if (!inBounds(nx, ny)) return;
                const v = idx(nx, ny);
                const alt = dist[u] + 1; // uniform cost
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                    prevAction[v] = action;
                }
            };

            // action name corresponds to Player.moveDirection()
            if (square.left && this.getSquare(ux - 1, uy)) tryRelax(ux - 1, uy, "left");
            if (square.right && this.getSquare(ux + 1, uy)) tryRelax(ux + 1, uy, "right");
            if (square.top && this.getSquare(ux, uy - 1)) tryRelax(ux, uy - 1, "up");
            if (square.bottom && this.getSquare(ux, uy + 1)) tryRelax(ux, uy + 1, "down");
        }

        if (start !== target && prev[target] === -1) return [];

        // Reconstruct actions: start -> target
        const actions = [];
        for (let cur = target; cur !== start; cur = prev[cur]) {
            const action = prevAction[cur];
            if (!action) break;
            actions.push({ direction: action });
        }
        actions.reverse();

        return actions;
    }
}