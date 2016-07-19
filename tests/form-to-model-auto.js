(function () {
    "use strict";

    var container = $('<div />').hide(), form, formToModel, model,
        Model = Backbone.Model.extend();

    function loadForm () {
        $.ajax({
            url: 'data/form-to-model-auto.html',
            dataType: 'html',
            async: false,
            success: function (html) {
                container.html(html);
                container.appendTo('body');
            }
        });

        form = container.find('#formAutobinding');
        formToModel = new Backbone.form.FormToModel(new Model(), form, {
            keepPrefix: false,
            auto: true
        });
        model = formToModel.getModel();
    }

    loadForm();

    /**
     * @param {number} [length]
     *
     * @returns {String}
     */
    function randomString (length) {
        var result = '', i, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        length = length || 10;

        for (i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }

        return result;
    }

    /**
     * @param {number} min
     * @param {number} max
     *
     * @returns {number}
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @param {String} inputName
     * @param {String} modelName
     * @param {Function} [customExpect]
     * @param {String} [triggerName]
     */
    function testValueTrigger (inputName, modelName, customExpect, triggerName) {
        var input = $('[name="' + inputName + '"]'), val, selected;

        triggerName = triggerName || 'change';

        if (input.prop('tagName') === 'SELECT'
            || (input.prop('tagName') === 'INPUT' && (
                input.attr('type') === 'radio' || input.attr('type') === 'checkbox'
            ))
        ) {
            if (triggerName === 'change') {
                selected = input.eq(randomInt(0, input.length - 1));
                val = selected.val();
                if (input.prop('tagName') === 'SELECT') {
                    selected.attr('selected', 'selected');
                } else {
                    selected.attr('checked', 'checked');
                }

                input.trigger(triggerName);
            }
        } else {
            val = randomString();
            input.val(val);
            input.trigger(triggerName);
        }

        if (!customExpect) {
            if (Array.isArray(model.get(modelName))) {
                expect(model.get(modelName)).to.be([val]);
            } else {
                expect(model.get(modelName)).to.be(val);
            }
        } else {
            customExpect(val, modelName);
        }
    }

    function emptyValuesTest () {
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
    }

    function triggerTest (triggerName) {
        var input, val;

        input = $('[name="order[first_name]"]');
        val = randomString();
        document.querySelector('[name="order[first_name]"]').value = val;
        input.trigger(triggerName);
        expect(model.get('first_name')).to.be(val);

        testValueTrigger('order[first_name]', 'first_name', null, triggerName);
        testValueTrigger('order[last_name]', 'last_name', null, triggerName);
        testValueTrigger('order[email]', 'email', null, triggerName);
        testValueTrigger('order[tel]', 'tel', null, triggerName);
        testValueTrigger('order[unknown]', 'unknown', null, triggerName);
        testValueTrigger('order[customer_type]', 'customer_type', null, triggerName);
        testValueTrigger('order[post]', 'post', null, triggerName);

        if (triggerName === 'change') {
            input = $('[name="order[agree1]"]').attr('checked', 'checked');
            input.trigger(triggerName);
            expect(model.get('agree1')).to.eql(['yes']);

            input = $('[name="order[agree2]"]').attr('checked', 'checked');
            input.trigger(triggerName);
            expect(model.get('agree2')).to.eql(['yes']);
        }

        testValueTrigger('order[comment]', 'comment', null, triggerName);

        if (triggerName === 'change') {
            $('[name="order[address][street]"]').val('test').trigger(triggerName);
            $('[name="order[address][house_number]"]').val('elo').trigger(triggerName);
            input = $('[name="order[address][city]"]');
            input.eq(0).attr('selected');
            input.trigger(triggerName);
            expect(model.get('address')).to.eql({
                street: 'test',
                house_number: 'elo',
                city: input.eq(0).val()
            });
        }
    }

    describe('FormToModel - autobinding', function () {
        it('Autobinding jest włączone', function () {
            expect(formToModel.isAuto()).to.be(true);
        });

        it('Model nie powinien być zapełniony danymi od razu', function () {
            expect(emptyValuesTest).to.throwException(/expected undefined to equal ''/);
            formToModel.bind();
            emptyValuesTest();
        });

        it('Wywoływanie zdarzenia change na polach formularza', function () {
            triggerTest('change');
        });

        it('Wywoływanie zdarzenia input na polach formularza', function () {
            loadForm();
            formToModel.bind();
            emptyValuesTest();
            triggerTest('input');
        });

        it('Wywoływanie zdarzenia keyup na polach formularza', function () {
            loadForm();
            formToModel.bind();
            emptyValuesTest();
            triggerTest('keyup');
        });

        it('Wywoływanie zdarzenia paste na polach formularza', function () {
            loadForm();
            formToModel.bind();
            emptyValuesTest();
            triggerTest('paste');
        });

        it('Sprawdzanie czy włącznik/wyłącznik działa', function () {
            loadForm();
            formToModel.bind();
            emptyValuesTest();

            formToModel.auto(false);
            testValueTrigger('order[last_name]', 'last_name', function (val, modelName) {
                expect(model.get(modelName)).to.eql('');
            }, 'change');

            formToModel.auto(true);
            testValueTrigger('order[last_name]', 'last_name', null, 'change');
        });
    });
}());
