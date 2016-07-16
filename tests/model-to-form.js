(function () {
    "use strict";

    /**
     * @returns {jQuery}
     */
    function getForm () {
        var nodes;

        $.ajax({
            url: 'data/model-to-form.html',
            dataType: 'html',
            async: false,
            success: function (html) {
                nodes = $('<div />').html(html);
            }
        });

        return nodes.find('#form');
    }

    describe('ModelToForm', function () {
        describe('#bindAttribute() - z nawiasami, z prefiksem', function () {
            var Model = Backbone.Model.extend(),
                modelToForm = new Backbone.form.ModelToForm(new Model(), getForm(), {
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
                    agree1: true,
                    agree2: false,
                    comment: 'Lorem Ipsum',
                    address: {
                        street: 'Wall Street',
                        house_number: 20,
                        city: 'gdynia'
                    },
                    button1: 'test',
                    item: ['item2', 'item6'],
                    sub_item: ['item1', 'item2'],
                    addition: ['addition2', 'addition3'],
                    rules: 'yes',
                    "address.city": 'test'
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
                modelToForm.bindAttribute(['agree2']);
                expect(modelToForm.formHelper.getControlValue('order[agree2]')).to.be(null);
                modelToForm.bindAttribute(['comment']);
                expect(modelToForm.formHelper.getControlValue('order[comment]')).to.be('Lorem Ipsum');
                modelToForm.bindAttribute(['address']);
                expect(modelToForm.formHelper.getControlValue('order[address][street]')).to.be('');
                modelToForm.bindAttribute(['address', 'street']);
                expect(modelToForm.formHelper.getControlValue('order[address][street]')).to.be('Wall Street');
                modelToForm.bindAttribute(['address', 'house_number']);
                expect(modelToForm.formHelper.getControlValue('order[address][house_number]')).to.be('20');
                modelToForm.bindAttribute(['address', 'city']);
                expect(modelToForm.formHelper.getControlValue('order[address][city]')).to.be('gdynia');
                modelToForm.bindAttribute(['button1']);
                expect(modelToForm.formHelper.getControlValue('order[button1]')).to.be(null);
                modelToForm.bindAttribute(['item']);
                expect(modelToForm.formHelper.getControlValue('order[item][]')).to.eql(['item2', 'item6']);
                modelToForm.bindAttribute(['sub_item']);
                expect(modelToForm.formHelper.getControlValue('order[sub_item][]')).to.be('item1');
                modelToForm.bindAttribute(['addition']);
                expect(modelToForm.formHelper.getControlValue('order[addition][]')).to.eql(['addition2', 'addition3']);
                modelToForm.bindAttribute(['rules']);
                expect(modelToForm.formHelper.getControlValue('order[rules]')).to.eql(['yes']);
                modelToForm.bindAttribute(['address.city']);
                expect(modelToForm.formHelper.getControlValue('order.address.city')).to.be('');
            });
        });

        describe('#bindAttribute() - z nawiasami, bez prefixu', function () {
            var Model = Backbone.Model.extend(),
                modelToForm = new Backbone.form.ModelToForm(new Model(), getForm()),
                model = modelToForm.getModel();

            it('Sprawdzanie czy wartości atrybutów modelu zostały prawidłowo naniesione na formularz', function () {
                model.set({
                    order: {
                        first_name: 'Sebastien',
                        last_name: 'Loeb',
                        email: 'test@test.test',
                        tel: '123456789',
                        unknown: 'lorem',
                        customer_type: 'person',
                        post: 'no exists value',
                        agree1: true,
                        agree2: false,
                        comment: 'Lorem Ipsum',
                        address: {
                            street: 'Wall Street',
                            house_number: 20,
                            city: 'gdynia'
                        },
                        button1: 'test',
                        item: ['item2', 'item6'],
                        sub_item: ['item1', 'item2'],
                        addition: ['addition2', 'addition3'],
                        rules: 'yes'
                    },
                    "order.address.city": 'test',
                    "order.first_name": 'John',
                    "order.last_name": 'Doe',
                    "order.email": 'john@doe.com',
                    "order.item": ['item1', 'item2']
                });

                modelToForm.bindAttribute(['order', 'first_name']);
                expect(modelToForm.formHelper.getControlValue('order[first_name]')).to.be('Sebastien');
                modelToForm.bindAttribute(['order', 'last_name']);
                expect(modelToForm.formHelper.getControlValue('order[last_name]')).to.be('Loeb');
                modelToForm.bindAttribute(['order', 'email']);
                expect(modelToForm.formHelper.getControlValue('order[email]')).to.be('test@test.test');
                modelToForm.bindAttribute(['order', 'tel']);
                expect(modelToForm.formHelper.getControlValue('order[tel]')).to.be('123456789');
                modelToForm.bindAttribute(['order', 'unknown']);
                expect(modelToForm.formHelper.getControlValue('order[unknown]')).to.be('lorem');
                modelToForm.bindAttribute(['order', 'customer_type']);
                expect(modelToForm.formHelper.getControlValue('order[customer_type]')).to.be('person');
                modelToForm.bindAttribute(['order', 'post']);
                expect(modelToForm.formHelper.getControlValue('order[post]')).to.be(null);
                modelToForm.bindAttribute(['order', 'agree1']);
                expect(modelToForm.formHelper.getControlValue('order[agree1]')).to.eql(['yes']);
                modelToForm.bindAttribute(['order', 'agree2']);
                expect(modelToForm.formHelper.getControlValue('order[agree2]')).to.be(null);
                modelToForm.bindAttribute(['order', 'comment']);
                expect(modelToForm.formHelper.getControlValue('order[comment]')).to.be('Lorem Ipsum');
                modelToForm.bindAttribute(['order', 'address']);
                expect(modelToForm.formHelper.getControlValue('order[address][street]')).to.be('');
                modelToForm.bindAttribute(['order', 'address', 'street']);
                expect(modelToForm.formHelper.getControlValue('order[address][street]')).to.be('Wall Street');
                modelToForm.bindAttribute(['order', 'address', 'house_number']);
                expect(modelToForm.formHelper.getControlValue('order[address][house_number]')).to.be('20');
                modelToForm.bindAttribute(['order', 'address', 'city']);
                expect(modelToForm.formHelper.getControlValue('order[address][city]')).to.be('gdynia');
                modelToForm.bindAttribute(['order', 'button1']);
                expect(modelToForm.formHelper.getControlValue('order[button1]')).to.be(null);
                modelToForm.bindAttribute(['order', 'item']);
                expect(modelToForm.formHelper.getControlValue('order[item][]')).to.eql(['item2', 'item6']);
                modelToForm.bindAttribute(['order', 'sub_item']);
                expect(modelToForm.formHelper.getControlValue('order[sub_item][]')).to.be('item1');
                modelToForm.bindAttribute(['order', 'addition']);
                expect(modelToForm.formHelper.getControlValue('order[addition][]')).to.eql(['addition2', 'addition3']);
                modelToForm.bindAttribute(['order', 'rules']);
                expect(modelToForm.formHelper.getControlValue('order[rules]')).to.eql(['yes']);
                modelToForm.bindAttribute(['order.address.city']);
                expect(modelToForm.formHelper.getControlValue('order.address.city')).to.be('test');
                modelToForm.bindAttribute(['order.first_name']);
                expect(modelToForm.formHelper.getControlValue('order.first_name')).to.be('John');
                modelToForm.bindAttribute(['order.last_name']);
                expect(modelToForm.formHelper.getControlValue('order.last_name')).to.be('Doe');
                modelToForm.bindAttribute(['order.email']);
                expect(modelToForm.formHelper.getControlValue('order.email')).to.be('john@doe.com');
                modelToForm.bindAttribute(['order.item']);
                expect(modelToForm.formHelper.getControlValue('order.item[]')).to.eql(['item1', 'item2']);
            });
        });

        describe('#bindAttribute() - z separatorem, z prefiksem', function () {
            var Model = Backbone.Model.extend(),
                modelToForm = new Backbone.form.ModelToForm(new Model(), getForm(), {
                    prefix: 'order',
                    naming: Backbone.form.FormHelper.MODES.separator,
                    separator: '.'
                }),
                model = modelToForm.getModel();

            it('Sprawdzanie czy wartości atrybutów modelu zostały prawidłowo naniesione na formularz', function () {
                model.set({
                    first_name: 'Toni',
                    last_name: 'Kros',
                    email: 'toni@kros.com',
                    item: ['item6', 'item7', 'item3', 'not_found'],
                    address: {
                        city: 'Madrid'
                    },
                    comment: 'Lorem Ipsum'
                });

                modelToForm.bindAttribute(['first_name']);
                expect(modelToForm.formHelper.getControlValue('order.first_name')).to.be('Toni');
                modelToForm.bindAttribute(['last_name']);
                expect(modelToForm.formHelper.getControlValue('order.last_name')).to.be('Kros');
                modelToForm.bindAttribute(['email']);
                expect(modelToForm.formHelper.getControlValue('order.email')).to.be('toni@kros.com');
                modelToForm.bindAttribute(['item']);
                expect(modelToForm.formHelper.getControlValue('order.item[]')).to.eql(['item3', 'item6', 'item7']);
                modelToForm.bindAttribute(['address', 'city']);
                expect(modelToForm.formHelper.getControlValue('order.address.city')).to.be('Madrid');
                modelToForm.bindAttribute(['comment']);
                expect(modelToForm.formHelper.getControlValue('order[comment]')).to.be('');
            });
        });

        describe('#bindAttribute() - z separatorem, bez prefiksu', function () {
            var Model = Backbone.Model.extend(),
                modelToForm = new Backbone.form.ModelToForm(new Model(), getForm(), {
                    naming: Backbone.form.FormHelper.MODES.separator,
                    separator: '.'
                }),
                model = modelToForm.getModel();

            it('Sprawdzanie czy wartości atrybutów modelu zostały prawidłowo naniesione na formularz', function () {
                model.set({
                    order: {
                        first_name: 'Toni',
                        last_name: 'Kros',
                        email: 'toni@kros.com',
                        item: ['item6', 'item7', 'item3', 'not_found'],
                        address: {
                            city: 'Madrid'
                        }
                    },
                    "order[comment]": 'Lorem Ipsum'
                });

                modelToForm.bindAttribute(['order', 'first_name']);
                expect(modelToForm.formHelper.getControlValue('order.first_name')).to.be('Toni');
                modelToForm.bindAttribute(['order', 'last_name']);
                expect(modelToForm.formHelper.getControlValue('order.last_name')).to.be('Kros');
                modelToForm.bindAttribute(['order', 'email']);
                expect(modelToForm.formHelper.getControlValue('order.email')).to.be('toni@kros.com');
                modelToForm.bindAttribute(['order', 'item']);
                expect(modelToForm.formHelper.getControlValue('order.item[]')).to.eql(['item3', 'item6', 'item7']);
                modelToForm.bindAttribute(['order', 'address', 'city']);
                expect(modelToForm.formHelper.getControlValue('order.address.city')).to.be('Madrid');
                modelToForm.bindAttribute(['order[comment]']);
                expect(modelToForm.formHelper.getControlValue('order[comment]')).to.be('Lorem Ipsum');
            });
        });
    });
}());
