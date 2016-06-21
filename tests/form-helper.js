(function () {
    "use strict";

    var nodes, formOrder, formAccount, formOrderHelper,
        formAccountHelper;

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
     * @type {jQuery}
     */
    formAccount = nodes.find('#formWihoutPrefix');
    formAccountHelper = new Backbone.form.FormHelper(formAccount.get(0));

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
    });
}());
