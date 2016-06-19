/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};

    /**
     * @param {HTMLFormElement} form
     * @param {String} [prefix]
     * @constructor
     */
    function FormHelper (form, prefix) {
        /**
         * @type {HTMLFormElement}
         */
        this.form = form;
        this.prefix = prefix || '';
    }

    /**
     * @param {String} name
     *
     * @returns {Array}
     */
    FormHelper.prototype.getInputCheckedValue = function (name) {
        var arr = [], found, i;

        found = this.form.querySelectorAll('[name="' + name + '"]');
        for (i = 0; i < found.length; i++) {
            if (found[i].checked) {
                arr.push(found[i].value);
            }
        }

        return arr;
    };

    /**
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} control
     *
     * @returns {null|String|Array}
     */
    FormHelper.prototype.getControlValue = function (control) {
        var type = control.getAttribute('type'),
            name = control.getAttribute('name'),
            tagName = control.tagName.toLowerCase(),
            value = null,
            arr, i;

        switch (tagName) {
            case 'input':
                if (type === 'radio') {
                    arr = this.getInputCheckedValue(name);

                    if (arr.length) {
                        value = arr[arr.length - 1];
                    }
                } else if (type === 'checkbox') {
                    arr = this.getInputCheckedValue(name);

                    if (arr.length) {
                        if (name.substr(name.length - 2) === '[]') {
                            value = arr;
                        } else {
                            value = arr[arr.length - 1];
                        }
                    }
                } else if (type !== 'button' && type !== 'submit' && type !== 'image') {
                    value = control.value;
                }
                break;
            case 'select':
                if (control.multiple && name.substr(name.length - 2) === '[]') {
                    if (control.selectedOptions.length) {
                        value = [];

                        for (i = 0; i < control.selectedOptions.length; ++i) {
                            value.push(control.selectedOptions[i].value);
                        }
                    }
                } else {
                    value = control.value;
                }
                break;
            case 'textarea':
                value = control.value;
                break;
        }

        return value;
    };

    /**
     * @param {String} name
     *
     * @return {String}
     */
    FormHelper.prototype.removePrefix = function (name) {
        return name.indexOf(this.prefix) === 0
            ? name.substr(this.prefix)
            : name;
    };

    /**
     * @param {String} name
     *
     * @return {String}
     */
    FormHelper.prototype.removeExtremeBrackets = function (name) {
        return name.indexOf('[') === 0 && name.indexOf(']') === name.length-1
            ? name.substr(1, name.length-2)
            : name;
    };

    Backbone.form.FormHelper = FormHelper;

    if (typeof define === 'function' && define.amd) {
        define('backbone.form.form-helper', ['backbone'], function (Backbone) {
            return Backbone.form.FormHelper;
        });
    }
}());
