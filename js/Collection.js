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

