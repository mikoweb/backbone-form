(function () {
    "use strict";

    var container = $('<div />').hide();

    $.ajax({
        url: 'data/form-to-model-auto.html',
        dataType: 'html',
        async: false,
        success: function (html) {
            container.html(html);
            container.appendTo('body');
        }
    });

    var form = container.find('#formAutobinding'),
        Model = Backbone.Model.extend(),
        formToModel = new Backbone.form.FormToModel(new Model(), form, {keepPrefix: false}),
        model = formToModel.getModel();

    describe('FormToModel - autobinding', function () {
        it('Autobinding jest włączone', function () {
            expect(formToModel.isAuto()).to.be(true);
        });

        it('Model powinien być zapełniony danymi od razu', function () {
            expect(model.get('attachment')).to.be(undefined);
            expect(model.get('first_name')).to.be('');
            expect(model.get('last_name')).to.be('');
            expect(model.get('email')).to.be('');
            expect(model.get('tel')).to.be('');
            expect(model.get('unknown')).to.be('');
            expect(model.get('customer_type')).to.be(undefined);
            expect(model.get('post')).to.be(undefined);
            expect(model.get('agree1')).to.be(undefined);
            expect(model.get('agree2')).to.be(undefined);
            expect(model.get('comment')).to.be('');
            expect(model.get('address')).to.eql({
                street: '',
                house_number: '',
                city: 'warszawa'
            });
            expect(model.get('button1')).to.be(undefined);
            expect(model.get('button2')).to.be(undefined);
            expect(model.get('button3')).to.be(undefined);
            expect(model.get('button4')).to.be(undefined);
            expect(model.get('button5')).to.be(undefined);
            expect(model.get('image')).to.be(undefined);
            expect(model.get('item')).to.eql(undefined);
            expect(model.get('sub_item')).to.be('item1');
            expect(model.get('addition')).to.eql(undefined);
        });
    });
}());
