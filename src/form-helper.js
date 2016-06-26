/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};

    var MODES = {
        brackets: 'brackets',
        separator: 'separator'
    };

    /**
     * @param {HTMLElement} form
     * @param {String} mode
     * @param {String} [separator]
     * @constructor
     */
    function FormHelper (form, mode, separator) {
        var validMode = false, k;

        if (!(form instanceof HTMLElement)) {
            throw new TypeError('Expected HTMLElement');
        }

        if (_.isUndefined(mode)) {
            throw new TypeError('Expected mode');
        }

        for (k in MODES) {
            if (MODES.hasOwnProperty(k)) {
                if (mode === MODES[k]) {
                    validMode = true;
                    break;
                }
            }
        }

        if (!validMode) {
            throw new TypeError('Unexpected mode');
        }

        if (mode === MODES.separator) {
            if (typeof separator !== 'string') {
                throw new TypeError('separator is not string');
            }

            if (!separator.length) {
                throw new TypeError('separator is empty');
            }
        }

        /**
         * @type {HTMLElement}
         */
        this.form = form;
        this.mode = mode;
        this.separator = separator;
    }

    /**
     * @param {String} name
     *
     * @returns {Boolean}
     */
    function hasArrayBrackets (name) {
        return name.substr(name.length - 2) === '[]';
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
                        if (hasArrayBrackets(name)) {
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
                if (control.multiple && hasArrayBrackets(name)) {
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
     * @returns {String|null}
     */
    FormHelper.prototype.getPrefix = function (name) {
        var prefix = null, prefixPos = null;

        if (hasArrayBrackets(name)) {
            name = name.substr(0, name.length - 2);
        }

        switch (this.mode) {
            case MODES.brackets:
                prefixPos = name.indexOf('[');

                if (prefixPos > 0) {
                    prefix = name.substr(0, prefixPos);
                }
                break;
            case MODES.separator:
                var names = name.split(this.separator, 2);

                if (names.length > 1) {
                    prefix = names[0];
                }
                break;
        }

        return prefix;
    };

    /**
     * @param {String} name
     *
     * @returns {String}
     */
    FormHelper.prototype.removePrefix = function (name) {
        var prefix = this.getPrefix(name), value = name;

        if (prefix !== null) {
            value = name.substr(this.mode === MODES.separator 
                ? (prefix.length + this.separator.length) : prefix.length);
        }

        return value;
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
     *
     * @returns {Object}
     */
    FormHelper.prototype.getObjectFromName = function (name, keepPrefix) {
        var obj = {}, prefix = this.getPrefix(name), cursor = obj, lastItem = null, lastName = null, value;

        if (typeof name !== 'string') {
            throw new TypeError('name is not string');
        }

        if (typeof keepPrefix !== 'boolean') {
            throw new TypeError('keepPrefix is not boolean');
        }

        value = this.getControlValue(name);

        if (hasArrayBrackets(name)) {
            name = name.substr(0, name.length - 2);
        }

        switch (this.mode) {
            case MODES.brackets:
                var regex = /\[(.*?)\]/g, results;

                if (prefix !== null) {
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
                } else {
                    cursor[name] = value;
                }
                break;
            case MODES.separator:
                name.split(this.separator).forEach(function (element, index, array) {
                    if (keepPrefix || (!keepPrefix && index !== 0) || array.length === 1) {
                        lastItem = cursor;
                        lastName = element;
                        cursor[element] = {};
                        cursor = cursor[element];
                    }
                });

                if (lastItem !== null && lastName !== null) {
                    lastItem[lastName] = value;
                }
                break;
        }

        return obj;
    };

    Backbone.form.FormHelper = FormHelper;
}());
