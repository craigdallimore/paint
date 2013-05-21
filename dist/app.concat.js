var App = {};

(function(app){

    var Events = {
        subscribers: {
            any: []
        },
        on: function(type, fn, context) {
            type = type || 'any';
            fn = typeof fn === 'function' ? fn : context[fn];

            if (typeof this.subscribers[type] === 'undefined') {
                this.subscribers[type] = [];
            }
            this.subscribers[type].push({ fn: fn, context: context || this });
        },
        off: function(type, fn, context) {
            this.eachSubscriber('unsubscribe', type, fn, context);
        },
        fire: function(type, args) {
            this.eachSubscriber('publish', type, args);
        },
        eachSubscriber: function(action, type, arg, context) {
            var eventType = type || 'any',
                subscribers = this.subscribers[eventType],
                i,
                max = subscribers ? subscribers.length : 0;

                for (i=0; i<max; i++) {
                    if (action === 'publish') {
                        subscribers[i].fn.call(subscribers[i].context, arg);
                    } else {
                        if (subscribers[i].fn === arg && subscribers[i].context === context) {
                            subscribers.splice(i, 1);
                        }
                    }
                }

        }
    };

    app.Events = Events;

}(App));

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
        pixelModel.set({ previousColor: color });
        pixelView.el.style.backgroundColor = '#' + color;
    };

    Mediator.prototype.multiStroke = function(pixelModel, pixelView, color) {

        if (!this.selection.length) {

            this.selection.push(pixelView);
            pixelView.el.style.backgroundColor = '#' + color;
            return;

        }

        var alreadySelectedPixel = this.selection[0].model;

        if ( alreadySelectedPixel.isInLineWith(pixelModel)) {

            this.selection = this.getLinearSelection(alreadySelectedPixel, pixelModel);
            this.selection.forEach(function(pixelView) {
                pixelView.el.style.backgroundColor = '#' + color;
            });
            this.clearSelection();

        } else {

            this.undoSelection();

        }

    };

    Mediator.prototype.fillStroke = function(pixelModel, pixelView, color) {

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
                    if (col === centreCol && row === centreRow) { continue; }
                    surroundingPixels.push(self.getPixelByCoords(row, col));
                }
            }

            return surroundingPixels;

        }

        function colorFilter(pv) {
            return pv.model.color !== color;
        }

        function selectedFilter(pv) {
            return self.selection.indexOf(pv) === -1;
        }

        var neighbours = getSurroundingPixels(pixelView);
        var sameColor = neighbours.filter(colorFilter);
        var different = sameColor.filter(selectedFilter);

        console.log('dif', different);
        this.selection = this.selection.concat(different);

        this.selection.forEach(function(pv) {
            var n = pv.model;
            console.log(n.get('row'), n.get('col'));
            //pv.el.style.backgroundColor = '#FFFF00';
        });
/*
 */


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
                this.fillStroke(pixelModel, view, color);
                break;
        }
    };













    Mediator.prototype.clearCanvas = function() {
        this.pixelViewCollection.forEach(function(pixelView) {
            pixelView.el.style.backgroundColor = '#ffffff';
        });
    };

    Mediator.prototype.clearSelection = function() {
        this.selection = [];
    };

    Mediator.prototype.undoSelection = function() {
        if (this.paletteModel.get('strokeType') !== 'multi') { return; }
        this.selection.forEach(function(pixelView) {
            pixelView.el.style.backgroundColor = '#' + pixelView.model.get('previousColor');
        });
        this.clearSelection();
    };

    app.Mediator = Mediator;

}(App, App.Events));

(function(app) {

    function Model(config) {
        this.attrs = {};
        this.set(config);
    }
    Model.prototype.get = function(attr) {
        if(typeof this.attrs[attr] !== 'undefined') {
            return this.attrs[attr];
        }
        return null;
    };
    Model.prototype.toJSON = function() {
        return this.attrs;
    };
    Model.prototype.set = function(hash) {
        for(var key in hash) {
            this.attrs[key] = hash[key];
        }
    };
    app.Model = Model;

}(App));




(function(app, Model, Events){

    function PaletteModel() {

        var model = new Model({
            color: 'ffffff',
            strokeType: 'single'
        });

        Events.on('select:color', function(color) {
            model.set({'color': color});
        });

        Events.on('pick:stroke', function(strokeType) {
            model.set({'strokeType': strokeType});
        });

        return model;
    }

    app.PaletteModel = PaletteModel;

}(App, App.Model, App.Events));

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





(function(app, Model, Events){

    function PixelModel(config) {

        var model = new Model(config);
        model.set({ previousColor: 'ffffff' });


        model.isInLineWith = function(other) {
            return ((model.get('row') === other.get('row')) || (model.get('col') === other.get('col')));
        };

        return model;
    }


    app.PixelModel = PixelModel;

}(App, App.Model, App.Events));


(function(app, Events) {

    function PixelView(config) {
        var view = new app.View(config);

        view.onClick = function() {
            var model = view.model;
            Events.fire('click:pixel', view.model);
        };

        view.addEventListeners = function() {
            view.el.addEventListener('click', view.onClick);
        };

        return view;

    }

    app.PixelView = PixelView;

}(App, App.Events));






(function(app) {

    function View(config) {
        for(var attr in config) {
            this[attr] = config[attr];
        }
    }

    View.prototype.render = function() {
        if (!this.el) {
            this.el = document.createElement(this.tagName || 'div');
            this.el.className = this.className || '';
        }
        if (this.template) {
            this.el.innerHTML = '';
            this.el.appendChild(this.template());
        }
        return this;
    };

    app.View = View;


}(App));


(function(app) {

    function Collection() {
        this.items = [];
    }
    Collection.prototype.push = function(item) {
        this.items.push(item);
    };
    Collection.prototype.forEach = function(fn) {
        this.items.forEach(fn);
    };
    Collection.prototype.get = function(query) {
        var results = [];
        this.items.forEach(function(item) {
            for(var key in query) {
                if(item.get(key).toString() === query[key].toString()) {
                    results.push(item);
                }
            }
        });
        return results;
    };
    Collection.prototype.last = function() {
        return this.items[this.items.length-1];
    },
    Collection.prototype.where = function(fn) {
        var i=0, length = this.items.length;
        for(; i<length; i++) {
            if (fn(this.items[i])) {
                return this.items[i];
            }
        }
    };
    Collection.prototype.sortBy = function(prop) {
        this.items.sort(function(a, b) {
            return b.get(prop) - a.get(prop);
        });
        return this;
    };
    Collection.prototype.sort = function(fn) {
        this.items.sort(fn);
        return this;
    };
    app.Collection = Collection;

}(App));


(function(app) {

    var Templates = {

        palette: function() {

            var htmlString =
            '<button id="btn-clear">Clear</button>' +
            '<button id="btn-single">Single</button>' +
            '<button id="btn-multi">Multi</button>' +
            '<button id="btn-fill">Fill</button>' +
            '<select id="select-color" name="select-color">' +
                '<option value="ffffff">White</option>' +
                '<option value="000000">Black</option>' +
                '<option value="ff0000">Red</option>' +
            '</select>',
            form = document.createElement('form');
            form.innerHTML = htmlString;

            return form;

        }
    };

    app.Templates = Templates;

}(App));

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

        ul.addEventListener('mouseleave', function() {
            App.Events.fire('mouseleave:canvas');
        });

    };

}(App));

App.start();