/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};

    /**
     * @param {HTMLElement} form
     * @param {String} [prefix]
     * @constructor
     */
    function FormHelper (form, prefix) {
        if (!(form instanceof HTMLElement)) {
            throw new TypeError('Expected HTMLElement');
        }

        /**
         * @type {HTMLElement}
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
     * @param {String} name
     *
     * @returns {null|String|Array}
     */
    FormHelper.prototype.getControlValue = function (name) {
        var control, type, tagName, value = null, arr, i;

        control = this.form.querySelector('[name="' + name + '"]');

        if (control === null) {
            throw new Error('Not found form control by name "' + name + '"');
        }

        type = control.getAttribute('type');
        tagName = control.tagName.toLowerCase();

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
                } else if (type !== 'button' && type !== 'submit' && type !== 'image' && type !== 'file' && type !== 'reset') {
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
     * @returns {String}
     */
    FormHelper.prototype.removePrefix = function (name) {
        return name.indexOf(this.prefix) === 0
            ? name.substr(this.prefix.length)
            : name;
    };

    /**
     * @param {String} name
     *
     * @returns {String}
     */
    FormHelper.prototype.removeExtremeBrackets = function (name) {
        return name.indexOf('[') === 0 && name.indexOf(']') === name.length-1
            ? name.substr(1, name.length-2)
            : name;
    };

    /**
     * @param {String} name
     * @param {Boolean} keepPrefix
     * @param {String} mode
     * @param {String} [divider]
     *
     * @returns {Object}
     */
    FormHelper.prototype.getObjectFromName = function (name, keepPrefix, mode, divider) {
        var obj = {}, prefix = null, prefixPos, cursor = obj, lastItem = null, lastName = null, value;

        if (typeof name !== 'string') {
            throw new TypeError('name is not string');
        }

        if (typeof keepPrefix !== 'boolean') {
            throw new TypeError('keepPrefix is not boolean');
        }

        value = this.getControlValue(name);

        switch (mode) {
            case 'brackets':
                var regex = /\[(.*?)\]/g, results;

                prefixPos = name.indexOf('[');

                if (prefixPos > 0) {
                    prefix = name.substr(0, prefixPos);

                    if (keepPrefix) {
                        cursor[prefix] = {};
                        cursor = cursor[prefix];
                    }

                    while (results = regex.exec(name)) {
                        lastItem = cursor;
                        lastName = results[1];
                        cursor[results[1]] = {};
                        cursor = cursor[results[1]];
                    }

                    if (lastItem !== null && lastName !== null) {
                        lastItem[lastName] = value;
                    }
                } else if (prefixPos === -1) {
                    cursor[name] = value;
                }
                break;
            default:
                throw new Error('Unexpected mode');
        }

        console.log(obj);

        return obj;
    };

    Backbone.form.FormHelper = FormHelper;

    if (typeof define === 'function' && define.amd) {
        define('backbone.form.form-helper', ['backbone'], function (Backbone) {
            return Backbone.form.FormHelper;
        });
    }
}());
