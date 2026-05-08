export default {
    grid: true,
    size: 15,
    screen: {
        ratio: 1,
        viewMethod: "default",
        viewMethods: {
            default: "Auto",
            player: "Joueur",
            frame: "Libre",
        },
    },
    square: {
        size: 100,
        pOpen: 0.65, // probability to open the "forward" edge
        pMirror: 0.8, // probability to also open the mirrored edge
    },
    player: {
        size: 25,
        speed: 500, // délai de 500ms entre chaque déplacements
    },
    dragState: {
        active: false,
        pointerId: null,
        lastX: 0,
        lastY: 0,
    },
    getSquareSize() {
        return this.square.size * this.screen.ratio;
    },
    getPlayerSize() {
        return this.player.size * this.screen.ratio;
    }
}