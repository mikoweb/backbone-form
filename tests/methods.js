(function () {
    "use strict";

    describe('methods', function () {
        describe('#validModelForm()', function () {
            it('Przekazanie prawidłowych argumentów nie zgłasza wyjątków', function () {
                var Model = Backbone.form.FormModel.extend(),
                    htmlElement = document.createElement('DIV');

                expect(Backbone.form.validModelForm).withArgs(new Model(), htmlElement).to.not.throwException();
            });

            it('Prawidłowe argumenty z użyciem jQuery', function () {
                var Model = Backbone.form.FormModel.extend(),
                    element = $('<div />'), data;

                expect(Backbone.form.validModelForm).withArgs(new Model(), element).to.not.throwException();
                data = Backbone.form.validModelForm(new Model(), element);
                expect(data.form).to.be.a(HTMLElement);
            });

            it('Bez argumentów rzuci wyjątek', function () {
                expect(Backbone.form.validModelForm).withArgs().to.throwException(/model is undefined/);
            });

            it('Niewłaściwy typ modelu rzuci wyjątek', function () {
                expect(Backbone.form.validModelForm).withArgs(new Date(), document.createElement('FORM')).to.throwException(/expected Backbone.form.FormModel/);
            });

            it('Niewłaściwy typ formularza rzuci wyjątek', function () {
                var Model = Backbone.form.FormModel.extend();
                expect(Backbone.form.validModelForm).withArgs(new Model(), new Model()).to.throwException(/expected HTMLElement/);
            });
        });

        describe('Domyślne opcje klasy FormToModel', function () {
            var defaults = $.extend(true, {}, Backbone.form.getDefaults('formToModel'));

            it('Sprawdzanie czy domyślne opcje są jak być powinny', function () {
                expect(defaults).to.eql({
                    naming: Backbone.form.FormHelper.MODES.brackets,
                    separator: null,
                    auto: false,
                    keepPrefix: true
                });
            });

            it('Sprawdzanie czy można zmienić opcje', function () {
                Backbone.form.setDefaults('formToModel', {
                    keepPrefix: false,
                    naming: Backbone.form.FormHelper.MODES.separator,
                    separator: '.'
                });

                expect(Backbone.form.getDefaults('formToModel')).to.eql({
                    naming: Backbone.form.FormHelper.MODES.separator,
                    separator: '.',
                    auto: false,
                    keepPrefix: false
                });
            });

            it('Sprawdzanie czy można przywrócić opcje domyślne', function () {
                Backbone.form.setDefaults('formToModel');
                expect(Backbone.form.getDefaults('formToModel')).to.eql(defaults);
            });
        });

        describe('Domyślne opcje klasy ModelToForm', function () {
            var defaults = $.extend(true, {}, Backbone.form.getDefaults('modelToForm'));

            it('Sprawdzanie czy domyślne opcje są jak być powinny', function () {
                expect(defaults).to.eql({
                    naming: Backbone.form.FormHelper.MODES.brackets,
                    separator: null,
                    auto: false,
                    prefix: null
                });
            });

            it('Sprawdzanie czy można zmienić opcje', function () {
                Backbone.form.setDefaults('modelToForm', {
                    auto: true,
                    prefix: 'lorem'
                });

                expect(Backbone.form.getDefaults('modelToForm')).to.eql({
                    naming: Backbone.form.FormHelper.MODES.brackets,
                    separator: null,
                    auto: true,
                    prefix: 'lorem'
                });
            });

            it('Sprawdzanie czy można przywrócić opcje domyślne', function () {
                Backbone.form.setDefaults('modelToForm');
                expect(Backbone.form.getDefaults('modelToForm')).to.eql(defaults);
            });
        });
    });
}());
