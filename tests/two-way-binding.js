(function () {
    "use strict";

    /**
     * @returns {jQuery}
     */
    function getForm () {
        var nodes;

        $.ajax({
            url: 'data/two-way-binding.html',
            dataType: 'html',
            async: false,
            success: function (html) {
                nodes = $('<div />').html(html);
            }
        });

        return nodes.find('#form');
    }

    var Model = Backbone.Model.extend({
        url: 'data/data.json'
    });

    describe('TwoWayBinding', function () {
        it('FormToModel i ModelToForm powinny być ze sobą powiązane', function () {
            var twoWayBinding = new Backbone.form.TwoWayBinding(new Model(), $('<div />')),
                formToModel = twoWayBinding.getFormToModel(),
                modelToForm = twoWayBinding.getModelToForm();

            expect(formToModel.isRelatedWith(modelToForm)).to.be(true);
            expect(modelToForm.isRelatedWith(formToModel)).to.be(true);
        });

        it('Auto powinno być domyślnie wyłączone', function () {
            var twoWayBinding = new Backbone.form.TwoWayBinding(new Model(), $('<div />')),
                formToModel = twoWayBinding.getFormToModel(),
                modelToForm = twoWayBinding.getModelToForm();

            expect(twoWayBinding.isAuto()).to.be(false);
            expect(formToModel.isAuto()).to.be(false);
            expect(modelToForm.isAuto()).to.be(false);
        });

        it('Włączanie auto przez konstruktor', function () {
            var twoWayBinding = new Backbone.form.TwoWayBinding(new Model(), $('<div />'), {auto: true}),
                formToModel = twoWayBinding.getFormToModel(),
                modelToForm = twoWayBinding.getModelToForm();

            expect(twoWayBinding.isAuto()).to.be(true);
            expect(formToModel.isAuto()).to.be(true);
            expect(modelToForm.isAuto()).to.be(true);
        });

        it('Włączanie auto przez metodę', function () {
            var twoWayBinding = new Backbone.form.TwoWayBinding(new Model(), $('<div />')),
                formToModel = twoWayBinding.getFormToModel(),
                modelToForm = twoWayBinding.getModelToForm();

            twoWayBinding.auto(true);
            expect(twoWayBinding.isAuto()).to.be(true);
            expect(formToModel.isAuto()).to.be(true);
            expect(modelToForm.isAuto()).to.be(true);
        });

        it('Auto powinno dać się wyłączyć', function () {
            var twoWayBinding = new Backbone.form.TwoWayBinding(new Model(), $('<div />')),
                formToModel = twoWayBinding.getFormToModel(),
                modelToForm = twoWayBinding.getModelToForm();

            twoWayBinding.auto(true);
            expect(twoWayBinding.isAuto()).to.be(true);
            expect(formToModel.isAuto()).to.be(true);
            expect(modelToForm.isAuto()).to.be(true);
            twoWayBinding.auto(false);
            expect(twoWayBinding.isAuto()).to.be(false);
            expect(formToModel.isAuto()).to.be(false);
            expect(modelToForm.isAuto()).to.be(false);
        });

        it('Sprawdzanie czy autobinding działa', function (done) {
            var model = new Model(),
                form = getForm(),
                twoWayBinding = new Backbone.form.TwoWayBinding(model, form),
                modelToForm = twoWayBinding.getModelToForm();

            twoWayBinding.auto(true);
            model.fetch({
                success: function () {
                    expect(modelToForm.formHelper.getControlValue('order[first_name]')).to.be('Sebastien');
                    expect(modelToForm.formHelper.getControlValue('order[last_name]')).to.be('Loeb');
                    expect(modelToForm.formHelper.getControlValue('order[email]')).to.be('test@test.test');
                    expect(modelToForm.formHelper.getControlValue('order[tel]')).to.be('123456789');
                    expect(modelToForm.formHelper.getControlValue('order[unknown]')).to.be('lorem');
                    expect(modelToForm.formHelper.getControlValue('order[customer_type]')).to.be('person');
                    expect(modelToForm.formHelper.getControlValue('order[post]')).to.be(null);
                    expect(modelToForm.formHelper.getControlValue('order[agree1]')).to.eql(['yes']);
                    expect(modelToForm.formHelper.getControlValue('order[agree2]')).to.be(null);
                    expect(modelToForm.formHelper.getControlValue('order[comment]')).to.be('Lorem Ipsum');
                    expect(modelToForm.formHelper.getControlValue('order[address][street]')).to.be('Wall Street');
                    expect(modelToForm.formHelper.getControlValue('order[address][house_number]')).to.be('20');
                    expect(modelToForm.formHelper.getControlValue('order[address][city]')).to.be('gdynia');
                    expect(modelToForm.formHelper.getControlValue('order[button1]')).to.be(null);
                    expect(modelToForm.formHelper.getControlValue('order[item][]')).to.eql(['item2', 'item6']);
                    expect(modelToForm.formHelper.getControlValue('order[sub_item][]')).to.be('item1');
                    expect(modelToForm.formHelper.getControlValue('order[addition][]')).to.eql(['addition2', 'addition3']);
                    expect(modelToForm.formHelper.getControlValue('order[rules]')).to.eql(['yes']);
                    expect(modelToForm.formHelper.getControlValue('order.address.city')).to.be('test');
                    expect(modelToForm.formHelper.getControlValue('order.first_name')).to.be('John');
                    expect(modelToForm.formHelper.getControlValue('order.last_name')).to.be('Doe');
                    expect(modelToForm.formHelper.getControlValue('order.email')).to.be('john@doe.com');
                    expect(modelToForm.formHelper.getControlValue('order.item[]')).to.eql(['item1', 'item2']);

                    form.find('[name="order[first_name]"]').val('Jan').trigger('change');
                    expect(model.get('order').first_name).to.be('Jan');
                    form.find('[name="order[comment]"]').val('Test').trigger('change');
                    expect(model.get('order').comment).to.be('Test');

                    var order = $.extend(true, {}, model.get('order'));
                    order.last_name = 'Kowalski';
                    model.set('order', order);
                    expect(modelToForm.formHelper.getControlValue('order[last_name]')).to.be('Kowalski');

                    done();
                }
            });
        });
    });
}());
