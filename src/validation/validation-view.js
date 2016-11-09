/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.ValidationView = Backbone.View.extend({
        events: {
            'submit': '_onSubmit',
            'focusin :input': '_onFocusIn',
            'focusout :input': '_onFocusOut'
        },
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            var values = _.defaults(options || {}, Backbone.form.getDefaults('validationView'));

            this.useShadow = values.useShadow;
            this.errorsPlace = values.errorsPlace;
            this.bindingOptions = values.bindingOptions;
            this.binding = new Backbone.form.TwoWayBinding(this.model, this.$el, this.bindingOptions);
            this.validValue = 0;
            this.validPercent = 0;
            this.errors = {};
            this.autoBinding = values.autoBinding;
            this.popoverErrors = values.popoverErrors;

            this.classFormErrors = 'form__errors';
            this.classFormError = 'form__error ' + values.classFormError;
            this.classFormErrorInitial = 'form__error--initial';
            this.classInputError = values.classInputError;
            this.classFormGroupError = values.classFormGroupError;

            Backbone.Validation.bind(this, {
                model: this.getValidationModel()
            });

            this.listenTo(this.getValidationModel(), 'change', this._onModelChange);
            this.listenTo(this.getValidationModel(), 'validated', this._onModelValidated);
            $(window).resize($.proxy(this._onWindowResize, this));

            if (this.autoBinding) {
                this.binding.auto(true);
            }

            this._initialErrors();
        },
        /**
         * @return {Boolean}
         */
        isUseShadow: function () {
            return Boolean(this.useShadow);
        },
        getValidationModel: function () {
            return this.isUseShadow() ? this.model.getShadow() : this.model;
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

            if (this.popoverErrors && !container.data('is-popover')) {
                container.addClass(this.classFormErrors + '--popover');
                container.addClass(this.classFormErrors + '--popover-hidden');
                container.attr('data-is-popover', 'true');
                container.data('popover-related', element);
                element.attr('data-has-popover', 'true');
                element.data('popover-element', container);
                this.popoverPosition(element, container);
            }

            container.find('.' + this.classFormErrorInitial).remove();

            return container;
        },
        /**
         * @param {jQuery} element
         * @param {String} message
         * @param {boolean} [initial]
         */
        addError: function (element, message, initial) {
            var container = this.getErrorsContainer(element), item;
            initial = initial || false;

            if (message && message !== '__none') {
                item = $('<div />')
                    .addClass(this.classFormError)
                    .text(message)
                ;

                if (initial) {
                    item.addClass(this.classFormErrorInitial);
                }

                item.appendTo(container);
            }

            element
                .addClass(this.classInputError)
                .parent()
                .addClass(this.classFormGroupError)
            ;

            if (!initial) {
                element.attr('data-has-error', 'yes');
            }
        },
        /**
         * @param {jQuery} element
         */
        clearErrors: function (element) {
            this.getErrorsContainer(element).empty();
            this._removeErrorState(element);
        },
        clearAllErrors: function () {
            this.$el.find('.' + this.classFormErrors)
                .children()
                .not('.' + this.classFormErrorInitial)
                .remove()
            ;
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
         * @param {jQuery} control
         * @param {jQuery} element
         */
        popoverPosition: function (control, element) {
            var position = control.position(),
                height;

            if (control.hasClass('select2-hidden-accessible')) {
                control.removeClass('select2-hidden-accessible');
                height = control.outerHeight();
                control.addClass('select2-hidden-accessible');
            } else {
                height = control.outerHeight();
            }

            if (element.data('is-popover')) {
                element.css({
                    position: 'absolute',
                    left: position.left,
                    top: position.top + height
                });
            }
        },
        /**
         * @param {jQuery} input
         * @param {boolean} [force]
         */
        inputShowPopover: function (input, force) {
            var popover = input.data('popover-element');
            force = force || false;

            if (force || (input.has('has-popover') && input.attr('data-has-error') && popover && popover.children().length)) {
                popover.removeClass(this.classFormErrors + '--popover-hidden');
                this.popoverPosition(input, popover);
            }
        },
        /**
         * @param {jQuery} input
         */
        inputHidePopover: function (input) {
            var popover = input.data('popover-element');

            if (input.has('has-popover') && popover && popover.find('.' + this.classFormErrorInitial).length === 0) {
                popover.addClass(this.classFormErrors + '--popover-hidden');
            }
        },
        hideAllPopovers: function () {
            var view = this,
                elements = this.$el.find('[data-has-popover]');

            elements.each(function () {
                view.inputHidePopover($(this));
            });
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
        _initialErrors: function () {
            var view = this;
            this.$el.find('[name][data-initial-error]').each(function () {
                var control = $(this),
                    error = control.data('initial-error');

                if (error) {
                    view.addError(control, error, true);
                    view.inputShowPopover(control, true);
                }
            });
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
            this.hideAllPopovers();
            _.mapObject(errors, function(val, attr) {
                var modelValue = model.get(attr),
                    control;

                if (view.isUseShadow()) {
                    control = view.$el.find('[name="' + attr + '"]');
                } else {
                    control = view.$el.find('[name="' + formToModel.getControleName([attr], modelValue) + '"]');
                }

                if (control.length && control.data('ready-to-validation')) {
                    view.addError(control, val);
                    if (control.data('is-focused')) {
                        view.inputShowPopover(control);
                    }
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
            if (!this.getValidationModel().isValid(true)) {
                e.preventDefault();
                setTimeout(function () {
                    view.getFirstErrorInput().focus();
                }, 50);
            }
        },
        /**
         * @private
         */
        _onWindowResize: function () {
            var view = this;
            this.$el.find('[data-is-popover]').each(function () {
                var popover = $(this),
                    related = popover.data('popover-related');

                if (related) {
                    view.popoverPosition(related, popover);
                }
            });
        },
        /**
         * @param {Event} e
         * @private
         */
        _onFocusIn: function (e) {
            var input = $(e.target);
            input.data('ready-to-validation', true);
            input.data('is-focused', true);
            this.getValidationModel().isValid(true);
        },
        /**
         * @param {Event} e
         * @private
         */
        _onFocusOut: function (e) {
            var input = $(e.target);
            input.data('is-focused', false);
            this.inputHidePopover(input);
        }
    });
}());
