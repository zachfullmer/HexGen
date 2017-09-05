requirejs.config({
    paths: {
        jquery: 'utility/jquery-1.10.2.min',
        hex: 'utility/hex-grid',
        xml: 'utility/xml-parsing'
    }
});

requirejs(['jquery', 'map', 'tile', 'xml', 'sprites', 'anim', 'gen'],
    function ($, map, tile, xml, sprites, anim, gen) {
        // when sprite loading is done, load map and begin drawing
        $.when(tile.loadTiles(), tile.loadFeatures(), sprites.addAnimList('castle.anim'))
            .done(() => {
                console.log($('#terrainSpriteSheet')[0]);
                console.log($('#featureSpriteSheet')[0]);
                let hexMap = new map.HexMap({
                    mapWidthInTiles: 128,
                    mapHeightInTiles: 128,
                    tileWidthInPixels: 64,
                    tileHeightInPixels: 74,
                    tileSpriteSheet: $('#terrainSpriteSheet')[0],
                    featureSpriteSheet: $('#featureSpriteSheet')[0]
                });
                console.log('map ready');
                var canvas = $('#drawSurface')[0];
                var ctx = canvas.getContext('2d');
                var cam = new map.Camera();
                var camVel = { x: 0, y: 0 };
                var camSpeed = 15;
                window.addEventListener('mousemove', (event) => {
                    let pixelPos = { x: event.clientX + cam.pos.x, y: event.clientY + cam.pos.y }
                    let axial = hexMap.pixelToAxial(pixelPos.x, pixelPos.y, hexMap.tileHeightInPixels / 2);
                    let offset = map.axialToOffset(axial);
                    $('#mousePos').text('mouse: ' + axial.q + ',' + axial.r);
                    if (hexMap.grid.isWithinBoundaries(offset.x, offset.y)) {
                        let changedTile = hexMap.grid.getTileByCoords(offset.x, offset.y);
                        changedTile.terrain = tile.tileTypes.taiga;
                        hexMap.renderTile(offset.x, offset.y);
                    }
                });
                $(window).keydown((event) => {
                    if (event.repeat) {
                        return;
                    }
                    if (event.key == 'ArrowLeft' || event.key == 'a') {
                        camVel.x = -camSpeed;
                    }
                    if (event.key == 'ArrowRight' || event.key == 'd') {
                        camVel.x = camSpeed;
                    }
                    if (event.key == 'ArrowUp' || event.key == 'w') {
                        camVel.y = -camSpeed;
                    }
                    if (event.key == 'ArrowDown' || event.key == 's') {
                        camVel.y = camSpeed;
                    }
                    if (event.key == 'Enter') {
                        cam.pos.x = 0;
                        cam.pos.y = 0;
                    }
                });
                $(window).keyup((event) => {
                    if (event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'ArrowRight' || event.key == 'd') {
                        camVel.x = 0;
                    }
                    if (event.key == 'ArrowUp' || event.key == 'w' || event.key == 'ArrowDown' || event.key == 's') {
                        camVel.y = 0;
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
                    cam.pos.x += camVel.x, cam.pos.y += camVel.y;
                    $('#camPos').text('camera: ' + cam.pos.x + ',' + cam.pos.y);
                    var t0 = performance.now();
                    // main drawing
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    cam.update(hexMap, canvas);
                    hexMap.drawTiles(ctx, cam);
                    for (let a = 0; a < 1; a++) {
                        let pos = hexMap.pixelCoordsOfTile(2, 4);
                        testAnim.renderFrame();
                        testAnim.draw(ctx, cam, pos.x, pos.y);
                    }
                    hexMap.drawFeatures(ctx, cam);
                    // end main drawing
                    var t1 = performance.now();
                    var time = Math.round(t1 - t0);
                    ctx.font = "30px Arial";
                    ctx.strokeStyle = 'white';
                    ctx.fillText(time, 10, 50);
                    ctx.strokeText(time, 10, 50);
                    window.requestAnimationFrame(renderAll);
                }
                // set up the map
                testAnim = new anim.Anim(sprites.animLists.castle['castle']);
                gen.generateMap(hexMap);
                console.log('start map drawing');
                hexMap.render();
                window.requestAnimationFrame(renderAll);
            });
    });