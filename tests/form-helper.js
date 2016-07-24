(function () {
    "use strict";

    var nodes, formOrder, formOrderHelper, formOrderHelperSeparator;

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
    formOrderHelper = new Backbone.form.FormHelper(formOrder.get(0), Backbone.form.FormHelper.MODES.brackets);
    formOrderHelperSeparator = new Backbone.form.FormHelper(formOrder.get(0), Backbone.form.FormHelper.MODES.separator, '.');

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
        describe('#getPrefix()', function () {
            it('Powinno zwrócić prefiks', function () {
                var helper = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.brackets),
                    helperSeparator = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.separator, '.');

                expect(helper.getPrefix('foo[bar][dupa]')).to.be('foo');
                expect(helper.getPrefix('foo[bar][dupa][]')).to.be('foo');
                expect(helperSeparator.getPrefix('foo.bar.dupa')).to.be('foo');
                expect(helperSeparator.getPrefix('foo.bar.dupa[]')).to.be('foo');
            });

            it('Jeżeli nie ma prefiksu to powinno zwrócić null', function () {
                var helper = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.brackets),
                    helperSeparator = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.separator, '.');

                expect(helper.getPrefix('foo')).to.be(null);
                expect(helper.getPrefix('foo[]')).to.be(null);
                expect(helperSeparator.getPrefix('foo')).to.be(null);
                expect(helperSeparator.getPrefix('foo[]')).to.be(null);
            });
        });

        describe('#removePrefix()', function () {
            it('Testowanie czy zwraca nazwy bez prefiksów', function () {
                var helper = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.brackets);
                expect(helper.removePrefix('address[city]')).to.be('[city]');
                expect(helper.removePrefix('address[item][]')).to.be('[item][]');
                expect(helper.removePrefix('address[1][street]')).to.be('[1][street]');

                var helperSeparator = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.separator, '.');
                expect(helperSeparator.removePrefix('address.city')).to.be('city');
                expect(helperSeparator.removePrefix('address.item[]')).to.be('item[]');
                expect(helperSeparator.removePrefix('address.1.street')).to.be('1.street');

                var helperDoubleSeparator = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.separator, '||');
                expect(helperDoubleSeparator.removePrefix('address||city')).to.be('city');
                expect(helperDoubleSeparator.removePrefix('address||item[]')).to.be('item[]');
                expect(helperDoubleSeparator.removePrefix('address||1||street')).to.be('1||street');
            });

            it('Wyrażenie bez prefiksu jest nienaruszone', function () {
                var helper = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.brackets),
                    helperSeparator = new Backbone.form.FormHelper(document.createElement('DIV'), Backbone.form.FormHelper.MODES.separator, '.');

                expect(helper.removePrefix('foo_bar')).to.be('foo_bar');
                expect(helper.removePrefix('foo_bar[]')).to.be('foo_bar[]');
                expect(helperSeparator.removePrefix('foo_bar')).to.be('foo_bar');
                expect(helperSeparator.removePrefix('foo_bar[]')).to.be('foo_bar[]');
            });
        });

        describe('#removeExtremeBrackets()', function () {
            var helper = new Backbone.form.FormHelper(document.createElement('FORM'), Backbone.form.FormHelper.MODES.brackets);

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
                expect(formOrderHelper.getInputCheckedValue(formOrder.find('[name="order[customer_type]"]'))).to.eql(['company']);
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
            testFormControl('order[not_found_control]', '[not_found_control]', undefined);
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
            testFormControl('order[item2]', '[item2]', ['item2', 'item5']);
            testFormControl('order[sub_item][]', '[sub_item][]', 'item3');
            testFormControl('order[addition][]', '[addition][]', ['addition3', 'addition5']);
            testFormControl('order[addition2]', '[addition2]', ['addition2', 'addition4']);
            testFormControl('order[rules]', '[rules]', null);
        });

        describe('#getObjectFromName - w konwencji nazwenictwa z nawiasami', function () {
            it('Sprawdzanie wartości pola "simple_name" z prefiksem', function () {
                expect(formOrderHelper.getObjectFromName('simple_name', true)).to.eql({
                    simple_name: 'lorem ipsum'
                });
            });

            it('Sprawdzanie wartości pola "simple_name" bez prefiksu', function () {
                expect(formOrderHelper.getObjectFromName('simple_name', false)).to.eql({
                    simple_name: 'lorem ipsum'
                });
            });

            it('Sprawdzanie wartości pola "order[address][street]" z prefiksem', function () {
                expect(formOrderHelper.getObjectFromName('order[address][street]', true)).to.eql({
                    order: {
                        address: {
                            street: 'Mickiewicza 45'
                        }
                    }
                });
            });

            it('Sprawdzanie wartości pola "order[address][street]" bez prefiksu', function () {
                expect(formOrderHelper.getObjectFromName('order[address][street]', false)).to.eql({
                    address: {
                        street: 'Mickiewicza 45'
                    }
                });
            });

            it('Sprawdzanie wartości pola "order[addition][]" z prefiksem', function () {
                expect(formOrderHelper.getObjectFromName('order[addition][]', true)).to.eql({
                    order: {
                        addition: ['addition3', 'addition5']
                    }
                });
            });

            it('Sprawdzanie wartości pola "order[addition][]" bez prefiksu', function () {
                expect(formOrderHelper.getObjectFromName('order[addition][]', false)).to.eql({
                    addition: ['addition3', 'addition5']
                });
            });
        });

        describe('#getObjectFromName - w konwencji nazwenictwa z separatorem', function () {
            it('Sprawdzanie wartości pola "simple_name" z prefiksem', function () {
                expect(formOrderHelperSeparator.getObjectFromName('simple_name', true)).to.eql({
                    simple_name: 'lorem ipsum'
                });
            });

            it('Sprawdzanie wartości pola "simple_name" bez prefiksu', function () {
                expect(formOrderHelperSeparator.getObjectFromName('simple_name', false)).to.eql({
                    simple_name: 'lorem ipsum'
                });
            });

            it('Sprawdzanie wartości pola "order.address.city" z prefiksem', function () {
                expect(formOrderHelperSeparator.getObjectFromName('order.address.city', true)).to.eql({
                    order: {
                        address: {
                            city: 'Warszawa'
                        }
                    }
                });
            });

            it('Sprawdzanie wartości pola "order.address.city" bez prefixu', function () {
                expect(formOrderHelperSeparator.getObjectFromName('order.address.city', false)).to.eql({
                    address: {
                        city: 'Warszawa'
                    }
                });
            });

            it('Sprawdzanie wartości pola "order.email" z prefiksem', function () {
                expect(formOrderHelperSeparator.getObjectFromName('order.email', true)).to.eql({
                    order: {
                        email: 'jan@kowalski.pl'
                    }
                });
            });

            it('Sprawdzanie wartości pola "order.email" bez prefiksu', function () {
                expect(formOrderHelperSeparator.getObjectFromName('order.email', false)).to.eql({
                    email: 'jan@kowalski.pl'
                });
            });

            it('Sprawdzanie wartości pola "order.item[]" z prefiksem', function () {
                expect(formOrderHelperSeparator.getObjectFromName('order.item[]', true)).to.eql({
                    order: {
                        item: ['item3', 'item5', 'item6']
                    }
                });
            });

            it('Sprawdzanie wartości pola "order.item[]" bez prefiksu', function () {
                expect(formOrderHelperSeparator.getObjectFromName('order.item[]', false)).to.eql({
                    item: ['item3', 'item5', 'item6']
                });
            });
        });

        describe('#getObjectPath', function () {
            it('Funkcja powinna zwrócić pustą tablicę kiedy otrzyma niewłaściwą wartość', function () {
                expect(formOrderHelperSeparator.getObjectPath('string')).to.eql([]);
                expect(formOrderHelperSeparator.getObjectPath([1, 2, 3])).to.eql([]);
                expect(formOrderHelperSeparator.getObjectPath({foo: '123', bar: '123'})).to.eql([]);
                expect(formOrderHelperSeparator.getObjectPath({foo: {bar: '123', foo: '123'}})).to.eql([]);
            });

            it('Sprawdzanie czy funkcja zwraca prawidłowe ścieżki', function () {
                expect(formOrderHelperSeparator.getObjectPath({})).to.eql([]);
                expect(formOrderHelperSeparator.getObjectPath({foo: [{foo: 1}]})).to.eql(['foo']);
                expect(formOrderHelperSeparator.getObjectPath({foo: {bar: []}})).to.eql(['foo', 'bar']);
                expect(formOrderHelperSeparator.getObjectPath({foo: {bar: 'test'}})).to.eql(['foo', 'bar']);
                expect(formOrderHelperSeparator.getObjectPath({
                    foo: {
                        bar: {
                            lorem: 'lorem'
                        }
                    }
                })).to.eql(['foo', 'bar', 'lorem']);
            });
        });

        describe('#createName', function () {
            it('Sprawdzanie czy nazwy z nawiasami są prawidłowe', function () {
                var helper = new Backbone.form.FormHelper(document.createElement('FORM'), Backbone.form.FormHelper.MODES.brackets);

                expect(helper.createName).to.throwException(/Path must be Array/);
                expect(helper.createName).withArgs([]).to.throwException(/Path is empty!/);
                expect(helper.createName).withArgs(['harry_lepper'], {}).to.throwException(/Prefix must be string/);
                expect(helper.createName).withArgs(['harry_lepper'], '').to.throwException(/Prefix must be longer than 0 characters/);

                expect(helper.createName(['harry_lepper'])).to.be('harry_lepper');
                expect(helper.createName(['harry_lepper'], 'mc')).to.be('mc[harry_lepper]');
                expect(helper.createName(['harry_lepper'], 'mc', false)).to.be('mc[harry_lepper]');
                expect(helper.createName(['harry_lepper'], 'mc', true)).to.be('mc[harry_lepper][]');

                expect(helper.createName(['foo', 'bar'])).to.be('foo[bar]');
                expect(helper.createName(['foo', 'bar'], 'lorem')).to.be('lorem[foo][bar]');
                expect(helper.createName(['foo', 'bar'], 'lorem', true)).to.be('lorem[foo][bar][]');

                expect(helper.createName(['foo', 'bar', 'foo'])).to.be('foo[bar][foo]');
                expect(helper.createName(['foo', 'bar', 'foo'], 'lorem')).to.be('lorem[foo][bar][foo]');
                expect(helper.createName(['foo', 'bar', 'foo'], 'lorem', true)).to.be('lorem[foo][bar][foo][]');

                expect(helper.createName(['root', 'foo', 'bar', 'item'])).to.be('root[foo][bar][item]');
                expect(helper.createName(['root', 'foo', 'bar', 'item'], 'lorem')).to.be('lorem[root][foo][bar][item]');
                expect(helper.createName(['root', 'foo', 'bar', 'item'], 'lorem', true)).to.be('lorem[root][foo][bar][item][]');
            });

            it('Sprawdzanie czy nazwy z separatorem "." są prawidłowe', function () {
                var helper = new Backbone.form.FormHelper(
                    document.createElement('FORM'),
                    Backbone.form.FormHelper.MODES.separator,
                    '.'
                );

                expect(helper.createName(['harry_lepper'])).to.be('harry_lepper');
                expect(helper.createName(['harry_lepper'], 'mc')).to.be('mc.harry_lepper');
                expect(helper.createName(['harry_lepper'], 'mc', false)).to.be('mc.harry_lepper');
                expect(helper.createName(['harry_lepper'], 'mc', true)).to.be('mc.harry_lepper[]');

                expect(helper.createName(['foo', 'bar'])).to.be('foo.bar');
                expect(helper.createName(['foo', 'bar'], 'lorem')).to.be('lorem.foo.bar');
                expect(helper.createName(['foo', 'bar'], 'lorem', true)).to.be('lorem.foo.bar[]');

                expect(helper.createName(['foo', 'bar', 'foo'])).to.be('foo.bar.foo');
                expect(helper.createName(['foo', 'bar', 'foo'], 'lorem')).to.be('lorem.foo.bar.foo');
                expect(helper.createName(['foo', 'bar', 'foo'], 'lorem', true)).to.be('lorem.foo.bar.foo[]');

                expect(helper.createName(['root', 'foo', 'bar', 'item'])).to.be('root.foo.bar.item');
                expect(helper.createName(['root', 'foo', 'bar', 'item'], 'lorem')).to.be('lorem.root.foo.bar.item');
                expect(helper.createName(['root', 'foo', 'bar', 'item'], 'lorem', true)).to.be('lorem.root.foo.bar.item[]');
            });

            it('Sprawdzanie czy nazwy z separatorem "||" są prawidłowe', function () {
                var helper = new Backbone.form.FormHelper(
                    document.createElement('FORM'),
                    Backbone.form.FormHelper.MODES.separator,
                    '||'
                );

                expect(helper.createName(['harry_lepper'])).to.be('harry_lepper');
                expect(helper.createName(['harry_lepper'], 'mc')).to.be('mc||harry_lepper');
                expect(helper.createName(['harry_lepper'], 'mc', false)).to.be('mc||harry_lepper');
                expect(helper.createName(['harry_lepper'], 'mc', true)).to.be('mc||harry_lepper[]');

                expect(helper.createName(['foo', 'bar'])).to.be('foo||bar');
                expect(helper.createName(['foo', 'bar'], 'lorem')).to.be('lorem||foo||bar');
                expect(helper.createName(['foo', 'bar'], 'lorem', true)).to.be('lorem||foo||bar[]');

                expect(helper.createName(['foo', 'bar', 'foo'])).to.be('foo||bar||foo');
                expect(helper.createName(['foo', 'bar', 'foo'], 'lorem')).to.be('lorem||foo||bar||foo');
                expect(helper.createName(['foo', 'bar', 'foo'], 'lorem', true)).to.be('lorem||foo||bar||foo[]');

                expect(helper.createName(['root', 'foo', 'bar', 'item'])).to.be('root||foo||bar||item');
                expect(helper.createName(['root', 'foo', 'bar', 'item'], 'lorem')).to.be('lorem||root||foo||bar||item');
                expect(helper.createName(['root', 'foo', 'bar', 'item'], 'lorem', true)).to.be('lorem||root||foo||bar||item[]');
            });
        });
    });
}());
