requirejs.config({
    paths: {
        jquery: 'utility/jquery-1.10.2.min',
        hex: 'utility/hex-grid',
        xml: 'utility/xml-parsing'
    }
});

requirejs(['jquery', 'map', 'tile', 'xml', 'sprites', 'anim'],
    function ($, map, tile, xml, sprites, anim) {
        let hexMap = new map.HexMap({
            mapWidthInTiles: 10,
            mapHeightInTiles: 10,
            tileWidthInPixels: 64,
            tileHeightInPixels: 74
        });
        console.log('map ready');
        var c = $('#drawSurface')[0];
        var ctx = c.getContext('2d');
        let mapCanvas = document.createElement('canvas');
        mapCanvas.width = hexMap.mapWidthInPixels;
        mapCanvas.height = hexMap.mapHeightInPixels;
        let mapCtx = mapCanvas.getContext('2d');
        window.addEventListener('mousemove', (event) => {
            let axial = map.pixelToAxial(event.clientX, event.clientY, hexMap.tileHeightInPixels / 2);
            let offset = map.axialToOffset(axial);
            $('#info').text(axial.q + ',' + axial.r);
            if (hexMap.grid.isWithinBoundaries(offset.x, offset.y)) {
                let changedTile = hexMap.grid.getTileByCoords(offset.x, offset.y);
                changedTile.terrain = tile.tileTypes.tundra;
                hexMap.drawTile(mapCtx, offset.x, offset.y);
            }
        });
        var testAnim = null;
        var oldTime = null;
        function renderAll(time) {
            if (oldTime === null) {
                oldTime = time;
            }
            var deltaTime = time - oldTime;
            oldTime = time;
            testAnim.update(deltaTime);
            var t0 = performance.now();
            // main drawing
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(mapCanvas, 0, 0, mapCanvas.width, mapCanvas.height,
                -hexMap.tileWidthInPixels / 2,
                -hexMap.tileHeightInPixels / 2,
                mapCanvas.width / 1,
                mapCanvas.height / 1);
            for (let a = 0; a < 1; a++) {
                testAnim.renderFrame();
                testAnim.draw(ctx, 64, 0);
            }
            // end main drawing
            var t1 = performance.now();
            var time = Math.round(t1 - t0);
            ctx.font = "30px Arial";
            ctx.strokeStyle = 'white';
            ctx.fillText(time, 10, 50);
            ctx.strokeText(time, 10, 50);
            window.requestAnimationFrame(renderAll);
        }
        // when sprite loading is done, load map and begin drawing
        $.when(tile.loadTiles(), sprites.addAnimList('castle.anim'))
            .done(() => {
                testAnim = new anim.Anim(sprites.animLists.castle['castle']);
                let iterator = hexMap.grid.getTileIterator();
                let currentTile = iterator.next();
                while (currentTile !== null) {
                    currentTile.terrain = tile.tileTypes.desert;
                    currentTile = iterator.next();
                }
                console.log('start map drawing');
                hexMap.draw(mapCtx);
                window.requestAnimationFrame(renderAll);
            });
    });