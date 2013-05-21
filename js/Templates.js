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
