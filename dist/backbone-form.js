/*!
 * deep-diff.
 * Licensed under the MIT License.
 */
(function(e,t){"use strict";if(typeof define==="function"&&define.amd){define([],t)}else if(typeof exports==="object"){module.exports=t()}else{e.DeepDiff=t()}})(this,function(e){"use strict";var t,n,a=[];if(typeof global==="object"&&global){t=global}else if(typeof window!=="undefined"){t=window}else{t={}}n=t.DeepDiff;if(n){a.push(function(){if("undefined"!==typeof n&&t.DeepDiff===p){t.DeepDiff=n;n=e}})}function r(e,t){e.super_=t;e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:false,writable:true,configurable:true}})}function i(e,t){Object.defineProperty(this,"kind",{value:e,enumerable:true});if(t&&t.length){Object.defineProperty(this,"path",{value:t,enumerable:true})}}function f(e,t,n){f.super_.call(this,"E",e);Object.defineProperty(this,"lhs",{value:t,enumerable:true});Object.defineProperty(this,"rhs",{value:n,enumerable:true})}r(f,i);function u(e,t){u.super_.call(this,"N",e);Object.defineProperty(this,"rhs",{value:t,enumerable:true})}r(u,i);function l(e,t){l.super_.call(this,"D",e);Object.defineProperty(this,"lhs",{value:t,enumerable:true})}r(l,i);function s(e,t,n){s.super_.call(this,"A",e);Object.defineProperty(this,"index",{value:t,enumerable:true});Object.defineProperty(this,"item",{value:n,enumerable:true})}r(s,i);function h(e,t,n){var a=e.slice((n||t)+1||e.length);e.length=t<0?e.length+t:t;e.push.apply(e,a);return e}function c(e){var t=typeof e;if(t!=="object"){return t}if(e===Math){return"math"}else if(e===null){return"null"}else if(Array.isArray(e)){return"array"}else if(e instanceof Date){return"date"}else if(/^\/.*\//.test(e.toString())){return"regexp"}return"object"}function o(t,n,a,r,i,p,b){i=i||[];var d=i.slice(0);if(typeof p!=="undefined"){if(r&&r(d,p,{lhs:t,rhs:n})){return}d.push(p)}var v=typeof t;var y=typeof n;if(v==="undefined"){if(y!=="undefined"){a(new u(d,n))}}else if(y==="undefined"){a(new l(d,t))}else if(c(t)!==c(n)){a(new f(d,t,n))}else if(t instanceof Date&&n instanceof Date&&t-n!==0){a(new f(d,t,n))}else if(v==="object"&&t!==null&&n!==null){b=b||[];if(b.indexOf(t)<0){b.push(t);if(Array.isArray(t)){var k,m=t.length;for(k=0;k<t.length;k++){if(k>=n.length){a(new s(d,k,new l(e,t[k])))}else{o(t[k],n[k],a,r,d,k,b)}}while(k<n.length){a(new s(d,k,new u(e,n[k++])))}}else{var g=Object.keys(t);var w=Object.keys(n);g.forEach(function(i,f){var u=w.indexOf(i);if(u>=0){o(t[i],n[i],a,r,d,i,b);w=h(w,u)}else{o(t[i],e,a,r,d,i,b)}});w.forEach(function(t){o(e,n[t],a,r,d,t,b)})}b.length=b.length-1}}else if(t!==n){if(!(v==="number"&&isNaN(t)&&isNaN(n))){a(new f(d,t,n))}}}function p(t,n,a,r){r=r||[];o(t,n,function(e){if(e){r.push(e)}},a);return r.length?r:e}function b(e,t,n){if(n.path&&n.path.length){var a=e[t],r,i=n.path.length-1;for(r=0;r<i;r++){a=a[n.path[r]]}switch(n.kind){case"A":b(a[n.path[r]],n.index,n.item);break;case"D":delete a[n.path[r]];break;case"E":case"N":a[n.path[r]]=n.rhs;break}}else{switch(n.kind){case"A":b(e[t],n.index,n.item);break;case"D":e=h(e,t);break;case"E":case"N":e[t]=n.rhs;break}}return e}function d(e,t,n){if(e&&t&&n&&n.kind){var a=e,r=-1,i=n.path?n.path.length-1:0;while(++r<i){if(typeof a[n.path[r]]==="undefined"){a[n.path[r]]=typeof n.path[r]==="number"?[]:{}}a=a[n.path[r]]}switch(n.kind){case"A":b(n.path?a[n.path[r]]:a,n.index,n.item);break;case"D":delete a[n.path[r]];break;case"E":case"N":a[n.path[r]]=n.rhs;break}}}function v(e,t,n){if(n.path&&n.path.length){var a=e[t],r,i=n.path.length-1;for(r=0;r<i;r++){a=a[n.path[r]]}switch(n.kind){case"A":v(a[n.path[r]],n.index,n.item);break;case"D":a[n.path[r]]=n.lhs;break;case"E":a[n.path[r]]=n.lhs;break;case"N":delete a[n.path[r]];break}}else{switch(n.kind){case"A":v(e[t],n.index,n.item);break;case"D":e[t]=n.lhs;break;case"E":e[t]=n.lhs;break;case"N":e=h(e,t);break}}return e}function y(e,t,n){if(e&&t&&n&&n.kind){var a=e,r,i;i=n.path.length-1;for(r=0;r<i;r++){if(typeof a[n.path[r]]==="undefined"){a[n.path[r]]={}}a=a[n.path[r]]}switch(n.kind){case"A":v(a[n.path[r]],n.index,n.item);break;case"D":a[n.path[r]]=n.lhs;break;case"E":a[n.path[r]]=n.lhs;break;case"N":delete a[n.path[r]];break}}}function k(e,t,n){if(e&&t){var a=function(a){if(!n||n(e,t,a)){d(e,t,a)}};o(e,t,a)}}Object.defineProperties(p,{diff:{value:p,enumerable:true},observableDiff:{value:o,enumerable:true},applyDiff:{value:k,enumerable:true},applyChange:{value:d,enumerable:true},revertChange:{value:y,enumerable:true},isConflict:{value:function(){return"undefined"!==typeof n},enumerable:true},noConflict:{value:function(){if(a){a.forEach(function(e){e()});a=null}return p},enumerable:true}});return p});
Backbone.form = {};
Backbone.form.mixin = {};
/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var formToModelDefaults = {},
        modelToFormDefaults = {};

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

        if (!(model instanceof Backbone.Model)) {
            throw new TypeError('expected Backbone.Model');
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
     * @returns {Object}
     */
    Backbone.form.getFormToModelDefaults = function () {
        return formToModelDefaults;
    };

    /**
     * @param {Object} [options]
     */
    Backbone.form.setFormToModelDefaults = function (options) {
        formToModelDefaults = _.defaults(options || {}, {
            naming: Backbone.form.FormHelper.MODES.brackets,
            separator: null,
            auto: false,
            keepPrefix: true
        });
    };

    /**
     * @returns {Object}
     */
    Backbone.form.getModelToFormDefaults = function () {
        return modelToFormDefaults;
    };

    /**
     * @param {Object} [options]
     */
    Backbone.form.setModelToFormDefaults = function (options) {
        modelToFormDefaults = _.defaults(options || {}, {
            naming: Backbone.form.FormHelper.MODES.brackets,
            separator: null,
            auto: false,
            prefix: null
        });
    };
}());

/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var related = {};

    /**
     * @param {Object} obj
     */
    function throwIsUnexpectedRelated (obj) {
        if (!(obj instanceof this.getRelatedClass())) {
            throw new TypeError('Unexpected related object');
        }
    }

    /**
     * @returns {Array}
     */
    related.getRelated = function () {
        return this._related;
    };

    /**
     * @param {Object} obj
     *
     * @returns {Boolean}
     */
    related.isRelatedWith = function (obj) {
        return _.contains(this._related, obj);
    };

    /**
     * @param {Object} obj
     */
    related.addRelated = function (obj) {
        throwIsUnexpectedRelated.call(this, obj);

        if (!this.isRelatedWith(obj)) {
            this._related.push(obj);
            if (!obj.isRelatedWith(this)) {
                obj.addRelated(this);
            }
        }
    };

    /**
     * @param {Object} obj
     */
    related.removeRelated = function (obj) {
        throwIsUnexpectedRelated.call(this, obj);

        if (this.isRelatedWith(obj)) {
            this._related = _.reject(this._related, function (item) {
                return obj === item;
            });
            if (obj.isRelatedWith(this)) {
                obj.removeRelated(this);
            }
        }
    };

    Backbone.form.mixin.related = related;
}());

