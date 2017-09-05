
define(['tile', 'map', 'noise'],
    function (tile, map, noise) {
        var settings = {
            seaLevel: 100,
            heightMap: { octaves: 5.0, persistence: 0.5, scale: 0.01 },
            tempMap: { octaves: 3.0, persistence: 0.5, scale: 0.02 },
            drainMap: { octaves: 3.0, persistence: 0.5, scale: 0.02 },
            moistMap: { octaves: 4.0, persistence: 0.4, scale: 0.01 },
            forest: [150.0, 165.0, 180.0],
            desert: 70.0,
            swamp: 80.0,
            sand: 120.0,
            cold: 74.0,
            hot: 182.0,
            mountNum: 10.0
        };
        function generateMap(map) {
            var heightMap = new noise.FastSimplexNoise({
                min: 0,
                max: 255,
                octaves: settings.heightMap.octaves,
                persistence: settings.heightMap.persistence
            });
            let iterator = map.grid.getTileIterator();
            let currentTile = iterator.next();
            while (currentTile !== null) {
                let pos = map.grid.getPositionById(currentTile.id);
                pos.x *= settings.heightMap.scale, pos.y *= settings.heightMap.scale;
                var heightVal = heightMap.scaled2D(pos.x, pos.y);
                currentTile.height = Math.floor(heightVal);
                if (heightVal < settings.seaLevel) {
                    currentTile.terrain = tile.tileTypes.ocean;
                }
                else {
                    currentTile.terrain = tile.tileTypes.desert;
                }
                currentTile = iterator.next();
            }
        }
        return {
            generateMap: generateMap
        }
    }
);