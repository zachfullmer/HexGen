
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
            snow: 50,
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
            var tempMap = new noise.FastSimplexNoise({
                min: 96,
                max: 160,
                octaves: settings.tempMap.octaves,
                persistence: settings.tempMap.persistence
            });
            var drainMap = new noise.FastSimplexNoise({
                min: 0,
                max: 255,
                octaves: settings.drainMap.octaves,
                persistence: settings.drainMap.persistence
            });
            var moistMap = new noise.FastSimplexNoise({
                min: 0,
                max: 255,
                octaves: settings.moistMap.octaves,
                persistence: settings.moistMap.persistence
            });
            let iterator = map.grid.getTileIterator();
            let currentTile = iterator.next();
            let i = 0, y = 0;
            while (currentTile !== null) {
                y = Math.floor(i / map.mapWidthInTiles);
                let pos = map.grid.getPositionById(currentTile.id);
                var heightVal = heightMap.scaled2D(pos.x * settings.heightMap.scale, pos.y * settings.heightMap.scale);
                var tempVal = tempMap.scaled2D(pos.x * settings.tempMap.scale, pos.y * settings.tempMap.scale);
                var drainVal = drainMap.scaled2D(pos.x * settings.drainMap.scale, pos.y * settings.drainMap.scale);
                var moistVal = moistMap.scaled2D(pos.x * settings.moistMap.scale, pos.y * settings.moistMap.scale);
                // bias temperature by latitude
                tempVal += (y - map.mapHeightInTiles / 2) * 1.5;
                currentTile.height = Math.floor(heightVal);
                currentTile.temperature = Math.floor(tempVal);
                currentTile.drainage = Math.floor(drainVal);
                currentTile.moisture = Math.floor(moistVal);
                currentTile.feature = null;
                if (heightVal < settings.seaLevel) {
                    currentTile.terrain = tile.tileTypes.ocean;
                }
                else {
                    // forest: [150.0, 165.0, 180.0],
                    // desert: 70.0,
                    // swamp: 80.0,
                    // sand: 120.0,
                    // mountNum: 10.0
                    if (tempVal < settings.snow) {
                        currentTile.terrain = tile.tileTypes.tundraSnow;
                        if (moistVal >= settings.forest[0]) {
                            if (moistVal < settings.forest[1]) {
                                currentTile.feature = tile.featureTypes.taigaSnowS;
                            }
                            else if (moistVal < settings.forest[2]) {
                                currentTile.feature = tile.featureTypes.taigaSnowM;
                            }
                            else {
                                currentTile.feature = tile.featureTypes.taigaSnowL;
                            }
                        }
                    }
                    else if (tempVal < settings.cold) {
                        // cold biomes
                        currentTile.terrain = tile.tileTypes.tundra;
                        if (moistVal >= settings.forest[0]) {
                            if (moistVal < settings.forest[1]) {
                                currentTile.feature = tile.featureTypes.taigaS;
                            }
                            else if (moistVal < settings.forest[2]) {
                                currentTile.feature = tile.featureTypes.taigaM;
                            }
                            else {
                                currentTile.feature = tile.featureTypes.taigaL;
                            }
                        }
                    }
                    else if (tempVal < settings.hot) {
                        // temperate biomes
                        if (moistVal >= settings.forest[0]) {
                            currentTile.terrain = tile.tileTypes.grassland;
                            if (drainVal >= settings.swamp) {
                                if (moistVal < settings.forest[1]) {
                                    currentTile.feature = tile.featureTypes.forestS;
                                }
                                else if (moistVal < settings.forest[2]) {
                                    currentTile.feature = tile.featureTypes.forestM;
                                }
                                else {
                                    currentTile.feature = tile.featureTypes.forestL;
                                }
                            }
                            else {
                                currentTile.terrain = tile.tileTypes.swamp;
                            }
                        }
                        else if (moistVal >= settings.desert) {
                            currentTile.terrain = tile.tileTypes.grassland;
                        }
                        else {
                            if (drainVal >= settings.sand) {
                                currentTile.terrain = tile.tileTypes.desert;
                            }
                            else {
                                currentTile.terrain = tile.tileTypes.semiarid;
                            }
                        }
                    }
                    else {
                        // tropical biomes
                        if (moistVal >= settings.forest[0]) {
                            currentTile.terrain = tile.tileTypes.jungle;
                            // if (moistVal < settings.forest[1]) {
                            //     currentTile.feature = tile.featureTypes.jungleS;
                            // }
                            // else if (moistVal < settings.forest[2]) {
                            //     currentTile.feature = tile.featureTypes.jungleM;
                            // }
                            // else {
                            //     currentTile.feature = tile.featureTypes.jungleL;
                            // }
                        }
                        else if (moistVal >= settings.desert) {
                            currentTile.terrain = tile.tileTypes.savanna;
                        }
                        else {
                            if (drainVal >= settings.sand) {
                                currentTile.terrain = tile.tileTypes.desert;
                            }
                            else {
                                currentTile.terrain = tile.tileTypes.semiarid;
                            }
                        }
                    }
                }
                currentTile = iterator.next();
                i++;
            }
        }
        return {
            generateMap: generateMap
        }
    }
);