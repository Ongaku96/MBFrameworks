import { SpiceRack } from "./spice.js";

/**Server connection management */
export default class Server extends SpiceRack {
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