import { setTheTable, renderHtmlReference, applyTagEvent, createOnChangeProxy } from "./setup.js";

const default_formatter = [
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
/**Salsaverde app */
export default class Sandwich {
    #_data = null;
    get target() { return document.getElementById(this.name) };
    constructor(name) {
        this.name = name;
        this.settings = {
            formatter: default_formatter
        };
        this.dataset = null;
        this.cookbook = [];
        this.references = [];
    }

    //#region SETUP
    /**Setup all dynamic components into the app*/
    cook(instructions = null) {
        let _me = this;

        this.cookbook = instructions && instructions.components ? instructions.components : null;
        this.#_data = instructions && instructions.data ? instructions.data : null;
        if (instructions) updateSettings(instructions.settings);
        this.dataset = setupProxy();

        //replace all components and tag with relative html patterns
        setTheTable(this, this.#_data);
        //render values into the references
        renderAllHtmlReferences();
        //apply event listeners
        applyTagEvent(this.target);
        //refresh session storage
        svglobal.store();

        /**setup interaction data proxy */
        function setupProxy() {
            return createOnChangeProxy(() => {
                renderAllHtmlReferences();
            }, _me.#_data);
        }
        /**setup personalized settings */
        function updateSettings(settings) {
            if (settings && settings.formatter) {
                _me.addFormat(settings.formatter);
            }
        }
        /**replace all values to references tag on document */
        function renderAllHtmlReferences() {
            for (const ref of _me.references) {
                renderHtmlReference(_me, ref, _me.#_data[ref.key]);
            }
        }
    }
    /**Reset properties and close the app */
    rearrange() {

    }
    /**refresh render application on html */
    flash(){
        this.target.innerHTML = this.content;
        setTheTable(this, this.#_data);
        for (const ref of this.references) {
            renderHtmlReference(this, ref, this.#_data[ref.key]);
        }
        applyTagEvent(this);
    }

    /**Produce json compatible storage of object*/
    freeze() {
        return {
            name: this.name,
            coockbook: this.cookbook,
            data: this.#_data,
            settings: this.settings,
            references: this.references
        };
    }
    /**Read json storage and restore parameters value */
    defrost(freezed) {
        this.name = freezed.name;
        this.cookbook = freezed.coockbook;
        this.data = freezed.data;
        this.settings = freezed.settings;
        this.references = freezed.references;
    }
    //#endregion

    //#region COMPONENTS
    /**Add component into the app collection*/
    addRecipe(name, instructions = null) {
        let _recipe = null;
        this.cookbook.push(_recipe);
    }
    /**Get component from the app collection */
    getRecipe(name) {
        return this.cookbook.find((c) => c.name == name);
    }
    //#endregion

    //#region SETTINGS
    /**Format text based on formatting app rules */
    format(value) {
        return this.settings.formatter.find(f => f.type == getDataType(value)).stamp(value);
    }
    /**Add or personalize app formatting text rules */
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

