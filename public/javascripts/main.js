requirejs.config({
    paths: {
        jquery: 'utility/jquery-1.10.2.min',
        hex: 'utility/hex-grid'
    }
});

requirejs(['jquery', 'map', 'tile'],
    function ($, map, Tile) {
        let hexMap = new map.HexMap({
            mapWidthInTiles: 5,
            mapHeightInTiles: 5,
            tileWidthInPixels: 64,
            tileHeightInPixels: 74
        });
        window.addEventListener('mousemove', (event) => {
            let axial = map.pixelToAxial(event.clientX, event.clientY, hexMap.tileHeightInPixels / 2);
            let offset = map.axialToOffset(axial);
            //axial = map.offsetToAxial(offset);
            $('#info').text(axial.q + ',' + axial.r);
            //$('#info').text(offset.x + ',' + offset.y);
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
            ctx.drawImage(mapCanvas, 0, 0, mapCanvas.width, mapCanvas.height, -hexMap.tileWidthInPixels / 2, -hexMap.tileHeightInPixels / 2, mapCanvas.width, mapCanvas.height);
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
        Tile.loadSprites()
            .then(() => {
                let iterator = hexMap.grid.getTileIterator();
                let tile = iterator.next();
                while (tile !== null) {
                    tile.terrain = Tile.tileTypes.sandDesert;
                    tile = iterator.next();
                }
                hexMap.draw(mapCtx);
                window.requestAnimationFrame(renderFrame);
            });
    });