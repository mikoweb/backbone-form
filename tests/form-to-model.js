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
        describe('#bindControl() - z nawiasami, bez prefiksu', function () {
            var Model = Backbone.Model.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                    keepPrefix: false
                }),
                model = formToModel.getModel();

            function test (controlName, modelField, value) {
                it("model.get('" + modelField + "') powinno zwrócić '" + value + "'", function () {
                    formToModel.bindControl(controlName);
                    expect(model.get(modelField)).to.eql(value);
                });
            }

            it('Musi rzucić wyjątek, bo nie ma pola o nazwie abcdef', function () {
                expect(formToModel.bindControl).withArgs('abcdef').to.throwException();
            });

            test('simple_name', 'simple_name', 'lorem ipsum');
            test('order[attachment]', 'attachment', undefined);
            test('order[first_name]', 'first_name', 'John');
            test('order[last_name]', 'last_name', 'Doe');
            test('order[email]', 'email', 'john@doe.com');
            test('order[tel]', 'tel', '123456789');
            test('order[unknown]', 'unknown', 'unknown_value');
            test('order[post]', 'post', '3');
            test('order[agree1]', 'agree1', undefined);
            test('order[agree2]', 'agree2', 'yes');
            test('order[comment]', 'comment', 'lorem ipsum');
            test('order[address][street]', 'address', {
                street: 'Mickiewicza 45'
            });
            test('order[address][house_number]', 'address', {
                street: 'Mickiewicza 45',
                house_number: '10'
            });
            test('order[address][city]', 'address', {
                street: 'Mickiewicza 45',
                house_number: '10',
                city: 'gdynia'
            });
            test('order[button1]', 'button1', undefined);
            test('order[button2]', 'button2', undefined);
            test('order[button3]', 'button3', undefined);
            test('order[button4]', 'button4', undefined);
            test('order[button5]', 'button5', undefined);
            test('order[image]', 'image', undefined);
            test('order[item][]', 'item', ['item3', 'item5', 'item6']);
            test('order[sub_item][]', 'sub_item', 'item3');
            test('order[addition][]', 'addition', ['addition3', 'addition5']);
            test('order[rules]', 'rules', undefined);
            test('order.first_name', 'order.first_name', 'Jan');
            test('order.last_name', 'order.last_name', 'Kowalski');
            test('order.email', 'order.email', 'jan@kowalski.pl');
            test('order.address.city', 'order.address.city', 'Warszawa');
            test('order.item[]', 'order.item', ['item3', 'item5', 'item6']);
        });
        describe('#bindControl() - z nawiasami, z prefiksem', function () {
            var Model = Backbone.Model.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), formOrder),
                model = formToModel.getModel();

            function testOrder (controlName, value) {
                formToModel.bindControl(controlName);
                expect(model.get('order')).to.eql(value);
                console.log(model.get('order'));
            }

            it('Wartość simple_name to "lorem ipsum"', function () {
                formToModel.bindControl('simple_name');
                expect(model.get('simple_name')).to.eql('lorem ipsum');
            });

            it('Sprawdzanie czy obiekt zwracany przez model.get("order") jest budowany we właściwy sposób po każdym wywołaniu formToModel.bindControl', function () {
                var value = {};

                testOrder('order[attachment]', value);

                value.first_name = 'John';
                testOrder('order[first_name]', value);

                value.last_name = 'Doe';
                testOrder('order[last_name]', value);

                value.email = 'john@doe.com';
                testOrder('order[email]', value);

                value.tel = '123456789';
                testOrder('order[tel]', value);

                value.unknown = 'unknown_value';
                testOrder('order[unknown]', value);

                value.post = '3';
                testOrder('order[post]', value);

                testOrder('order[agree1]', value);

                value.agree2 = 'yes';
                testOrder('order[agree2]', value);

                value.comment = 'lorem ipsum';
                testOrder('order[comment]', value);

                value.address = {};
                value.address.street = 'Mickiewicza 45';
                testOrder('order[address][street]', value);

                value.address.house_number = '10';
                testOrder('order[address][house_number]', value);

                value.address.city = 'gdynia';
                testOrder('order[address][city]', value);

                testOrder('order[button1]', value);
                testOrder('order[button2]', value);
                testOrder('order[button3]', value);
                testOrder('order[button4]', value);
                testOrder('order[button5]', value);
                testOrder('order[image]', value);

                value.item = ['item3', 'item5', 'item6'];
                testOrder('order[item][]', value);

                value.sub_item = 'item3';
                testOrder('order[sub_item][]', value);

                value.addition = ['addition3', 'addition5'];
                testOrder('order[addition][]', value);

                testOrder('order[rules]', value);
            });

            it('Sprawdzanie wartości pól bez nawiasów', function () {
                formToModel.bindControl('order.first_name');
                expect(model.get('order.first_name')).to.eql('Jan');
                formToModel.bindControl('order.address.city');
                expect(model.get('order.address.city')).to.eql('Warszawa');
            });
        });
    });
}());