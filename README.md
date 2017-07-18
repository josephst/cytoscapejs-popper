cytoscape-popperjs
================================================================================

![screenshot](https://cdn.rawgit.com/josephst/cytoscapejs-popper/master/screenshot.png)


## Description

Display popups on graph elements using [Popper.js](https://github.com/FezVrasta/popper.js/), a positioning library by Federico Zivolo and contributors.


## Dependencies

 * Cytoscape.js ^3.0.0
 * Popper.js ^1.9.0


## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-popperjs`,
 * via bower: `bower install cytoscape-popperjs`, or
 * via direct download in the repository (probably from a tag).

`require()` the library as appropriate for your project:

CommonJS:
```js
var cytoscape = require('cytoscape');
var popperjs = require('cytoscape-popperjs');

popperjs( cytoscape ); // register extension
```

AMD:
```js
require(['cytoscape', 'cytoscape-popperjs'], function( cytoscape, popperjs ){
  popperjs( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.
Make sure to use the UMD version of Popper.js if using with plain HTML/JS.


## API
This extension may be used on both graph elements:

`eles.popper({ /* options */ })`

and on the core:

`cy.popper({ /* options */ })`

As a thin wrapper around Popper.js, all [Popper.js options](https://popper.js.org/popper-documentation.html) are supported within the `popper` key in `options`.

After its creation, the Popper can be retrieved via `cy.scratch('popper')` (if registered on the core) or `ele.scratch('popper')` (if registered on an element).

This extension **will not** automatically update the position of the Popper(s) as the graph is panned and zoomed.
If this is desired, add an [event listener](http://js.cytoscape.org/#events) for panning and zooming and in the body of the event callback, get the Popper with `var popper = cy.scratch('popper')` or `var popper = ele.scratch('popper')` and call `popper.scheduleUpdate()`.

## Examples

Core:

```js
cy.popperjs({
  target: 'htmlElementId', // the ID of an HTML element to use as the popper; or,
  // a function which takes `cy` as its argument and returns a HTML element ID

  popper: { placement: "top" } // Popper.js-specific options
});
```

Collection:

```js
cy.elements().popperjs({
  target: 'htmlElementId', // the ID of an HTML element to use as the popper; or,
  // a function which takes an element as its argument and returns a HTML element ID

  popper: { placement: "bottom" } // Popper.js-specific options
});
```

The function support for `target` is useful when adding many Poppers to many graph elements (with many corresponding HTML elements) as it enables registering all Poppers at once.


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Set the version number environment variable: `export VERSION=1.2.3`
1. Publish: `gulp publish`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-popperjs https://github.com/josephst/cytoscapejs-popper.git`
