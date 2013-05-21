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

