
define(['hex', 'tile', 'sprites', 'color', 'pixi'],
    function (HexGrid, tile, sprites, color, PIXI) {
        function cubeRound(cube) {
            var rx = Math.round(cube.x)
            var ry = Math.round(cube.y)
            var rz = Math.round(cube.z)
            var xDiff = Math.abs(rx - cube.x);
            var yDiff = Math.abs(ry - cube.y);
            var zDiff = Math.abs(rz - cube.z);
            if (xDiff > yDiff && xDiff > zDiff) {
                rx = -ry - rz;
            }
            else if (yDiff > zDiff) {
                ry = -rx - rz;
            }
            else {
                rz = -rx - ry;
            }
            return { x: rx, y: ry, z: rz };
        }
        function oddrToCube(x, y) {
            var xCube = x - (y - (y & 1)) / 2;
            var zCube = y;
            var yCube = -x - z;
        }
        function axialToCube(axial) {
            var x = axial.q;
            var z = axial.r;
            var y = -x - z;
            return { x: x, y: y, z: z };
        }
        function cubeToAxial(cube) {
            var q = cube.x;
            var r = cube.z;
            return { q: q, r: r };
        }
        function axialToOffset(axial) {
            var x = axial.q + Math.floor(axial.r / 2);
            var y = axial.r;
            return { x: x, y: y };
        }
        function offsetToAxial(offset) {
            var q = offset.x - Math.floor(offset.y / 2);
            var r = offset.y;
            return { q: q, r: r };
        }
        function Tile() {
            this.id = 0;
            this.terrain = null;
            this.feature = null;
            this.spriteContainer = new PIXI.Container();
            this.terrainSprite = new PIXI.Sprite();
            this.featureSprite = new PIXI.Sprite();
            this.spriteContainer.addChild(this.featureSprite);
            this.featureOpacity = 1.0;
            this.height = 0;
            this.temperature = 0;
            this.moisture = 0;
            this.drainage = 0;
            Object.defineProperties(this, {
                colorHexInt: {
                    get: () => {
                        if (this.feature !== null) {
                            return this.feature.colorHex;
                        }
                        else if (this.terrain !== null) {
                            if (this.terrain.tinted !== undefined) {
                                return this.terrainSprite.tint;
                            }
                            else {
                                return this.terrain.colorHex;
                            }
                        }
                    }
                }
            });
        }
        Tile.prototype.setTerrain = function (terrain) {
            this.terrain = terrain;
            this.terrainSprite.setTexture(this.terrain.sprite);
            this.terrainSprite.anchor.set(
                Math.floor(this.terrainSprite.width / 2) / this.terrainSprite.width,
                Math.floor(this.terrainSprite.height / 2) / this.terrainSprite.height);
            if (this.terrain.tinted) {
                let gradValue = this[this.terrain.gradient.type];
                let keys = this.terrain.gradient.keys;
                // clamp the grad value inside the defined range
                gradValue = Math.min(keys[keys.length - 1].value, Math.max(gradValue, keys[0].value));
                gradValue -= keys[0].value;
                let tileColor = this.terrain.colorList[gradValue];
                this.terrainSprite.tint = color.rgbToHexInt(tileColor.r, tileColor.g, tileColor.b);
            }
            else {
                this.terrainSprite.tint = 0xFFFFFF;
            }
        }
        Tile.prototype.addSprite = function (tSprite) {
            this.spriteContainer.addChild(tSprite);
        }
        Tile.prototype.removeSprite = function (tSprite) {
            this.spriteContainer.removeChild(tSprite);
        }
        Tile.prototype.setFeature = function (feature) {
            this.feature = feature;
            if (feature === null) {
                this.featureSprite.visible = false;
            }
            else {
                this.featureSprite.setTexture(this.feature.full.sprite);
                this.featureSprite.visible = true;
                this.featureSprite.anchor.set(
                    Math.floor(this.featureSprite.width / 2 - this.feature.full.offsetX) / this.featureSprite.width,
                    Math.floor(this.featureSprite.height / 2 - this.feature.full.offsetY) / this.featureSprite.height);
            }
        }
        var TileFactory = function () {
            var _id = 0;
            return {
                newTile: function () {
                    var tile = new Tile();
                    tile.id = _id.toString();
                    _id += 1;
                    return tile;
                }
            };
        };
        var tileFactory = new TileFactory();
        var HexMap = function (op) {
            this.grid = new HexGrid({
                width: op.mapWidthInTiles,
                height: op.mapHeightInTiles,
                orientation: 'pointy-topped',
                layout: 'odd-r',
                tileFactory: tileFactory
            });
            let lastTileId = op.mapWidthInTiles * op.mapHeightInTiles - 1;
            let lastPos = this.grid.getPositionById(lastTileId);
            this.tileSpriteSheet = op.tileSpriteSheet;
            this.featureSpriteSheet = op.featureSpriteSheet;
            this.spriteContainer = new PIXI.Container();
            var _mapWidthInTiles = op.mapWidthInTiles;
            var _mapHeightInTiles = op.mapHeightInTiles;
            var _tileWidthInPixels = op.tileWidthInPixels;
            var _tileHeightInPixels = op.tileHeightInPixels;
            var _tileAdvanceVertical = op.tileAdvanceVertical;
            if (_tileAdvanceVertical === undefined) {
                _tileAdvanceVertical = Math.round(_tileHeightInPixels * 0.75);
            }
            var _mapWidthInPixels = (op.mapWidthInTiles + 0.5) * op.tileWidthInPixels;
            var _mapHeightInPixels = ((op.mapHeightInTiles - 1) * _tileAdvanceVertical) + op.tileHeightInPixels;
            Object.defineProperties(this, {
                mapWidthInTiles: {
                    get: function () { return _mapWidthInTiles; }
                },
                mapHeightInTiles: {
                    get: function () { return _mapHeightInTiles; }
                },
                tileWidthInPixels: {
                    get: function () { return _tileWidthInPixels; }
                },
                tileHeightInPixels: {
                    get: function () { return _tileHeightInPixels; }
                },
                tileAdvanceVertical: {
                    get: function () { return _tileAdvanceVertical; }
                },
                mapWidthInPixels: {
                    get: function () { return _mapWidthInPixels; }
                },
                mapHeightInPixels: {
                    get: function () { return _mapHeightInPixels; }
                }
            });
            // this is where the minimap is drawn to
            this.miniMapCanvas = document.createElement('canvas');
            this.miniMapCanvas.width = this.mapWidthInTiles * 2;
            this.miniMapCanvas.height = this.mapHeightInTiles * 2;
            this.miniMapCtx = this.miniMapCanvas.getContext('2d');
            this.miniMapCtx.fillStyle = 'black';
            this.miniMapCtx.fillRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
            // create containers for clipping offscreen sprites
            var _groupSize = 8;
            var _groupPixelSize = {
                w: this.tileWidthInPixels * _groupSize + (_groupSize % 2 ? (this.tileWidthInPixels / 2) : 0),
                h: this.tileAdvanceVertical * _groupSize
            };
            this.groupTotal = { x: (this.mapWidthInTiles / _groupSize), y: (this.mapHeightInTiles / _groupSize) };
            this.spriteGroups = [];
            this.featureGroups = [];
            for (let y = 0; y < this.groupTotal.y; y++) {
                this.spriteGroups.push([]);
                for (let x = 0; x < this.groupTotal.x; x++) {
                    let container = new PIXI.Container();
                    this.spriteGroups[y].push(container);
                    this.spriteContainer.addChild(container);
                    container.visible = false;
                }
            }
            for (let a = 0; a < this.mapHeightInTiles; a++) {
                let container = new PIXI.Container();
                let row = { container: container, children: [] };
                this.featureGroups.push(row);
                for (let c = 0; c < this.mapWidthInTiles / _groupSize; c++) {
                    let innerContainer = new PIXI.Container();
                    row.children.push(innerContainer);
                    container.addChild(innerContainer);
                    //innerContainer.visible = false;
                }
                container.visible = false;
                this.spriteContainer.addChild(container);
            }
            // create all of the terrain sprites
            for (let y = 0; y < this.mapHeightInTiles; y++) {
                for (let x = 0; x < this.mapWidthInTiles; x++) {
                    let currentTile = this.grid.getTileByCoords(x, y);
                    currentTile.setTerrain(tile.tileTypes.blank);
                    let terrainSprite = currentTile.terrainSprite;
                    let spriteContainer = currentTile.spriteContainer;
                    let xPos = this.tileWidthInPixels * x + (y % 2 ? (this.tileWidthInPixels / 2) : 0);
                    let yPos = this.tileAdvanceVertical * y;
                    terrainSprite.position.set(xPos, yPos);
                    this.spriteGroups[Math.floor(y / _groupSize)][Math.floor(x / _groupSize)].addChild(terrainSprite);
                    spriteContainer.position.set(xPos, yPos);
                    this.featureGroups[y].children[Math.floor(x / _groupSize)].addChild(spriteContainer);
                }
            }
            this.screenPos = { x: 0, y: 0 };
            var _screenEnd = {};
            var _groupPos = {};
            var _groupEnd = {};
            var _tilePos = {};
            var _tileEnd = {};
            this.renderMiniMapTile = function (sourceTile) {
                var pos = this.grid.getPositionById(sourceTile.id);
                this.miniMapCtx.fillStyle = color.hexIntToHexString(sourceTile.colorHexInt);
                this.miniMapCtx.fillRect(pos.x * 2, pos.y * 2, 2, 2);
            }
            this.renderMiniMapTileByCoord = function (x, y) {
                var sourceTile = this.grid.getTileByCoords(x, y);
                this.renderMiniMapTile(sourceTile);
            }
            this.renderMiniMap = function () {
                var iterator = this.grid.getTileIterator();
                var currentTile = iterator.next();
                while (currentTile !== null) {
                    this.renderMiniMapTile(currentTile);
                    currentTile = iterator.next();
                }
            }
            this.calcCamPos = function (canvas) {
                _screenEnd = {
                    x: (this.screenPos.x + canvas.width),
                    y: (this.screenPos.y + canvas.height)
                };
                _tilePos = {
                    x: Math.max(0, Math.floor(this.screenPos.x / this.tileWidthInPixels)),
                    y: Math.max(0, Math.floor(this.screenPos.y / this.tileAdvanceVertical))
                };
                _tileEnd = {
                    x: Math.min(this.mapWidthInTiles - 1, Math.ceil(_screenEnd.x / this.tileWidthInPixels) + 1),
                    y: Math.min(this.mapHeightInTiles - 1, Math.ceil(_screenEnd.y / this.tileAdvanceVertical) + 1)
                };
                _groupPos = {
                    x: Math.max(0, Math.floor(this.screenPos.x / _groupPixelSize.w)),
                    y: Math.max(0, Math.floor(this.screenPos.y / _groupPixelSize.h))
                };
                _groupEnd = {
                    x: Math.floor((_screenEnd.x + this.tileWidthInPixels * 2) / _groupPixelSize.w),
                    y: Math.floor((_screenEnd.y + this.tileAdvanceVertical * 2) / _groupPixelSize.h)
                };
                _groupEnd.x = Math.min(this.groupTotal.x - 1, _groupEnd.x);
                _groupEnd.y = Math.min(this.groupTotal.y - 1, _groupEnd.y);
            }
            this.updateScreenVisibility = function (visible) {
                for (let y = _groupPos.y; y <= _groupEnd.y; y++) {
                    for (let x = _groupPos.x; x <= _groupEnd.x; x++) {
                        this.spriteGroups[y][x].visible = visible;
                    }
                }
                for (let y = _tilePos.y; y <= _tileEnd.y; y++) {
                    this.featureGroups[y].container.visible = visible;
                    for (let x = _groupPos.x; x <= _groupEnd.x; x++) {
                        this.featureGroups[y].children[x].visible = visible;
                    }
                }
            }
            this.drawMiniMap = function (ctx, destX, destY, destW, destH) {
                let minPix = { x: Math.floor(this.screenPos.x / this.tileWidthInPixels) * 2, y: Math.floor(this.screenPos.y / this.tileAdvanceVertical) * 2 };
                let maxPix = { x: Math.floor(_screenEnd.x / this.tileWidthInPixels) * 2, y: Math.floor(_screenEnd.y / this.tileAdvanceVertical) * 2 };
                ctx.drawImage(this.miniMapCanvas, destX, destY, destW, destH);
                ctx.strokeRect(minPix.x, minPix.y, maxPix.x - minPix.x, maxPix.y - minPix.y);
            }
            this.pixelCoordsOfTile = function (offsetX, offsetY) {
                var pos = this.grid.getPositionByCoords(offsetX, offsetY);
                pos.x *= this.tileWidthInPixels;
                pos.y *= this.tileAdvanceVertical;
                return pos;
            }
            this.pixelToAxial = function (x, y, size) {
                let q = x / this.tileWidthInPixels - y / this.tileAdvanceVertical * 0.5;
                let r = y / this.tileAdvanceVertical;
                let cube = axialToCube({ q: q, r: r });
                cube = cubeRound(cube);
                let result = cubeToAxial(cube);
                return result;
            }
        }
        return {
            axialToOffset: axialToOffset,
            HexMap: HexMap,
            offsetToAxial: offsetToAxial
        };
    }
);