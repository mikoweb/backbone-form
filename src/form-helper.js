/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};

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

        for (k in FormHelper.MODES) {
            if (FormHelper.MODES.hasOwnProperty(k)) {
                if (mode === FormHelper.MODES[k]) {
                    validMode = true;
                    break;
                }
            }
        }

        if (!validMode) {
            throw new TypeError('Unexpected mode');
        }

        if (mode === FormHelper.MODES.separator) {
            if (typeof separator !== 'string') {
                throw new TypeError('separator is not string');
            }

            if (!separator.length) {
                throw new TypeError('separator is empty');
            }
        }

        this.form = $(form);
        this.mode = mode;
        this.separator = separator;
    }

    FormHelper.MODES = {
        brackets: 'brackets',
        separator: 'separator'
    };

    if (Object.freeze) {
        Object.freeze(FormHelper.MODES);
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
     * @returns {Object}
     */
    function controlInfo (name) {
        if (!_.isString(name)) {
            throw new TypeError('Name must be string');
        }

        var controls = this.form.find('[name="' + name + '"]'),
            control = controls.eq(0),
            type = null, tagName = null;

        if (control.length) {
            type = control.attr('type');
            tagName = control.prop('tagName').toLowerCase();
        }

        return {
            /**
             * @returns {jQuery}
             */
            getControls: function () {
                return controls;
            },
            /**
             * @returns {jQuery}
             */
            getControl: function () {
                return control;
            },
            /**
             * @returns {String|null}
             */
            getType: function () {
                return type;
            },
            /**
             * @returns {String|null}
             */
            getTagName: function () {
                return tagName;
            }
        };
    }

    /**
     * @param {String|jQuery} selector
     *
     * @returns {Array}
     */
    FormHelper.prototype.getInputCheckedValue = function (selector) {
        var arr = [], elements;

        if (typeof selector === 'string') {
            elements = this.form.find('[name="' + selector + '"]');
        } else if (_.isFunction(selector.each)) {
            elements = selector;
        } else {
            throw new Error('Unexpected value');
        }

        elements.each(function () {
            var $this = $(this);
            if ($this.is(':checked')) {
                arr.push($this.val());
            }
        });

        return arr;
    };

    /**
     * @param {String} name
     *
     * @returns {null|String|Array}
     */
    FormHelper.prototype.getControlValue = function (name) {
        var info = controlInfo.call(this, name), value = null, arr, type = info.getType();

        switch (info.getTagName()) {
            case 'input':
                if (type === 'radio') {
                    arr = this.getInputCheckedValue(info.getControls());

                    if (arr.length) {
                        value = arr[arr.length - 1];
                    }
                } else if (type === 'checkbox') {
                    arr = this.getInputCheckedValue(info.getControls());

                    if (arr.length) {
                        value = arr;
                    }
                } else if (type !== 'button' && type !== 'submit' && type !== 'image' 
                    && type !== 'file' && type !== 'reset'
                ) {
                    value = info.getControl().val();
                }
                break;
            case 'select':
                var selectVal = info.getControl().val();
                if (selectVal && selectVal.length) {
                    value = selectVal;
                }
                break;
            case 'textarea':
                value = info.getControl().val();
                break;
        }

        return value;
    };

    /**
     * @param {String} name
     * @param {String|Array|Boolean} value
     */
    FormHelper.prototype.setControlValue = function (name, value) {
        var info = controlInfo.call(this, name), type = info.getType();

        if (!(_.isString(value) || _.isArray(value) || _.isBoolean(value))) {
            throw new TypeError('Unexpected value with name ' + name);
        }

        if (_.isBoolean(value) && (info.getTagName() !== 'input' || type !== 'checkbox'
            || info.getControls().length !== 1)
        ) {
            value = '';
        }

        switch (info.getTagName()) {
            case 'input':
                if (type === 'radio') {
                    info.getControls().val(_.isArray(value) ? (value.length ? [value[0]] : []) : [value]);
                } else if (type === 'checkbox') {
                    if (_.isBoolean(value)) {
                        info.getControl().prop('checked', value);
                    } else {
                        info.getControls().val(_.isArray(value) ? value : [value]);
                    }
                } else if (type !== 'button' && type !== 'submit' && type !== 'image' 
                    && type !== 'file' && type !== 'reset'
                ) {
                    info.getControl().val(_.isArray(value) ? (value.length ? value[0] : '') : value);
                }
                break;
            case 'select':
                info.getControls().val(_.isArray(value) ? value : [value]);
                break;
            case 'textarea':
                info.getControl().val(_.isArray(value) ? (value.length ? value[0] : '') : value);
                break;
        }
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
            case FormHelper.MODES.brackets:
                prefixPos = name.indexOf('[');

                if (prefixPos > 0) {
                    prefix = name.substr(0, prefixPos);
                }
                break;
            case FormHelper.MODES.separator:
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
            value = name.substr(this.mode === FormHelper.MODES.separator
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
            case FormHelper.MODES.brackets:
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
            case FormHelper.MODES.separator:
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

    /**
     * @param {String} path
     * @param {String} [prefix]
     * @param {Boolean} [isCollection]
     *
     * @returns {String}
     */
    FormHelper.prototype.createName = function (path, prefix, isCollection) {
        var name, levels, i;

        if (typeof path !== 'string') {
            throw new TypeError('Path must be string');
        }

        if (path.length === 0) {
            throw new Error('Path must be longer than 0 characters');
        }

        if (!_.isUndefined(prefix) && !_.isNull(prefix)) {
            if (typeof prefix !== 'string') {
                throw new TypeError('Prefix must be string');
            }

            if (prefix.length === 0) {
                throw new Error('Prefix must be longer than 0 characters');
            }
        }

        levels = path.split('.');

        switch (this.mode) {
            case FormHelper.MODES.brackets:
                if (prefix) {
                    name = prefix + '[' + levels[0] + ']';
                } else if (levels.length > 0) {
                    name = levels[0];
                }

                for (i = 1; i < levels.length; ++i) {
                    name += '[' + levels[i] + ']';
                }

                break;
            case FormHelper.MODES.separator:
                name = prefix ? (prefix + this.separator) : '';

                for (i = 0; i < levels.length; ++i) {
                    name += levels[i] + this.separator;
                }

                name = name.substr(0, name.length - this.separator.length);
                break;
        }

        if (isCollection) {
            name += '[]';
        }

        return name;
    };

    Backbone.form.FormHelper = FormHelper;
}());
