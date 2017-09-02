define(['jquery', 'xml'],
    function ($, xml) {
        function addSpriteSheet(fileName) {
            var fileNameMinusExt = fileName.match(/(.+)\./)[1];
            if ($('#' + fileNameMinusExt + 'SpriteSheet').length > 0) {
                console.log('sprite sheet "' + fileName + '" already exists');
                return;
            }
            console.log('loading sprite sheet "' + fileName + '"');
            var img = document.createElement('img');
            img.src = 'images/' + fileName;
            img.id = fileNameMinusExt + 'SpriteSheet';
            img.classList.add('sprite-sheet');
            document.body.appendChild(img);
        }

        function readFolder(folder, root = true) {
            var folderData = ['', { dir: {}, spr: {} }];
            folderData[0] = folder.getAttribute('name');
            var child = xml.getFirstChild(folder);
            while (child !== null) {
                if (child.tagName == 'dir') {
                    var subFolderData = readFolder(child, false);
                    folderData[1]['dir'][subFolderData[0]] = subFolderData[1];
                }
                else if (child.tagName == 'spr') {
                    folderData[1]['spr'][child.getAttribute('name')] = {
                        x: child.getAttribute('x'),
                        y: child.getAttribute('y'),
                        w: child.getAttribute('w'),
                        h: child.getAttribute('h')
                    };
                }
                child = xml.nextSibling(child);
            }
            if (root) {
                return folderData[1];
            }
            return folderData;
        }

        var spriteLists = {};

        function addSpriteList(xmlFilename) {
            var deferred = $.Deferred();

            $.ajax({
                type: 'GET',
                url: 'data/' + xmlFilename,
                dataType: 'xml',
                success: (xmlData) => {
                    var img = xml.get(xmlData, 'img')[0];
                    var fileName = img.getAttribute('name');
                    var fileNameMinusExt = fileName.match(/(.+)\./)[1];
                    addSpriteSheet(fileName);
                    var folder = xml.get(img, 'definitions')[0];
                    folder = xml.get(folder, 'dir')[0];
                    spriteLists[fileNameMinusExt] = {
                        sheet: $('#' + fileNameMinusExt + 'SpriteSheet')[0],
                        sprites: readFolder(folder)
                    };
                    deferred.resolve();
                }
            });

            return deferred.promise();
        }

        function getSprite(spriteListName, path) {
            if (spriteLists[spriteListName] === undefined) {
                throw Error('" couldn\'t find sprite list "' + spriteListName + '"');
            }
            let splitPath = path.split(/\/+/);
            splitPath.splice(0, 1);
            let spriteData = spriteLists[spriteListName].sprites;
            for (let s in splitPath) {
                if (s >= splitPath.length - 1) {
                    spriteData = spriteData.spr[splitPath[s]];
                }
                else {
                    spriteData = spriteData.dir[splitPath[s]];
                }
            }
            if (spriteData === undefined) {
                throw Error('" couldn\'t find sprite "' + path + '" in sprite list "' + spriteListName + '"');
            }
            return spriteData;
        }

        var animLists = {};

        function addAnimList(xmlFileName) {
            var deferred = $.Deferred();
            $.ajax({
                type: 'GET',
                url: 'data/' + xmlFileName,
                dataType: 'xml',
                success: (xmlData) => {
                    var anims = xml.get(xmlData, 'animations')[0];
                    var fileName = anims.getAttribute('spriteSheet');
                    var fileNameMinusExt = fileName.match(/(.+)\./)[1];
                    addSpriteList(fileName)
                        .then(() => {
                            var animListObject = {};
                            var anim = xml.getFirstChild(anims);
                            // loop through animations
                            while (anim !== null) {
                                if (anim.tagName == 'anim') {
                                    var animObject = {
                                        loops: anim.getAttribute('loops'),
                                        cells: []
                                    };
                                    // loop through animation cells
                                    var cell = xml.getFirstChild(anim);
                                    while (cell !== null) {
                                        if (cell.tagName == 'cell') {
                                            var cellObject = {
                                                delay: cell.getAttribute('delay'),
                                                sprites: []
                                            };
                                            // loop through cell sprites
                                            var spr = xml.getFirstChild(cell);
                                            while (spr !== null) {
                                                if (spr.tagName == 'spr') {
                                                    var sprObject = {
                                                        x: spr.getAttribute('x'),
                                                        y: spr.getAttribute('y'),
                                                        z: spr.getAttribute('z')
                                                    }
                                                    let path = spr.getAttribute('name');
                                                    let splitPath = path.split(/\/+/);
                                                    splitPath.splice(0, 1);
                                                    sprObject.spriteData = spriteLists[fileNameMinusExt].sprites;
                                                    for (let s in splitPath) {
                                                        if (s >= splitPath.length - 1) {
                                                            sprObject.spriteData = sprObject.spriteData.spr[splitPath[s]];
                                                        }
                                                        else {
                                                            sprObject.spriteData = sprObject.spriteData.dir[splitPath[s]];
                                                        }
                                                    }
                                                    if (sprObject.spriteData === undefined) {
                                                        throw Error('animation "' + xmlFileName + '" couldn\'t find sprite "' + path + '" in sprite list "' + fileName + '"');
                                                    }
                                                    cellObject.sprites.push(sprObject);
                                                }
                                                spr = xml.nextSibling(spr);
                                            }
                                            animObject.cells.push(cellObject);
                                        }
                                        cell = xml.nextSibling(cell);
                                    }
                                    animListObject[anim.getAttribute('name')] = animObject;
                                }
                                anim = xml.nextSibling(anim);
                            }
                            animLists[fileNameMinusExt] = animListObject;
                            deferred.resolve();
                        });
                }
            });
            return deferred.promise();
        }

        return {
            addAnimList: addAnimList,
            addSpriteSheet: addSpriteSheet,
            addSpriteList: addSpriteList,
            animLists: animLists,
            getSprite: getSprite,
            spriteLists: spriteLists
        }
    }
);