/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.ValidationView = Backbone.View.extend({
        events: {
            'submit': '_onSubmit',
            'click :input': '_onClickInput'
        },
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            Backbone.Validation.bind(this, {
                model: this.model
            });

            this.errorsPlace = options.errorsPlace || 'after';
            this.bindingOptions = options.bindingOptions || {};
            this.binding = new Backbone.form.TwoWayBinding(this.model, this.$el, this.bindingOptions);
            this.validValue = 0;
            this.validPercent = 0;
            this.errors = {};
            this.autoBinding = options.autoBinding || true;

            this.classFormErrors = 'form__errors';
            this.classFormError = 'form__error form-control-feedback';
            this.classInputError = 'form-control-danger';
            this.classFormGroupError = 'has-danger';

            this.listenTo(this.model, 'change', this._onModelChange);
            this.listenTo(this.model, 'validated', this._onModelValidated);

            if (this.autoBinding) {
                this.binding.auto(true);
            }
        },
        bindToModel: function () {
            this.binding.formToModel.bind();
        },
        /**
         * @return {Backbone.form.TwoWayBinding}
         */
        getBinding: function () {
            return this.binding;
        },
        /**
         * What percentage of fields is valid.
         *
         * @return {number}
         */
        getValidPercent: function () {
            return this.validPercent;
        },
        /**
         * @returns {Object}
         */
        getErrors: function () {
            return this.errors;
        },
        /**
         * @param {jQuery} element
         *
         * @returns {jQuery}
         */
        getErrorsContainer: function (element) {
            var container;

            switch (this.errorsPlace) {
                case 'before':
                    container = element.prev();
                    break;
                case 'after':
                    container = element.next();
                    break;
            }

            if (!container.hasClass(this.classFormErrors)) {
                container = $('<div />').addClass(this.classFormErrors);

                switch (this.errorsPlace) {
                    case 'before':
                        container.insertBefore(element);
                        break;
                    case 'after':
                        container.insertAfter(element);
                        break;
                }
            }

            return container;
        },
        /**
         * @param {jQuery} element
         * @param {String} message
         */
        addError: function (element, message) {
            var container = this.getErrorsContainer(element);

            if (message && message !== '__none') {
                $('<div />')
                    .addClass(this.classFormError)
                    .appendTo(container)
                    .text(message)
                ;
            }

            element
                .attr('data-has-error', 'yes')
                .addClass(this.classInputError)
                .parent()
                .addClass(this.classFormGroupError)
            ;
        },
        /**
         * @param {jQuery} element
         */
        clearErrors: function (element) {
            this.getErrorsContainer(element).empty();
            this._removeErrorState(element);
        },
        clearAllErrors: function () {
            this.$el.find('.' + this.classFormErrors).empty();
            this._removeErrorState(this.getItemsWithErrors());
        },
        /**
         * @return {jQuery}
         */
        getItemsWithErrors: function () {
            return this.$el.find('[data-has-error]');
        },
        /**
         * @return {jQuery}
         */
        getFirstErrorInput: function () {
            return this.$el.find('[data-has-error]:input:eq(0)');
        },
        /**
         * @param {Boolean} disable
         */
        disabledHtmlValidation: function (disable) {
            if (this.$el.prop('tagName') === 'FORM') {
                if (disable) {
                    this.$el.attr('novalidate', 'novalidate');
                } else {
                    this.$el.removeAttr('novalidate');
                }
            }
        },
        /**
         * @param {Object} errors
         * @private
         */
        _calculatePercent: function (errors) {
            var keysNum = this.$el.find(':input:not([type="button"],[type="submit"],[type="image"],[type="reset"],[type="file"]):not(button)').length,
                validNum = keysNum - _.keys(errors).length;

            this.errors = errors;
            this.validValue = validNum / keysNum;
            this.validValue = isNaN(this.validValue) ? 0 : this.validValue;
            this.validPercent = Math.round(this.validValue * 100);
        },
        /**
         * @param {jQuery} elements
         * @private
         */
        _removeErrorState: function (elements) {
            elements
                .removeAttr('data-has-error')
                .removeClass(this.classInputError)
                .parent()
                .removeClass(this.classFormGroupError)
            ;
        },
        /**
         * @param {Backbone.Model} model
         *
         * @private
         */
        _onModelChange: function (model) {
            model.isValid(true);
        },
        /**
         * @param {Boolean} isValid
         * @param {Backbone.Model} model
         * @param {Object} errors
         * @private
         */
        _onModelValidated: function (isValid, model, errors) {
            this._calculatePercent(errors);
            var view = this,
                formToModel = this.binding.getModelToForm();

            this.clearAllErrors();
            _.mapObject(errors, function(val, attr) {
                var modelValue = model.get(attr),
                    control = view.$el.find('[name="' + formToModel.getControleName([attr], modelValue) + '"]');

                if (control.length && control.data('ready-to-validation')) {
                    view.addError(control, val);
                }
            });
        },
        /**
         * @param {Event} e
         * @private
         */
        _onSubmit: function (e) {
            var view = this;
            this.$el.find(':input').data('ready-to-validation', true);
            if (!this.model.isValid(true)) {
                e.preventDefault();
                setTimeout(function () {
                    view.getFirstErrorInput().focus();
                }, 50);
            }
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickInput: function (e) {
            $(e.target).data('ready-to-validation', true);
            this.model.isValid(true);
        }
    });
}());
