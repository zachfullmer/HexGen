define(['jquery'],
    function ($) {
        var WINDOW = {};
        WINDOW.Window = function () {
            var _title = '';
            var _bgColor = '';
            var _textColor = '';
            var _borderColor = '';
            // elements
            this.windowDom = $('<div>', {
                class: 'gui-window'
            })[0];
            // background for title and x button
            var _titleBar = $('<div>', {
                class: 'gui-window-title-bar'
            }).appendTo(this.windowDom);
            // contains title of window
            var _titleSpan = $('<span>', {
                class: 'gui-window-title-span'
            }).appendTo(_titleBar);
            // close window button
            var _xButtonSpan = $('<span>', {
                class: 'gui-window-x-button-span noselect'
            }).appendTo(_titleBar);
            _xButtonSpan.text('\u2715');
            _xButtonSpan.click(() => {
                this.windowDom.remove();
            });
            // content inside window
            this.domContent = $('<div>', {
                class: 'gui-window-content'
            }).appendTo(this.windowDom)[0];
            Object.defineProperties(this, {
                title: {
                    get: () => _title,
                    set: (t) => {
                        _title = t;
                        _titleSpan.text(t);
                    }
                },
                bgColor: {
                    get: () => _bgColor,
                    set: (c) => {
                        _bgColor = c;
                        _titleBar.css('background', c);
                    }
                },
                textColor: {
                    get: () => _textColor,
                    set: (c) => {
                        _textColor = c;
                        _titleBar.css('color', c);
                    }
                },
                borderColor: {
                    get: () => _borderColor,
                    set: (c) => {
                        _borderColor = c;
                        $(this.windowDom).css('border', 'solid 1px ' + c);
                    }
                }
            })
        }
        return WINDOW;
    });