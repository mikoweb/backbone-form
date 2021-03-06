// Backbone.Validation v0.11.4
//
// Copyright (c) 2011-2015 Thomas Pedersen
// Distributed under MIT License
//
// Documentation and full license available at:
// http://thedersen.com/projects/backbone-validation
Backbone.Validation = (function(_){
  'use strict';

  // Default options
  // ---------------

  var defaultOptions = {
    forceUpdate: false,
    selector: 'name',
    labelFormatter: 'sentenceCase',
    valid: Function.prototype,
    invalid: Function.prototype
  };


  // Helper functions
  // ----------------

  // Formatting functions used for formatting error messages
  var formatFunctions = {
    // Uses the configured label formatter to format the attribute name
    // to make it more readable for the user
    formatLabel: function(attrName, model) {
      return defaultLabelFormatters[defaultOptions.labelFormatter](attrName, model);
    },

    // Replaces nummeric placeholders like {0} in a string with arguments
    // passed to the function
    format: function() {
      var args = Array.prototype.slice.call(arguments),
          text = args.shift();
      return text.replace(/\{(\d+)\}/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
      });
    }
  };

  // Flattens an object
  // eg:
  //
  //     var o = {
  //       owner: {
  //         name: 'Backbone',
  //         address: {
  //           street: 'Street',
  //           zip: 1234
  //         }
  //       }
  //     };
  //
  // becomes:
  //
  //     var o = {
  //       'owner': {
  //         name: 'Backbone',
  //         address: {
  //           street: 'Street',
  //           zip: 1234
  //         }
  //       },
  //       'owner.name': 'Backbone',
  //       'owner.address': {
  //         street: 'Street',
  //         zip: 1234
  //       },
  //       'owner.address.street': 'Street',
  //       'owner.address.zip': 1234
  //     };
  // This may seem redundant, but it allows for maximum flexibility
  // in validation rules.
  var flatten = function (obj, into, prefix) {
    into = into || {};
    prefix = prefix || '';

    _.each(obj, function(val, key) {
      if(obj.hasOwnProperty(key)) {
        if (!!val && _.isArray(val)) {
          _.forEach(val, function(v, k) {
            flatten(v, into, prefix + key + '.' + k + '.');
            into[prefix + key + '.' + k] = v;
          });
        } else if (!!val && typeof val === 'object' && val.constructor === Object) {
          flatten(val, into, prefix + key + '.');
        }

        // Register the current level object as well
        into[prefix + key] = val;
      }
    });

    return into;
  };

  // Validation
  // ----------

  var Validation = (function(){

    // Returns an object with undefined properties for all
    // attributes on the model that has defined one or more
    // validation rules.
    var getValidatedAttrs = function(model, attrs) {
      attrs = attrs || _.keys(_.result(model, 'validation') || {});
      return _.reduce(attrs, function(memo, key) {
        memo[key] = void 0;
        return memo;
      }, {});
    };

    // Returns an array with attributes passed through options
    var getOptionsAttrs = function(options, view) {
      var attrs = options.attributes;
      if (_.isFunction(attrs)) {
        attrs = attrs(view);
      } else if (_.isString(attrs) && (_.isFunction(defaultAttributeLoaders[attrs]))) {
        attrs = defaultAttributeLoaders[attrs](view);
      }
      if (_.isArray(attrs)) {
        return attrs;
      }
    };


    // Looks on the model for validations for a specified
    // attribute. Returns an array of any validators defined,
    // or an empty array if none is defined.
    var getValidators = function(model, attr) {
      var attrValidationSet = model.validation ? _.result(model, 'validation')[attr] || {} : {};

      // If the validator is a function or a string, wrap it in a function validator
      if (_.isFunction(attrValidationSet) || _.isString(attrValidationSet)) {
        attrValidationSet = {
          fn: attrValidationSet
        };
      }

      // Stick the validator object into an array
      if(!_.isArray(attrValidationSet)) {
        attrValidationSet = [attrValidationSet];
      }

      // Reduces the array of validators into a new array with objects
      // with a validation method to call, the value to validate against
      // and the specified error message, if any
      return _.reduce(attrValidationSet, function(memo, attrValidation) {
        _.each(_.without(_.keys(attrValidation), 'msg'), function(validator) {
          memo.push({
            fn: defaultValidators[validator],
            val: attrValidation[validator],
            msg: attrValidation.msg
          });
        });
        return memo;
      }, []);
    };

    // Validates an attribute against all validators defined
    // for that attribute. If one or more errors are found,
    // the first error message is returned.
    // If the attribute is valid, an empty string is returned.
    var validateAttr = function(model, attr, value, computed) {
      // Reduces the array of validators to an error message by
      // applying all the validators and returning the first error
      // message, if any.
      return _.reduce(getValidators(model, attr), function(memo, validator){
        // Pass the format functions plus the default
        // validators as the context to the validator
        var ctx = _.extend({}, formatFunctions, defaultValidators),
            result = validator.fn.call(ctx, value, attr, validator.val, model, computed);

        if(result === false || memo === false) {
          return false;
        }
        if (result && !memo) {
          return _.result(validator, 'msg') || result;
        }
        return memo;
      }, '');
    };

    // Loops through the model's attributes and validates the specified attrs.
    // Returns and object containing names of invalid attributes
    // as well as error messages.
    var validateModel = function(model, attrs, validatedAttrs) {
      var error,
          invalidAttrs = {},
          isValid = true,
          computed = _.clone(attrs);

      _.each(validatedAttrs, function(val, attr) {
        error = validateAttr(model, attr, val, computed);
        if (error) {
          invalidAttrs[attr] = error;
          isValid = false;
        }
      });

      return {
        invalidAttrs: invalidAttrs,
        isValid: isValid
      };
    };

    // Contains the methods that are mixed in on the model when binding
    var mixin = function(view, options) {
      return {

        // Check whether or not a value, or a hash of values
        // passes validation without updating the model
        preValidate: function(attr, value) {
          var self = this,
              result = {},
              error;

          if(_.isObject(attr)){
            _.each(attr, function(value, key) {
              error = self.preValidate(key, value);
              if(error){
                result[key] = error;
              }
            });

            return _.isEmpty(result) ? undefined : result;
          }
          else {
            return validateAttr(this, attr, value, _.extend({}, this.attributes));
          }
        },

        // Check to see if an attribute, an array of attributes or the
        // entire model is valid. Passing true will force a validation
        // of the model.
        isValid: function(option) {
          var flattened, attrs, error, invalidAttrs;

          option = option || getOptionsAttrs(options, view);

          if(_.isString(option)){
            attrs = [option];
          } else if(_.isArray(option)) {
            attrs = option;
          }
          if (attrs) {
            flattened = flatten(this.attributes);
            //Loop through all associated views
            _.each(this.associatedViews, function(view) {
              _.each(attrs, function (attr) {
                error = validateAttr(this, attr, flattened[attr], _.extend({}, this.attributes));
                if (error) {
                  options.invalid(view, attr, error, options.selector);
                  invalidAttrs = invalidAttrs || {};
                  invalidAttrs[attr] = error;
                } else {
                  options.valid(view, attr, options.selector);
                }
              }, this);
            }, this);
          }

          if(option === true) {
            invalidAttrs = this.validate();
          }
          if (invalidAttrs) {
            this.trigger('invalid', this, invalidAttrs, {validationError: invalidAttrs});
          }
          return attrs ? !invalidAttrs : this.validation ? this._isValid : true;
        },

        // This is called by Backbone when it needs to perform validation.
        // You can call it manually without any parameters to validate the
        // entire model.
        validate: function(attrs, setOptions){
          var model = this,
              validateAll = !attrs,
              opt = _.extend({}, options, setOptions),
              validatedAttrs = getValidatedAttrs(model, getOptionsAttrs(options, view)),
              allAttrs = _.extend({}, validatedAttrs, model.attributes, attrs),
              flattened = flatten(allAttrs),
              changedAttrs = attrs ? flatten(attrs) : flattened,
              result = validateModel(model, allAttrs, _.pick(flattened, _.keys(validatedAttrs)));

          model._isValid = result.isValid;

          //After validation is performed, loop through all associated views
          _.each(model.associatedViews, function(view){

            // After validation is performed, loop through all validated and changed attributes
            // and call the valid and invalid callbacks so the view is updated.
            _.each(validatedAttrs, function(val, attr){
                var invalid = result.invalidAttrs.hasOwnProperty(attr),
                  changed = changedAttrs.hasOwnProperty(attr);

                if(!invalid){
                  opt.valid(view, attr, opt.selector);
                }
                if(invalid && (changed || validateAll)){
                  opt.invalid(view, attr, result.invalidAttrs[attr], opt.selector);
                }
            });
          });

          // Trigger validated events.
          // Need to defer this so the model is actually updated before
          // the event is triggered.
          _.defer(function() {
            model.trigger('validated', model._isValid, model, result.invalidAttrs);
            model.trigger('validated:' + (model._isValid ? 'valid' : 'invalid'), model, result.invalidAttrs);
          });

          // Return any error messages to Backbone, unless the forceUpdate flag is set.
          // Then we do not return anything and fools Backbone to believe the validation was
          // a success. That way Backbone will update the model regardless.
          if (!opt.forceUpdate && _.intersection(_.keys(result.invalidAttrs), _.keys(changedAttrs)).length > 0) {
            return result.invalidAttrs;
          }
        }
      };
    };

    // Helper to mix in validation on a model. Stores the view in the associated views array.
    var bindModel = function(view, model, options) {
      if (model.associatedViews) {
        model.associatedViews.push(view);
      } else {
        model.associatedViews = [view];
      }
      _.extend(model, mixin(view, options));
    };

    // Removes view from associated views of the model or the methods
    // added to a model if no view or single view provided
    var unbindModel = function(model, view) {
      if (view && model.associatedViews.length > 1){
        model.associatedViews = _.without(model.associatedViews, view);
      } else {
        delete model.validate;
        delete model.preValidate;
        delete model.isValid;
        delete model.associatedViews;
      }
    };

    // Mix in validation on a model whenever a model is
    // added to a collection
    var collectionAdd = function(model) {
      bindModel(this.view, model, this.options);
    };

    // Remove validation from a model whenever a model is
    // removed from a collection
    var collectionRemove = function(model) {
      unbindModel(model);
    };

    // Returns the public methods on Backbone.Validation
    return {

      // Current version of the library
      version: '0.11.3',

      // Called to configure the default options
      configure: function(options) {
        _.extend(defaultOptions, options);
      },

      // Hooks up validation on a view with a model
      // or collection
      bind: function(view, options) {
        options = _.extend({}, defaultOptions, defaultCallbacks, options);

        var model = options.model || view.model,
            collection = options.collection || view.collection;

        if(typeof model === 'undefined' && typeof collection === 'undefined'){
          throw 'Before you execute the binding your view must have a model or a collection.\n' +
                'See http://thedersen.com/projects/backbone-validation/#using-form-model-validation for more information.';
        }

        if(model) {
          bindModel(view, model, options);
        }
        else if(collection) {
          collection.each(function(model){
            bindModel(view, model, options);
          });
          collection.bind('add', collectionAdd, {view: view, options: options});
          collection.bind('remove', collectionRemove);
        }
      },

      // Removes validation from a view with a model
      // or collection
      unbind: function(view, options) {
        options = _.extend({}, options);
        var model = options.model || view.model,
            collection = options.collection || view.collection;

        if(model) {
          unbindModel(model, view);
        }
        else if(collection) {
          collection.each(function(model){
            unbindModel(model, view);
          });
          collection.unbind('add', collectionAdd);
          collection.unbind('remove', collectionRemove);
        }
      },

      // Used to extend the Backbone.Model.prototype
      // with validation
      mixin: mixin(null, defaultOptions)
    };
  }());


  // Callbacks
  // ---------

  var defaultCallbacks = Validation.callbacks = {

    // Gets called when a previously invalid field in the
    // view becomes valid. Removes any error message.
    // Should be overridden with custom functionality.
    valid: function(view, attr, selector) {
      view.$('[' + selector + '~="' + attr + '"]')
          .removeClass('invalid')
          .removeAttr('data-error');
    },

    // Gets called when a field in the view becomes invalid.
    // Adds a error message.
    // Should be overridden with custom functionality.
    invalid: function(view, attr, error, selector) {
      view.$('[' + selector + '~="' + attr + '"]')
          .addClass('invalid')
          .attr('data-error', error);
    }
  };


  // Patterns
  // --------

  var defaultPatterns = Validation.patterns = {
    // Matches any digit(s) (i.e. 0-9)
    digits: /^\d+$/,

    // Matches any number (e.g. 100.000)
    number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,

    // Matches a valid email address (e.g. mail@example.com)
    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

    // Mathes any valid url (e.g. http://www.xample.com)
    url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
  };


  // Error messages
  // --------------

  // Error message for the build in validators.
  // {x} gets swapped out with arguments form the validator.
  var defaultMessages = Validation.messages = {
    required: '{0} is required',
    acceptance: '{0} must be accepted',
    min: '{0} must be greater than or equal to {1}',
    max: '{0} must be less than or equal to {1}',
    range: '{0} must be between {1} and {2}',
    length: '{0} must be {1} characters',
    minLength: '{0} must be at least {1} characters',
    maxLength: '{0} must be at most {1} characters',
    rangeLength: '{0} must be between {1} and {2} characters',
    oneOf: '{0} must be one of: {1}',
    equalTo: '{0} must be the same as {1}',
    digits: '{0} must only contain digits',
    number: '{0} must be a number',
    email: '{0} must be a valid email',
    url: '{0} must be a valid url',
    inlinePattern: '{0} is invalid'
  };

  // Label formatters
  // ----------------

  // Label formatters are used to convert the attribute name
  // to a more human friendly label when using the built in
  // error messages.
  // Configure which one to use with a call to
  //
  //     Backbone.Validation.configure({
  //       labelFormatter: 'label'
  //     });
  var defaultLabelFormatters = Validation.labelFormatters = {

    // Returns the attribute name with applying any formatting
    none: function(attrName) {
      return attrName;
    },

    // Converts attributeName or attribute_name to Attribute name
    sentenceCase: function(attrName) {
      return attrName.replace(/(?:^\w|[A-Z]|\b\w)/g, function(match, index) {
        return index === 0 ? match.toUpperCase() : ' ' + match.toLowerCase();
      }).replace(/_/g, ' ');
    },

    // Looks for a label configured on the model and returns it
    //
    //      var Model = Backbone.Model.extend({
    //        validation: {
    //          someAttribute: {
    //            required: true
    //          }
    //        },
    //
    //        labels: {
    //          someAttribute: 'Custom label'
    //        }
    //      });
    label: function(attrName, model) {
      return (model.labels && model.labels[attrName]) || defaultLabelFormatters.sentenceCase(attrName, model);
    }
  };

  // AttributeLoaders

  var defaultAttributeLoaders = Validation.attributeLoaders = {
    inputNames: function (view) {
      var attrs = [];
      if (view) {
        view.$('form [name]').each(function () {
          if (/^(?:input|select|textarea)$/i.test(this.nodeName) && this.name &&
            this.type !== 'submit' && attrs.indexOf(this.name) === -1) {
            attrs.push(this.name);
          }
        });
      }
      return attrs;
    }
  };


  // Built in validators
  // -------------------

  var defaultValidators = Validation.validators = (function(){
    // Use native trim when defined
    var trim = String.prototype.trim ?
      function(text) {
        return text === null ? '' : String.prototype.trim.call(text);
      } :
      function(text) {
        var trimLeft = /^\s+/,
            trimRight = /\s+$/;

        return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
      };

    // Determines whether or not a value is a number
    var isNumber = function(value){
      return _.isNumber(value) || (_.isString(value) && value.match(defaultPatterns.number));
    };

    // Determines whether or not a value is empty
    var hasValue = function(value) {
      return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && trim(value) === '') || (_.isArray(value) && _.isEmpty(value)));
    };

    return {
      // Function validator
      // Lets you implement a custom function used for validation
      fn: function(value, attr, fn, model, computed) {
        if(_.isString(fn)){
          fn = model[fn];
        }
        return fn.call(model, value, attr, computed);
      },

      // Required validator
      // Validates if the attribute is required or not
      // This can be specified as either a boolean value or a function that returns a boolean value
      required: function(value, attr, required, model, computed) {
        var isRequired = _.isFunction(required) ? required.call(model, value, attr, computed) : required;
        if(!isRequired && !hasValue(value)) {
          return false; // overrides all other validators
        }
        if (isRequired && !hasValue(value)) {
          return this.format(defaultMessages.required, this.formatLabel(attr, model));
        }
      },

      // Acceptance validator
      // Validates that something has to be accepted, e.g. terms of use
      // `true` or 'true' are valid
      acceptance: function(value, attr, accept, model) {
        if(value !== 'true' && (!_.isBoolean(value) || value === false)) {
          return this.format(defaultMessages.acceptance, this.formatLabel(attr, model));
        }
      },

      // Min validator
      // Validates that the value has to be a number and equal to or greater than
      // the min value specified
      min: function(value, attr, minValue, model) {
        if (!isNumber(value) || value < minValue) {
          return this.format(defaultMessages.min, this.formatLabel(attr, model), minValue);
        }
      },

      // Max validator
      // Validates that the value has to be a number and equal to or less than
      // the max value specified
      max: function(value, attr, maxValue, model) {
        if (!isNumber(value) || value > maxValue) {
          return this.format(defaultMessages.max, this.formatLabel(attr, model), maxValue);
        }
      },

      // Range validator
      // Validates that the value has to be a number and equal to or between
      // the two numbers specified
      range: function(value, attr, range, model) {
        if(!isNumber(value) || value < range[0] || value > range[1]) {
          return this.format(defaultMessages.range, this.formatLabel(attr, model), range[0], range[1]);
        }
      },

      // Length validator
      // Validates that the value has to be a string with length equal to
      // the length value specified
      length: function(value, attr, length, model) {
        if (!_.isString(value) || value.length !== length) {
          return this.format(defaultMessages.length, this.formatLabel(attr, model), length);
        }
      },

      // Min length validator
      // Validates that the value has to be a string with length equal to or greater than
      // the min length value specified
      minLength: function(value, attr, minLength, model) {
        if (!_.isString(value) || value.length < minLength) {
          return this.format(defaultMessages.minLength, this.formatLabel(attr, model), minLength);
        }
      },

      // Max length validator
      // Validates that the value has to be a string with length equal to or less than
      // the max length value specified
      maxLength: function(value, attr, maxLength, model) {
        if (!_.isString(value) || value.length > maxLength) {
          return this.format(defaultMessages.maxLength, this.formatLabel(attr, model), maxLength);
        }
      },

      // Range length validator
      // Validates that the value has to be a string and equal to or between
      // the two numbers specified
      rangeLength: function(value, attr, range, model) {
        if (!_.isString(value) || value.length < range[0] || value.length > range[1]) {
          return this.format(defaultMessages.rangeLength, this.formatLabel(attr, model), range[0], range[1]);
        }
      },

      // One of validator
      // Validates that the value has to be equal to one of the elements in
      // the specified array. Case sensitive matching
      oneOf: function(value, attr, values, model) {
        if(!_.include(values, value)){
          return this.format(defaultMessages.oneOf, this.formatLabel(attr, model), values.join(', '));
        }
      },

      // Equal to validator
      // Validates that the value has to be equal to the value of the attribute
      // with the name specified
      equalTo: function(value, attr, equalTo, model, computed) {
        if(value !== computed[equalTo]) {
          return this.format(defaultMessages.equalTo, this.formatLabel(attr, model), this.formatLabel(equalTo, model));
        }
      },

      // Pattern validator
      // Validates that the value has to match the pattern specified.
      // Can be a regular expression or the name of one of the built in patterns
      pattern: function(value, attr, pattern, model) {
        if (!hasValue(value) || !value.toString().match(defaultPatterns[pattern] || pattern)) {
          return this.format(defaultMessages[pattern] || defaultMessages.inlinePattern, this.formatLabel(attr, model), pattern);
        }
      }
    };
  }());

  // Set the correct context for all validators
  // when used from within a method validator
  _.each(defaultValidators, function(validator, key){
    defaultValidators[key] = _.bind(defaultValidators[key], _.extend({}, formatFunctions, defaultValidators));
  });

  return Validation;
}(_));
Backbone.form = {};
Backbone.form.mixin = {};
Backbone.form.Validation = Backbone.Validation;
if (typeof exports === 'object') {
    module.exports = Backbone.form;
} else if (typeof define === 'function' && define.amd) {
    define('backbone.form', ['backbone'], function () {
        return Backbone.form;
    });
    Backbone.form.amd = define.amd;
    define.amd = false;
}
/*!
 * deep-diff.
 * Licensed under the MIT License.
 */
