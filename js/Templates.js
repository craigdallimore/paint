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
