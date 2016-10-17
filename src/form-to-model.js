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
        this.options = _.defaults(options || {}, Backbone.form.getDefaults('formToModel'));
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
        var valueMore = {},
            value = this.formHelper.getObjectFromName(name, this.options.keepPrefix, valueMore),
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