/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var relatedSilent = {};

    /**
     * @param {Boolean} silent
     */
    relatedSilent.silentRelated = function (silent) {
        var i, related = this.getRelated();

        if (typeof silent !== 'boolean') {
            throw new TypeError('silent must be boolean');
        }

        for (i = 0; i < related.length; ++i) {
            related[i]._silent = silent;
        }
    };

    Backbone.form.mixin.relatedSilent = relatedSilent;
}());

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

        var controls = this.form.find('[name="' + name + '"]'),
            control = controls.eq(0),
            type = null, tagName = null,
            disabled = false;

        if (control.length) {
            type = control.attr('type');
            tagName = control.prop('tagName').toLowerCase();
            disabled = control.is(':disabled');
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
            },
            /**
             * @returns {Boolean}
             */
            isDisabled: function () {
                return disabled;
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
     *
     * @returns {undefined|null|String|Array}
     */
    FormHelper.prototype.getControlValue = function (name) {
        var info = controlInfo.call(this, name), value, arr, type = info.getType();

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

/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var formSelectors = {
        selectable: 'select, input[type="checkbox"], input[type="radio"]',
        inputable: 'textarea, input:not([type="radio"],[type="checkbox"],[type="button"],[type="submit"],[type="image"],[type="reset"],[type="file"])'
    };

    if (Object.freeze) {
        Object.freeze(formSelectors);
    }

    /**
     * @param {Backbone.Model} model
     * @param {HTMLElement|jQuery} form
     * @param {Object} [options]
     * @constructor
     */
    function FormToModel (model, form, options) {
        var data = Backbone.form.validModelForm(model, form);

        _.extend(this, Backbone.Events);
        delete this.bind;
        delete this.unbind;
        _.extend(this, Backbone.form.mixin.related);
        _.extend(this, Backbone.form.mixin.relatedSilent);
        this._related = [];
        this._auto = false;
        this._silent = false;
        this._toSynchronize = {};
        this.model = data.model;
        this.form = data.form;
        this.options = _.defaults(options || {}, Backbone.form.getFormToModelDefaults());
        this.formHelper = new Backbone.form.FormHelper(this.form, this.options.naming, this.options.separator);
        this.$form = $(this.form);
        this.fileModel = null;
        this.auto(this.options.auto);
    }

    /**
     * @param {Object} target
     * @param {Object} source
     *
     * @returns {Object}
     */
    function mergeObject (target, source) {
        var prop;

        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                if (target[prop] && _.isObject(source[prop]) && !_.isArray(source[prop])) {
                    mergeObject(target[prop], source[prop]);
                } else if (source[prop] !== null) {
                    target[prop] = source[prop];
                } else if (target[prop] && source[prop] === null) {
                    delete target[prop];
                }
            }
        }

        return target;
    }

    /**
     * @param {Event} e
     */
    function controlBind (e) {
        if (!this._silent && e.currentTarget !== this.getForm()) {
            this.bindControl(e.currentTarget.getAttribute('name'));
        }
    }

    /**
     * @param {Object} value
     *
     * @return {Boolean}
     */
    function clearAttr (value) {
        var path = this.formHelper.getObjectPath(value), cleared = false;

        if (path.length === 1) {
            this.model.unset(path[0], {silent: true});
            cleared = true;
        } else if (path.length > 1) {
            var attr, prevAttr, i, found = true,
                length = path.length - 1;

            attr = this.model.get(path[0]);
            if (_.isObject(attr) && !_.isArray(attr)) {
                i = 1;
                while (i < length && found) {
                    prevAttr = attr;
                    attr = attr[path[i]];
                    if (!(_.isObject(attr) && !_.isArray(attr))) {
                        found = false;
                    }

                    ++i;
                }

                if (found) {
                    delete attr[path[path.length - 1]];

                    if (prevAttr && _.keys(attr).length === 0 && path.length - 2 > -1) {
                        delete prevAttr[path[path.length - 2]];
                    }

                    if (_.keys(this.model.get(path[0])).length === 0) {
                        this.model.unset(path[0], {silent: true});
                    }

                    cleared = true;
                }
            }
        }

        return cleared;
    }

    /**
     * @param {Backbone.Model} model
     * @param {String} key
     * @param value
     * @param oldValue
     */
    function setModelValue (model, key, value, oldValue) {
        if (_.isNull(value)) {
            model.unset(key);
        } else if (_.isObject(oldValue) && !_.isArray(oldValue) && _.isObject(value) && !_.isArray(value)) {
            model.set(key, mergeObject($.extend(true, {}, oldValue), value));
        } else if (_.isUndefined(oldValue) && _.isObject(value) && !_.isArray(value)) {
            model.set(key, mergeObject({}, value));
        } else {
            model.set(key, value);
        }
    }

    /**
     * @param {String} message
     * @constructor
     */
    FormToModel.prototype.WildcardValueError = function (message) {
        this.name = 'Backbone.form.FormToModel.WildcardValueError';
        this.message = message;
    };

    FormToModel.prototype.WildcardValueError.prototype = new Error();

    FormToModel.prototype.bind = function () {
        var inputs = this.$form.find('[name]:enabled'), i;

        this.trigger('bind:before', inputs);
        this.sync();

        for (i = 0; i < inputs.length; i++) {
            this.bindControl(inputs.get(i).getAttribute('name'));
        }

        this.trigger('bind:after', inputs);
    };

    /**
     * @param {String} name
     */
    FormToModel.prototype.bindControl = function (name) {
        var value = this.formHelper.getObjectFromName(name, this.options.keepPrefix),
            keys = _.keys(value), key, oldValue, fail = true,
            controls = this.$form.find('[name="' + name + '"]'),
            control = controls.eq(0);

        if (keys.length > 1) {
            throw new this.WildcardValueError('Control "' + name + '" has ' + keys.length + ' values');
        }

        if (keys.length) {
            key = keys[0];

            if (value[key] !== undefined) {
                this.trigger('bind:control:before', name, value);
                this.silentRelated(true);

                try {
                    if (control.attr('type') !== 'file') {
                        oldValue = this.model.get(key);
                        setModelValue(this.model, key, value[key], oldValue);
                    } else if (this.fileModel instanceof Backbone.Model) {
                        oldValue = this.fileModel.get(key);
                        setModelValue(this.fileModel, key, value[key], oldValue);
                        this.fileModel.trigger('change', this.fileModel, {});
                    }
                } catch (e) {
                    this.silentRelated(false);
                    throw e;
                }

                this.silentRelated(false);
                fail = false;
                this._toSynchronize[name] = {
                    value: value,
                    length: controls.length
                };

                this.trigger('bind:control:after', name, value, oldValue);
            }
        }

        if (fail) {
            this.trigger('bind:control:fail', name, value);
        }
    };

    /**
     * @return {Backbone.Model}
     */
    FormToModel.prototype.getModel = function () {
        return this.model;
    };

    /**
     * @return {HTMLElement}
     */
    FormToModel.prototype.getForm = function () {
        return this.form;
    };

    /**
     * @param {Boolean} auto
     */
    FormToModel.prototype.auto = function (auto) {
        if (typeof auto !== 'boolean') {
            throw new TypeError('Auto must be boolean');
        }

        if (auto && !this._auto) {
            this.$form.on('change', formSelectors.selectable, $.proxy(controlBind, this));
            this.$form.on('change', 'input[type="file"]', $.proxy(controlBind, this));
            this.$form.on('change keyup paste input', formSelectors.inputable, $.proxy(controlBind, this));
        } else if (!auto && this._auto) {
            this.$form.off('change', formSelectors.selectable, controlBind);
            this.$form.off('change', 'input[type="file"]', controlBind);
            this.$form.off('change keyup paste input', formSelectors.inputable, controlBind);
        }

        this._auto = auto;
    };

    /**
     * @returns {Boolean}
     */
    FormToModel.prototype.isAuto = function () {
        return this._auto;
    };

    FormToModel.prototype.sync = function () {
        var name, control, toDelete = [], i;

        this.trigger('sync:before', this._toSynchronize);

        for (name in this._toSynchronize) {
            if (this._toSynchronize.hasOwnProperty(name)) {
                control = this.$form.find('[name="' + name + '"]');
                if (control.length === 0 || control.is(':disabled')) {
                    if (clearAttr.call(this, this._toSynchronize[name].value)) {
                        toDelete.push(name);
                    }
                } else if (control.length !== this._toSynchronize[name].length) {
                    this.bindControl(name);
                }
            }
        }

        for (i = 0; i < toDelete.length; ++i) {
            delete this._toSynchronize[toDelete[i]];
        }

        this.trigger('sync:after', this._toSynchronize);
    };

    /**
     * @returns {Function} {@link Backbone.form.ModelToForm}.
     */
    FormToModel.prototype.getRelatedClass = function () {
        return Backbone.form.ModelToForm;
    };

    /**
     * @return {Backbone.Model|null}
     */
    FormToModel.prototype.getFileModel = function () {
        return this.fileModel;
    };

    /**
     * @param {Backbone.Model} fileModel
     */
    FormToModel.prototype.setFileModel = function (fileModel) {
        if (!(fileModel instanceof Backbone.Model)) {
            throw new TypeError('expected Backbone.Model');
        }

        this.fileModel = fileModel;
    };

    Backbone.form.FormToModel = FormToModel;
}());

