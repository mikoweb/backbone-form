/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    var View, Model, model;

    View = Backbone.View.extend({
        initialize: function () {
            this.model.on('change', this.render, this);
            this.form = this.$el.find('form.form-data');
            this.$formModel = this.$el.find('form.form-model');
            this.$elModel = this.$el.find('.model');
            this.twoWayBinding = new Backbone.form.TwoWayBinding(this.model, this.form);
            this.twoWayBinding.auto(true);
            this.model.fetch();
        },
        events: {
            'submit form.form-data': 'onFormSubmit',
            'submit form.form-model': 'onFormModelSubmit'
        },
        /**
         * @param {Event} e
         */
        onFormSubmit: function (e) {
            e.preventDefault();
            this.twoWayBinding.getFormToModel().bind();
        },
        /**
         * @param {Event} e
         */
        onFormModelSubmit: function (e) {
            var key = this.$formModel.find('[name="model_key"]').val(),
                value = this.$formModel.find('[name="model_value"]').val();

            e.preventDefault();

            if (_.isString(value)) {
                if (value === 'null' || value === 'true' || value === 'false') {
                    value = eval(value);
                }
            } else {
                value = undefined;
            }

            if (key && (_.isString(value) || _.isNull(value) || _.isBoolean(value))) {
                this.model.set(key, value);
                this.$formModel.find('[name]').val('');
            }
        },
        render: function (model) {
            this.$elModel.JSONView(model.attributes);
        }
    });

    Model = Backbone.Model.extend({
        url: 'data/form.json'
    });

    model = new Model();
    new View({
        model: model,
        el: $('#twoWayBinding')
    });
}());
