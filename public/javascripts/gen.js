
define(['tile', 'map', 'noise', 'seedrandom'],
    function (TILE, MAP, NOISE, SEEDRANDOM) {
        var settings = {
            seaLevel: 100,
            heightMap: { octaves: 5.0, persistence: 0.5, scale: 0.01 },
            tempMap: { octaves: 3.0, persistence: 0.5, scale: 0.02 },
            drainMap: { octaves: 3.0, persistence: 0.5, scale: 0.02 },
            moistMap: { octaves: 4.0, persistence: 0.4, scale: 0.01 },
            spotMap: { octaves: 4.0, persistence: 0.4, scale: 0.1 },
            mountMap: { octaves: 3.0, persistence: 0.5, scale: 0.05, frequency: 1.0, amplitude: 1.0 },
            mountLevel: 30,
            spot: 80,
            forest: [150.0, 165.0, 180.0],
            desert: 70.0,
            swamp: 80.0,
            sand: 120.0,
            cold: 74.0,
            snow: 50,
            hot: 182.0,
            mountNum: 10.0
        };
        function generateMap(map, seed) {
            Math.seedrandom(seed);
            var heightMap = new NOISE.FastSimplexNoise({
                min: 0,
                max: 255,
                octaves: settings.heightMap.octaves,
                persistence: settings.heightMap.persistence
            });
            var tempMap = new NOISE.FastSimplexNoise({
                min: 96,
                max: 160,
                octaves: settings.tempMap.octaves,
                persistence: settings.tempMap.persistence
            });
            var drainMap = new NOISE.FastSimplexNoise({
                min: 0,
                max: 255,
                octaves: settings.drainMap.octaves,
                persistence: settings.drainMap.persistence
            });
            var moistMap = new NOISE.FastSimplexNoise({
                min: 0,
                max: 255,
                octaves: settings.moistMap.octaves,
                persistence: settings.moistMap.persistence
            });
            var spotMap = new NOISE.FastSimplexNoise({
                min: 0,
                max: 255,
                octaves: settings.spotMap.octaves,
                persistence: settings.spotMap.persistence
            });
            var mountMap = new NOISE.FastSimplexNoise({
                min: 0,
                max: 255,
                octaves: settings.mountMap.octaves,
                persistence: settings.mountMap.persistence,
                frequency: settings.mountMap.frequency,
                amplitude: settings.mountMap.amplitude,
            });
            let iterator = map.grid.getTileIterator();
            let currentTile = iterator.next();
            let i = 0, y = 0;
            let mtList = [];
            while (currentTile !== null) {
                y = Math.floor(i / map.mapWidthInTiles);
                let pos = map.grid.getPositionById(currentTile.id);
                var heightVal = heightMap.scaled2D(pos.x * settings.heightMap.scale, pos.y * settings.heightMap.scale);
                var tempVal = tempMap.scaled2D(pos.x * settings.tempMap.scale, pos.y * settings.tempMap.scale);
                var drainVal = drainMap.scaled2D(pos.x * settings.drainMap.scale, pos.y * settings.drainMap.scale);
                var moistVal = moistMap.scaled2D(pos.x * settings.moistMap.scale, pos.y * settings.moistMap.scale);
                var spotVal = spotMap.scaled2D(pos.x * settings.spotMap.scale, pos.y * settings.spotMap.scale);
                var mountVal = mountMap.scaled2D(pos.x * settings.mountMap.scale, pos.y * settings.mountMap.scale);
                mountVal = Math.abs(mountVal - 128);
                // bias temperature by latitude
                tempVal += (y - map.mapHeightInTiles / 2) * 1.5;
                currentTile.height = Math.floor(heightVal);
                currentTile.temperature = Math.floor(tempVal);
                currentTile.drainage = Math.floor(drainVal);
                currentTile.moisture = Math.floor(moistVal);
                currentTile.mount = Math.floor(mountVal);
                currentTile.setFeature(null);
                if (mountVal < settings.mountLevel) {
                    mtList.push(currentTile);
                }
                if (heightVal < settings.seaLevel) {
                    currentTile.setTerrain(TILE.tileTypes.ocean);
                }
                else {
                    if (tempVal < settings.snow) {
                        // snoooow
                        if (moistVal >= settings.forest[0]) {
                            currentTile.setTerrain(TILE.tileTypes.tundraSnow);
                            if (spotVal >= settings.spot) {
                                if (moistVal < settings.forest[1]) {
                                    currentTile.setFeature(TILE.featureTypes.taigaSnowS);
                                }
                                else if (moistVal < settings.forest[2]) {
                                    currentTile.setFeature(TILE.featureTypes.taigaSnowM);
                                }
                                else {
                                    currentTile.setFeature(TILE.featureTypes.taigaSnowL);
                                }
                            }
                        }
                        else {
                            currentTile.setTerrain(TILE.tileTypes.tundraSnow);
                            if (spotVal < settings.spot) {
                                currentTile.setFeature(TILE.featureTypes.taigaSnowS);
                            }
                        }
                    }
                    else if (tempVal < settings.cold) {
                        // cold biomes
                        if (moistVal >= settings.forest[0]) {
                            currentTile.setTerrain(TILE.tileTypes.tundra);
                            if (spotVal >= settings.spot) {
                                if (moistVal < settings.forest[1]) {
                                    currentTile.setFeature(TILE.featureTypes.taigaS);
                                }
                                else if (moistVal < settings.forest[2]) {
                                    currentTile.setFeature(TILE.featureTypes.taigaM);
                                }
                                else {
                                    currentTile.setFeature(TILE.featureTypes.taigaL);
                                }
                            }
                        }
                        else {
                            currentTile.setTerrain(TILE.tileTypes.tundra);
                            if (spotVal < settings.spot) {
                                currentTile.setFeature(TILE.featureTypes.taigaS);
                            }
                        }
                    }
                    else if (tempVal < settings.hot) {
                        // temperate biomes
                        if (moistVal >= settings.forest[0]) {
                            currentTile.setTerrain(TILE.tileTypes.grassland);
                            if (spotVal >= settings.spot) {
                                if (drainVal >= settings.swamp) {
                                    if (moistVal < settings.forest[1]) {
                                        currentTile.setFeature(TILE.featureTypes.forestS);
                                    }
                                    else if (moistVal < settings.forest[2]) {
                                        currentTile.setFeature(TILE.featureTypes.forestM);
                                    }
                                    else {
                                        currentTile.setFeature(TILE.featureTypes.forestL);
                                    }
                                }
                                else {
                                    currentTile.setTerrain(TILE.tileTypes.swamp);
                                }
                            }
                        }
                        else if (moistVal >= settings.desert) {
                            currentTile.setTerrain(TILE.tileTypes.grassland);
                            if (spotVal < settings.spot) {
                                currentTile.setFeature(TILE.featureTypes.forestS);
                            }
                        }
                        else {
                            if (drainVal >= settings.sand) {
                                currentTile.setTerrain(TILE.tileTypes.desert);
                            }
                            else {
                                currentTile.setTerrain(TILE.tileTypes.semiarid);
                            }
                        }
                    }
                    else {
                        // tropical biomes
                        if (moistVal >= settings.forest[0]) {
                            currentTile.setTerrain(TILE.tileTypes.jungle);
                            //currentTile.setFeature(tile.featureTypes.mountain);
                            // if (moistVal < settings.forest[1]) {
                            //     currentTile.setFeature(tile.featureTypes.jungleS);
                            // }
                            // else if (moistVal < settings.forest[2]) {
                            //     currentTile.setFeature(tile.featureTypes.jungleM);
                            // }
                            // else {
                            //     currentTile.setFeature(tile.featureTypes.jungleL);
                            // }
                        }
                        else if (moistVal >= settings.desert) {
                            currentTile.setTerrain(TILE.tileTypes.savanna);
                            if (spotVal < settings.spot) {
                                currentTile.setTerrain(TILE.tileTypes.jungle);
                            }
                        }
                        else {
                            if (drainVal >= settings.sand) {
                                currentTile.setTerrain(TILE.tileTypes.desert);
                            }
                            else {
                                currentTile.setTerrain(TILE.tileTypes.semiarid);
                            }
                        }
                    }
                }
                currentTile = iterator.next();
                i++;
            }
            for (let a = 0; a < 8; a++) {
                let randIndex = Math.floor(Math.random() * mtList.length);
                let randTile = mtList[randIndex];
                if (randTile.terrain == TILE.tileTypes.ocean) {
                    continue;
                }
                randTile.setFeature(TILE.featureTypes.mountain);
                let frontier = map.grid.getNeighboursById(randTile.id);
                let newFrontier = [];
                let targetSize = Math.floor(Math.random() * 150) + 100;
                let totalSize = 0;
                while (frontier.length > 0) {
                    for (let f in frontier) {
                        if (totalSize >= targetSize) {
                            newFrontier = [];
                            break;
                        }
                        if (frontier[f].feature !== TILE.featureTypes.mountain &&
                            frontier[f].terrain !== TILE.tileTypes.ocean &&
                            mtList.indexOf(frontier[f]) >= 0) {
                            frontier[f].setFeature(TILE.featureTypes.mountain);
                            totalSize++;
                            newFrontier.push.apply(newFrontier, map.grid.getNeighboursById(frontier[f].id));
                        }
                    }
                    frontier = newFrontier;
                    newFrontier = [];
                }
            }
            Math.seedrandom();
        }
        return {
            generateMap: generateMap
        }
    }
);