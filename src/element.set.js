import _ from "./utils";
import $Node from "./node";
import $Element from "./element";

var hooks = {},
    sandbox = document.createElement("body");

/**
 * Set property/attribute value by name
 * @param {String|Object|Array} [name]  property/attribute name
 * @param {String|Function}     value   property/attribute value or function that returns it
 * @return {$Element}
 */
$Element.prototype.set = function(name, value) {
    var nameType = typeof name;

    if (arguments.length === 1 && nameType !== "object") {
        value = name;
        name = undefined;
    }

    return this.legacy((node, el, index, ref) => {
        var hook = hooks[name],
            watchers = (el._._watchers || {})[name || ("value" in node ? "value" : "innerHTML")],
            newValue = value, oldValue;

        if (watchers) oldValue = el.get(name);

        if (name && (name[0] === "_" || name[0] === "-")) {
            el._[name.substr(1)] = newValue;
        } else {
            if (typeof newValue === "function") newValue = value(el, index, ref);

            if (hook) {
                hook(node, newValue);
            } else if (nameType !== "string") {
                return $Node.prototype.set.call(el, name);
            } else if (newValue == null) {
                node.removeAttribute(name);
            } else if (name in node) {
                node[name] = newValue;
            } else {
                node.setAttribute(name, newValue);
            }

            // trigger reflow manually in IE8
            if (!_.DOM2_EVENTS || _.LEGACY_ANDROID) node.className = node.className;
        }

        if (watchers && oldValue !== newValue) {
            watchers.forEach((w) => { el.dispatch(w, newValue, oldValue, el, index, ref) });
        }
    });
};

// $Element#set hooks

hooks.undefined = function(node, value) {
    // handle numbers, booleans etc.
    value = value == null ? "" : String(value);

    if (node.tagName === "SELECT") {
        // selectbox has special case
        if (_.every.call(node.options, (o) => !(o.selected = o.value === value))) {
            node.selectedIndex = -1;
        }
    } else if (node.type && "value" in node) {
        // for IE use innerText for textareabecause it doesn't trigger onpropertychange
        node[_.DOM2_EVENTS || node.type !== "textarea" ? "value" : "innerText"] = value;
    } else {
        try {
            node.innerHTML = value;
        } catch (e) {
            // sometimes browsers fail to set innerHTML, so fallback to appendChild then
            // TODO: write a test
            node.innerHTML = "";
            sandbox.innerHTML = value;

            for (var n; n = sandbox.firstChild; node.appendChild(n));
        }
    }
};

if (!_.DOM2_EVENTS) hooks.textContent = (node, value) => { node.innerText = value };