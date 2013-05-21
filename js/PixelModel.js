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

