(function () {
    "use strict";

    var nodes, formOrder;

    $.ajax({
        url: 'data/form-to-model.html',
        dataType: 'html',
        async: false,
        success: function (html) {
            nodes = $('<div />').html(html);
        }
    });

    /**
     * @type {jQuery}
     */
    formOrder = nodes.find('#formOrder');

    describe('FormToModel', function () {
        describe('#bindControl()', function () {
            var Model = Backbone.Model.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), formOrder),
                model = formToModel.getModel();

            it('"simple_name" Powinno zwrócić "lorem ipsum"', function () {
                formToModel.bindControl('simple_name');
                expect(model.get('simple_name')).to.be('lorem ipsum');
            });
        });
    });
}());
