import { setTheTable, getProxy } from "./setup.js";

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
        this.settings = null;
        this.dataset = null;
        this.cookbook = [];
    }
    /**Setup all dynamic components into the app*/
    cook(instructions = null) {

        this.cookbook = instructions && instructions.components ? instructions.components : null;
        this.#_data = instructions && instructions.data ? instructions.data : null;
        this.dataset = getProxy(this.name, this.#_data);

        setTheTable(this);

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
    /**add component into the app collection*/
    addRecipe(name, options = null) {
        let _recipe = null;
        this.cookbook.push(_recipe);
    }
    /**get component from the app collection */
    getRecipe(name) {
        return this.cookbook.find((c) => c.name == name);
    }

    rearrange() {

    }

    addReference(name, template, path) {
        if (!this.references) this.references = [];
        if (!this.references.find(r => r.name == name)) {
            this.references.push({
                name: name,
                template: template,
                path: path
            });
        }
    }
}