(function(e,t){"use strict";if(typeof define==="function"&&define.amd){define([],t)}else if(typeof exports==="object"){module.exports=t()}else{e.DeepDiff=t()}})(this,function(e){"use strict";var t,n,a=[];if(typeof global==="object"&&global){t=global}else if(typeof window!=="undefined"){t=window}else{t={}}n=t.DeepDiff;if(n){a.push(function(){if("undefined"!==typeof n&&t.DeepDiff===p){t.DeepDiff=n;n=e}})}function r(e,t){e.super_=t;e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:false,writable:true,configurable:true}})}function i(e,t){Object.defineProperty(this,"kind",{value:e,enumerable:true});if(t&&t.length){Object.defineProperty(this,"path",{value:t,enumerable:true})}}function f(e,t,n){f.super_.call(this,"E",e);Object.defineProperty(this,"lhs",{value:t,enumerable:true});Object.defineProperty(this,"rhs",{value:n,enumerable:true})}r(f,i);function u(e,t){u.super_.call(this,"N",e);Object.defineProperty(this,"rhs",{value:t,enumerable:true})}r(u,i);function l(e,t){l.super_.call(this,"D",e);Object.defineProperty(this,"lhs",{value:t,enumerable:true})}r(l,i);function s(e,t,n){s.super_.call(this,"A",e);Object.defineProperty(this,"index",{value:t,enumerable:true});Object.defineProperty(this,"item",{value:n,enumerable:true})}r(s,i);function h(e,t,n){var a=e.slice((n||t)+1||e.length);e.length=t<0?e.length+t:t;e.push.apply(e,a);return e}function c(e){var t=typeof e;if(t!=="object"){return t}if(e===Math){return"math"}else if(e===null){return"null"}else if(Array.isArray(e)){return"array"}else if(e instanceof Date){return"date"}else if(/^\/.*\//.test(e.toString())){return"regexp"}return"object"}function o(t,n,a,r,i,p,b){i=i||[];var d=i.slice(0);if(typeof p!=="undefined"){if(r&&r(d,p,{lhs:t,rhs:n})){return}d.push(p)}var v=typeof t;var y=typeof n;if(v==="undefined"){if(y!=="undefined"){a(new u(d,n))}}else if(y==="undefined"){a(new l(d,t))}else if(c(t)!==c(n)){a(new f(d,t,n))}else if(t instanceof Date&&n instanceof Date&&t-n!==0){a(new f(d,t,n))}else if(v==="object"&&t!==null&&n!==null){b=b||[];if(b.indexOf(t)<0){b.push(t);if(Array.isArray(t)){var k,m=t.length;for(k=0;k<t.length;k++){if(k>=n.length){a(new s(d,k,new l(e,t[k])))}else{o(t[k],n[k],a,r,d,k,b)}}while(k<n.length){a(new s(d,k,new u(e,n[k++])))}}else{var g=Object.keys(t);var w=Object.keys(n);g.forEach(function(i,f){var u=w.indexOf(i);if(u>=0){o(t[i],n[i],a,r,d,i,b);w=h(w,u)}else{o(t[i],e,a,r,d,i,b)}});w.forEach(function(t){o(e,n[t],a,r,d,t,b)})}b.length=b.length-1}}else if(t!==n){if(!(v==="number"&&isNaN(t)&&isNaN(n))){a(new f(d,t,n))}}}function p(t,n,a,r){r=r||[];o(t,n,function(e){if(e){r.push(e)}},a);return r.length?r:e}function b(e,t,n){if(n.path&&n.path.length){var a=e[t],r,i=n.path.length-1;for(r=0;r<i;r++){a=a[n.path[r]]}switch(n.kind){case"A":b(a[n.path[r]],n.index,n.item);break;case"D":delete a[n.path[r]];break;case"E":case"N":a[n.path[r]]=n.rhs;break}}else{switch(n.kind){case"A":b(e[t],n.index,n.item);break;case"D":e=h(e,t);break;case"E":case"N":e[t]=n.rhs;break}}return e}function d(e,t,n){if(e&&t&&n&&n.kind){var a=e,r=-1,i=n.path?n.path.length-1:0;while(++r<i){if(typeof a[n.path[r]]==="undefined"){a[n.path[r]]=typeof n.path[r]==="number"?[]:{}}a=a[n.path[r]]}switch(n.kind){case"A":b(n.path?a[n.path[r]]:a,n.index,n.item);break;case"D":delete a[n.path[r]];break;case"E":case"N":a[n.path[r]]=n.rhs;break}}}function v(e,t,n){if(n.path&&n.path.length){var a=e[t],r,i=n.path.length-1;for(r=0;r<i;r++){a=a[n.path[r]]}switch(n.kind){case"A":v(a[n.path[r]],n.index,n.item);break;case"D":a[n.path[r]]=n.lhs;break;case"E":a[n.path[r]]=n.lhs;break;case"N":delete a[n.path[r]];break}}else{switch(n.kind){case"A":v(e[t],n.index,n.item);break;case"D":e[t]=n.lhs;break;case"E":e[t]=n.lhs;break;case"N":e=h(e,t);break}}return e}function y(e,t,n){if(e&&t&&n&&n.kind){var a=e,r,i;i=n.path.length-1;for(r=0;r<i;r++){if(typeof a[n.path[r]]==="undefined"){a[n.path[r]]={}}a=a[n.path[r]]}switch(n.kind){case"A":v(a[n.path[r]],n.index,n.item);break;case"D":a[n.path[r]]=n.lhs;break;case"E":a[n.path[r]]=n.lhs;break;case"N":delete a[n.path[r]];break}}}function k(e,t,n){if(e&&t){var a=function(a){if(!n||n(e,t,a)){d(e,t,a)}};o(e,t,a)}}Object.defineProperties(p,{diff:{value:p,enumerable:true},observableDiff:{value:o,enumerable:true},applyDiff:{value:k,enumerable:true},applyChange:{value:d,enumerable:true},revertChange:{value:y,enumerable:true},isConflict:{value:function(){return"undefined"!==typeof n},enumerable:true},noConflict:{value:function(){if(a){a.forEach(function(e){e()});a=null}return p},enumerable:true}});return p});
if (typeof define === 'function') {
    define.amd = Backbone.form.amd;
}
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
                    useShadow: false,
                    classFormError: 'form-control-feedback',
                    classInputError: 'form-control-danger',
                    classFormGroupError: 'has-danger'
                };
                break;
        }

        defaults[name] = _.defaults(options || {}, values);
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
     *
     * @returns {Object}
     */
    FormHelper.prototype.getControlInfo = function (name) {
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
    };

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
        info = info || this.getControlInfo(name);
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
        var info = this.getControlInfo(name), type = info.getType();

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

        info = this.getControlInfo(name);
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

