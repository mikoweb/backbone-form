(function () {
    "use strict";

    var nodes, formOrder, formOrderHelper;

    $.ajax({
        url: 'data/form-helper.html',
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
    formOrderHelper = new Backbone.form.FormHelper(formOrder.get(0), 'order');

    /**
     * @param {String} name
     * @param {String} nameWithoutPrefix
     * @param {*} expectValue
     */
    function testFormControl (name, nameWithoutPrefix, expectValue) {
        it('Sprawdzanie wartości pola ' + name, function () {
            expect(formOrderHelper.getControlValue(name)).to.eql(expectValue);
            expect(formOrderHelper.removePrefix(name)).to.be(nameWithoutPrefix);
        });
    }

    describe('FormHelper', function () {
        describe('#removePrefix()', function () {
            it('Powinno zwrócić nazwę pola "address[city]" bez prefiksu', function () {
                var helper = new Backbone.form.FormHelper(
                    document.createElement('DIV'),
                    'address'
                );
                expect(helper.removePrefix('address[city]')).to.be('[city]');
            });

            it('Prefiks rozpoczyna się tylko i wyłącznie na pierwszym znaku', function () {
                var helper = new Backbone.form.FormHelper(
                    document.createElement('DIV'),
                    'ddress[ci'
                );
                expect(helper.removePrefix('address[city]')).to.be('address[city]');
            });

            it('Wielkość liter ma znaczenie', function () {
                var helper = new Backbone.form.FormHelper(
                    document.createElement('DIV'),
                    'aDdReSs'
                );
                expect(helper.removePrefix('address[city]')).to.be('address[city]');
            });
        });

        describe('#removeExtremeBrackets()', function () {
            var helper = new Backbone.form.FormHelper(document.createElement('FORM'));

            it('Powinno wywalić nawiasy na początku i końcu', function () {
                expect(helper.removeExtremeBrackets('[last_name]')).to.be('last_name');
            });

            it('Wyrażenie bez nawiasów jest nienaruszone', function () {
                expect(helper.removeExtremeBrackets('lorem ipsum')).to.be('lorem ipsum');
            });

            it('Wyrażanie z więcej niż jednym domknięciem jest nienaruszone', function () {
                expect(helper.removeExtremeBrackets('[foo][bar]')).to.be('[foo][bar]');
            });

            it('Wyrażenie z jednym domknięciem ale z więcej niż jednym otwarciem zostanie przetworzone', function () {
                expect(helper.removeExtremeBrackets('[foo[bar]')).to.be('foo[bar');
            });
        });

        describe('#getInputCheckedValue()', function () {
            it('Nieistniejące pole zwraca pustą tablicę', function () {
                expect(formOrderHelper.getInputCheckedValue('gjfdhkjhkjgh')).to.eql([]);
            });

            it('Porównanie wartości radio order[customer_type]', function () {
                expect(formOrderHelper.getInputCheckedValue('order[customer_type]')).to.eql(['company']);
            });

            it('Kiedy wszystkie pola radio posiadają atrybut checked zwracana jest wartość ostatniego pola', function () {
                expect(formOrderHelper.getInputCheckedValue('order[post]')).to.eql([3]);
            });

            it('Porównanie wartości checkbox order[addition][]', function () {
                expect(formOrderHelper.getInputCheckedValue('order[addition][]')).to.eql(['addition3', 'addition5']);
            });

            it('Porównanie wartości checkbox order[rules]', function () {
                expect(formOrderHelper.getInputCheckedValue('order[rules]')).to.eql([]);
            });

            it('Wartość pola nieposiadającego właściwości checked to pusta tablica', function () {
                expect(formOrderHelper.getInputCheckedValue('order[first_name]')).to.eql([]);
            });
        });

        describe('Porównywanie wartości pól formularza "order"', function () {
            testFormControl('order[attachment]', '[attachment]', null);
            testFormControl('order[first_name]', '[first_name]', 'John');
            testFormControl('order[last_name]', '[last_name]', 'Doe');
            testFormControl('order[email]', '[email]', 'john@doe.com');
            testFormControl('order[tel]', '[tel]', '123456789');
            testFormControl('order[unknown]', '[unknown]', 'unknown_value');
            testFormControl('order[customer_type]', '[customer_type]', 'company');
            testFormControl('order[post]', '[post]', '3');
            testFormControl('order[agree1]', '[agree1]', null);
            testFormControl('order[agree2]', '[agree2]', 'yes');
            testFormControl('order[comment]', '[comment]', 'lorem ipsum');
            testFormControl('order[address][street]', '[address][street]', 'Mickiewicza 45');
            testFormControl('order[address][house_number]', '[address][house_number]', '10');
            testFormControl('order[address][city]', '[address][city]', 'gdynia');
            testFormControl('order[button1]', '[button1]', null);
            testFormControl('order[button2]', '[button2]', null);
            testFormControl('order[button3]', '[button3]', null);
            testFormControl('order[button4]', '[button4]', null);
            testFormControl('order[button5]', '[button5]', null);
            testFormControl('order[image]', '[image]', null);
            testFormControl('order[item][]', '[item][]', ['item3', 'item5', 'item6']);
            testFormControl('order[sub_item][]', '[sub_item][]', 'item3');
            testFormControl('order[addition][]', '[addition][]', ['addition3', 'addition5']);
            testFormControl('order[rules]', '[rules]', null);
        });

        describe('#getObjectFromName', function () {
            it('Sprawdzanie wartości pola "simple_name" z prefiksem', function () {
                expect(formOrderHelper.getObjectFromName('simple_name', true, 'brackets')).to.eql({
                    simple_name: 'lorem ipsum'
                });
            });

            it('Sprawdzanie wartości pola "simple_name" bez prefiksu', function () {
                expect(formOrderHelper.getObjectFromName('simple_name', false, 'brackets')).to.eql({
                    simple_name: 'lorem ipsum'
                });
            });

            it('Sprawdzanie wartości pola "order[address][street] z prefiksem"', function () {
                expect(formOrderHelper.getObjectFromName('order[address][street]', true, 'brackets')).to.eql({
                    order: {
                        address: {
                            street: 'Mickiewicza 45'
                        }
                    }
                });
            });

            it('Sprawdzanie wartości pola "order[address][street] bez prefiksu"', function () {
                expect(formOrderHelper.getObjectFromName('order[address][street]', false, 'brackets')).to.eql({
                    address: {
                        street: 'Mickiewicza 45'
                    }
                });
            });
        });
    });
}());
