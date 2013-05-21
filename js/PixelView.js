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





