(function () {
    "use strict";

    var nodes, formOrder;

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

    describe('FormHelper', function () {
        describe('#setControlValue()', function () {
            it('Testowanie wyjątków', function () {
                var helper = new Backbone.form.FormHelper(formOrder.get(0), Backbone.form.FormHelper.MODES.brackets),
                    exception = null;

                try {
                    helper.setControlValue();
                } catch (e) {
                    exception = e;
                }

                expect(exception).to.a(TypeError);
                expect(exception.message).to.be('Name must be string');

                exception = null;
                try {
                    helper.setControlValue('order[first_name]');
                } catch (e) {
                    exception = e;
                }

                expect(exception).to.a(TypeError);
                expect(exception.message).to.be('Unexpected value with name order[first_name]');

                exception = null;
                try {
                    helper.setControlValue('order[first_name]', {});
                } catch (e) {
                    exception = e;
                }

                expect(exception).to.a(TypeError);
                expect(exception.message).to.be('Unexpected value with name order[first_name]');

                exception = null;
                try {
                    helper.setControlValue('not_found_field', 'test');
                } catch (e) {
                    exception = e;
                }

                expect(exception).to.be(null);
            });

            it('Sprawdzanie czy setControlValue ustawia porządaną wartość pola tekstowego', function () {
                var helper = new Backbone.form.FormHelper(formOrder.get(0), Backbone.form.FormHelper.MODES.brackets);

                expect(helper.getControlValue('order[first_name]')).to.be('John');
                helper.setControlValue('order[first_name]', []);
                expect(helper.getControlValue('order[first_name]')).to.be('');
                helper.setControlValue('order[first_name]', 'test');
                expect(helper.getControlValue('order[first_name]')).to.be('test');
                helper.setControlValue('order[first_name]', '');
                expect(helper.getControlValue('order[first_name]')).to.be('');
                helper.setControlValue('order[first_name]', ['lorem']);
                expect(helper.getControlValue('order[first_name]')).to.be('lorem');
                helper.setControlValue('order[first_name]', ['foo', 'bar']);
                expect(helper.getControlValue('order[first_name]')).to.be('foo');
                helper.setControlValue('order[first_name]', 'test');
                helper.setControlValue('order[first_name]', true);
                expect(helper.getControlValue('order[first_name]')).to.be('');
                helper.setControlValue('order[first_name]', 'test');
                helper.setControlValue('order[first_name]', false);
                expect(helper.getControlValue('order[first_name]')).to.be('');
            });

            it('Sprawdzanie czy setControlValue ustawia porządaną wartość pola textarea', function () {
                var helper = new Backbone.form.FormHelper(formOrder.get(0), Backbone.form.FormHelper.MODES.brackets);

                expect(helper.getControlValue('order[comment]')).to.be('lorem ipsum');
                helper.setControlValue('order[comment]', 'foo');
                expect(helper.getControlValue('order[comment]')).to.be('foo');
                helper.setControlValue('order[comment]', []);
                expect(helper.getControlValue('order[comment]')).to.be('');
                helper.setControlValue('order[comment]', 'test');
                helper.setControlValue('order[comment]', true);
                expect(helper.getControlValue('order[comment]')).to.be('');
                helper.setControlValue('order[comment]', 'test');
                helper.setControlValue('order[comment]', false);
                expect(helper.getControlValue('order[comment]')).to.be('');
            });

            it('Sprawdzanie czy setControlValue ustawia porządaną wartość pola radio', function () {
                var helper = new Backbone.form.FormHelper(formOrder.get(0), Backbone.form.FormHelper.MODES.brackets);

                expect(helper.getControlValue('order[post]')).to.be('3');
                helper.setControlValue('order[post]', []);
                expect(helper.getControlValue('order[post]')).to.be(null);
                helper.setControlValue('order[post]', ['not_found_value']);
                expect(helper.getControlValue('order[post]')).to.be(null);
                helper.setControlValue('order[post]', 'not_found_value');
                expect(helper.getControlValue('order[post]')).to.be(null);
                helper.setControlValue('order[post]', ['2']);
                expect(helper.getControlValue('order[post]')).to.be('2');
                helper.setControlValue('order[post]', '1');
                expect(helper.getControlValue('order[post]')).to.be('1');
                helper.setControlValue('order[post]', ['3', '1', '2']);
                expect(helper.getControlValue('order[post]')).to.be('3');
                helper.setControlValue('order[post]', '1');
                helper.setControlValue('order[post]', true);
                expect(helper.getControlValue('order[post]')).to.be(null);
                helper.setControlValue('order[post]', '1');
                helper.setControlValue('order[post]', false);
                expect(helper.getControlValue('order[post]')).to.be(null);
            });

            it('Sprawdzanie czy setControlValue ustawia porządaną wartość pola checkbox', function () {
                var helper = new Backbone.form.FormHelper(formOrder.get(0), Backbone.form.FormHelper.MODES.brackets);

                expect(helper.getControlValue('order[addition][]')).to.eql(['addition3', 'addition5']);
                helper.setControlValue('order[addition][]', 'not_found_value');
                expect(helper.getControlValue('order[addition][]')).to.be(null);
                helper.setControlValue('order[addition][]', []);
                expect(helper.getControlValue('order[addition][]')).to.be(null);
                helper.setControlValue('order[addition][]', 'addition3');
                expect(helper.getControlValue('order[addition][]')).to.eql(['addition3']);
                helper.setControlValue('order[addition][]', ['addition2']);
                expect(helper.getControlValue('order[addition][]')).to.eql(['addition2']);
                helper.setControlValue('order[addition][]', ['addition2', 'addition1', 'addition5']);
                expect(helper.getControlValue('order[addition][]')).to.eql(['addition1', 'addition2', 'addition5']);

                expect(helper.getControlValue('order[agree1]')).to.eql(null);
                helper.setControlValue('order[agree1]', 'yes');
                expect(helper.getControlValue('order[agree1]')).to.eql(['yes']);
                helper.setControlValue('order[agree1]', false);
                expect(helper.getControlValue('order[agree1]')).to.eql(null);
                helper.setControlValue('order[agree1]', true);
                expect(helper.getControlValue('order[agree1]')).to.eql(['yes']);
            });

            it('Sprawdzanie czy setControlValue ustawia porządaną wartość pola select', function () {
                var helper = new Backbone.form.FormHelper(formOrder.get(0), Backbone.form.FormHelper.MODES.brackets);

                expect(helper.getControlValue('order[address][city]')).to.be('gdynia');
                helper.setControlValue('order[address][city]', 'not_found_value');
                expect(helper.getControlValue('order[address][city]')).to.be(null);
                helper.setControlValue('order[address][city]', ['olsztyn', 'gdynia']);
                expect(helper.getControlValue('order[address][city]')).to.eql('gdynia');
                helper.setControlValue('order[address][city]', 'olsztyn');
                expect(helper.getControlValue('order[address][city]')).to.eql('olsztyn');
                helper.setControlValue('order[address][city]', 'olsztyn');
                helper.setControlValue('order[address][city]', true);
                expect(helper.getControlValue('order[address][city]')).to.be(null);
                helper.setControlValue('order[address][city]', 'olsztyn');
                helper.setControlValue('order[address][city]', false);
                expect(helper.getControlValue('order[address][city]')).to.be(null);

                expect(helper.getControlValue('order[item2]')).to.eql(['item2', 'item5']);
                helper.setControlValue('order[item2]', ['item3']);
                expect(helper.getControlValue('order[item2]')).to.eql(['item3']);
                helper.setControlValue('order[item2]', []);
                expect(helper.getControlValue('order[item2]')).to.be(null);
                helper.setControlValue('order[item2]', ['item1', 'item2', 'item3']);
                expect(helper.getControlValue('order[item2]')).to.eql(['item1', 'item2', 'item3']);
                helper.setControlValue('order[item2]', ['item1', 'item2', 'item3']);
                expect(helper.getControlValue('order[item2]')).to.eql(['item1', 'item2', 'item3']);
            });
        });
    });
}());
