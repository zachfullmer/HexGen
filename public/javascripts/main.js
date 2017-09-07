requirejs.config({
    paths: {
        jquery: 'utility/jquery-1.10.2.min',
        hex: 'utility/hex-grid',
        xml: 'utility/xml-parsing',
        noise: 'utility/noise',
        tint: 'utility/tint',
        gradient: 'utility/gradient',
        color: 'utility/color',
        coords: 'utility/coords'
    }
});

requirejs(['jquery', 'map', 'tile', 'xml', 'sprites', 'anim', 'gen', 'tint', 'gradient'],
    function ($, map, tile, xml, sprites, anim, gen, tint, gradient) {
        // when sprite loading is done, load map and begin drawing
        $.when(tile.loadTiles(), tile.loadFeatures(), sprites.addAnimList('castle.anim'))
            .done(() => {
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
                cam.zoomFactor = 1.5;
                var camVel = { x: 0, y: 0 };
                var camSpeed = 15;
                window.addEventListener('mousemove', (event) => {
                    let pixelPos = { x: ((event.clientX * cam.zoomFactor) + cam.pos.x), y: ((event.clientY * cam.zoomFactor) + cam.pos.y) }
                    let axial = hexMap.pixelToAxial(pixelPos.x, pixelPos.y, hexMap.tileHeightInPixels / 2);
                    let offset = map.axialToOffset(axial);
                    let mouseTile = hexMap.grid.getTileByCoords(offset.x, offset.y);
                    let terrain = mouseTile && mouseTile.terrain ? mouseTile.terrain.name : 'none';
                    let feature = mouseTile && mouseTile.feature ? mouseTile.feature.name : 'none';
                    $('#mousePos').text(axial.q + ',' + axial.r);
                    $('#tileTerrain').text(terrain);
                    $('#tileFeature').text(feature);
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
                        gen.generateMap(hexMap);
                        hexMap.renderMiniMap();
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
                var tintB = 0;
                var miniMap = $('#miniMap')[0];
                miniMap.width = hexMap.miniMapCanvas.width;
                miniMap.height = hexMap.miniMapCanvas.height;
                var miniMapCtx = miniMap.getContext('2d');
                function renderAll(time) {
                    if (oldTime === null) {
                        oldTime = time;
                    }
                    var deltaTime = time - oldTime;
                    oldTime = time;
                    testAnim.update(deltaTime);
                    cam.pos.x += camVel.x / 16 * deltaTime, cam.pos.y += camVel.y / 16 * deltaTime;
                    $('#camPos').text(Math.floor(cam.pos.x) + ',' + Math.floor(cam.pos.y));
                    var t0 = performance.now();
                    // main drawing
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    cam.update(hexMap, canvas);
                    hexMap.drawTiles(ctx, cam);
                    hexMap.drawFeatures(ctx, cam);
                    hexMap.drawMiniMap(miniMapCtx, cam, 0, 0, miniMap.width, miniMap.height);
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
                hexMap.renderMiniMap();
                window.requestAnimationFrame(renderAll);
            });
    });