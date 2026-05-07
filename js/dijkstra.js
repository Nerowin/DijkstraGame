export class Dijkstra extends Array {
    constructor(matriceOrWrapper, sx, sy, tx, ty) {
        super();

        const matrice = Array.isArray(matriceOrWrapper) ? matriceOrWrapper : matriceOrWrapper?.matrice;
        const size = matrice.length;
        const n = size * size;
        const squareSize = matrice.squareSize;

        // startX/startY viennent de player.getX/getY (pixels) ; targetX/targetY viennent du dataset (coords grille)
        const toGrid = (v) => {
            const val = Number(v);
            if (squareSize && val > size - 1) return Math.round(val / squareSize);
            return Math.round(val);
        };

        sx = toGrid(sx);
        sy = toGrid(sy);
        tx = toGrid(tx);
        ty = toGrid(ty);

        const idx = (x, y) => y * size + x;
        const start = idx(sx, sy);
        const target = idx(tx, ty);

        const INF = Number.POSITIVE_INFINITY;
        const dist = new Array(n).fill(INF);
        const prev = new Array(n).fill(-1);
        const prevAction = new Array(n).fill(null);
        const visited = new Array(n).fill(false);

        dist[start] = 0;

        for (let iter = 0; iter < n; iter++) {
            // pick unvisited node with smallest distance
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
            const uy = Math.floor(u / size);
            const neighbors = matrice[uy][ux].neighbors;
            for (let k = 0; k < neighbors.length; k++) {
                const nb = neighbors[k];
                const v = idx(nb.x, nb.y);
                const alt = dist[u] + 1;
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                    prevAction[v] = nb.action;
                }
            }
        }

        if (start !== target && prev[target] === -1) return; // unreachable

        // Reconstruct actions (start -> target)
        const actions = [];
        for (let cur = target; cur !== start; cur = prev[cur]) {
            const action = prevAction[cur];
            if (!action) break;
            actions.push(action);
        }
        actions.reverse();

        this.push(...actions);
        this.start = { x: sx, y: sy };
        this.target = { x: tx, y: ty };
    }
}