/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.FormModel = Backbone.Model.extend({
        pathPrefix: null,
        initialize: function () {
            Backbone.Model.prototype.initialize.apply(this, arguments);
            this.formData = {};
        },
        /**
         * Get attribute by string path eg. "foo.bar".
         *
         * @param {String} path dot separated.
         * @param {*} [def] default value (if result undefined).
         *
         * @returns {*}
         */
        value: function (path, def) {
            return this._path(this.attributes, this._pathWithPrefix(path), def || null);
        },
        /**
         * Get attribute from first key in array/object.
         *
         * @param {String} path dot separated.
         * @param {*} [def] default value (if result undefined).
         *
         * @returns {*}
         */
        firstValue: function (path, def) {
            var firstLevel = _.isString(this.pathPrefix) && this.pathPrefix.length
                ? this._path(this.attributes, this.pathPrefix, def || null)
                : this.attributes;

            return this._firstKeyPath(firstLevel, path, def || null);
        },
        /**
         * Get form control by path.
         *
         * @param {String} path dot separated.
         *
         * @returns {jQuery}
         */
        input: function (path) {
            var data = this._path(this.formData, this._pathWithPrefix(path), null), input = null;

            if (_.isFunction(data)) {
                input = data('control');
            }

            return _.isObject(input) ? input : $('<input />');
        },
        /**
         * Get form control from first key in array/object.
         *
         * @param {String} path dot separated.
         *
         * @returns {jQuery}
         */
        firstInput: function (path) {
            var firstLevel = _.isString(this.pathPrefix) && this.pathPrefix.length
                ? this._path(this.formData, this.pathPrefix, null)
                : this.formData;

            var input = null, data = this._firstKeyPath(firstLevel, path, null);

            if (_.isFunction(data)) {
                input = data('control');
            }

            return _.isObject(input) ? input : $('<input />');
        },
        /**
         * @param {String} key
         * @return {*}
         */
        getData: function (key) {
            return this.formData[key];
        },
        /**
         * @param {String} key
         * @param {*} value
         */
        setData: function (key, value) {
            this.formData[key] = value;
        },
        /**
         * @param {String} key
         */
        unsetData: function (key) {
            if (this.hasData(key)) {
                delete this.formData[key];
            }
        },
        /**
         * @param {String} key
         * @return {boolean}
         */
        hasData: function (key) {
            return !_.isUndefined(this.formData[key]);
        },
        /**
         * @return {boolean}
         */
        hasShadow: function () {
            return this.shadow instanceof Backbone.Model;
        },
        /**
         * @return {Backbone.Model|null}
         */
        getShadow: function () {
            var shadow = null;

            if (this.hasShadow()) {
                shadow = this.shadow;
            }

            return shadow;
        },
        /**
         * Retrieve nested item from object/array.
         *
         * @param {Object|Array} obj
         * @param {String} path dot separated
         * @param {*} def default value ( if result undefined )
         *
         * @returns {*}
         *
         * @private
         */
        _path: function (obj, path, def){
            var i, len;

            path = path.split('.');
            len = path.length;
            for (i = 0; i < len; i++) {
                if (!obj || typeof obj !== 'object') {
                    return def;
                }
                obj = obj[path[i]];
            }

            if (_.isUndefined(obj)) {
                return def;
            }

            return obj;
        },
        /**
         * @param {String} path
         *
         * @returns {String}
         *
         * @private
         */
        _pathWithPrefix: function (path) {
            var value = null;

            if (!_.isString(path)) {
                throw new TypeError('Path is not string.');
            }

            if (_.isString(this.pathPrefix) && this.pathPrefix.length) {
                value = this.pathPrefix + '.' + path;
            } else {
                value = path;
            }

            return value;
        },
        /**
         * Get first element from array/object.
         *
         * @param {Object} obj
         *
         * @return {*}
         *
         * @private
         */
        _firstKey: function (obj) {
            var values, first = null;

            if (_.isArray(obj)) {
                if (obj.length) {
                    first = _.first(obj);
                }
            } else if (_.isObject(obj)) {
                values = _.values(obj);
                first = values.length ? values[0] : null;
            }

            return first;
        },
        /**
         * Mix functions _firstKey and _path.
         *
         * @param {Object} obj
         * @param {String} path
         * @param {*} def
         * @return {*}
         *
         * @private
         */
        _firstKeyPath: function (obj, path, def) {
            var value = null, data = this._firstKey(obj);

            if (_.isObject(data)) {
                value = this._path(data, path, def);
            }

            return value;
        }
    });
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
     * @param {Backbone.form.FormModel} model
     * @param {String} key
     * @param value
     * @param oldValue
     */
    function setModelData (model, key, value, oldValue) {
        if (_.isNull(value)) {
            model.unsetData(key);
        } else if (_.isObject(oldValue) && !_.isArray(oldValue) && _.isObject(value) && !_.isArray(value)) {
            model.setData(key, mergeObject($.extend(true, {}, oldValue), value));
        } else if (_.isUndefined(oldValue) && _.isObject(value) && !_.isArray(value)) {
            model.setData(key, mergeObject({}, value));
        } else {
            model.setData(key, value);
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
            info = this.formHelper.getControlInfo(name),
            controls = info.getControls(),
            control = info.getControl();

        if (keys.length > 1) {
            throw new this.WildcardValueError('Control "' + name + '" has ' + keys.length + ' values');
        }

        if (this.model.hasShadow()) {
            this.model.getShadow().set(name, this.formHelper.getControlValue(name, info));
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

                    setModelData(this.model, key, valueMore[key], this.model.getData(key));
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
     * @return {Backbone.form.FormModel}
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
                if (this.model.hasShadow()) {
                    this.model.getShadow().set(name, current);
                }
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

            var values = _.defaults(options, Backbone.form.getDefaults('collectionItemView'));

            this.bindingOptions = values.bindingOptions;
            this.htmlAttr = values.htmlAttr;
            this.isValidAttr = values.isValidAttr;
            this.messageAttr = values.messageAttr;
            this.currentState = null;
            this.name = options.name;
            this.removeConfirmation = values.removeConfirmation;
            this.validationOptions = values.validationOptions;
            this._templateRequest = true;
            this._compiledTemplate = null;
            this._backup = null;
            this._serverIsValid = true;
            this._serverMessage = null;

            this._initFormModel(options.formModel);
            this.setPlaceholder(values.placeholder);
            this.setTemplate(options.template);

            if (options.editClick === true) {
                this.$el.on('click', '.form-collection__item_preview', $.proxy(this._onSwitchToForm, this));
            }

            if (options.editDblClick === true) {
                this.$el.on('dblclick', '.form-collection__item_preview', $.proxy(this._onSwitchToForm, this));
            }

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
                form: this.formModel,
                el: this.$el
            };
        },
        renderAll: function () {
            this._renderTemplate();
            this.changeState(this.formModel.isNew() ? 'form' : 'preview');
        },
        renderPreview: function () {
            var preview = this.getPreviewElement(), template, fresh;

            if (preview.length) {
                template = this._renderTemplate($('<div />'));
                fresh = this.getPreviewElement(template);
                fresh.attr('class', preview.attr('class'));
                preview.replaceWith(fresh);
            }
        },
        /**
         * "Virtual" method. It's call after fully render.
         */
        onRender: function () {},
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
         * @return {Backbone.form.ValidationView}
         */
        getValidation: function () {
            return this.validation;
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
            return this.$el.find('.form-collection__item_form:eq(0)');
        },
        /**
         * @param {jQuery} [el]
         *
         * @returns {jQuery}
         */
        getPreviewElement: function (el) {
            return (el || this.$el).find('.form-collection__item_preview:eq(0)');
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
         * @return {String|null}
         */
        getCurrentState: function () {
            return this.currentState;
        },
        /**
         * Load html to this.$el from model html attribute. After load html attribute will be unset.
         */
        loadHtml: function () {
            var html, view = this;
            if (this.formModel.has(this.htmlAttr)) {
                html = this.formModel.get(this.htmlAttr);

                if (!_.isString(html)) {
                    throw new TypeError('Html data is not string!');
                }

                this.$el.html(html);
                this.formModel.unset(this.htmlAttr);
                setTimeout(function () {
                    view.validation._initialErrors();
                }, 100);
                this.onRender();
            }
        },
        doBackup: function () {
            this._backup = this.formModel.toJSON();
        },
        restoreBackup: function () {
            if (!_.isNull(this._backup)) {
                this.formModel.clear();
                this.formModel.set(this._backup);
            }
        },
        /**
         * Absolutely destroy model.
         */
        triggerRemove: function () {
            var view = this;
            this.disabled(true);
            function reset () {
                view.disabled(false);
            }

            this.formModel.destroy({
                success: function () {
                    reset();
                    view.trigger('item:remove', view);
                },
                error: reset
            });
        },
        /**
         * Save model.
         */
        triggerSave: function () {
            var view = this;

            this.disabled(true);
            this._serverIsValid = false;
            this._serverMessage = null;

            function reset () {
                view.disabled(false);
            }

            this.$el.find(':input').data('ready-to-validation', true);

            if (this.validation.getValidationModel().isValid(true)) {
                this.formModel.save({}, {
                    success: function (model, response) {
                        if (_.isBoolean(response[view.isValidAttr])) {
                            view._serverIsValid = response[view.isValidAttr];
                            if (!_.isUndefined(response[view.messageAttr])) {
                                view._serverMessage = response[view.messageAttr];
                            }
                        } else {
                            view._serverIsValid = true;
                        }

                        if (view._serverIsValid) {
                            view.doBackup();
                        }

                        reset();
                        view.changeState(view._serverIsValid ? 'preview' : 'form');

                        view.trigger('server:validation', view._serverIsValid, response, view);

                        if (!view._serverIsValid && view._serverMessage) {
                            view.trigger('server:invalid:message', view._serverMessage, response, view);
                        }

                        view.trigger('item:save', view);
                    },
                    error: reset
                });
            } else {
                reset();
                setTimeout(function () {
                    view.validation.getFirstErrorInput().focus();
                }, 50);
            }
        },
        /**
         * Open edit view.
         */
        triggerEdit: function () {
            this.doBackup();
            this.changeState('form');
            this.trigger('item:edit', this);
        },
        /**
         * Cancel edit.
         */
        triggerCancel: function () {
            this.restoreBackup();
            this.renderAll();
            this.bindModelToForm();
            this.changeState('preview');
            this.onRender();
            this.trigger('item:cancel', this);
        },
        bindModelToForm: function () {
            this.getBinding().getModelToForm().bind();
        },
        bindFormToModel: function () {
            this.getBinding().getFormToModel().bind();
        },
        /**
         * @param {jQuery} [el]
         *
         * @returns {jQuery}
         */
        _renderTemplate: function (el) {
            var html = $('<div />');
            el = el || this.$el;
            html.html(this.getTemplate()(this.renderParams()));
            el.empty().append(html.children());
            return el;
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
            this.validation = new Backbone.form.ValidationView(_.defaults({
                el: this.$el,
                model: this.formModel,
                autoBinding: false,
                bindingOptions: this.bindingOptions
            }, this.validationOptions));
            this.twoWayBinding = this.validation.getBinding();
            this.formToModel = this.twoWayBinding.getFormToModel();
            this.formToModel.setFileModel(new Backbone.Model());
            this.twoWayBinding.auto(true);
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickRemove: function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (_.isFunction(this.removeConfirmation)) {
                this.removeConfirmation(this, this.formModel);
            } else {
                this.triggerRemove();
            }
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickSave: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.triggerSave();
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickEdit: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.triggerEdit();
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickCancel: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.triggerCancel();
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

            this.formModel.unset(this.isValidAttr);
            this.formModel.unset(this.messageAttr);
        },
        /**
         * @private
         */
        _onSwitchToForm: function () {
            this.changeState('form');
            this.trigger('item:swich_to_form', this);
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

            if (options.itemView) {
                this.itemView = options.itemView;
            } else {
                this.itemView = Backbone.form.CollectionItemView;
            }

            var values = _.defaults(options, Backbone.form.getDefaults('collectionView'));

            this.items = [];
            this.index = 0;
            this.itemTagName = values.itemTagName;
            this.itemClass = values.itemClass;
            this.htmlAttr = values.htmlAttr;
            this.isValidAttr = values.isValidAttr;
            this.messageAttr = values.messageAttr;
            this.closeAlert = values.closeAlert;
            this.removeConfirmation = values.removeConfirmation;
            this._onRuquestError = options.onRuquestError;
            this.setElContainer(options.elContainer);
            this.newElementPlace = values.newElementPlace;
            this.prototypeAttr = values.prototypeAttr;
            this.autofocus = values.autofocus;
            this.editClick = values.editClick;
            this.editDblClick = values.editDblClick;
            this.bindingOptions = values.bindingOptions;
            this.itemPlaceholder = values.itemPlaceholder;
            this.validationOptions = values.validationOptions;

            if (options.itemTemplate) {
                this.setItemTemplate(options.itemTemplate);
            } else if (this.$el.get(0).hasAttribute(this.prototypeAttr)) {
                this.setItemTemplate(this.$el.attr(this.prototypeAttr));
            } else {
                throw new Error('CollectionView: Please set itemTemplate.');
            }

            this._initFormCollection(options.formCollection);
            this._initFromElement();

            this.$el.on('click', '.form-collection__btn-add', $.proxy(this._onClickAdd, this));
            this.$el.on('click', '.form-collection__btn-save-all', $.proxy(this._onClickSaveAll, this));
            this.$el.on('click', '.form-collection__btn-remove-all', $.proxy(this._onClickRemoveAll, this));
            this.listenTo(this.formCollection, 'sync', this._onFormCollectionSync);
            this.listenTo(this.formCollection, 'error', this._onRuquestError);
            this._initBeforeUnload();
            this.disabled(false);
        },
        /**
         * Remove all items.
         */
        clear: function () {
            this.items.forEach(function (item) {
                item.destroyView(true);
            });

            this.items = [];
            this.index = 0;
            this.trigger('items:clear', this);
        },
        /**
         * @param {String} [modelKey]
         * @param {jQuery} [el]
         *
         * @return {Backbone.form.CollectionItemView}
         */
        addItem: function (modelKey, el) {
            var view, viewOptions, model = new this.formCollection.model();

            if (modelKey) {
                model.set(model.idAttribute, modelKey);
            }

            this.formCollection.add(model);
            this._addModelListeners(model);

            viewOptions = this._itemViewCommonOptions(model);

            if (el) {
                viewOptions.el = el;
                view = this._newItemView(viewOptions);
                view.disabled(false);
                view.bindFormToModel();
            } else {
                view = this._newItemView(viewOptions);
                view.renderAll();
                view.disabled(false);
                view.bindFormToModel();
                this._attachView(view);
            }

            this._initItemView(view);
            view.onRender();

            return view;
        },
        /**
         * @param {Backbone.Model} model
         *
         * @return {Backbone.form.CollectionItemView}
         */
        addItemWithModel: function (model) {
            var view;

            this._addModelListeners(model);

            view = this._newItemView(this._itemViewCommonOptions(model));

            if (model.has(this.htmlAttr)) {
                view.loadHtml();
            } else {
                view.renderAll();
                view.disabled(false);
                view.bindModelToForm();
            }

            this._attachView(view);
            this._initItemView(view);
            view.onRender();

            return view;
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
         * Add fresh item.
         */
        triggerAdd: function () {
            var view = this.addItem();
            this.trigger('items:add', view, this);
        },
        /**
         * Save all models.
         */
        triggerSave: function () {
            var view = this;

            this.disabled(true);
            function reset () {
                view.disabled(false);
            }

            this.items.forEach(function (item) {
                item.changeState('preview');
            });

            if (_.isFunction(this.formCollection.save)) {
                this.formCollection.save({
                    success: function () {
                        reset();
                        view.trigger('items:save_all', view);
                    },
                    error: reset
                });
            } else {
                reset();
                this.trigger('items:error:save_all', this);
            }
        },
        /**
         * Destroy all models.
         */
        triggerRemove: function () {
            var view = this;

            this.clear();

            if (_.isFunction(this.formCollection.destroy)) {
                this.formCollection.destroy({
                    success: function () {
                        view.trigger('items:remove_all', view);
                    }
                });
            } else {
                this.formCollection.reset();
                this.formCollection.trigger('update', this.formCollection, this.options);
                this.trigger('items:error:remove_all', this);
            }
        },
        /**
         * @param {Object} options
         *
         * @returns {Backbone.form.CollectionItemView}
         *
         * @private
         */
        _newItemView: function (options) {
            var view = new this.itemView(options);

            if (!(view instanceof Backbone.form.CollectionItemView)) {
                throw new TypeError('CollectionView: Item is not instanceof Backbone.form.CollectionItemView.');
            }

            return view;
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

            view.on('server:validation', function (valid, response, view) {
                that.trigger('server:validation', valid, response, view);
            });

            view.on('server:invalid:message', function (message, response, view) {
                that.trigger('server:invalid:message', message, response, view);
            });
        },
        /**
         * @param {Backbone.Model} formModel
         * @returns {Object}
         * @private
         */
        _itemViewCommonOptions: function (formModel) {
            var $el = $('<' + this.itemTagName + ' />').addClass('form-collection__item');

            if (_.isString(this.itemClass)) {
                $el.addClass(this.itemClass);
            }

            return {
                el: $el,
                template: this.itemTemplate,
                name: String(this.index),
                formModel: formModel,
                htmlAttr: this.htmlAttr,
                isValidAttr: this.isValidAttr,
                messageAttr: this.messageAttr,
                editClick: this.editClick,
                editDblClick: this.editDblClick,
                bindingOptions: this.bindingOptions,
                removeConfirmation: this.removeConfirmation,
                placeholder: this.itemPlaceholder,
                validationOptions: this.validationOptions
            };
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
                    if (this.newElementPlace[0] === '.') {
                        view.getElement().insertAfter(this.elContainer.find(this.newElementPlace).eq(0));
                    } else {
                        view.getElement().appendTo(this.elContainer);
                    }
            }

            if (this.autofocus) {
                view.getElement().find(':input:not(button)').eq(0).focus();
            }
        },
        /**
         * @param {Backbone.form.CollectionItemView} view
         * @private
         */
        _initItemView: function (view) {
            view.doBackup();
            this._addViewListeners(view);
            this.items.push(view);
            ++this.index;
            this.trigger('items:init', view, this);
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickAdd: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.triggerAdd();
        },
        /**
         * @private
         */
        _onFormCollectionSync: function (collection) {
            var view = this;

            if (collection instanceof Backbone.Collection) {
                this.clear();
                this.formCollection.models.forEach(function (model) {
                    view.addItemWithModel(model);
                });
            }
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickSaveAll: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.triggerSave();
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickRemoveAll: function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (_.isFunction(this.removeConfirmation)) {
                this.removeConfirmation(this, this.formModel);
            } else {
                this.triggerRemove();
            }
        },
        /**
         * @private
         */
        _initBeforeUnload: function () {
            var view = this,
                closeAlert = this.closeAlert;

            if (_.isFunction(closeAlert)) {
                window.addEventListener('beforeunload', function (e) {
                    var confirmationMessage, confirm;

                    confirm = _.find(view.getItems(), function (item){
                        return item.getCurrentState() === 'form';
                    });

                    if (!_.isUndefined(confirm)) {
                        confirmationMessage = closeAlert();

                        (e || window.event).returnValue = confirmationMessage;
                        return confirmationMessage;
                    }
                });
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

Backbone.form.setDefaults('formToModel');
Backbone.form.setDefaults('modelToForm');
Backbone.form.setDefaults('collectionView');
Backbone.form.setDefaults('collectionItemView');
Backbone.form.setDefaults('validationView');