/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    /**
     * @param {Backbone.Model} model
     * @param {HTMLElement|jQuery} form
     * @param {Object} [options]
     * @constructor
     */
    function ModelToForm (model, form, options) {
        var data = Backbone.form.validModelForm(model, form);

        _.extend(this, Backbone.Events);
        delete this.bind;
        delete this.unbind;
        _.extend(this, Backbone.form.mixin.related);
        _.extend(this, Backbone.form.mixin.relatedSilent);
        this._related = [];
        this._auto = false;
        this._silent = false;
        this.model = data.model;
        this.form = data.form;
        this.options = _.defaults(options || {}, Backbone.form.getModelToFormDefaults());
        this.formHelper = new Backbone.form.FormHelper(this.form, this.options.naming, this.options.separator);
        this.prefix = this.options.prefix;
        this.$form = $(this.form);
        this.auto(this.options.auto);
    }

    /**
     * @param {Array|String[]} attr
     * @param value
     */
    function controlName (attr, value) {
        var name;

        if (_.isArray(value)) {
            name = this.formHelper.createName(attr, this.prefix, true);
            if (!this.$form.find('[name="' + name + '"]').length) {
                name = this.formHelper.createName(attr, this.prefix);
            }
        } else {
            name = this.formHelper.createName(attr, this.prefix);
        }

        return name;
    }

    /**
     * @param {Array|String[]} attr
     * @param lastValue
     */
    function clearControlValue (attr, lastValue) {
        this.formHelper.setControlValue(controlName.call(this, attr, lastValue), null);
    }

    /**
     * @param attributes
     * @param {Array} path
     * @param {Boolean} [clear]
     */
    function bind (attributes, path, clear) {
        var context = this;

        if (!_.isArray(attributes) && _.isObject(attributes)) {
            _.each(attributes, function (attr, key) {
                var contextPath = _.clone(path);
                contextPath.push(key);
                bind.call(context, attr, contextPath, clear);
            });
        } else if (!_.isUndefined(attributes)) {
            if (clear === true) {
                clearControlValue.call(this, path, attributes);
            } else {
                this.bindAttribute(path);
            }
        }
    }

    /**
     * @param {Backbone.Model} model
     */
    function onModelChange (model) {
        if (!this._silent) {
            var deepDiff = DeepDiff.noConflict(),
                diff = deepDiff.diff(model.previousAttributes(), model.attributes),
                i, j, current;

            if (diff) {
                for (i = 0; i < diff.length; ++i) {
                    if (diff[i].kind === 'D') {
                        bind.call(this, diff[i].lhs, diff[i].path, true);
                    } else if (diff[i].kind === 'A') {
                        bind.call(this, [], diff[i].path);
                    } else {
                        if (diff[i].path.length > 1) {
                            j = 1;
                            current = model.attributes[diff[i].path[0]];
                            while (!_.isUndefined(current) && j < diff[i].path.length - 1) {
                                current = current[diff[i].path[j]];
                                ++j;
                            }
                        }

                        if (_.isArray(current)) {
                            bind.call(this, current, diff[i].path.slice(0, diff[i].path.length - 1));
                        } else {
                            bind.call(this, diff[i].rhs, diff[i].path);
                        }
                    }
                }
            }
        }
    }

    /**
     * @param {Boolean} [diffPrevious]
     */
    ModelToForm.prototype.bind = function (diffPrevious) {
        diffPrevious = diffPrevious || false;

        this.trigger('bind:before');

        if (diffPrevious) {
            var deepDiff = DeepDiff.noConflict(),
                diff = deepDiff.diff(this.model.previousAttributes(), this.model.attributes), i;

            for (i = 0; i < diff.length; ++i) {
                if (diff[i].kind === 'D') {
                    bind.call(this, diff[i].lhs, diff[i].path, true);
                }
            }
        }

        bind.call(this, this.model.attributes, []);
        this.trigger('bind:after');
    };

    /**
     * @param {Array|String[]} attr
     */
    ModelToForm.prototype.bindAttribute = function (attr) {
        var i, current, name;

        if (!_.isArray(attr)) {
            throw new TypeError('Attribute must be Array');
        }

        if (attr.length === 0) {
            throw new TypeError('Attribute is empty!');
        }

        current = this.model.get(attr[0]);
        i = 1;
        while (!_.isUndefined(current) && i < attr.length) {
            current = current[attr[i]];
            ++i;
        }

        if (attr.length === i && ((!_.isUndefined(current) && !_.isObject(current)) || _.isArray(current))) {
            name = controlName.call(this, attr, current);
            this.trigger('bind:attr:before', attr, name, current);
            this.silentRelated(true);

            try {
                this.formHelper.setControlValue(name, current);
            } catch (e) {
                this.silentRelated(false);
                throw e;
            }

            this.silentRelated(false);
            this.trigger('bind:attr:after', attr, name, current);
        } else {
            this.trigger('bind:attr:fail', attr);
        }
    };

    /**
     * @return {Backbone.Model}
     */
    ModelToForm.prototype.getModel = function () {
        return this.model;
    };

    /**
     * @return {HTMLElement}
     */
    ModelToForm.prototype.getForm = function () {
        return this.form;
    };

    /**
     * @param {Boolean} auto
     */
    ModelToForm.prototype.auto = function (auto) {
        if (typeof auto !== 'boolean') {
            throw new TypeError('Auto must be boolean');
        }

        if (auto && !this._auto) {
            this.model.on('change', onModelChange, this);
        } else if (!auto && this._auto) {
            this.model.off('change', onModelChange);
        }

        this._auto = auto;
    };

    /**
     * @returns {Boolean}
     */
    ModelToForm.prototype.isAuto = function () {
        return this._auto;
    };

    /**
     * @returns {Function} {@link Backbone.form.FormToModel}.
     */
    ModelToForm.prototype.getRelatedClass = function () {
        return Backbone.form.FormToModel;
    };

    Backbone.form.ModelToForm = ModelToForm;
}());

