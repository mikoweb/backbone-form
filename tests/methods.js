(function () {
    "use strict";

    describe('methods', function () {
        describe('#validModelForm()', function () {
            it('Przekazanie prawidłowych argumentów nie zgłasza wyjątków', function () {
                var Model = Backbone.Model.extend(),
                    htmlElement = document.createElement('DIV');

                expect(Backbone.form.validModelForm).withArgs(new Model(), htmlElement).to.not.throwException();
            });

            it('Prawidłowe argumenty z użyciem jQuery', function () {
                var Model = Backbone.Model.extend(),
                    element = $('<div />'), data;

                expect(Backbone.form.validModelForm).withArgs(new Model(), element).to.not.throwException();
                data = Backbone.form.validModelForm(new Model(), element);
                expect(data.form).to.be.a(HTMLElement);
            });

            it('Bez argumentów rzuci wyjątek', function () {
                expect(Backbone.form.validModelForm).withArgs().to.throwException(/model is undefined/);
            });

            it('Niewłaściwy typ modelu rzuci wyjątek', function () {
                expect(Backbone.form.validModelForm).withArgs(new Date(), document.createElement('FORM')).to.throwException(/expected Backbone.Model/);
            });

            it('Niewłaściwy typ formularza rzuci wyjątek', function () {
                var Model = Backbone.Model.extend();
                expect(Backbone.form.validModelForm).withArgs(new Model(), new Model()).to.throwException(/expected HTMLElement/);
            });
        });

        describe('Domyślne opcje klasy FormToModel', function () {
            var defaults = _.clone(Backbone.form.getFormToModelDefaults());

            it('Sprawdzanie czy domyślne opcje są jak być powinny', function () {
                expect(defaults).to.eql({
                    naming: Backbone.form.FormHelper.MODES.brackets,
                    separator: null,
                    auto: false,
                    keepPrefix: true
                });
            });

            it('Sprawdzanie czy można zmienić opcje', function () {
                Backbone.form.setFormToModelDefaults({
                    keepPrefix: false,
                    naming: Backbone.form.FormHelper.MODES.separator,
                    separator: '.'
                });

                expect(Backbone.form.getFormToModelDefaults()).to.eql({
                    naming: Backbone.form.FormHelper.MODES.separator,
                    separator: '.',
                    auto: false,
                    keepPrefix: false
                });
            });

            it('Sprawdzanie czy można przywrócić opcje domyślne', function () {
                Backbone.form.setFormToModelDefaults();
                expect(Backbone.form.getFormToModelDefaults()).to.eql(defaults);
            });
        });
    });
}());
