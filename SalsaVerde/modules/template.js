import { SpiceRack } from "./spice.js";
import { errortype, stampError } from "./errors.js";

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

  constructor(name) {
    super();

    this.methods = {
      
    };

    this.state = svenums.staterecipe.mise; //state of elaboration
    this.action = null; //server call
    this.data = []; //component data from wich the html is build
    this.name = name; //univoque reference of component in app environement
    this.reference = null; //reference to the html element

    this.template = null; //the html template
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
  static read(json) {
    try {
      let _data = JSON.parse(json);
      return Object.setPrototypeOf(_data, this.prototype);
    } catch (ex) {
      console.error(ex);
    }
  }
  //SESSION MANAGEMENT
  /**Save current item in session storage */
  store() {
    sessionStorage.setItem(this.name, this.json);
  }
  /**read item from session storage */
  static fetch() {
    if (!sessionStorage.key.find(this.name)) store();
    return this.parse(sessionStorage.getItem(this.name));
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
        Snack.apply(
          "Communication error with the server, too much time has passed without any response.",
          snacktype.server
        );
        console.error(stampError(errortype.requesttimeout, "SVE3").format(this.name));
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