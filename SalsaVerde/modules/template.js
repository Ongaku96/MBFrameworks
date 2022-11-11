import { SpiceRack } from "./spice";

export function createTemplate(templateText) {
  const dom = createDOM(templateText);
  const template = dom.querySelector("template");
  return template;
}
function createDOM(htmlText) {
  return new DOMParser().parseFromString(htmlText, "text/html");
}

/**Base class for all components */
export class BaseRecipe extends SpiceRack {
  #_error_timer = null;
  get error_timer() {
    return this.#_error_timer;
  }

  constructor(id) {
    super();

    this.state = staterecipe.default;
    this.action = null; //server call
    this.data = []; //component data from wich the html is build
    this.id = id; //univoque reference of component in app environement
    this.reference = null; //reference to the html element
  }

  //JSON CONVERTER
  /**convert item in json data */
  get json() {
    try {
      super.useSpice("json");
      return JSON.stringify(this);
    } catch (ex) {
      console.error(ex);
    }
  }
  /**parse json string in current item */
  static parse(json) {
    try {
      let _data = JSON.parse(json);
      return Object.setPrototypeOf(_data, this.prototype);
    } catch (ex) {
      console.error(ex);
    }
  }
  //SESSION MANAGEMENT
  /**Save current item in session storage */
  save() {
    sessionStorage.setItem(this.id, this.json);
  }
  /**read item from session storage */
  static read() {
    if (!sessionStorage.key.find(this.id)) save();
    return this.parse(sessionStorage.getItem(this.id));
  }

  //INTERFACE
  /**Start component loading animation */
  startCooking(timer = 50000) {
    if (this.reference) {
      $(this.reference).addClass("add-skeleton");
      let _me = this;
      this._error_timer = setTimeout(function () {
        _me.abort();
        _me.stopCooking();
        Snack.eat(
          "Communication error with the server, too much time has passed without any response.",
          snacktype.server
        );
      }, timer);
    }
  }
  /**Stop component loading animation */
  stopCooking() {
    if (this.reference) {
      window.clearTimeout(this.error_timer);
      $(this.reference).removeClass("add-skeleton");
    }
  }
}