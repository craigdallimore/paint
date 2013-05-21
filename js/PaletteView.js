(function(app, Events) {

    function $(id) {
        return document.getElementById(id);
    }

    function PaletteView(config) {
        var view = new app.View(config);

        view.addEventListeners = function() {
            $('select-color').addEventListener('change', this.selectColor, this);
            $('btn-single').addEventListener('click', this.pickSingle, this);
            $('btn-multi').addEventListener('click', this.pickMulti, this);
            $('btn-fill').addEventListener('click', this.pickFill, this);
            $('btn-clear').addEventListener('click', this.clearCanvas, this);
        };

        view.selectColor = function(e) {
            Events.fire('select:color', e.target.value);
        };

        view.pickSingle = function(e) {
            e.preventDefault();
            Events.fire('pick:stroke', 'single');
        };

        view.pickMulti = function(e) {
            e.preventDefault();
            Events.fire('pick:stroke', 'multi');
        };

        view.pickFill = function(e) {
            e.preventDefault();
            Events.fire('pick:stroke', 'fill');
        };

        view.clearCanvas = function(e) {
            e.preventDefault();
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




