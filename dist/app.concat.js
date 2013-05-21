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
            color: '#000000',
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





(function(app, Model, Events){

    function PixelModel(config) {

        var model = new Model(config);
        model.set({ color: '#ffffff' });


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
            if( view.el.addEventListener ) {
                view.el.addEventListener('click', view.onClick);
            } else {
                view.el.attachEvent('onclick', view.onClick);
            }
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
            '<button id="btn-single" class="selected">Single</button>' +
            '<button id="btn-multi">Multi</button>' +
            '<button id="btn-fill">Fill</button>' +
            '<select id="select-color" name="select-color">' +
                '<option selected="selected" value="#000000">Black</option>' +
                '<option value="#0000AA">Blue</option>' +
                '<option value="#00AA00">Green</option>' +
                '<option value="#00AAAA">Cyan</option>' +
                '<option value="#AA0000">Red</option>' +
                '<option value="#AA00AA">Magenta</option>' +
                '<option value="#AA5500">Brown</option>' +
                '<option value="#AAAAAA">Light Grey</option>' +
                '<option value="#555555">Dark Grey</option>' +
                '<option value="#5555FF">Bright Blue</option>' +
                '<option value="#55FF55">Bright Green</option>' +
                '<option value="#55FFFF">Bright Cyan</option>' +
                '<option value="#FF5555">Bright Red</option>' +
                '<option value="#FF55FF">Bright Magenta</option>' +
                '<option value="#FFFF55">Bright Yellow</option>' +
                '<option value="#FFFFFF">Bright White</option>' +
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
