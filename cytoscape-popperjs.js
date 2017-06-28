// @ts-check
;
(function () {
  'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape) {

    if (!cytoscape) {
      return;
    } // can't register if cytoscape unspecified

    function generateOptions(passedOpts) {
      var opts = Object.assign({}, passedOpts); // TODO: polyfill?

      if (!opts.id) {
        opts.id = 'cy-popper-target-' + (Date.now() + Math.round(Math.random() * 10000));
      }

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

      return opts
    }

    function updatePosition(ele, evt) {
      var isCy = ele.pan !== undefined && typeof ele.pan === 'function';
      var isEle = !isCy;
      var isNode = isEle && ele.isNode();
      var cy = isCy ? ele : ele.cy();

      if (ele.scratch('popper')) {
        // Popper has already been created
        var popper = ele.scratch('popper');
        popper.scheduleUpdate();
      } else {
        // need to create a new Popper
        var dim = isNode ? {
          get w() {
            return ele.renderedOuterWidth();
          },
          get h() {
            return ele.renderedOuterHeight();
          }
        } : {
          w: 3,
          h: 3,
        };

        var refObject = {
          getBoundingClientRect: function () {
            var pos = isNode ? ele.renderedPosition() : (evt ? evt.renderedPosition || evt.cyRenderedPosition : undefined);
            var cyOffset = cy.container().getBoundingClientRect();
            if (!pos || pos.x === null || isNaN(pos.x)) {
              return;
            }
            return {
              top: pos.y + cyOffset.top + window.pageYOffset,
              left: pos.x + cyOffset.left + window.pageXOffset,
              right: pos.x + dim.w + cyOffset.left + window.pageXOffset,
              bottom: pos.y + dim.h + cyOffset.top + window.pageYOffset,
              width: dim.w,
              height: dim.h,
            };
          },
          get clientWidth() {
            return dim.w
          },
          get clientHeight() {
            return dim.h
          },
        }
        var popperOpts = ele.scratch('popper-opts');
        var popper = new Popper(refObject, document.getElementById('pop'), popperOpts);
        ele.scratch('popper', popper);
      }
    }


    cytoscape('core', 'popperjs', function (passedOpts) {
      // for use on core
      // TODO

      return this; // chainability
    });

    cytoscape('collection', 'popperjs', function (passedOpts) {
      // for use on elements
      var eles = this;
      var cy = this.cy()
      var container = cy.container()

      eles.each(function (ele, i) {
        var opts = generateOptions(passedOpts); // TODO: custom options?
        ele.scratch('popper-opts', opts.popper);
        updatePosition(ele, null);

        ele.on('position', function (e) {
          updatePosition(ele, e);
        });

        ele.on(opts.show.event, function (e) {
          console.log('should be visible');
          updatePosition(ele, e);
        });
        ele.on('unfocus', function (e) {
          // TODO: hide element
          console.log('should be hidden');
        });

        cy.on('pan zoom', function (e) {
          updatePosition(ele, e);
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