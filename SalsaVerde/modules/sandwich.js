import { setTheTable, getProxy } from "./setup.js";

/**Salsaverde app */
export default class Sandwich {
    #_data = null;
    
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
        this.settings = instructions && instructions.settings ? instructions.settings : null;
        this.#_data = instructions && instructions.data ? instructions.data : null;
        this.dataset = getProxy(this.name, this.#_data);

        setTheTable(this);

        svglobal.save();
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
}