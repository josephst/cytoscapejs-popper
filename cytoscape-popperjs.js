;
(function () {
  'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape) {

    if (!cytoscape) {
      return;
    } // can't register if cytoscape unspecified

    cytoscape('core', 'popperjs', function () {
      var cy = this;

      // your extension impl...
      function updatePosition(ele, evt) {
        var isCy = (ele != null && typeof ele == 'function');
        var isEle = !isCy;
        var isNode = isEle && ele.isNode();
        var cy = isCy ? ele : ele.cy();
        var parentContainerSize = cy.container().getBoundingClientRect();
        var pos = isNode ? ele.renderedPos() :
          (event ? event.renderedPosition || event.cyRenderedPos : undefined);

        // sanity check for found position
        if (!pos || pos.x == null || isNaN(pos.x)) {
          return;
        }

        var boundingBox = isNode ? ele.renderedBoundingBox({
          includeNodes: true,
          includeEdges: false,
          includeLabels: false,
          includeShadows: false
        }) : {
          x1: pos.x - 1,
          x2: pos.x + 1,
          w: 3,
          y1: pos.y - 1,
          y2: pos.y + 1,
          h: 3
        }
      }

      // reference object for Popper.js
      var referenceObject = {
        getBoundingClientRect() {
          return {
            top: boundingBox.y1,
            left: boundingBox.x1,
            right: boundingBox.x2,
            bottom: boundingBox.y2,
            width: boundingBox.x2 - boundingBox.x1,
            height: boundingBox.y2 - boundingBox.y1
          };
        },
        clientWidth: boundingBox.x2 - boundingBox.x1,
        clientHeight: boundingBox.y2 - boundingBox.y1
      };

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