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
        this.options = _.defaults(options || {}, Backbone.form.getDefaults('modelToForm'));
        this.formHelper = new Backbone.form.FormHelper(this.form, this.options.naming, this.options.separator);
        this.prefix = this.options.prefix;
        this.$form = $(this.form);
        this.auto(this.options.auto);
    }

    /**
     * @param {Array|String[]} attr
     * @param value
     *
     * @return {String}
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
     * @return {Backbone.form.FormModel}
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
     * @param {Array|String[]} attr
     * @param value
     *
     * @return {String}
     */
    ModelToForm.prototype.getControleName = function (attr, value) {
        return controlName.call(this, attr, value);
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
