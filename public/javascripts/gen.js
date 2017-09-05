define(['tile', 'map'],
    function (tile, map) {
        function generateMap(map) {
            let iterator = map.grid.getTileIterator();
            let currentTile = iterator.next();
            while (currentTile !== null) {
                currentTile.terrain = tile.tileTypes.desert;
                currentTile = iterator.next();
            }
        }
        return {
            generateMap: generateMap
        }
    }
);