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
