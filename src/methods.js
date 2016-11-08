/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var defaults = {
        formToModel: {},
        modelToForm: {},
        collectionView: {},
        collectionItemView: {},
        validationView: {}
    };

    /**
     * @param {Backbone.Model} model
     * @param {HTMLElement|jQuery} form
     * 
     * @returns {{model: Backbone.Model, form: HTMLElement}}
     */
    Backbone.form.validModelForm = function (model, form) {
        if (_.isUndefined(model)) {
            throw new TypeError('model is undefined');
        }

        if (_.isUndefined(form)) {
            throw new TypeError('form is undefined');
        }

        if (!(model instanceof Backbone.form.FormModel)) {
            throw new TypeError('expected Backbone.form.FormModel');
        }

        if (!(form instanceof HTMLElement) && _.isFunction(form.get)) {
            form = form.get(0);
        }

        if (!(form instanceof HTMLElement)) {
            throw new TypeError('expected HTMLElement');
        }

        return {
            model: model,
            form: form
        };
    };

    /**
     * @param {String} name
     */
    function throwDefaultsNotFound (name) {
        if (_.isUndefined(defaults[name])) {
            throw new TypeError('Defaults ' + name + ' not found.');
        }
    }

    /**
     * @param {String} name
     * @returns {Object}
     */
    Backbone.form.getDefaults = function (name) {
        throwDefaultsNotFound(name);
        return defaults[name];
    };

    /**
     * @param {String} name
     * @param {Object} [options]
     */
    Backbone.form.setDefaults = function (name, options) {
        throwDefaultsNotFound(name);
        var values = {};
        switch (name) {
            case 'formToModel':
                values = {
                    naming: Backbone.form.FormHelper.MODES.brackets,
                    separator: null,
                    auto: false,
                    keepPrefix: true
                };
                break;
            case 'modelToForm':
                values = {
                    naming: Backbone.form.FormHelper.MODES.brackets,
                    separator: null,
                    auto: false,
                    prefix: null
                };
                break;
            case 'collectionView':
                values = {
                    itemTagName: 'div',
                    itemClass: null,
                    htmlAttr: '_html',
                    isValidAttr: '_isValid',
                    messageAttr: '_message',
                    closeAlert: null,
                    removeConfirmation: null,
                    newElementPlace: 'last',
                    prototypeAttr: 'data-prototype',
                    autofocus: true,
                    editClick: false,
                    editDblClick: false,
                    bindingOptions: {},
                    itemPlaceholder: '__name__',
                    validationOptions: {}
                };
                break;
            case 'collectionItemView':
                values = {
                    bindingOptions: {},
                    htmlAttr: '_html',
                    isValidAttr: '_isValid',
                    messageAttr: '_message',
                    removeConfirmation: null,
                    placeholder: '__name__',
                    validationOptions: {}
                };
                break;
            case 'validationView':
                values = {
                    errorsPlace: 'after',
                    bindingOptions: {},
                    autoBinding: true,
                    popoverErrors: false,
                    useShadow: false
                };
                break;
        }

        defaults[name] = _.defaults(options || {}, values);
    };
}());
