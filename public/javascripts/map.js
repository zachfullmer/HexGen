
define(['hex'],
    function (HexGrid) {
        // function pixel_to_hex(x, y):
        //     q = (x * sqrt(3)/3 - y / 3) / size
        //     r = y * 2/3 / size
        //     return hex_round(Hex(q, r))
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
        function pixelToAxial(x, y, size) {
            let q = (x * Math.sqrt(3) / 3 - y / 3) / size;
            let r = y * 0.667 / size;
            let cube = axialToCube({ q: q, r: r });
            cube = cubeRound(cube);
            let result = cubeToAxial(cube);
            return result;
        }
        var TileFactory = function () {
            var _id = 0;
            return {
                newTile: function () {
                    var tile = {
                        id: _id.toString()
                    };

                    _id += 1;
                    return tile;
                }
            };
        };
        var Camera = function () {
            this.pos = { x: 0, y: 0 };
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
            this.mapCanvas = document.createElement('canvas');
            this.mapCanvas.width = this.mapWidthInPixels;
            this.mapCanvas.height = this.mapHeightInPixels;
            this.mapCtx = this.mapCanvas.getContext('2d');
            this.origin = {
                x: Math.floor(-this.tileWidthInPixels / 2),
                y: Math.floor(-this.tileHeightInPixels / 2)
            }
        }
        var img = document.getElementsByClassName('sprite-sheet')[0];
        // (re)draw the whole map, tile-by-tile
        HexMap.prototype.render = function () {
            let iterator = this.grid.getTileIterator();
            let tile = iterator.next();
            while (tile !== null) {
                let pos = this.grid.getPositionById(tile.id);
                this.mapCtx.drawImage(img, tile.terrain.sprite.x, tile.terrain.sprite.y,
                    this.tileWidthInPixels,
                    this.tileHeightInPixels,
                    pos.x * this.tileWidthInPixels,
                    pos.y * this.tileAdvanceVertical,
                    this.tileWidthInPixels,
                    this.tileHeightInPixels);
                tile = iterator.next();
            }
        }
        // (re)draw a single tile, on the given context and at the given coordinates
        HexMap.prototype.renderTile = function (x, y) {
            let tile = this.grid.getTileByCoords(x, y);
            let pos = this.grid.getPositionByCoords(x, y);
            this.mapCtx.drawImage(img, tile.terrain.sprite.x, tile.terrain.sprite.y,
                this.tileWidthInPixels,
                this.tileHeightInPixels,
                pos.x * this.tileWidthInPixels,
                pos.y * this.tileAdvanceVertical,
                this.tileWidthInPixels,
                this.tileHeightInPixels);
        }
        // draw the rendered map to an external canvas
        HexMap.prototype.draw = function (ctx, canvas, cam) {
            ctx.drawImage(this.mapCanvas,
                -this.origin.x + cam.pos.x,
                -this.origin.y + cam.pos.y,
                canvas.width,
                canvas.height,
                0,
                0,
                canvas.width / 1,
                canvas.height / 1);
        }
        HexMap.prototype.pixelCoordsOfTile = function (offsetX, offsetY) {
            var pos = this.grid.getPositionByCoords(offsetX, offsetY);
            pos.x *= this.tileWidthInPixels;
            pos.y *= this.tileAdvanceVertical;
            return pos;
        }
        console.log('loaded HexMap class');
        return {
            axialToOffset: axialToOffset,
            Camera: Camera,
            HexMap: HexMap,
            offsetToAxial: offsetToAxial,
            pixelToAxial: pixelToAxial
        };
    }
);