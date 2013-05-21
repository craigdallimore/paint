(function(app, Events) {

    function Mediator(config) {
        for(var attr in config) {
            this[attr] = config[attr];
        }
        this.selection = [];

        Events.on('click:pixel', this.stroke, this);
        Events.on('clear:canvas', this.clearCanvas, this);
        Events.on('pick:stroke', this.clearSelection, this);
        Events.on('mouseleave:canvas', this.undoSelection, this);
    }

    Mediator.prototype.singleStroke = function(pixelModel, pixelView, color) {
        pixelModel.set({ color: color });
        pixelView.el.style.backgroundColor = color;
    };

    Mediator.prototype.multiStroke = function(pixelModel, pixelView, color) {

        if (!this.selection.length) {

            this.selection.push(pixelView);
            pixelView.el.style.backgroundColor = color;
            return;

        }

        var alreadySelectedPixel = this.selection[0].model;

        if ( alreadySelectedPixel.isInLineWith(pixelModel)) {

            this.selection = this.getLinearSelection(alreadySelectedPixel, pixelModel);
            this.selection.forEach(function(pixelView) {
                pixelView.model.set({ color: color });
                pixelView.el.style.backgroundColor = color;
            });
            this.clearSelection();

        } else {

            this.undoSelection();

        }

    };

    Mediator.prototype.fillStroke = function(pixelView, color) {

        this.selectAllNearbyByColour(pixelView, color);

        this.selection.forEach(function(pv) {
            pv.model.set({ color: color });
            pv.el.style.backgroundColor = color;
        });

        this.clearSelection();

    };

    Mediator.prototype.selectAllNearbyByColour = function(pixelView, color) {

        var collection = this.pixelViewCollection;
        var self = this;

        // Gets the adjacent pixels to the target pixelView
        function getSurroundingPixels(pv) {
            var surroundingPixels = [],
                model =     pv.model,
                lastPixel = collection.last().model,

                centreCol = model.get('col'),
                leftCol =   model.get('col') -1,
                rightCol =  model.get('col') +1,
                colMax =    lastPixel.get('col'),

                centreRow = model.get('row'),
                topRow =    model.get('row') -1,
                bottomRow = model.get('row') +1,
                rowMax =    lastPixel.get('row');

                leftCol =   (0 >= leftCol) ? 0 : leftCol;
                rightCol =  (colMax <= rightCol) ? colMax : rightCol;
                topRow =    (0 >= topRow) ? 0 : topRow;
                bottomRow = (rowMax <= bottomRow) ? rowMax : bottomRow;

            var col, row;

            for(row = topRow; row<=bottomRow; row++) {
                for(col = leftCol; col<=rightCol; col++) {
                    surroundingPixels.push(self.getPixelByCoords(row, col));
                }
            }

            return surroundingPixels;

        }

        function colorFilter(pv) {
            return pv.model.get('color') === pixelView.model.get('color');
        }

        function selectedFilter(pv) {
            return self.selection.indexOf(pv) === -1;
        }

        var neighbours = getSurroundingPixels(pixelView);
        var sameColor = neighbours.filter(colorFilter);
        var different = sameColor.filter(selectedFilter);

        this.selection = this.selection.concat(different);

        // Recurse over nearby similarly colored pixels and add them to the selection.
        different.forEach(function(pv) {
            self.selectAllNearbyByColour(pv, color);
        });

    };

    Mediator.prototype.getPixelByCoords = function(row, col) {
        return this.pixelViewCollection.where(function(pixelView) {
            return ((pixelView.model.get('row') === row) && (pixelView.model.get('col') === col));
        });
    };


    Mediator.prototype.getLinearSelection = function(a, b) {

        var linearSelection = [], max, col, row;

        if (a.get('row') === b.get('row')) {

            // get cols in this row
            row = a.get('row');
            col = a.get('col') < b.get('col') ? a.get('col') : b.get('col');
            max = a.get('col') > b.get('col') ? a.get('col') : b.get('col');

            while ( col <= max ) { linearSelection.push(this.getPixelByCoords(row, col++)); }
            return linearSelection;
        }

        if (a.get('col') === b.get('col')) {

            // get rows in this col
            col = a.get('col');
            row = a.get('row') < b.get('row') ? a.get('row') : b.get('row');
            max = a.get('row') > b.get('row') ? a.get('row') : b.get('row');

            while ( row <= max ) { linearSelection.push(this.getPixelByCoords(row++, col)); }
            return linearSelection;
        }

    };

    Mediator.prototype.stroke = function(pixelModel) {

        var color = this.paletteModel.get('color'),
            strokeType = this.paletteModel.get('strokeType'),
            view;

        this.pixelViewCollection.forEach(function(pixelView) {
            if (pixelView.model === pixelModel) {
                view = pixelView;
            }
        });

        switch (strokeType) {
            case 'single':
                this.singleStroke(pixelModel, view, color);
                break;
            case 'multi':
                this.multiStroke(pixelModel, view, color);
                break;
            case 'fill':
                this.fillStroke(view, color);
                break;
        }
    };

    Mediator.prototype.clearCanvas = function() {
        this.pixelViewCollection.forEach(function(pixelView) {
            pixelView.model.set({ color: '#ffffff'});
            pixelView.el.style.backgroundColor = '#ffffff';
        });
        Events.fire('pick:stroke', 'single');
    };

    Mediator.prototype.clearSelection = function() {
        this.selection = [];
    };

    Mediator.prototype.undoSelection = function() {
        if (this.paletteModel.get('strokeType') !== 'multi') { return; }
        this.selection.forEach(function(pixelView) {
            pixelView.el.style.backgroundColor = pixelView.model.get('color');
        });
        this.clearSelection();
    };

    app.Mediator = Mediator;

}(App, App.Events));
