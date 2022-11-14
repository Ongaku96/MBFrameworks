import { snacktype, spicetype } from "./enumerators.js";
import { errortype, stampError } from "./errors.js";
import __snack from "./snack.js";
import __server from "./server.js";
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
                try {
                    if (args && args.length > 0)
                        this.ingredients = this.ingredients.format(args);
                    window.open(this.ingredients, "_blank");
                } catch (ex) {
                    __snack.apply("An error occurred while the action was being performed", snacktype.error);
                    console.error(stampError(errortype.notacceptable, "SVE4").format(this.name, ex));
                }
                break;
            case spicetype.script:
                try {
                    if (this.ingredients.args) args.push(this.ingredients.args);
                    runFunctionByName(this.ingredients.name.format(args));
                } catch (ex) {
                    __snack.apply("An error occurred while the action was being performed", snacktype.error);
                    console.error(stampError(errortype.notacceptable, "SVE4").format(this.name, ex));
                }
                break;
            case spicetype.server:
                try {
                    if (args && args.length > 0) {
                        switch (args.length) {
                            case 1:
                                __server.script(args[0]);
                                break;
                            case 2:
                                __server.script(args[0], args[1]);
                                break;
                            case 3:
                                __server.script(args[0], args[1], function (result) {
                                    args[2](result);
                                });
                                break;
                        }
                    }
                } catch (ex) {
                    __snack.apply("An error occurred while the action was being performed", snacktype.error);
                    console.error(stampError(errortype.notacceptable, "SVE4").format(this.name, ex));
                }
                break;
            case spicetype.email:
                try {
                    let _to = this.ingredients.to;
                    let _cc = this.ingredients.cc ? "?cc=" + this.ingredients.cc : "";
                    let subject = this.ingredients.subject
                        ? "&subject=" + this.ingredients.subject
                        : "";
                    if (args && args.length > 0) subject = subject.format(args);
                    window.open("mailto:" + _to + _cc + subject, "_blank");
                } catch (ex) {
                    __snack.apply("An error occurred while the action was being performed", snacktype.error);
                    console.error(stampError(errortype.notacceptable, "SVE4").format(this.name, ex));
                }
                break;
            default:
                break;
        }
    }
    /**Get Spice object from json */
    static fetch(json) {
        try {
            let _data = JSON.parse(json);
            return _data ? new Spice(_data.name, data.type, data.ingredients) : null;
        } catch (ex) {
            __snack.apply("Impossible to convert the data", snacktype.error);
            console.error(stampError(errortype.notacceptable, "SVE5").format(ex));
        }
    }
}
