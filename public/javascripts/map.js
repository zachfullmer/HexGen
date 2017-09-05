
define(['hex', 'tile', 'sprites', 'color'],
    function (HexGrid, tile, sprites, color) {
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
        var TileFactory = function () {
            var _id = 0;
            return {
                newTile: function () {
                    var tile = {
                        id: _id.toString(),
                        terrain: null,
                        featureOpacity: 1.0,
                        height: 0,
                        temperature: 0,
                        moisture: 0,
                        drainage: 0
                    };

                    _id += 1;
                    return tile;
                }
            };
        };
        var Camera = function () {
            this.pos = { x: 0, y: 0 };
            this.end = { x: 0, y: 0 };
            this.minVisibleHex = { x: 0, y: 0 };
            this.maxVisibleHex = { x: 0, y: 0 };
            this.update = function (map, canvas) {
                this.end.x = this.pos.x + canvas.width;
                this.end.y = this.pos.y + canvas.height;
                this.width = canvas.width;
                this.height = canvas.height;
                this.minVisibleHex.x = Math.max(0, Math.floor(this.pos.x / map.tileWidthInPixels) - 1);
                this.minVisibleHex.y = Math.max(0, Math.floor(this.pos.y / map.tileAdvanceVertical) - 1);
                this.maxVisibleHex.x = Math.min(map.mapWidthInTiles - 1, Math.ceil(this.end.x / map.tileWidthInPixels));
                this.maxVisibleHex.y = Math.min(map.mapWidthInTiles - 1, Math.ceil(this.end.y / map.tileAdvanceVertical));
            }
        }
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
            // huge canvas onto which tiles are drawn
            this.tileCanvas = document.createElement('canvas');
            this.tileCanvas.width = this.mapWidthInPixels;
            this.tileCanvas.height = this.mapHeightInPixels;
            this.tileCtx = this.tileCanvas.getContext('2d');
            // this is where the minimap is drawn to
            this.miniMapCanvas = document.createElement('canvas');
            this.miniMapCanvas.width = this.mapWidthInTiles * 2;
            this.miniMapCanvas.height = this.mapHeightInTiles * 2;
            this.miniMapCtx = this.miniMapCanvas.getContext('2d');
            this.miniMapCtx.fillStyle = 'black';
            this.miniMapCtx.fillRect(0, 0, this.miniMapCanvas.width, this.miniMapCanvas.height);
            this.origin = {
                x: Math.floor(-this.tileWidthInPixels / 2),
                y: Math.floor(-this.tileHeightInPixels / 2)
            }
            let iterator = this.grid.getTileIterator();
            let currentTile = iterator.next();
            while (currentTile !== null) {
                currentTile.terrain = tile.tileTypes.blank;
                currentTile = iterator.next();
            }
        }
        // (re)draw a single tile
        HexMap.prototype.renderTile = function (sourceTile) {
            let pos = this.grid.getPositionById(sourceTile.id);
            if (sourceTile.terrain.tinted) {
                if (sourceTile.terrain.gradient === undefined) {
                    this.miniMapCtx.fillStyle = sourceTile.terrain.colorHex;
                    this.miniMapCtx.fillRect(pos.x * 2, pos.y * 2, 2, 2);
                }
                else {
                    let gradValue = sourceTile[sourceTile.terrain.gradient.type];
                    let keys = sourceTile.terrain.gradient.keys;
                    // clamp the grad value inside the defined range
                    gradValue = Math.min(keys[keys.length - 1].value, Math.max(gradValue, keys[0].value));
                    gradValue -= keys[0].value;
                    let gradColor = sourceTile.terrain.colorList[gradValue];
                    sourceTile.terrain.tintedSprite.setTint(gradColor.r, gradColor.g, gradColor.b);
                    this.miniMapCtx.fillStyle = color.rgbToHex(Math.round(gradColor.r), Math.round(gradColor.g), Math.round(gradColor.b));
                    this.miniMapCtx.fillRect(pos.x * 2, pos.y * 2, 2, 2);
                }
                sourceTile.terrain.tintedSprite.draw(this.tileCtx,
                    pos.x * this.tileWidthInPixels,
                    pos.y * this.tileAdvanceVertical,
                    this.tileWidthInPixels,
                    this.tileHeightInPixels);
            }
            else {
                this.miniMapCtx.fillStyle = sourceTile.terrain.colorHex;
                this.miniMapCtx.fillRect(pos.x * 2, pos.y * 2, 2, 2);
                this.tileCtx.drawImage(this.tileSpriteSheet, sourceTile.terrain.sprite.x, sourceTile.terrain.sprite.y,
                    this.tileWidthInPixels,
                    this.tileHeightInPixels,
                    pos.x * this.tileWidthInPixels,
                    pos.y * this.tileAdvanceVertical,
                    this.tileWidthInPixels,
                    this.tileHeightInPixels);
            }
        }
        // (re)draw a single tile, at the given coordinates
        HexMap.prototype.renderTileByPos = function (x, y) {
            let sourceTile = this.grid.getTileByCoords(x, y);
            this.renderTile(sourceTile);
        }
        // (re)draw the whole map, tile-by-tile
        HexMap.prototype.render = function () {
            let iterator = this.grid.getTileIterator();
            let sourceTile = iterator.next();
            while (sourceTile !== null) {
                this.renderTile(sourceTile);
                sourceTile = iterator.next();
            }
        }
        // draw the rendered map to an external canvas
        HexMap.prototype.drawTiles = function (ctx, cam) {
            let zoom = 1;
            ctx.drawImage(this.tileCanvas,
                -this.origin.x + cam.pos.x,
                -this.origin.y + cam.pos.y,
                cam.width * zoom,
                cam.height * zoom,
                0,
                0,
                cam.width,
                cam.height);
        }
        HexMap.prototype.drawFeatures = function (ctx, cam) {
            for (let y = cam.minVisibleHex.y; y <= cam.maxVisibleHex.y; y++) {
                for (let x = cam.minVisibleHex.x; x <= cam.maxVisibleHex.x; x++) {
                    let tile = this.grid.getTileByCoords(x, y);
                    if (tile.terrain.feature !== undefined) {
                        let featureSprite = tile.terrain.feature.full;
                        let halfW = Math.floor(featureSprite.sprite.w / 2);
                        let halfH = Math.floor(featureSprite.sprite.h / 2);
                        let tilePos = this.pixelCoordsOfTile(x, y);
                        let drawRect = {
                            x: tilePos.x - halfW + featureSprite.offsetX - cam.pos.x,
                            y: tilePos.y - halfH + featureSprite.offsetY - cam.pos.y,
                            w: featureSprite.sprite.w,
                            h: featureSprite.sprite.h
                        };
                        ctx.globalAlpha = tile.featureOpacity;
                        ctx.drawImage(featureSpriteSheet,
                            featureSprite.sprite.x, featureSprite.sprite.y, featureSprite.sprite.w, featureSprite.sprite.h,
                            drawRect.x, drawRect.y, drawRect.w, drawRect.h);
                        ctx.globalAlpha = 1.0;
                    }
                }
            }
        }
        HexMap.prototype.pixelCoordsOfTile = function (offsetX, offsetY) {
            var pos = this.grid.getPositionByCoords(offsetX, offsetY);
            pos.x *= this.tileWidthInPixels;
            pos.y *= this.tileAdvanceVertical;
            return pos;
        }
        HexMap.prototype.pixelToAxial = function (x, y, size) {
            let q = x / this.tileWidthInPixels - y / this.tileAdvanceVertical * 0.5;
            let r = y / this.tileAdvanceVertical;
            let cube = axialToCube({ q: q, r: r });
            cube = cubeRound(cube);
            let result = cubeToAxial(cube);
            return result;
        }
        console.log('loaded HexMap class');
        return {
            axialToOffset: axialToOffset,
            Camera: Camera,
            HexMap: HexMap,
            offsetToAxial: offsetToAxial
        };
    }
);