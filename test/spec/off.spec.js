describe("off", function() {
    "use strict";
    
    var input, link, obj = {test: function() { }, test2: function() {}}, spy;

    beforeEach(function() {
        setFixtures("<a id='link'><input id='input'></a>");

        input = DOM.find("#input");
        link = DOM.find("#link");

        spy = jasmine.createSpy("click");
    });

    it("should remove event handler", function() {
        input.on("click", spy).off("click").fire("click");

        expect(spy).not.toHaveBeenCalled();


        input.on("click", spy).off("click", spy).fire("click");

        expect(spy).not.toHaveBeenCalled();
    });

    it("should remove all event handlers if called without the second argument", function() {
        spyOn(obj, "test");
        spyOn(obj, "test2");

        link.on("click", obj.test).on("click input", obj.test2).off("click");
        input.fire("click");

        expect(obj.test).not.toHaveBeenCalled();
        expect(obj.test2).not.toHaveBeenCalled();
    });

    it("should return reference to 'this'", function() {
        expect(input.off("click")).toEqual(input);
    });

    it("should throw error if agruments are invalid", function() {
        expect(function() { link.off(123); }).toThrow();
    });

});