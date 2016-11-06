/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

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

        var form = this.form,
            selector = '[name="' + name + '"]',
            controls, control;

        function load () {
            controls = form.find(selector);
            control = controls.eq(0);
        }

        load();

        return {
            reload: load,
            /**
             * @param {boolean} [reload]
             * @returns {jQuery}
             */
            getControls: function (reload) {
                if (reload) {
                    load();
                }

                return controls;
            },
            /**
             * @param {boolean} [reload]
             * @returns {jQuery}
             */
            getControl: function (reload) {
                if (reload) {
                    load();
                }

                return control;
            },
            /**
             * @returns {String|null}
             */
            getType: function () {
                return control.length ? control.attr('type') : null;
            },
            /**
             * @returns {String|null}
             */
            getTagName: function () {
                return control.length ? control.prop('tagName').toLowerCase() : null;
            },
            /**
             * @returns {Boolean}
             */
            isDisabled: function () {
                return control.length ? control.is(':disabled') : false;
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
            elements = this.form.find('[name="' + selector + '"]:enabled');
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
     * @param {Object} [info]
     *
     * @returns {undefined|null|String|Array}
     */
    FormHelper.prototype.getControlValue = function (name, info) {
        info = info || controlInfo.call(this, name);
        var value, arr, type = info.getType();

        if (!info.isDisabled()) {
            switch (info.getTagName()) {
                case 'input':
                    if (type === 'radio') {
                        arr = this.getInputCheckedValue(info.getControls());

                        if (arr.length) {
                            value = arr[arr.length - 1];
                        } else {
                            value = null;
                        }
                    } else if (type === 'checkbox') {
                        arr = this.getInputCheckedValue(info.getControls());

                        if (arr.length === 1 && info.getControls().length === 1) {
                            value = arr[0];
                        } else if (arr.length) {
                            value = arr;
                        } else {
                            value = null;
                        }
                    } else if (type === 'file') {
                        value = [];

                        info.getControls().each(function () {
                            var input = $(this), filename = [], i, files;

                            if (_.isUndefined(FileList)) {
                                filename.push(input.val());
                            } else {
                                files = input.get(0).files;
                                for (i = 0; i < files.length; ++i) {
                                    filename.push(files[i].name);
                                }
                            }

                            value.push({
                                element: input.get(0),
                                filename: filename,
                                files: files
                            });
                        });
                    } else if (type !== 'button' && type !== 'submit' && type !== 'image' && type !== 'reset') {
                        value = info.getControl().val();
                    } else {
                        value = null;
                    }
                    break;
                case 'select':
                    var selectVal = info.getControl().val();
                    if (selectVal && selectVal.length) {
                        value = selectVal;
                    } else {
                        value = null;
                    }
                    break;
                case 'textarea':
                    value = info.getControl().val();
                    break;
                case 'button':
                    value = null;
                    break;
            }
        }

        return value;
    };

    /**
     * @param {String} name
     * @param {String|Array|Boolean} value
     */
    FormHelper.prototype.setControlValue = function (name, value) {
        var info = controlInfo.call(this, name), type = info.getType();

        if ((_.isObject(value) && !_.isArray(value)) || _.isFunction(value) || _.isUndefined(value)) {
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
     * @param {Object} cursor
     * @param {Object} copy
     * @param {Function} findValue
     * @param {String} [lastKey]
     */
    function deepEach (cursor, copy, findValue, lastKey) {
        var keys = _.keys(cursor), key,
            current = _.isString(lastKey) ? copy[lastKey] : copy;

        if (keys.length) {
            key = keys[0];

            if (cursor[key] === findValue) {
                current[key] = findValue();
            } else {
                current[key] = {};
                deepEach(cursor[key], current, findValue, key);
            }
        }
    }

    /**
     * @param {String} name
     * @param {Boolean} keepPrefix
     * @param {Object} [obj]
     *
     * @returns {Object}
     */
    FormHelper.prototype.getObjectFromName = function (name, keepPrefix, obj) {
        obj = obj || {};
        var result = {}, prefix = this.getPrefix(name), cursor = obj, lastItem = null, lastName = null, value, info;

        if (typeof name !== 'string') {
            throw new TypeError('name is not string');
        }

        if (typeof keepPrefix !== 'boolean') {
            throw new TypeError('keepPrefix is not boolean');
        }

        info = controlInfo.call(this, name);
        value = this.getControlValue(name, info);

        function getValue (key) {
            key = key || 'value';
            switch (key) {
                case 'value':
                    return value;
                case 'control':
                    return info.getControls(true);
                case 'info':
                    return info;
            }
        }

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
                        lastItem[lastName] = getValue;
                    }
                } else {
                    cursor[name] = getValue;
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
                    lastItem[lastName] = getValue;
                }
                break;
        }

        deepEach(obj, result, getValue);

        return result;
    };

    /**
     * @param {Object} object
     *
     * @returns {Array}
     */
    FormHelper.prototype.getObjectPath = function (object) {
        var path = [], keys = _.keys(object), cursor = object;

        while (keys.length === 1 && _.isObject(cursor) && !_.isArray(cursor)) {
            cursor = cursor[keys[0]];
            path.push(keys[0]);
            keys = _.keys(cursor);
        }

        return (_.isObject(cursor) && !_.isArray(cursor)) ? [] : path;
    };

    /**
     * @param {Array} path
     * @param {String} [prefix]
     * @param {Boolean} [isCollection]
     *
     * @returns {String}
     */
    FormHelper.prototype.createName = function (path, prefix, isCollection) {
        var name, i;

        if (!_.isArray(path)) {
            throw new TypeError('Path must be Array');
        }

        if (path.length === 0) {
            throw new Error('Path is empty!');
        }

        if (!_.isUndefined(prefix) && !_.isNull(prefix)) {
            if (typeof prefix !== 'string') {
                throw new TypeError('Prefix must be string');
            }

            if (prefix.length === 0) {
                throw new Error('Prefix must be longer than 0 characters');
            }
        }

        switch (this.mode) {
            case FormHelper.MODES.brackets:
                if (prefix) {
                    name = prefix + '[' + path[0] + ']';
                } else if (path.length > 0) {
                    name = path[0];
                }

                for (i = 1; i < path.length; ++i) {
                    name += '[' + path[i] + ']';
                }

                break;
            case FormHelper.MODES.separator:
                name = prefix ? (prefix + this.separator) : '';

                for (i = 0; i < path.length; ++i) {
                    name += path[i] + this.separator;
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
