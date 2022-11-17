import { setTheTable, renderHtmlReference, applyTagEvent } from "./setup.js";

/**Salsaverde app */
export default class Sandwich {
    #_data = null;
    #_default_formatter = [
        {
            type: svenum.datatypes.date,
            stamp: (value) => value.toLocaleDateString()
        },
        {
            type: svenum.datatypes.string,
            stamp: (value) => value.replace("\n", "<br />")
        },
        {
            type: svenum.datatypes.number,
            stamp: (value) => value.toString()
        }
    ];
    get target() { return document.getElementById(this.name) };

    constructor(name) {
        this.name = name;
        this.settings = {
            formatter: this.#_default_formatter
        };
        this.dataset = null;
        this.cookbook = [];
        this.references = [];
    }
    /**Setup all dynamic components into the app*/
    cook(instructions = null) {
        let _me = this;

        this.cookbook = instructions && instructions.components ? instructions.components : null;
        this.#_data = instructions && instructions.data ? instructions.data : null;
        if (instructions) updateSettings(instructions.settings);
        this.dataset = setupProxy();

        setTheTable(this, this.#_data);
        renderAllHtmlReferences();
        applyTagEvent(this.target);
        svglobal.save();

        function setupProxy() {
            let _handler = {
                set(target, prop, value, receiver) {
                    renderHtmlReference(_me, _me.references.find(r => r.key == prop), value);
                    target[prop] = value;
                    return true;
                }
            }
            return new Proxy(_me.#_data, _handler);
        }
        function updateSettings(settings) {
            if (settings && settings.formatter) {
                _me.addFormat(settings.formatter);
            }
        }
        function renderAllHtmlReferences() {
            for (const ref of _me.references) {
                renderHtmlReference(_me, ref, _me.#_data[ref.key]);
            }
        }
    }
    /**Reset properties and close the app */
    rearrange() {

    }

    //#region COMPONENTS
    /**add component into the app collection*/
    addRecipe(name, options = null) {
        let _recipe = null;
        this.cookbook.push(_recipe);
    }
    /**get component from the app collection */
    getRecipe(name) {
        return this.cookbook.find((c) => c.name == name);
    }
    //#endregion

    //#region SETTINGS
    /**format text based on formatting app rules */
    format(value) {
        return this.settings.formatter.find(f => f.type == getDataType(value)).stamp(value);
    }
    /**add or personalize app formatting text rules */
    addFormat(...formatter) {
        for (const format of formatter) {
            if (format && format.type && format.stamp) {
                if (this.settings.formatter.find(f => f.type == format.type)) {
                    this.settings.formatter = this.settings.formatter.filter(f => f.type != format.type);
                }
                this.settings.formatter.push(format);
            }
        }
    }
    //#endregion
}

