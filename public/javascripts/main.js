requirejs.config({
    paths: {
        jquery: 'utility/jquery-1.10.2.min',
        hex: 'utility/hex-grid'
    }
});

requirejs(['jquery', 'map', 'tile'],
    function ($, HexMap, Tile) {
        console.log(Tile);
        let times = [0, 0, 0, 0, 0];
        let hexMap = new HexMap({
            mapWidthInTiles: 10,
            mapHeightInTiles: 10,
            tileWidthInPixels: 64,
            tileHeightInPixels: 74
        });
        var c = $('#drawSurface')[0];
        var ctx = c.getContext('2d');
        let mapCanvas = document.createElement('canvas');
        mapCanvas.width = hexMap.mapWidthInPixels;
        mapCanvas.height = hexMap.mapHeightInPixels;
        let mapCtx = mapCanvas.getContext('2d');
        function renderFrame() {
            var t0 = performance.now();
            // main drawing
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(mapCanvas, 0, 0, mapCanvas.width, mapCanvas.height, 0, 0, mapCanvas.width, mapCanvas.height);
            // end main drawing
            var t1 = performance.now();
            var time = Math.round(t1 - t0);
            ctx.font = "30px Arial";
            ctx.strokeStyle = 'white';
            ctx.fillText(time, 10, 50);
            ctx.strokeText(time, 10, 50);
            window.requestAnimationFrame(renderFrame);
        }
        // when sprite loading is done, load map and begin drawing
        Tile.loadSprites(() => {
            let iterator = hexMap.grid.getTileIterator();
            let tile = iterator.next();
            console.log(Tile.tileTypes.sandDesert);
            while (tile !== null) {
                tile.terrain = Tile.tileTypes.sandDesert;
                tile = iterator.next();
            }
            hexMap.draw(mapCtx);
            window.requestAnimationFrame(renderFrame);
        });
    });