export default {
    grid: true,
    size: 5,
    screen: {
        ratio: 1,
        centerOnPlayer: false,
    },
    square: {
        size: 100,
        pOpen: 0.65, // probability to open the "forward" edge
        pMirror: 0.8, // probability to also open the mirrored edge
    },
    player: {
        size: 25
    },
    dragState: {
        active: false,
        pointerId: null,
        lastX: 0,
        lastY: 0,
    },
    getSquareSize() {
        return this.square.size * this.screen.ratio
    },
    getPlayerSize() {
        return this.player.size * this.screen.ratio
    }
}