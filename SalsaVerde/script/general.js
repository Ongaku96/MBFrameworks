import * as __ext from "./extensions.js";
import * as __enum from "../modules/enumerators.js";
import __server from '../modules/server.js';
import __snack from "../modules/snack.js";

export class Sandwich {
  #_cookbook = [];
  constructor(name, options) {
    this.name = name;
    this.options = { };
  }

  cook() {
    let _app = document.getElementById(this.name);
    if (_app) startup(_app);

    if (this.#_cookbook.length > 0) {
      for (let i = 0; i <this.#_cookbook.length; i++) {
        this.#_cookbook[i].spiceup(__enum.eventrecipe.cook);
      }
    }
    window.svglobal.save();
  }

  addRecipe(recipe) {
    this.#_cookbook.push(recipe);
  }

  getRecipe(id) {
    return this.#_cookbook.find((c) => c.id == id);
  }

  claim(message, type, ...args) {
    let _snack = new __snack(this.name);
    _snack.cook(message, type, args);
  }

  server(action, data = null){
    return new __server(action, data);
  }
}

const clickid = "sv-click";

function startup(app) {
  clickevent(app);
}

function clickevent(app) {
  let _items = app.querySelectorAll("[" + clickid + "]");
  if (_items.length > 0) {
    for (let i = 0; i < _items.length; i++) {
      let _script = _items[i].getAttribute(clickid);
      _items[i].addEventListener("click", () => { eval(_script); });
    }
  }
}