/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    /**
     * @param {Backbone.Model} model
     * @param {HTMLElement|jQuery} form
     * @param {Object} [options]
     * @constructor
     */
    function TwoWayBinding (model, form, options) {
        this.formToModel = new Backbone.form.FormToModel(model, form, options);
        this.modelToForm = new Backbone.form.ModelToForm(model, form, options);
        this.formToModel.addRelated(this.modelToForm);
        this.auto(_.isObject(options) && _.isBoolean(options.auto) ? options.auto : false);
    }

    /**
     * @param {Boolean} auto
     */
    TwoWayBinding.prototype.auto = function (auto) {
        this.formToModel.auto(auto);
        this.modelToForm.auto(auto);
    };

    /**
     * @returns {Boolean}
     */
    TwoWayBinding.prototype.isAuto = function () {
        return this.formToModel.isAuto() && this.modelToForm.isAuto();
    };

    /**
     * @returns {Backbone.form.FormToModel}
     */
    TwoWayBinding.prototype.getFormToModel = function () {
        return this.formToModel;
    };

    /**
     * @returns {Backbone.form.ModelToForm}
     */
    TwoWayBinding.prototype.getModelToForm = function () {
        return this.modelToForm;
    };

    Backbone.form.TwoWayBinding = TwoWayBinding;
}());

