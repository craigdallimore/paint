(function(App) {

    var canvasView = new App.View({ el: document.querySelector('.paint') }),
        paletteModel = new App.PaletteModel(),
        paletteView = new App.PaletteView({ className: 'palette', template: App.Templates.palette, model: paletteModel }),
        pixelModelCollection = new App.Collection(),
        pixelViewCollection = new App.Collection(),

        mediator = new App.Mediator({
            paletteModel: paletteModel,
            pixelViewCollection: pixelViewCollection
        });


    function createPixels(cols, rows) {

        var col,
            row,
            pixelModel,
            pixelView,
            fragment = document.createDocumentFragment();

        for(row=0; row<rows; row++) {
            for(col=0; col<cols; col++) {

                pixelModel = new App.PixelModel({ row: row, col: col });
                pixelView = new App.PixelView({ model: pixelModel, tagName: 'li' });
                pixelModelCollection.push(pixelModel);
                pixelViewCollection.push(pixelView);
                fragment.appendChild(pixelView.render().el);
                pixelView.addEventListeners();

            }
        }

        return fragment;

    }

    App.start = function() {

        var cols = canvasView.el.getAttribute('data-m'),
            rows = canvasView.el.getAttribute('data-n'),
            pixels = createPixels(cols, rows),
            ul = document.createElement('ul');

        // Setup
        canvasView.el.appendChild(paletteView.render().el);
        paletteView.addEventListeners();
        canvasView.el.appendChild(ul);
        ul.appendChild(pixels);

        // Set width of canvas
        ul.style.width = (cols * (ul.children[0].clientWidth + 1)) + 1 + 'px';

        if (ul.addEventListener) {
            ul.addEventListener('mouseleave', function() {
                App.Events.fire('mouseleave:canvas');
            });
        } else {
            ul.attachEvent('onmouseleave', function() {
                App.Events.fire('mouseleave:canvas');
            });
        }

    };

}(App));

App.start();
