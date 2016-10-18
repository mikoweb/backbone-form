(function () {
    "use strict";

    describe('FormModel', function () {
        describe('without pathPrefix', function () {
            var form = $('<form><input type="text" value="ok" name="foo[items][0][address][street]" /></form>');
            var Model = Backbone.form.FormModel.extend(),
                formToModel = new Backbone.form.FormToModel(new Model(), form, {
                    keepPrefix: true,
                    auto: false
                }),
                model = formToModel.getModel();

            formToModel.bindControl('foo[items][0][address][street]');

            it('value method', function () {
                expect(model.value('trtgf')).to.be(null);
                expect(model.value('foo.gfdgfd')).to.be(null);
                expect(model.value('foo.items.0.address.street')).to.be('ok');
                expect(model.value('foo.items.0.address')).to.eql({
                    street: 'ok'
                });
            });

            it('firstValue method', function () {
                expect(_.isObject(model.firstValue('items'))).to.be(true);
                expect(model.firstValue('items.0.address.street')).to.be('ok');
            });

            it('input method', function () {
                var input = model.input('foo.items.0.address.street');
                expect(input.val()).to.be('ok');
                expect(input.parent().length).to.be(1);
                input = model.input('foo.items.0.address');
                expect(input.parent().length).to.be(0);
            });

            it('firstInput method', function () {
                expect(model.firstInput('items.0.address.street').val()).to.be('ok');
            });
        });

        describe('with pathPrefix', function () {
            var form = $('<form><input type="text" value="ok" name="foo[items][0][address][street]" /></form>');
            var Model = Backbone.form.FormModel.extend({
                    pathPrefix: 'foo.items'
                }),
                formToModel = new Backbone.form.FormToModel(new Model(), form, {
                    keepPrefix: true,
                    auto: false
                }),
                model = formToModel.getModel();

            formToModel.bindControl('foo[items][0][address][street]');

            it('value method', function () {
                expect(model.value('0.address.street')).to.be('ok');
            });

            it('firstValue method', function () {
                expect(model.firstValue('address.street')).to.be('ok');
                expect(model.firstValue('fdfgfdg')).to.be(null);
            });

            it('input method', function () {
                expect(model.input('0.address.street').val()).to.be('ok');
            });

            it('firstInput method', function () {
                expect(model.firstInput('address.street').val()).to.be('ok');
                expect(model.firstInput('gfdgfdg.fgfdg').parent().length).to.be(0);
            });
        });

        describe('invalid pathPrefix', function () {
            var form = $('<form><input type="text" value="ok" name="foo[items][0][address][street]" /></form>');
            var Model = Backbone.form.FormModel.extend({
                    pathPrefix: 'lorem.ipsum'
                }),
                formToModel = new Backbone.form.FormToModel(new Model(), form, {
                    keepPrefix: true,
                    auto: false
                }),
                model = formToModel.getModel();

            formToModel.bindControl('foo[items][0][address][street]');

            it('value method', function () {
                expect(model.value('0.address.street')).to.be(null);
            });

            it('firstValue method', function () {
                expect(model.firstValue('address.street')).to.be(null);
                expect(model.firstValue('fdfgfdg')).to.be(null);
            });

            it('input method', function () {
                expect(model.input('0.address.street').parent().length).to.be(0);
            });

            it('firstInput method', function () {
                expect(model.firstInput('address.street').parent().length).to.be(0);
                expect(model.firstInput('gfdgfdg.fgfdg').parent().length).to.be(0);
            });
        });
    });
}());