/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.CollectionItemView = Backbone.View.extend({
        events: {
            'submit form': '_onFormSubmit'
        },
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            if (!_.isObject(options)) {
                throw new TypeError('CollectionItemView: Options is required.');
            }

            if (!_.isString(options.name)) {
                throw new TypeError('CollectionItemView: option name is not string.');
            }

            this.htmlAttr = options.htmlAttr || '_html';
            this.currentState = null;
            this.$el.addClass('form-collection__item');
            this._initFormModel(options.formModel);
            this._templateRequest = true;
            this._compiledTemplate = null;
            this.name = options.name;
            this.setPlaceholder(options.placeholder || '__name__');
            this.setTemplate(options.template);

            this.$el.on('click', '.form-collection__btn-remove', $.proxy(this._onClickRemove, this));
            this.$el.on('click', '.form-collection__btn-edit', $.proxy(this._onClickEdit, this));
            this.$el.on('click', '.form-collection__btn-cancel', $.proxy(this._onClickCancel, this));
            this.$el.on('click', '.form-collection__btn-save', $.proxy(this._onClickSave, this));
            this.listenTo(this.formModel, 'destroy', this.destroyView);
            this.listenTo(this.formModel, 'change', this.renderPreview);
            this.listenTo(this.formModel, 'change', this._onFormModelChange);
        },
        /**
         * @returns {Object}
         */
        renderParams: function () {
            return {
                name: this.name,
                form: this.formModel
            };
        },
        renderAll: function () {
            this.$el.html(this.getTemplate()(this.renderParams()));
            this.changeState(this.formModel.isNew() ? 'form' : 'preview');
        },
        renderPreview: function () {
            var preview = this.getPreviewElement(), template, fresh;

            if (preview.length) {
                template = $('<div />').html(this.getTemplate()(this.renderParams()));
                fresh = template.find('.' + this.getPreviewElementClass());
                fresh.attr('class', preview.attr('class'));
                preview.replaceWith(fresh);
            }
        },
        btnUpdate: function () {
            var btnRemove = this.$el.find('.form-collection__btn-remove'),
                btnCancel = this.$el.find('.form-collection__btn-cancel');

            if (this.formModel.isNew()) {
                btnCancel.hide();
                btnRemove.show();
            } else {
                btnCancel.show();

                if (this.currentState === 'form') {
                    btnRemove.hide();
                } else {
                    btnRemove.show();
                }
            }
        },
        /**
         * @param {Boolean} disabled
         */
        disabled: function (disabled) {
            if (disabled) {
                this.$el.find(':input').attr('disabled', 'disabled');
            } else {
                this.$el.find(':input').removeAttr('disabled');
            }
        },
        /**
         * @returns {Function}
         */
        getTemplate: function () {
            if (this._compiledTemplate === null || this._templateRequest) {
                this._compiledTemplate = this._createTemplate();
                this._templateRequest = false;
            }

            return this._compiledTemplate;
        },
        /**
         * Set "placeholder", which you'll replace with a unique, incrementing number.
         *
         * @param {String|null} placeholder
         */
        setPlaceholder: function (placeholder) {
            this._templateRequest = true;
            this.placeholder = String(placeholder);
        },
        /**
         * @param {String} template
         */
        setTemplate: function (template) {
            if (!_.isString(template)) {
                throw new TypeError('CollectionItemView: Template is not string');
            }

            this._templateRequest = true;
            this.template = template;
        },
        /**
         * @returns {jQuery}
         */
        getElement: function () {
            return this.$el;
        },
        /**
         * @returns {Backbone.form.TwoWayBinding}
         */
        getBinding: function () {
            return this.twoWayBinding;
        },
        /**
         * Destroy only view without model.
         *
         * @param {Boolean} [silent]
         */
        destroyView: function (silent) {
            if (silent !== true) {
                this.trigger('item:destroy', this);
            }
            this.undelegateEvents();
            this.remove();
        },
        /**
         * @returns {jQuery}
         */
        getFormElement: function () {
            return this.$el.find('.form-collection__item_form');
        },
        /**
         * @returns {jQuery}
         */
        getPreviewElement: function () {
            return this.$el.find('.' + this.getPreviewElementClass());
        },
        /**
         * @returns {string}
         */
        getPreviewElementClass: function () {
            return 'form-collection__item_preview';
        },
        /**
         * @param {String} state
         */
        changeState: function (state) {
            var form = this.getFormElement(),
                preview = this.getPreviewElement(),
                formDisabled = 'form-collection__item_form--disabled',
                previewDisabled = 'form-collection__item_preview--disabled';

            switch (state) {
                case 'form':
                    form.removeClass(formDisabled);
                    preview.addClass(previewDisabled);
                    break;
                case 'preview':
                    form.addClass(formDisabled);
                    preview.removeClass(previewDisabled);
            }

            this.currentState = state;
            this.btnUpdate();
        },
        /**
         * Load html to this.$el from model html attribute. After load html attribute will be unset.
         */
        loadHtml: function () {
            if (this.formModel.has(this.htmlAttr)) {
                this.$el.html(this.formModel.get(this.htmlAttr));
                this.formModel.unset(this.htmlAttr);
            }
        },
        /**
         * @returns {Function}
         * @private
         */
        _createTemplate: function () {
            var template;

            if (this.placeholder.length && !_.isNull(this.name)) {
                template = this.template.replace(new RegExp(this.placeholder, 'g'), this.name);
            } else {
                template = this.template;
            }

            return _.template(template);
        },
        /**
         * @param {Backbone.Model} model
         * @private
         */
        _initFormModel: function (model) {
            if (!(model instanceof Backbone.Model)) {
                throw new TypeError('Form model is not Backbone.Model.');
            }

            this.formModel = model;
            this.twoWayBinding = new Backbone.form.TwoWayBinding(this.formModel, this.$el);
            this.formToModel = this.twoWayBinding.getFormToModel();
            this.formToModel.setFileModel(new Backbone.Model());
            this.twoWayBinding.auto(true);
        },
        /**
         * @private
         */
        _onClickRemove: function () {
            var view = this;
            this.disabled(true);
            function reset () {
                view.disabled(false);
            }

            this.formModel.destroy({
                success: reset,
                error: reset
            });
        },
        /**
         * @private
         */
        _onClickSave: function () {
            var view = this;
            this.disabled(true);
            function reset () {
                view.disabled(false);
            }

            this.formModel.save({}, {
                success: function (model, response) {
                    if (!response[view.htmlAttr]) {
                        reset();
                        view.changeState('preview');
                    }
                },
                error: reset
            });
        },
        /**
         * @private
         */
        _onClickEdit: function () {
            this.changeState('form');
        },
        /**
         * @private
         */
        _onClickCancel: function () {
            this.changeState('preview');
        },
        /**
         * @param {Event} e
         * @private
         */
        _onFormSubmit: function (e) {
            e.preventDefault();
        },
        /**
         * @private
         */
        _onFormModelChange: function () {
            if (this.formModel.has(this.htmlAttr)) {
                this.loadHtml();
            }
        }
    });
}());

