spicetype = {
  link: 0,
  script: 1,
  server: 2,
  email: 3,
};
actionrecipe = {
  order: "order", //server call to load data
  cook: "cook", //render component on html page
  refuel: "refuel", //refresh partial item with some updated data
  abort: "abort", //abort all server call
};
staterecipe = {
  default: 0,
  loading: 1,
};

export class Sandwich {
  #_components = [];
  constructor(name) {
    this.name = name;
  }

  cook() {
    for (let i in this.#_components) {
      this.#_components[i].do(actioncomponent.cook);
    }
  }
  component(id) {
    return this.#_components.find((c) => c.id == id);
  }
}
/**Management of spice collection*/
class SpiceRack {
  #_spices = [];
  constructor() {}

  addSpice(spice) {
    this.#_spices.push(spice);
  }
  replaceSpice(spice) {
    this.#_spices = this.#_spices.filter((s) => s.name != spice.name);
    this.addSpice(spice);
  }
  useSpice(name, ...args) {
    if (this.containsSpice(name)) {
      this.#_spices.find((s) => s.name == name).use(args);
    } else {
      snack.eat("there is no spice named " + this.name, snacktype.warning);
    }
  }
  containsSpice(name) {
    return this.#_spices.find((s) => s.name == name) != null;
  }
}
/**Scpice represent a dynamic action that can be bound to an event and converted to json*/
class Spice {
  constructor(name, type, ingredients) {
    this.name = name;
    this.type = type;
    this.ingredients = ingredients;
  }

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

  static parse(json) {
    let _data = JSON.parse(json);
    return _data ? new Spice(_data.name, data.type, data.ingredients) : null;
  }
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
/**Server connection management */
export class Server extends SpiceRack {
  #_state;
  #_error;
  #_result;

  #_process;

  get state() {
    return this._state;
  }
  get error() {
    return this._error;
  }
  get result() {
    return this._result;
  }
  get process() {
    return this._process;
  }
  get params() {
    let _params = "";
    if (this.data) {
      _params = "?" + new URLSearchParams(this.data).toString();
    }
    return _params;
  }

  constructor(action, data) {
    super();
    this.action = action;
    this.data = data;
    this.type = "json";
    this.content = "application/json; charset=utf-8";
  }

  setType(type, content) {
    this.type = type;
    this.content = content;
  }

