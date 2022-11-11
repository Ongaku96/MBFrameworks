import { spicetype } from "./enumerators.js";
/**Management of spice collection*/
export class SpiceRack {
    #_spices = [];
    constructor() { }
    /**Store the event into the component, it will add the event event the name already exists*/
    addSpice(spice) {
        this.#_spices.push(spice);
    }
    /**Store the event into the component but it replace any with the same name */
    replaceSpice(spice) {
        this.#_spices = this.#_spices.filter((s) => s.name != spice.name);
        this.addSpice(spice);
    }
    /**Remove the specified named events */
    removeSpices(...names) {
        for (let n in names) {
            this.#_spices = this.#_spices.filter(s => s.name != names[n]);
        }
    }
    /**Trigger the named event */
    spiceup(name, ...args) {
        if (this.itContainsSpice(name)) {
            this.#_spices.find((s) => s.name == name).use(args);
        } else {
            snack.eat("there is no spice named " + this.name, snacktype.warning);
        }
    }
    /**Check if the component contains that event */
    itContainsSpice(name) {
        return this.#_spices.find((s) => s.name == name) != null;
    }
}
/**Scpice represent a dynamic action that can be bound to an event and converted to json*/
export class Spice {
    constructor(name, type, ingredients) {
        this.name = name;
        this.type = type;
        this.ingredients = ingredients;
    }
    /**Execute the action */
    use(...args) {
        switch (this.type) {
            case spicetype.link:
                if (args && args.length > 0)
                    this.ingredients = this.ingredients.format(args);
                window.open(this.ingredients, "_blank");
                break;
            case spicetype.script:
                try {
                    if (this.ingredients.args) args.push(this.ingredients.args);
                    window[this.ingredients.name](args);
                } catch (ex) {
                    Snack.eat(e, Snack.type.warning);
                }
                break;
            case spicetype.server:
                try {
                    if (args && args.length > 0) {
                        switch (args.length) {
                            case 1:
                                Connection.script(args[0]);
                                break;
                            case 2:
                                Connection.script(args[0], args[1]);
                                break;
                            case 3:
                                Connection.script(args[0], args[1], function (result) {
                                    args[2](result);
                                });
                                break;
                        }
                    }
                } catch (e) {
                    snack.eat(e, snacktype.server);
                }
                break;
            case spicetype.email:
                let _to = this.ingredients.to;
                let _cc = this.ingredients.cc ? "?cc=" + this.ingredients.cc : "";
                let subject = this.ingredients.subject
                    ? "&subject=" + this.ingredients.subject
                    : "";
                if (args && args.length > 0) subject = subject.format(args);
                window.open("mailto:" + _to + _cc + subject, "_blank");
            default:
                break;
        }
    }
    /**Get Spice object from json */
    static fetch(json) {
        let _data = JSON.parse(json);
        return _data ? new Spice(_data.name, data.type, data.ingredients) : null;
    }
}
