/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var model, Model, View;

    Model = Backbone.Model.extend({
        validation: {
            email: [{
                required: true,
                msg: 'Please enter an email address.'
            },{
                pattern: 'email',
                msg: 'Please enter a valid email.'
            }],
            first_name: {
                required: true,
                msg: '__none'
            },
            phone: {
                required: false,
                pattern: 'digits',
                msg: 'Please enter a valid phone.'
            },
            sex: {
                required: true,
                msg: 'Please choice sex.'
            },
            accept: {
                required: true,
                msg: 'Please check this.'
            }
        }
    });

    model = new Model();

    View = Backbone.View.extend({
        initialize: function () {
            this.validation = new Backbone.form.ValidationView({
                el: this.$el,
                model: this.model,
                popoverErrors: true
            });

            this.validation.bindToModel();
            this.validation.disabledHtmlValidation(true);
            this.listenTo(this.model, 'validated', this._onModelValidated);
        },
        /**
         * @private
         */
        _onModelValidated: function () {
            var progress = this.$el.find('.form__progress'),
                progressValue = this.$el.find('.form__progress-value');

            progress.attr('value', this.validation.getValidPercent());
            progressValue.text(this.validation.getValidPercent());
        }
    });

    new View({
        model: model,
        el: $('#form')
    });
}());
