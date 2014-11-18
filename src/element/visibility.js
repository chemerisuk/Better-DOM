import _ from "../util/index";
import { MethodError } from "../errors";
import { WEBKIT_PREFIX } from "../const";
import HOOK from "../util/selectorhooks";
import AnimationHandler from "../util/animationhandler";

var TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    ANIMATION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend",
    makeMethod = (name, condition) => function(animationName, callback) {
        if (typeof animationName !== "string") {
            callback = animationName;
            animationName = null;
        }

        if (callback && typeof callback !== "function") {
            throw new MethodError(name, arguments);
        }

        var node = this[0],
            style = node.style,
            computed = _.computeStyle(node),
            hiding = condition,
            done = () => {
                if (animationHandler) {
                    node.removeEventListener(eventType, animationHandler, true);
                    // restore initial state
                    style.cssText = animationHandler.initialCssText;
                } else {
                    this.set("aria-hidden", String(hiding));
                }
                // always update element visibility property
                // use value "inherit" to respect parent container visibility
                style.visibility = hiding ? "hidden" : "inherit";

                this._._frameId = null;

                if (callback) callback.call(this);
            },
            animationHandler = AnimationHandler(node, computed, animationName, hiding, done),
            eventType = animationName ? ANIMATION_EVENT_TYPE : TRANSITION_EVENT_TYPE;

        if (typeof hiding !== "boolean") {
            hiding = !HOOK[":hidden"](node, computed);
        }

        var frameId = this._._frameId;
        // cancel previous frame if it exists
        if (frameId) _.cancelFrame(frameId);

        if (animationHandler) {
            // use requestAnimationFrame to avoid animation quirks
            // for element inserted into the DOM
            // http://christianheilmann.com/2013/09/19/quicky-fading-in-a-newly-created-element-using-css/
            frameId = _.requestFrame(() => {
                // for a some reason the second raf callback performs
                // much better (especially on mobile devices)
                this._._frameId = _.requestFrame(() => {
                    node.addEventListener(eventType, animationHandler, true);
                    // update modified style rules
                    style.cssText = animationHandler.initialCssText + animationHandler.cssText;
                    // trigger CSS3 transition / animation
                    this.set("aria-hidden", String(hiding));
                });
            });
        } else {
            // no animation case - apply display property sync
            if (hiding) {
                let displayValue = computed.display;

                if (displayValue !== "none") {
                    // internally store original display value
                    this._._display = displayValue;
                }

                style.display = "none";
            } else {
                // restore previously store display value
                style.display = this._._display || "inherit";
            }
            // done callback is always async
            frameId = _.requestFrame(done);
        }

        this._._frameId = frameId;

        return this;
    };

_.register({
    /**
     * Show an element using CSS3 transition or animation
     * @memberof! $Element#
     * @alias $Element#show
     * @param {String}   [animationName]  CSS animation to apply during transition
     * @param {Function} [callback]       function that executes when animation is done
     * @return {$Element}
     * @function
     * @example
     * link.show(); // displays element
     *
     * foo.show(function() {
     *   // do something when transition is completed
     * });
     *
     * bar.show("fade", function() {
     *   // do something when "fade" animation is completed
     * });
     */
    show: makeMethod("show", false),

    /**
     * Hide an element using CSS3 transition or animation
     * @memberof! $Element#
     * @alias $Element#hide
     * @param {String}   [animationName]  CSS animation to apply during transition
     * @param {Function} [callback]       function that executes when animation is done
     * @return {$Element}
     * @function
     * @example
     * link.hide(); // hides element
     *
     * foo.hide(function() {
     *   // do something when transition is completed
     * });
     *
     * bar.hide("fade", function() {
     *   // do something when "fade" animation is completed
     * });
     */
    hide: makeMethod("hide", true),

    /**
     * Toggle an element using CSS3 transition or animation
     * @memberof! $Element#
     * @alias $Element#toggle
     * @param {String}   [animationName]  CSS animation to apply during transition
     * @param {Function} [callback]       function that executes when animation is done
     * @return {$Element}
     * @function
     * @example
     * link.toggle(); // toggles element visibility
     *
     * foo.toggle(function() {
     *   // do something when transition is completed
     * });
     *
     * bar.toggle("fade", function() {
     *   // do something when "fade" animation is completed
     * });
     */
    toggle: makeMethod("toggle")
});
