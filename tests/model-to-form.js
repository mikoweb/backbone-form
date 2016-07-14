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
                    first_name: 'Sebastien',
                    last_name: 'Loeb',
                    email: 'test@test.test',
                    tel: '123456789',
                    unknown: 'lorem',
                    customer_type: 'person',
                    post: 'no exists value',
                    agree1: true
                });

                modelToForm.bindAttribute(['first_name']);
                expect(modelToForm.formHelper.getControlValue('order[first_name]')).to.be('Sebastien');
                modelToForm.bindAttribute(['last_name']);
                expect(modelToForm.formHelper.getControlValue('order[last_name]')).to.be('Loeb');
                modelToForm.bindAttribute(['email']);
                expect(modelToForm.formHelper.getControlValue('order[email]')).to.be('test@test.test');
                modelToForm.bindAttribute(['tel']);
                expect(modelToForm.formHelper.getControlValue('order[tel]')).to.be('123456789');
                modelToForm.bindAttribute(['unknown']);
                expect(modelToForm.formHelper.getControlValue('order[unknown]')).to.be('lorem');
                modelToForm.bindAttribute(['customer_type']);
                expect(modelToForm.formHelper.getControlValue('order[customer_type]')).to.be('person');
                modelToForm.bindAttribute(['post']);
                expect(modelToForm.formHelper.getControlValue('order[post]')).to.be(null);
                modelToForm.bindAttribute(['agree1']);
                expect(modelToForm.formHelper.getControlValue('order[agree1]')).to.eql(['yes']);
            });
        });
    });
}());