/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.CollectionView = Backbone.View.extend({
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            if (!_.isObject(options)) {
                throw new TypeError('CollectionView: Options is required.');
            }

            if (options.itemView && options.itemView instanceof Backbone.form.CollectionItemView) {
                this.itemView = options.itemView;
            } else {
                this.itemView = Backbone.form.CollectionItemView;
            }

            this.items = [];
            this.index = 0;
            this.htmlAttr = options.htmlAttr || '_html';
            this._onRuquestError = options.onRuquestError;
            this.setElContainer(options.elContainer);
            this.newElementPlace = options.newElementPlace || 'last';
            this.prototypeAttr = options.prototypeAttr || 'data-prototype';

            if (options.itemTemplate) {
                this.setItemTemplate(options.itemTemplate);
            } else if (this.$el.get(0).hasAttribute(this.prototypeAttr)) {
                this.setItemTemplate(this.$el.attr(this.prototypeAttr));
            } else {
                throw new Error('CollectionView: Please set itemTemplate.');
            }

            this.autofocus = options.autofocus || true;
            this._initFormCollection(options.formCollection);
            this._initFromElement();

            this.$el.on('click', '.form-collection__btn-add', $.proxy(this._onClickAdd, this));
            this.listenTo(this.formCollection, 'sync', this._onFormCollectionSync);
            this.listenTo(this.formCollection, 'error', this._onRuquestError);
        },
        /**
         * @param {String} [modelKey]
         * @param {jQuery} [el]
         */
        addItem: function (modelKey, el) {
            var view, viewOptions, model = new this.formCollection.model();

            if (modelKey) {
                model.set(model.idAttribute, modelKey);
            }

            this.formCollection.add(model);
            this._addModelListeners(model);

            viewOptions = {
                template: this.itemTemplate,
                name: String(this.index),
                formModel: model,
                htmlAttr: this.htmlAttr
            };

            if (el) {
                viewOptions.el = el;
                view = new this.itemView(viewOptions);
                view.disabled(false);
                view.getBinding().getFormToModel().bind();
            } else {
                view = new this.itemView(viewOptions);
                view.renderAll();
                view.disabled(false);
                view.getBinding().getFormToModel().bind();
                this._attachView(view);
            }

            this._addViewListeners(view);
            this.items.push(view);
            ++this.index;
        },
        /**
         * @param {Backbone.Model} model
         */
        addItemWithModel: function (model) {
            var view;

            this._addModelListeners(model);
            view = new this.itemView({
                template: this.itemTemplate,
                name: String(this.index),
                formModel: model,
                htmlAttr: this.htmlAttr
            });

            if (model.has(this.htmlAttr)) {
                view.loadHtml();
            } else {
                view.renderAll();
                view.disabled(false);
                view.getBinding().getModelToForm().bind();
            }

            this._attachView(view);
            this._addViewListeners(view);
            this.items.push(view);
            ++this.index;
        },
        /**
         * @param {String} template
         */
        setItemTemplate: function (template) {
            if (!_.isString(template)) {
                throw new TypeError('CollectionView: Item template is not string.');
            }

            this.itemTemplate = template;
        },
        /**
         * @param {jQuery|String} [container]
         */
        setElContainer: function (container) {
            var elContainer;

            if (_.isString(container)) {
                this.elContainer = this.$el.find(container);
            } else if (_.isObject(container)) {
                this.elContainer = container;
            } else {
                elContainer = this.$el.find('.form_collection__container');
                this.elContainer = elContainer.length ? elContainer : this.$el;
            }
        },
        /**
         * @return {Array}
         */
        getItems: function () {
            return this.items;
        },
        /**
         * Initialize items from element content.
         *
         * @private
         */
        _initFromElement: function () {
            var view = this;
            this.$el.find('[data-is-item]').each(function () {
                var el = $(this),
                    key = el.attr('data-key');

                view.addItem(key, el);
            });
        },
        /**
         * @param {Backbone.Collection} collection
         * @private
         */
        _initFormCollection: function (collection) {
            if (!(collection instanceof Backbone.Collection)) {
                throw new TypeError('Form collection is not Backbone.Collection.');
            }

            this.formCollection = collection;
        },
        /**
         * @param {Backbone.Model} model
         * @private
         */
        _addModelListeners: function (model) {
            var that = this;

            if (!model.__addedItemListeners) {
                model.on('error', this._onRuquestError);
                model.on('change', function () {
                    that.trigger('model:change', model);
                });

                model.__addedItemListeners = true;
            }
        },
        /**
         * @param {Backbone.form.CollectionItemView} view
         * @private
         */
        _addViewListeners: function (view) {
            var that = this;
            view.on('item:destroy', function () {
                that.items = _.reject(that.items, function (item) {
                    return item === view;
                });
            });
        },
        /**
         * @param {Backbone.form.CollectionItemView} view
         * @private
         */
        _attachView: function (view) {
            switch (this.newElementPlace) {
                case 'last':
                    view.getElement().appendTo(this.elContainer);
                    break;
                case 'first':
                    view.getElement().prependTo(this.elContainer);
                    break;
                default:
                    view.getElement().appendTo(this.elContainer);
            }

            if (this.autofocus) {
                view.getElement().find(':input:not(button)').eq(0).focus();
            }
        },
        /**
         * @private
         */
        _onClickAdd: function () {
            this.addItem();
        },
        /**
         * @private
         */
        _onFormCollectionSync: function (collection) {
            var view = this;

            if (collection instanceof Backbone.Collection) {
                this.items.forEach(function (item) {
                    item.destroyView(true);
                });

                this.items = [];
                this.index = 0;

                this.formCollection.models.forEach(function (model) {
                    view.addItemWithModel(model);
                });
            }
        }
    });
}());

Backbone.form.setFormToModelDefaults();
Backbone.form.setModelToFormDefaults();