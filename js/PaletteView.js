(function(app, Events) {

    function $(id) {
        return document.getElementById(id);
    }

    function PaletteView(config) {
        var view = new app.View(config);

        view.addEventListeners = function() {
            if(document.addEventListener) {
                $('select-color').addEventListener('change', this.selectColor, this);
                $('btn-single').addEventListener('click', this.pickSingle, this);
                $('btn-multi').addEventListener('click', this.pickMulti, this);
                $('btn-fill').addEventListener('click', this.pickFill, this);
                $('btn-clear').addEventListener('click', this.clearCanvas, this);
            } else {
                $('select-color').attachEvent('onchange', this.selectColor, this);
                $('btn-single').attachEvent('onclick', this.pickSingle);
                $('btn-multi').attachEvent('onclick', this.pickMulti);
                $('btn-fill').attachEvent('onclick', this.pickFill);
                $('btn-clear').attachEvent('onclick', this.clearCanvas);
            }
        };

        view.selectColor = function(e) {
            var val = e.target ? e.target.value : e.srcElement.value;
            Events.fire('select:color', val);
        };

        view.pickSingle = function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            Events.fire('pick:stroke', 'single');
        };

        view.pickMulti = function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            Events.fire('pick:stroke', 'multi');
        };

        view.pickFill = function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            Events.fire('pick:stroke', 'fill');
        };

        view.clearCanvas = function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            Events.fire('clear:canvas');
        };

        view.selectButton = function(type) {
            var selected = document.querySelector('.selected');
            if (selected) { selected.className = ''; }
            $('btn-' + type).className = 'selected';
        };

        Events.on('pick:stroke', view.selectButton);

        return view;

    }

    app.PaletteView = PaletteView;

}(App, App.Events));




