(function () {
    "use strict";

    /**
     * @returns {jQuery}
     */
    function getForm () {
        var nodes;

        $.ajax({
            url: 'data/model-to-form-auto.html',
            dataType: 'html',
            async: false,
            success: function (html) {
                nodes = $('<div />').html(html);
            }
        });

        return nodes.find('#form');
    }

    /**
     * @param {Backbone.form.ModelToForm} modelToForm
     * @param {Object} order
     * @param {String} field
     * @param value
     */
    function testOrderValue (modelToForm, order, field, value) {
        var obj = $.extend(true, {}, order);
        obj[field] = value;
        modelToForm.getModel().set('order', obj);
        expect(modelToForm.formHelper.getControlValue('order[' + field + ']')).to.eql(value);
        order[field] = value;
    }

    describe('ModelToForm - autobinding', function () {
        var Model = Backbone.Model.extend(),
            modelToForm = new Backbone.form.ModelToForm(new Model(), getForm(), {
                auto: true
            }),
            model = modelToForm.getModel(),
            formHelper = modelToForm.formHelper;

        it('Autobinding jest włączone', function () {
            expect(modelToForm.isAuto()).to.be(true);
        });

        it('Sprawdzanie czy włącznik/wyłącznik działa', function () {
            model.set('order', {first_name: 'Zbigniew'});
            expect(formHelper.getControlValue('order[first_name]')).to.be('Zbigniew');
            model.set('order', {first_name: 'Test'});
            expect(formHelper.getControlValue('order[first_name]')).to.be('Test');
            modelToForm.auto(false);
            model.set('order', {first_name: 'Lorem'});
            expect(formHelper.getControlValue('order[first_name]')).to.be('Test');
            modelToForm.auto(true);
            model.set('order', {first_name: 'Zygmunt'});
            expect(formHelper.getControlValue('order[first_name]')).to.be('Zygmunt');
            model.set('order', {first_name: ''});
            expect(formHelper.getControlValue('order[first_name]')).to.be('');
        });

        it('Sprawdzanie czy wartości są nanoszone na formularz', function () {
            var defaultValue = '____',
                order = {
                first_name: defaultValue,
                last_name: defaultValue,
                email: defaultValue,
                tel: defaultValue,
                unknown: defaultValue,
                customer_type: null,
                post: null,
                agree1: null,
                agree2: null,
                comment: defaultValue,
                address: {
                    street: defaultValue,
                    house_number: defaultValue,
                    city: null
                },
                item: null,
                sub_item: null,
                addition: null,
                rules: null
            }, obj;

            model.set('order', order);
            expect(formHelper.getControlValue('order[first_name]')).to.be(defaultValue);
            expect(formHelper.getControlValue('order[last_name]')).to.be(defaultValue);
            expect(formHelper.getControlValue('order[email]')).to.be(defaultValue);
            expect(formHelper.getControlValue('order[tel]')).to.be(defaultValue);
            expect(formHelper.getControlValue('order[unknown]')).to.be(defaultValue);
            expect(formHelper.getControlValue('order[customer_type]')).to.be(null);
            expect(formHelper.getControlValue('order[post]')).to.be(null);
            expect(formHelper.getControlValue('order[agree1]')).to.be(null);
            expect(formHelper.getControlValue('order[agree2]')).to.be(null);
            expect(formHelper.getControlValue('order[comment]')).to.be(defaultValue);
            expect(formHelper.getControlValue('order[address][street]')).to.be(defaultValue);
            expect(formHelper.getControlValue('order[address][house_number]')).to.be(defaultValue);
            expect(formHelper.getControlValue('order[address][city]')).to.be(null);
            expect(formHelper.getControlValue('order[item][]')).to.be(null);
            expect(formHelper.getControlValue('order[sub_item][]')).to.be('item1');
            expect(formHelper.getControlValue('order[addition][]')).to.be(null);
            expect(formHelper.getControlValue('order[rules]')).to.be(null);

            testOrderValue(modelToForm, order, 'first_name', 'John');
            testOrderValue(modelToForm, order, 'last_name', 'Doe');
            testOrderValue(modelToForm, order, 'email', 'john@doe.com');
            testOrderValue(modelToForm, order, 'tel', '123456789');
            testOrderValue(modelToForm, order, 'unknown', 'test');
            testOrderValue(modelToForm, order, 'customer_type', 'person');
            testOrderValue(modelToForm, order, 'post', '2');
            testOrderValue(modelToForm, order, 'agree1', 'yes');
            testOrderValue(modelToForm, order, 'agree2', 'yes');
            testOrderValue(modelToForm, order, 'comment', 'test');
            testOrderValue(modelToForm, order, 'rules', 'yes');
            expect(formHelper.getControlValue('order[first_name]')).to.be('John');
            expect(formHelper.getControlValue('order[last_name]')).to.be('Doe');
            expect(formHelper.getControlValue('order[unknown]')).to.be('test');

            obj = $.extend(true, {}, order);
            obj.address.street = 'Ćwiartki 3/4';
            model.set('order', obj);
            expect(formHelper.getControlValue('order[address][street]')).to.be('Ćwiartki 3/4');
            order.address.street = 'Ćwiartki 3/4';

            obj = $.extend(true, {}, order);
            obj.item = ['item1', 'item2'];
            model.set('order', obj);
            expect(formHelper.getControlValue('order[item][]')).to.eql(['item1', 'item2']);
            order.item = ['item1', 'item2'];

            expect(formHelper.getControlValue('order[rules]')).to.eql('yes');
            model.set('order.item[]', ['item2', 'item1']);
            expect(formHelper.getControlValue('order.item[]')).to.eql(['item1', 'item2']);
            model.set('simple_name', 'lorem ipsum');
            expect(formHelper.getControlValue('simple_name')).to.be('lorem ipsum');

            model.clear();
            expect(formHelper.getControlValue('order[first_name]')).to.be('');
            expect(formHelper.getControlValue('order[last_name]')).to.be('');
            expect(formHelper.getControlValue('order[email]')).to.be('');
            expect(formHelper.getControlValue('order[tel]')).to.be('');
            expect(formHelper.getControlValue('order[unknown]')).to.be('');
            expect(formHelper.getControlValue('order[customer_type]')).to.be(null);
            expect(formHelper.getControlValue('order[post]')).to.be(null);
            expect(formHelper.getControlValue('order[agree1]')).to.be(null);
            expect(formHelper.getControlValue('order[agree2]')).to.be(null);
            expect(formHelper.getControlValue('order[comment]')).to.be('');
            expect(formHelper.getControlValue('order[address][street]')).to.be('');
            expect(formHelper.getControlValue('order[address][house_number]')).to.be('');
            expect(formHelper.getControlValue('order[address][city]')).to.be(null);
            expect(formHelper.getControlValue('order[item][]')).to.be(null);
            expect(formHelper.getControlValue('order[sub_item][]')).to.be('item1');
            expect(formHelper.getControlValue('order[addition][]')).to.be(null);
            expect(formHelper.getControlValue('order[rules]')).to.be(null);

            model.set({
                order: {
                    first_name: 'AAAA',
                    last_name: 'BBBB'
                }
            });

            expect(formHelper.getControlValue('order[first_name]')).to.be('AAAA');
            expect(formHelper.getControlValue('order[last_name]')).to.be('BBBB');

            model.set({
                order: {
                    first_name: 'CCCC'
                }
            });

            expect(formHelper.getControlValue('order[first_name]')).to.be('CCCC');
            expect(formHelper.getControlValue('order[last_name]')).to.be('');

            model.set({
                order: {
                    last_name: 'DDDD'
                }
            });

            expect(formHelper.getControlValue('order[first_name]')).to.be('');
            expect(formHelper.getControlValue('order[last_name]')).to.be('DDDD');
        });
    });
}());
