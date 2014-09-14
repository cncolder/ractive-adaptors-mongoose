/*

  ractive-adaptors-mongoose
  ==========================================

  Version 0.1.0

  ==========================

  Troubleshooting: If you're using a module system in your app (AMD or
  something more nodey) then you may need to change the paths below,
  where it says `require( 'ractive' )` or `define([ 'ractive' ]...)`.

  ==========================

  Usage: Include this file on your page below Ractive, e.g:

      <script src='lib/ractive.js'></script>
      <script src='lib/ractive-adaptors-mongoose.js'></script>

  Or, if you're using a module loader, require this module:

      // requiring the plugin will 'activate' it - no need to use
      // the return value
      require( 'ractive-adaptors-mongoose' );

*/

(function(global, factory) {

  'use strict';

  // AMD environment
  if (typeof define === 'function' && define.amd) {
    define(['ractive', 'mongoose'], factory);
  }

  // Common JS (i.e. node/browserify)
  else if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
    factory(require('ractive'), require('mongoose'));
  }

  // browser global
  else if (global.Ractive) {
    factory(global.Ractive, global.mongoose);
  } else {
    throw new Error('Could not find Ractive or mongoose! It must be loaded before the ractive-adaptors-mongoose plugin');
  }

}(typeof window !== 'undefined' ? window : this, function(Ractive, mongoose) {

  'use strict';

  Ractive.adaptors.mongoose = {
    filter: function(object) {
      return object instanceof mongoose.Document;
    },

    wrap: function(ractive, doc, keypath, prefix) {
      doc.on('validate', this.validateHandler = function(doc) {
        ractive.set(prefix({
          errors: doc.errors
        }));
      });

      doc.post('set', function(next, property, value) {
        if (this.settle && this.settle[property]) {
          delete this.settle[property];
        } else {
          var obj = {};
          obj[property] = value;
          ractive.set(prefix(obj));
        }
        next();
      });

      return {
        teardown: function() {
          this.value.removeListener('validate', this.validateHandler);
          // TODO remove post set hooks.
        },

        get: function() {
          return this.value;
        },

        set: function(property, value) {
          // mongoose cast value. so !=
          if (this.value[property] != value) {
            this.settle = this.settle || {};
            this.settle[property] = value;
            // if schema setter change other field. this may raise another set.
            this.value[property] = value;
          }
        },

        reset: function(data) {
          debug('reset', data);
          if (typeof data !== 'object' || data instanceof mongoose.Document) {
            return false;
          }

          this.value.set(data);
          this.value.$__reset();
          // TODO maybe ractive will set value and make doc dirty again.
        }
      };
    }
  };

}));
