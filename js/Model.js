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



