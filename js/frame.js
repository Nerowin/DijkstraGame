import { Square } from './Square.js'

export class Frame {
    constructor(config) {
        this.config = config
        this.elem = this.createElement()
        this.data = []
        this.init()
    }

    init() {
        for (let y = 0; y < this.config.size; y++) {
            for (let x = 0; x < this.config.size; x++) {
                this.data.push(new Square(this, x, y))
            }
        }
    }

    createElement() {
        const elem = document.createElement("div")
        elem.innerHTML = ""
        elem.id = "frame"
        return elem
    }

    setGrid(bool = false) {
        this.elem.classList.toggle("grid", bool)
    }

    draw() {
        document.body.appendChild(this.elem)
        this.setGrid(this.config.grid)
        this.center()
        if (!this.config.screen.centerOnPlayer) {
            Object.assign(this.elem.style, {
                transform: "translate(-50%, -50%)",
            })
        }
        this.data.forEach(square => square.draw())
    }

    moveTo(x, y) {
        Object.assign(this.elem.style, {
            left: `${x}px`,
            top: `${y}px`,
        })
    }

    relocate() {

    }

    center(player) {
        if (player) {
            this.moveTo(
                window.innerWidth / 2 - player.getX(),
                window.innerHeight / 2 - player.getY()
            )
        } else {
            this.moveTo(
                (this.elem.parentElement.offsetWidth - this.elem.offsetWidth) / 2,
                (this.elem.parentElement.offsetHeight - this.elem.offsetHeight) / 2
            )
        }
    }

    resize() {
        this.data.forEach(square => square.resize())
    }

    drag(x, y) {
        const currentLeft = parseFloat(this.elem.style.left || "0") || 0;
        const currentTop = parseFloat(this.elem.style.top || "0") || 0;
        this.elem.style.left = (currentLeft + x) + "px";
        this.elem.style.top = (currentTop + y) + "px";
    }

    getSquare(x, y) {
        return this.data.find(square => square.x === x && square.y === y)
    }

    toMatrice() {
        const size = this.config.size

        // Matrice 2D: matrice[y][x] = { x, y, neighbors: [{x,y,action}, ...] }
        const matrice = Array.from({ length: size }, (_, y) =>
            Array.from({ length: size }, (_, x) => ({ x, y, neighbors: [] }))
        )

        // Métadonnées utiles pour convertir des pixels (player.getX/getY) en coords grille
        matrice.size = size
        matrice.squareSize = this.config.getSquareSize()

        this.data.forEach((square) => {
            const cell = matrice[square.y][square.x]

            if (square.canGoRight()) cell.neighbors.push({ x: square.x + 1, y: square.y, action: "right" })
            if (square.canGoLeft()) cell.neighbors.push({ x: square.x - 1, y: square.y, action: "left" })
            if (square.canGoTop()) cell.neighbors.push({ x: square.x, y: square.y - 1, action: "up" })
            if (square.canGoBottom()) cell.neighbors.push({ x: square.x, y: square.y + 1, action: "down" })
        })

        return matrice
    }

    randomize() {
        const size = this.config.size;
        const pOpen = this.config.square.pOpen;
        const pMirror = this.config.square.pMirror;

        // Randomly open edges, while keeping symmetry between neighbors
        this.data.forEach((square) => {
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
        this.data.forEach((square) => square.drawDirections())
    }
}