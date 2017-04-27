# Ractive.js ractive-adaptors-mongoose adaptor plugin

[![Greenkeeper badge](https://badges.greenkeeper.io/cncolder/ractive-adaptors-mongoose.svg)](https://greenkeeper.io/)

*Find more Ractive.js plugins at [docs.ractivejs.org/latest/plugins](http://docs.ractivejs.org/latest/plugins)*

[See the demo here.](http://cncolder.github.io/ractive-adaptors-mongoose)

## Usage

Include this file on your page below Ractive, e.g:

```html
<script src='lib/ractive.js'></script>
<script src='lib/ractive-adaptors-mongoose.js'></script>
```

Or, if you're using a module loader, require this module:

```js
// requiring the plugin will 'activate' it - no need to use the return value
require( 'ractive-adaptors-mongoose' );
```

## I Am Very Young now

Mongoose 3.9.2+ allow us bundle it by browserify. This make us a new way to share model between server/client side.

This plugin is very young. Mongoose 3.9.x is unstable version. Just play it. Don't use for production.

## TODO

1. Handle virtual change when virtual path dependencies path changes.
2. Prevent dead loop when the setter(schema path level) modify value.
3. Clear errors after validate success. This issue depend on when mongoose would fix it.

## License

Copyright (c) 2014 colder. Licensed MIT

Created with the [Ractive.js plugin template](https://github.com/ractivejs/plugin-template) for Grunt.
