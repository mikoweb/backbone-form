(function () {
    "use strict";

    var nodes, formOrder, formAccount, formOrderHelper,
        formAccountHelper;

    $.ajaxSetup({async: false});
    $.ajax({
        url: 'data/form-helper.html',
        dataType: 'html',
        success: function (html) {
            nodes = $('<div />').html(html);
        }
    });
    $.ajaxSetup({async: true});

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
    });
}());
