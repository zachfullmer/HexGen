requirejs.config({
    paths: {
        jquery: 'utility/jquery-1.10.2.min',
        hex: 'utility/hex-grid',
        xml: 'utility/xml-parsing',
        noise: 'utility/noise',
        tint: 'utility/tint',
        gradient: 'utility/gradient',
        color: 'utility/color',
        coords: 'utility/coords',
        scaling: 'utility/scaling',
        pixi: 'utility/pixi.min'
    }
});

requirejs(['jquery', 'map', 'tile', 'xml', 'sprites', 'anim', 'gen', 'tint', 'gradient', 'scaling', 'pixi'],
    function ($, map, tile, xml, sprites, anim, gen, tint, gradient, scaling, PIXI) {
        var meter = new FPSMeter();
        // initialize rendering stuff
        var type = "WebGL"
        if (!PIXI.utils.isWebGLSupported()) {
            type = "canvas"
        }
        PIXI.utils.sayHello(type);
        var pixelRatio = devicePixelRatio;
        var zoom = 1.0;
        var canvasSize = { w: window.innerWidth * pixelRatio / zoom, h: window.innerHeight * pixelRatio / zoom };
        var renderer = PIXI.autoDetectRenderer(canvasSize.w, canvasSize.h);
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";
        renderer.view.style.left = '0';
        renderer.view.style.top = '0';
        renderer.autoResize = true;
        document.body.appendChild(renderer.view);
        var stage = new PIXI.Container();
        var camVelX = 0;
        var camVelY = 0;
        // when sprite loading is done, load map and begin drawing
        PIXI.loader
            .add(['images/terrain.png', 'images/feature.png', 'images/monsters.png', 'images/castle.png'])
            .load(function () {
                $.when(tile.loadTiles(), tile.loadFeatures(), sprites.addAnimList('castle.anim'))
                    .done(() => {
                        // let sprite = new PIXI.Sprite(tile.tileTypes.ocean.sprite);
                        // sprite.tint = 0x00FF00;
                        // stage.addChild(sprite);
                        // var castles = [];
                        // for (let c = 0; c < 1000; c++) {
                        //     let castleAnim = new anim.Anim(sprites.animLists.castle['castle']);
                        //     castleAnim.spriteContainer.position.set(400 + c, 300);
                        //     stage.addChild(castleAnim.spriteContainer);
                        //     castles.push(castleAnim);
                        // }
                        // var oldTime = null;
                        // function render(time) {
                        //     meter.tickStart();
                        //     requestAnimationFrame(render);
                        //     if (oldTime === null) {
                        //         oldTime = time;
                        //     }
                        //     var deltaTime = time - oldTime;
                        //     oldTime = time;
                        //     for (let c in castles) {
                        //         castles[c].update(deltaTime);
                        //     }
                        //     renderer.render(stage);
                        //     meter.tick();
                        // };
                        // requestAnimationFrame(render);
                        // return;
                        var camSpeed = 15;
                        $(window).keydown((event) => {
                            if (event.repeat) {
                                return;
                            }
                            if (event.key == 'ArrowLeft' || event.key == 'a') {
                                camVelX = -camSpeed;
                            }
                            if (event.key == 'ArrowRight' || event.key == 'd') {
                                camVelX = camSpeed;
                            }
                            if (event.key == 'ArrowUp' || event.key == 'w') {
                                camVelY = -camSpeed;
                            }
                            if (event.key == 'ArrowDown' || event.key == 's') {
                                camVelY = camSpeed;
                            }
                            if (event.key == 'Enter') {
                                gen.generateMap(hexMap);
                                //hexMap.renderMiniMap();
                            }
                        });
                        $(window).keyup((event) => {
                            if (event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'ArrowRight' || event.key == 'd') {
                                camVelX = 0;
                            }
                            if (event.key == 'ArrowUp' || event.key == 'w' || event.key == 'ArrowDown' || event.key == 's') {
                                camVelY = 0;
                            }
                        });
                        let hexMap = new map.HexMap({
                            mapWidthInTiles: 128,
                            mapHeightInTiles: 128,
                            tileWidthInPixels: 64,
                            tileHeightInPixels: 74,
                            tileSpriteSheet: $('#terrainSpriteSheet')[0],
                            featureSpriteSheet: $('#featureSpriteSheet')[0],
                            canvasWidthInPixels: canvasSize.w,
                            canvasHeightInPixels: canvasSize.h,
                        });
                        gen.generateMap(hexMap);
                        stage.addChild(hexMap.spriteContainer);
                        let anims = [];
                        for (let a = 0; a < 3000; a++) {
                            let tilePos = {
                                x: Math.floor(Math.random() * hexMap.mapWidthInTiles),
                                y: Math.floor(Math.random() * hexMap.mapHeightInTiles)
                            }
                            let currentTile = hexMap.grid.getTileByCoords(tilePos.x, tilePos.y);
                            let currentAnim = new anim.Anim(sprites.animLists.castle['castle']);
                            currentTile.addSprite(currentAnim.spriteContainer);
                            //stage.addChild(currentAnim.spriteContainer);
                            anims.push(currentAnim);
                        }
                        var oldTime = null;
                        function render(time) {
                            meter.tickStart();
                            requestAnimationFrame(render);
                            if (oldTime === null) {
                                oldTime = time;
                            }
                            var deltaTime = time - oldTime;
                            oldTime = time;
                            //
                            for (let a in anims) {
                                anims[a].update(deltaTime);
                            }
                            hexMap.updateScreenVisibility(false);
                            hexMap.screenPos.x += camVelX;
                            hexMap.screenPos.y += camVelY;
                            stage.x = -hexMap.screenPos.x;
                            stage.y = -hexMap.screenPos.y;
                            hexMap.calcCamPos();
                            hexMap.updateScreenVisibility(true);
                            //
                            renderer.render(stage);
                            meter.tick();
                        };
                        requestAnimationFrame(render);
                        return;
                        console.log('map ready');
                        var canvas = $('#drawSurface')[0];
                        var ctx = canvas.getContext('2d');
                        var cam = new map.Camera();
                        var camVel = { x: 0, y: 0 };
                        var camSpeed = 15;
                        var dpiScaling = false;
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
                                camVelX = -camSpeed;
                            }
                            if (event.key == 'ArrowRight' || event.key == 'd') {
                                camVelX = camSpeed;
                            }
                            if (event.key == 'ArrowUp' || event.key == 'w') {
                                camVelY = -camSpeed;
                            }
                            if (event.key == 'ArrowDown' || event.key == 's') {
                                camVelY = camSpeed;
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
                                camVelX = 0;
                            }
                            if (event.key == 'ArrowUp' || event.key == 'w' || event.key == 'ArrowDown' || event.key == 's') {
                                camVelY = 0;
                            }
                        });
                        $('#dpiCheck').on('change', (event) => {
                            dpiScaling = event.target.checked;
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
                            cam.pos.x += camVelX / 16 * deltaTime, cam.pos.y += camVelY / 16 * deltaTime;
                            $('#camPos').text(Math.floor(cam.pos.x) + ',' + Math.floor(cam.pos.y));
                            var t0 = performance.now();
                            // main drawing
                            let pixelRatio = scaling.getPixelRatio(ctx);
                            if (dpiScaling) {
                                cam.zoomFactor = pixelRatio;
                                scaling.scaleCanvas(canvas, ctx, window.innerWidth, window.innerHeight);
                            }
                            else {
                                cam.zoomFactor = 1.0;
                                canvas.width = window.innerWidth;
                                canvas.height = window.innerHeight;
                            }
                            cam.update(hexMap, canvas, dpiScaling ? pixelRatio : 1.0);
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            hexMap.drawTiles(ctx, cam);
                            hexMap.drawFeatures(ctx, cam);
                            hexMap.drawMiniMap(miniMapCtx, cam, 0, 0, miniMap.width, miniMap.height);
                            for (let a = 0; a < 100; a++) {
                                testAnim.renderFrame();
                                testAnim.draw(ctx, cam, 0, 0);
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
                        // set up the map
                        testAnim = new anim.Anim(sprites.animLists.castle['castle']);
                        gen.generateMap(hexMap);
                        console.log('start map drawing');
                        hexMap.renderMiniMap();
                        window.requestAnimationFrame(renderAll);
                    });
            });
    });