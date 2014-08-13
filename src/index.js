export { $Element, $Elements };

/**
 * Used to represent a DOM element
 * @name $Element
 * @class
 * @private
 */
function $Element(node) {
    if (node && node.__dom__) return node.__dom__;

    if (this instanceof $Element) {
        if (node) this[0] = node.__dom__ = this;

        this._ = { _node: node, _handlers: [] };
        this.length = node ? 1 : 0;
    } else {
        return new $Element(node);
    }
}

$Element.prototype.toString = function() {
    var node = this._._node;

    return node ? node.tagName.toLowerCase() : "";
};

/**
 * Used to represent a collection of DOM elements
 * @name $Elements
 * @class
 * @extends $Element
 * @private
 */
function $Elements(elements) {
    for (var i = 0, n = elements && elements.length || 0; i < n; ++i) {
        this[i] = $Element(elements[i]);
    }

    this._ = {};
    this.length = n;
}

$Elements.prototype = new $Element();
$Elements.prototype.toString = Array.prototype.join;

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Element
 */
var DOM = new $Element(document.documentElement);

DOM.version = "<%= pkg.version %>";

window.DOM = DOM;

export default DOM;