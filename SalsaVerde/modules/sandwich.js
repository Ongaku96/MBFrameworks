import * as __setup from "./setup.js";
import * as __vnode from "./vnodes.js";
//{ setTheTable, renderHtmlReference, applyTagEvent, createOnChangeProxy, renderValues, renderIf }
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
        this.state = svenum.staterecipe.heard;
        this.dataset = null;
        this.instructions = null;
        this.cookbook = [];
        this.references = [];
        this.broccoli = new Broccoli();
        this.setup();
    }

    //#region SETUP
    setup() {
        this.broccoli.boil(this);
        console.log(this);
    }
    /**Setup all dynamic components into the app*/
    cook(forniture = null) {
        let _me = this;
        this.state = svenum.staterecipe.cooking;
        setupData();
        this.flash();
        svglobal.store();

        /**Application setup */
        function setupData() {
            if (forniture) {
                _me.#_data = forniture.data ? forniture.data : {};
                _me.cookbook = forniture.recipes ? forniture.recipes : null;
                if (forniture) updateSettings(forniture.demands);
                _me.dataset = setupProxy();
                if (forniture.instructions) {
                    for (const param of Object.keys(forniture.instructions)) {
                        _me.dataset[param] = forniture.instructions[param];
                    }
                }
            }

            /**setup interaction data proxy */
            function setupProxy() {
                return __setup.createOnChangeProxy((prop, attr, val) => {
                    _me.flash(attr);
                }, _me.#_data);
            }
            /**setup personalized settings */
            function updateSettings(settings) {
                if (settings && settings.formatter) {
                    _me.addFormat(settings.formatter);
                }
            }
        }
    }
    /**Reset properties and close the app */
    rearrange() {
    }
    /**refresh render application on html */
    flash(attr = null) {
        this.broccoli.serve(this, attr);
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
    addRecipe(name, demands = null) {
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
        if (value != null) {
            let _formatter = this.settings.formatter.find(f => f.type == getDataType(value));
            return _formatter ? _formatter.stamp(value) : value.toString();
        }
        return "";
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

class Broccoli {
    constructor() {
        this.children = [];
    }
    add(vnode) {
        this.children.push(vnode);
    }
    remove(name) {
        this.children = this.children.filter(c => c.name != name);
    }
    boil(app) {
        this.add(new __vnode.vNode(app.target));
        // for (const key of __setup.custommapper.keys()) {
        //     let _items = app.target.querySelectorAll("[" + __setup.custommapper.get(key) + "]");
        //     for (const item of _items) {
        //         switch (key) {
        //             case svenum.commands.if: this.add(new __vnode.vIf(item)); break;
        //             case svenum.commands.for: this.add(new __vnode.vFor(item)); break;
        //             case svenum.commands.model: this.add(new __vnode.vModel(item)); break;
        //             case svenum.commands.on: this.add(new __vnode.vOn(item)); break;
        //         }
        //     }
        // }
    }
    serve(app, attr = null) {
        for (const child of this.children) {
            child.render(app, attr);
        }
    }
}

//#region OBSOLETE
function renderMethodOld(app, data) {
    //refresh application html with original references
    app.target.innerhtml = app.content;
    //store references and templates for list rendering
    __setup.setthetable(app, data);
    //render conditional visibility
    __setup.renderif(app);
    //render all references previously stored
    for (const ref of app.references) {
        __setup.renderhtmlreference(app, ref, data[ref.key]);
    }
    //render simpler values tags
    __setup.rendervalues(app, data);
    //connect input to data and setup values
    __setup.rendermodels(app, data);

    //setup buttons and events on elements
    __setup.applytagevent(app, data);
}
//#endregion