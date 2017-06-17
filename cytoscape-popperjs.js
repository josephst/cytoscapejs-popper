// @ts-check
;
(function () {
  'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape) {

    if (!cytoscape) {
      return;
    } // can't register if cytoscape unspecified

    function generateOptions(target, passedOpts) {
      var popper = target.scratch().popper;
      var opts = Object.assign({}, passedOpts); // TODO: polyfill?

      if (!opts.id) {
        opts.id = 'cy-qtip-target-' + (Date.now() + Math.round(Math.random() * 10000));
      }

      var targetBox = target.boundingBox();
      opts.referenceObject = {
        getBoundingClientRect() {
          return {
            // TODO: return Cytoscape's dimensions here; also implement clientWidth and clientHeight
          }
        }
      }

      // adjust
      // TODO: ??

      // default show event
      opts.show = opts.show || {};
      if (opts.show.event === undefined) {
        opts.show.event = 'tap';
      }

      // default hide event
      opts.hide = opts.hide || {};
      opts.hide.cyViewport = opts.hide.cyViewport === undefined ? true : opts.hide.cyViewport;
      if (opts.hide.event === undefined) {
        opts.hide.event = 'unfocus';
      }

      // content
      // TODO: content

      return opts
    }

    function updatePosition(ele, popper, evt) {
      console.log('update');
      const popElement = new Popper(document.getElementById("cy"), document.getElementById("pop"));
    }


    cytoscape('core', 'popperjs', function (passedOpts) {
      // for use on core   

      return this; // chainability
    });

    cytoscape('collection', 'popperjs', function (passedOpts) {
      // for use on elements
      var eles = this;
      var cy = this.cy()
      var container = cy.container()

      eles.each(function(ele, i) {
        var scratch = ele.scratch();
        var popper = scratch.popper = scratch.popper || {};
        var opts = generateOptions(ele, passedOpts); // TODO: custom options?

        updatePosition(opts.referenceObject, popper);

        ele.on(opts.show.event, function(e) {
          updatePosition(opts.referenceObject, popper, e);
        });
      });

      return this; // chainability
    });

  };

  if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = function (cytoscape) {
      register(cytoscape);
    };
  } else if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
    define('cytoscape-popperjs', function () {
      return register;
    });
  }

  if (typeof cytoscape !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
    register(cytoscape);
  }

})();