  /**
   * Esegue una chiamata Ajax GET
   * @param {any} alert
   */
  async get(alert = true) {
    let _me = this;
    try {
      this._process = await $.ajax({
        url: this.action + this.params,
        cache: false,
        type: "GET",
        method: "GET",
        //data: this.data,
        //dataType: this.type,
        //contentType: this.content,
        processData: false,
        error: function (xhr, status, error) {
          //var _debug = xhr.responseText;
          _me._error = error;
          _me._result = xhr;
          if (alert)
            obimessage("Errore di connessione al server - " + error, "danger");
          _me.dispatchEvent("error", error);
        },
        success: function (response) {
          _me._result = response;
          if (response.type) {
            switch (response.type) {
              case "error":
                _me._error = response.message;
                if (alert && response.message)
                  obimessage(response.message, "warning");
                _me.dispatchEvent("error", response.message);
                break;
              default:
                _me.dispatchEvent("success", response.output);
                break;
            }
          } else {
            _me.dispatchEvent("success", response);
          }
        },
        complete: function (response) {
          _me.dispatchEvent("load", response);
        },
      });
      this.dispatchEvent("bind");
    } catch (ex) {
      console.debug(ex);
      //if (ex.message) obimessage(ex.message, "server_error"); else obimessage("Si è verificato un errore nella comunicazione col Server.", "server_error");
    }
  }
  /**
   * Esegue una chiamata ajax POST
   * @param {any} alert
   */
  async post(alert = true) {
    let _me = this;
    try {
      this._process = await $.ajax({
        url: this.action,
        //cache: false,
        type: "post",
        //method: 'POST',
        data: this.data,
        //dataType: this.type,
        //contentType: this.content,
        //processData: false,
        error: function (xhr, status, error) {
          //var _debug = xhr.responseText;
          _me._error = error;
          if (alert)
            obimessage("Errore di connessione al server - " + error, "danger");
          _me.dispatchEvent("error", error);
        },
        success: function (response) {
          if (response.type) {
            switch (response.type) {
              case "error":
                _me._error = response.message;
                if (alert && response.message)
                  obimessage(response.message, "warning");
                _me.dispatchEvent("error", response.message);
                break;
              default:
                if (alert && response.message)
                  obimessage(response.message, "success");
                _me.dispatchEvent("success", response.output);
                break;
            }
          }
          _me._result = response;
        },
        complete: function (response) {
          _me.dispatchEvent("load");
        },
      });
      _me.dispatchEvent("bind");
    } catch (ex) {
      console.debug(ex);
      //if (ex.message) obimessage(ex.message, "server_error"); else obimessage("Si è verificato un errore nella comunicazione col Server.", "server_error");
    }
  }
  /**
   * Esegue la funzione JQuery $.load()
   * @param {any} alert
   */
  async load(view, alert = true) {
    let _me = this;
    try {
      this._process = await $(view).load(
        this.action,
        this.data,
        function (responseTxt, statusTxt, xhr) {
          if (statusTxt == "success") {
            _me.dispatchEvent("success");
          }
          if (statusTxt == "error") {
            if (alert) obimessage(xhr.status + ": " + xhr.statusText, "danger");
            _me.dispatchEvent("error");
          }
          _me.dispatchEvent("load");
        }
      );
      _me.dispatchEvent("bind");
    } catch (ex) {
      console.debug(ex);
      //if (ex.message) obimessage(ex.message, "server_error"); else obimessage("Si è verificato un errore nella comunicazione col Server.", "server_error");
    }
  }

  /**
   * Scarica dei dati dal server leggibili tramite definizione della funzione load
   * @param {any} action
   * @param {any} urldata
   * @param {any} success
   * @param {any} alert
   */
  static async loadData(action, urldata = null, load = null, alert = true) {
    let _connection = new Connection(action, urldata);
    _connection.addEventListener("success", function (result) {
      let _data = result[0];
      if (getType(_data) === datatypes.string) _data = JSON.parse(result[0]);
      if (load) load(_data);
    });
    _connection.get(alert);
    return _connection;
  }
  /**
   * Esegue uno script da server
   * @param {any} action l'url da chiamare
   */
  static async script(action, data = null, complete = null) {
    if (action) {
      let _params = "";
      if (data) {
        _params = "?" + new URLSearchParams(data).toString();
      }
      let _url = action + _params;
      try {
        await $.getScript(_url, function (data, textStatus, jqxhr) {
          if (data.includes("server_error") || data.includes("danger"))
            textStatus = "error";
          if (complete !== null) complete(jqxhr, textStatus, data);
        }).fail(function (jqxhr, settings, exception) {
          obimessage("Errore di connessione: " + exception, "warning");
          //if (complete !== null) complete(jqxhr, exception, settings);
        });
      } catch (ex) {
        console.debug(ex);
        //if (ex.message) obimessage(ex.message, "server_error"); else obimessage("Si è verificato un errore nella comunicazione col Server.", "server_error");
      }
    }
  }
  /**Annulla il processo in corso */
  abort() {
    try {
      if (this._process && getType(this._process) === datatypes.xhr) {
        this._process.abort();
        this.dispatchEvent("abort");
        location.reload();
      }
    } catch (ex) {
      console.debug(ex);
      if (ex.message) obimessage(ex.message, "server_error");
      else
        obimessage(
          "Si è verificato un errore nella comunicazione col Server.",
          "server_error"
        );
    }
  }
}
