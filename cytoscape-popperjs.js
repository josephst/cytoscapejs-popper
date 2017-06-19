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
        opts.id = 'cy-popper-target-' + (Date.now() + Math.round(Math.random() * 10000));
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
      var e = evt;
      var isCy = ele.pan !== undefined && typeof ele.pan === 'function';
      var isEle = !isCy;
      var isNode = isEle && ele.isNode();
      var cy = isCy ? ele : ele.cy();
      var cyOffset = cy.container().getBoundingClientRect();
      var pos = isNode ? ele.renderedPosition() : (e ? e.renderedPosition || e.cyRenderedPosition : undefined);
      if (!pos || pos.x === null || isNaN(pos.x)) {
        return;
      }

      var bb = isNode ? ele.renderedBoundingBox({
        includeNodes: true,
        includeEdges: false,
        includeLabels: false,
        includeShadows: false,
      }) : {
        x1: pos.x - 1,
        x2: pos.x + 1,
        w: 3,
        y1: pos.y - 1,
        y2: pos.y + 1,
        h: 3,
      };

      var refObject = {
        getBoundingClientRect() {
          // TODO: return Cytoscape's dimensions here; also implement clientWidth and clientHeight
          return {
            top: bb.y1,
            left: bb.x1,
            right: bb.x2,
            bottom: bb.y2,
            width: bb.w,
            height: bb.h,
          };
        },
        clientWidth: bb.w,
        clientHeight: bb.h,
      }
      var scratch = ele.scratch();
      var popElement;
      if (scratch.popper) {
        popElement = scratch.popper
        scratch.popper.scheduleUpdate();
        // TODO: update position
      } else {
        popElement = new Popper(refObject, document.getElementById("pop"));
      }
      return popElement;
    }


    cytoscape('core', 'popperjs', function(passedOpts) {
      // for use on core   

      return this; // chainability
    });

    cytoscape('collection', 'popperjs', function(passedOpts) {
      // for use on elements
      var eles = this;
      var cy = this.cy()
      var container = cy.container()

      eles.each(function (ele, i) {
        var scratch = ele.scratch();
        var opts = generateOptions(ele, passedOpts); // TODO: custom options?
        var popper = scratch.popper = updatePosition(ele, popper);

        ele.on(opts.show.event, function(e) {
          updatePosition(ele, popper, e);
        });
        ele.on(opts.hide.event, function(e) {
          // TODO: hide element
          console.log('hidden');
        });

        cy.on('pan zoom', function(e) {
          console.log('updating position');
          updatePosition(ele, popper, e);
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