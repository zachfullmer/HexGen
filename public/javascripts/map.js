
define(['hex'],
    function (HexGrid) {
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
            var _mapWidthInPixels = (lastPos.x + 1) * op.tileWidthInPixels;
            var _mapHeightInPixels = (lastPos.y * op.tileHeightInPixels * 0.75) + op.tileHeightInPixels;
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
            })
        }
        HexMap.prototype.draw = function (ctx) {
            let iterator = this.grid.getTileIterator();
            let tile = iterator.next();
            while (tile !== null) {
                let pos = this.grid.getPositionById(tile.id);
                var img = document.getElementById("spriteSheet");
                ctx.drawImage(img, tile.terrain.sprite.x, tile.terrain.sprite.y,
                    this.tileWidthInPixels,
                    this.tileHeightInPixels,
                    pos.x * this.tileWidthInPixels,
                    pos.y * this.tileAdvanceVertical,
                    this.tileWidthInPixels,
                    this.tileHeightInPixels);
                //console.log(Math.round(pos.y * this.tileHeightInPixels * 0.75));
                tile = iterator.next();
            }
        }
        console.log('created a new HexMap');
        return HexMap;
    }
);