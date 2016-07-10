(function () {
    "use strict";

    var nodes, form;

    $.ajax({
        url: 'data/model-to-form.html',
        dataType: 'html',
        async: false,
        success: function (html) {
            nodes = $('<div />').html(html);
        }
    });

    /**
     * @type {jQuery}
     */
    form = nodes.find('#form');

    describe('ModelToForm', function () {
        describe('#bindAttribute() - z nawiasami, z prefiksem', function () {
            var Model = Backbone.Model.extend(),
                modelToForm = new Backbone.form.ModelToForm(new Model(), form, {
                    prefix: 'order'
                }),
                model = modelToForm.getModel();

            it('Sprawdzanie czy wartości atrybutów modelu zostały prawidłowo naniesione na formularz', function () {
                model.set({
                    first_name: 'Sebastien'
                });

                modelToForm.bindAttribute(['first_name']);
                expect(modelToForm.formHelper.getControlValue('order[first_name]')).to.be('Sebastien');
            });
        });
    });
}());
