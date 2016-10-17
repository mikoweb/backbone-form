(function () {
    "use strict";

    var nodes, formOrder, bindCounter = {
        controlFails: 0,
        controlBefore: 0,
        controlAfter: 0,
        bindBefore: 0,
        bindAfter: 0
    };

    $.ajax({
        url: 'data/form-to-model.html',
        dataType: 'html',
        async: false,
        success: function (html) {
            nodes = $('<div />').html(html);
        }
    });

    function addFailListener (formToModel) {
        formToModel.on('bind:control:fail', function () {
            ++bindCounter.controlFails;
        });
    }

    function addCommonListeners (formToModel) {
        formToModel.on('bind:control:before', function () {
            ++bindCounter.controlBefore;
        });

        formToModel.on('bind:control:after', function () {
            ++bindCounter.controlAfter;
        });

        formToModel.on('bind:before', function () {
            ++bindCounter.bindBefore;
        });

        formToModel.on('bind:after', function () {
            ++bindCounter.bindAfter;
        });
    }

    /**
     * @type {jQuery}
     */
    formOrder = nodes.find('#formOrder');

    describe('FormToModel', function () {
        describe('#bindControl() - z nawiasami, bez prefiksu', function () {
            var Model = Backbone.form.FormModel.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                    keepPrefix: false,
                    auto: false
                }),
                model = formToModel.getModel();

            addFailListener(formToModel);
            addCommonListeners(formToModel);

            function test (controlName, modelField, value) {
                it("model.get('" + modelField + "') powinno zwrócić '" + value + "'", function () {
                    formToModel.bindControl(controlName);
                    expect(model.get(modelField)).to.eql(value);
                });
            }

            test('not_found_control', 'not_found_control', undefined);
            --bindCounter.controlFails;
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
            var Model = Backbone.form.FormModel.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                    auto: false
                }),
                model = formToModel.getModel();

            addFailListener(formToModel);
            addCommonListeners(formToModel);

            function testOrder (controlName, value) {
                formToModel.bindControl(controlName);
                expect(model.get('order')).to.eql(value);
            }

            it('Wartość simple_name to "lorem ipsum"', function () {
                formToModel.bindControl('simple_name');
                expect(model.get('simple_name')).to.eql('lorem ipsum');
            });

            it('Sprawdzanie czy obiekt zwracany przez model.get("order") jest budowany we właściwy sposób po każdym wywołaniu formToModel.bindControl', function () {
                var value = {};

                testOrder('order[attachment]', undefined);

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

        describe('#bindControl() - z separatorem, bez prefiksu', function () {
            var Model = Backbone.form.FormModel.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                    keepPrefix: false,
                    naming: Backbone.form.FormHelper.MODES.separator,
                    separator: '.',
                    auto: false
                }),
                model = formToModel.getModel();

            addFailListener(formToModel);
            addCommonListeners(formToModel);

            function test (controlName, modelField, value) {
                it("model.get('" + modelField + "') powinno zwrócić '" + value + "'", function () {
                    formToModel.bindControl(controlName);
                    expect(model.get(modelField)).to.eql(value);
                });
            }

            test('simple_name', 'simple_name', 'lorem ipsum');
            test('order.first_name', 'first_name', 'Jan');
            test('order.last_name', 'last_name', 'Kowalski');
            test('order.email', 'email', 'jan@kowalski.pl');
            test('order.address.city', 'address', {
                city: 'Warszawa'
            });
            test('order.item[]', 'item', ['item3', 'item5', 'item6']);
            test('order[address][house_number]', 'order[address][house_number]', '10');
        });

        describe('#bindControl() - z separatorem, z prefiksem', function () {
            var Model = Backbone.form.FormModel.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                    naming: Backbone.form.FormHelper.MODES.separator,
                    separator: '.',
                    auto: false
                }),
                model = formToModel.getModel();

            addFailListener(formToModel);
            addCommonListeners(formToModel);

            function testOrder (controlName, value) {
                formToModel.bindControl(controlName);
                expect(model.get('order')).to.eql(value);
            }

            it('Wartość simple_name to "lorem ipsum"', function () {
                formToModel.bindControl('simple_name');
                expect(model.get('simple_name')).to.eql('lorem ipsum');
            });

            it('Sprawdzanie czy obiekt zwracany przez model.get("order") jest budowany we właściwy sposób po każdym wywołaniu formToModel.bindControl', function () {
                var value = {};

                value.first_name = 'Jan';
                testOrder('order.first_name', value);

                value.last_name = 'Kowalski';
                testOrder('order.last_name', value);

                value.email = 'jan@kowalski.pl';
                testOrder('order.email', value);

                value.address = {};
                value.address.city = 'Warszawa';
                testOrder('order.address.city', value);

                value.item = ['item3', 'item5', 'item6'];
                testOrder('order.item[]', value);
            });

            it('Sprawdzanie wartości pól z nawiasami', function () {
                formToModel.bindControl('order[comment]');
                expect(model.get('order[comment]')).to.eql('lorem ipsum');
                formToModel.bindControl('order[address][city]');
                expect(model.get('order[address][city]')).to.eql('gdynia');
            });
        });

        describe('#bindControl() - test FormModel', function () {
            var Model = Backbone.form.FormModel.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                    keepPrefix: false,
                    auto: false
                }),
                model = formToModel.getModel();

            formToModel.bindControl('order[address][street]');

            it('hasData test', function () {
                expect(model.hasData('address')).to.be(true);
                expect(model.hasData('marian')).to.be(false);
            });

            it('getData test', function () {
                var data = model.getData('address');
                expect(data.street()).to.eql('Mickiewicza 45');
            });

            it('setData && unsetData test', function () {
                model.setData('microsoft', 'ok');
                expect(model.getData('microsoft')).to.eql('ok');
                expect(model.hasData('microsoft')).to.be(true);
                model.unsetData('microsoft');
                expect(model.hasData('microsoft')).to.be(false);
            });
        });

        describe('#bind()', function () {
            it('Weryfikacja danych - naming: brackets, keepPrefix: true', function () {
                var Model = Backbone.form.FormModel.extend(),
                    formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {auto: false}),
                    model = formToModel.getModel(), order;

                addCommonListeners(formToModel);

                formToModel.bind();
                order = model.get('order');
                expect(order.attachment).to.be(undefined);
                expect(order.first_name).to.be('John');
                expect(order.last_name).to.be('Doe');
                expect(order.email).to.be('john@doe.com');
                expect(order.tel).to.be('123456789');
                expect(order.unknown).to.be('unknown_value');
                expect(order.customer_type).to.be('company');
                expect(order.post).to.be('3');
                expect(order.agree1).to.be(undefined);
                expect(order.agree2).to.eql('yes');
                expect(order.comment).to.be('lorem ipsum');
                expect(order.address).to.eql({
                    street: 'Mickiewicza 45',
                    house_number: '10',
                    city: 'gdynia'
                });
                expect(order.button1).to.be(undefined);
                expect(order.button2).to.be(undefined);
                expect(order.button3).to.be(undefined);
                expect(order.button4).to.be(undefined);
                expect(order.button5).to.be(undefined);
                expect(order.image).to.be(undefined);
                expect(order.item).to.eql(['item3', 'item5', 'item6']);
                expect(order.sub_item).to.be('item3');
                expect(order.addition).to.eql(['addition3', 'addition5']);

                expect(model.get('simple_name')).to.be('lorem ipsum');
                expect(model.get('order.first_name')).to.be('Jan');
                expect(model.get('order.last_name')).to.be('Kowalski');
                expect(model.get('order.email')).to.be('jan@kowalski.pl');
                expect(model.get('order.address.city')).to.be('Warszawa');
            });

            it('Weryfikacja danych - naming: brackets, keepPrefix: false', function () {
                var Model = Backbone.form.FormModel.extend(),
                    formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                        auto: false,
                        keepPrefix: false
                    }),
                    model = formToModel.getModel();

                addCommonListeners(formToModel);

                formToModel.bind();
                expect(model.get('attachment')).to.be(undefined);
                expect(model.get('first_name')).to.be('John');
                expect(model.get('last_name')).to.be('Doe');
                expect(model.get('email')).to.be('john@doe.com');
                expect(model.get('tel')).to.be('123456789');
                expect(model.get('unknown')).to.be('unknown_value');
                expect(model.get('customer_type')).to.be('company');
                expect(model.get('post')).to.be('3');
                expect(model.get('agree1')).to.be(undefined);
                expect(model.get('agree2')).to.eql('yes');
                expect(model.get('comment')).to.be('lorem ipsum');
                expect(model.get('address')).to.eql({
                    street: 'Mickiewicza 45',
                    house_number: '10',
                    city: 'gdynia'
                });
                expect(model.get('button1')).to.be(undefined);
                expect(model.get('button2')).to.be(undefined);
                expect(model.get('button3')).to.be(undefined);
                expect(model.get('button4')).to.be(undefined);
                expect(model.get('button5')).to.be(undefined);
                expect(model.get('image')).to.be(undefined);
                expect(model.get('item')).to.eql(['item3', 'item5', 'item6']);
                expect(model.get('sub_item')).to.be('item3');
                expect(model.get('addition')).to.eql(['addition3', 'addition5']);

                expect(model.get('simple_name')).to.be('lorem ipsum');
                expect(model.get('order.first_name')).to.be('Jan');
                expect(model.get('order.last_name')).to.be('Kowalski');
                expect(model.get('order.email')).to.be('jan@kowalski.pl');
                expect(model.get('order.address.city')).to.be('Warszawa');
            });

            it('Weryfikacja danych - naming: separator, keepPrefix: true', function () {
                var Model = Backbone.form.FormModel.extend(),
                    formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                        auto: false,
                        naming: Backbone.form.FormHelper.MODES.separator,
                        separator: '.'
                    }),
                    model = formToModel.getModel(), order;

                addCommonListeners(formToModel);

                formToModel.bind();
                order = model.get('order');

                expect(order.first_name).to.be('Jan');
                expect(order.last_name).to.be('Kowalski');
                expect(order.email).to.be('jan@kowalski.pl');
                expect(order.address).to.eql({
                    city: 'Warszawa'
                });

                expect(model.get('order[first_name]')).to.be('John');
            });

            it('Weryfikacja danych - naming: separator, keepPrefix: false', function () {
                var Model = Backbone.form.FormModel.extend(),
                    formToModel = new Backbone.form.FormToModel(new Model(), formOrder, {
                        auto: false,
                        naming: Backbone.form.FormHelper.MODES.separator,
                        separator: '.',
                        keepPrefix: false
                    }),
                    model = formToModel.getModel();

                addCommonListeners(formToModel);

                formToModel.bind();
                expect(model.get('first_name')).to.be('Jan');
                expect(model.get('last_name')).to.be('Kowalski');
                expect(model.get('email')).to.be('jan@kowalski.pl');
                expect(model.get('address')).to.eql({
                    city: 'Warszawa'
                });

                expect(model.get('order[address][street]')).to.be('Mickiewicza 45');
            });
        });

        describe('#sync()', function () {
            it('Kiedy pole zostanie usunięte jego wartość powinna zostać usunięta z modelu', function () {
                var Model = Backbone.form.FormModel.extend(),
                    formToModel = new Backbone.form.FormToModel(new Model(), formOrder),
                    model = formToModel.getModel(), order;

                formToModel.bind();
                order = model.get('order');

                expect(model.get('simple_name')).to.be('lorem ipsum');
                formOrder.find('[name="simple_name"]').remove();
                expect(model.get('simple_name')).to.be('lorem ipsum');
                formToModel.sync();
                expect(model.get('simple_name')).to.be(undefined);

                expect(order.first_name).to.be('John');
                formOrder.find('[name="order[first_name]"]').remove();
                expect(order.first_name).to.be('John');
                formToModel.sync();
                expect(order.first_name).to.be(undefined);

                expect(order.address.street).to.be('Mickiewicza 45');
                formOrder.find('[name="order[address][street]"]').remove();
                expect(order.address.street).to.be('Mickiewicza 45');
                formToModel.bind();
                expect(order.address.street).to.be(undefined);
            });

            it('Kiedy zostanie dodane/usunięte pole wielokrotnego wyboru powinno zostać wywołane bindControl', function () {
                var Model = Backbone.form.FormModel.extend(),
                    formToModel = new Backbone.form.FormToModel(new Model(), formOrder),
                    model = formToModel.getModel(), order;

                formToModel.bind();
                order = model.get('order');
                expect(order.addition).to.eql(['addition3', 'addition5']);
                formOrder.find('[name="order[addition][]"][value="addition3"]').remove();
                expect(order.addition).to.eql(['addition3', 'addition5']);
                formToModel.sync();
                order = model.get('order');
                expect(order.addition).to.eql(['addition5']);
                formOrder.append(
                    $('<input />')
                        .attr('name', 'order[addition][]')
                        .attr('type', 'checkbox')
                        .attr('value', 'test')
                        .attr('checked', 'checked')
                );
                formToModel.sync();
                order = model.get('order');
                expect(order.addition).to.eql(['addition5', 'test']);
            });

            it('Usunięcie wszystkich kontrolek powinno wyczyścić model.', function () {
                var Model = Backbone.form.FormModel.extend(),
                    formToModel = new Backbone.form.FormToModel(new Model(), formOrder),
                    model = formToModel.getModel();

                formToModel.bind();
                expect(model.attributes).to.not.eql({});
                formOrder.find('[name]').remove();
                formToModel.sync();
                expect(model.attributes).to.eql({});
            });
        });

        describe('Test wartości licznika wywołań listerów', function () {
            it('bind:control:fail poza kontrolowanymi failami nie powinno się wykonać', function () {
                expect(bindCounter.controlFails).to.be(0);
            });

            it('bind:control:before powinno się wykonać conajmniej raz', function () {
                expect(bindCounter.controlBefore).to.be.greaterThan(0);
            });

            it('bind:control:before powinno się wykonać tyle samo razy co bind:control:after', function () {
                expect(bindCounter.controlBefore).to.be(bindCounter.controlAfter);
            });

            it('bind:before powinno się wykonać conajmniej raz', function () {
                expect(bindCounter.bindBefore).to.be.greaterThan(0);
            });

            it('bind:before powinno się wykonać tyle samo razy co bind:after', function () {
                expect(bindCounter.bindBefore).to.be(bindCounter.bindAfter);
            });
        });
    });
}());
