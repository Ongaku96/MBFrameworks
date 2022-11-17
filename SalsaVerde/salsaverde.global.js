const global_session_key = "svpantry";

window.onload = () => {
    svglobal = SalsaVerde.instance();
    svglobal.import;
};
var openKiosk = (name) => {
    return SalsaVerde.instance().import.then((sv) => { return sv.kiosk(name); });
};

class SalsaVerde {
    static #_singleton;
    static instance(todo = null) {
        if (!this.#_singleton) this.#_singleton = new SalsaVerde(todo);
        return this.#_singleton;
    };
    /**import and setup framework modules */
    get import() {
        let _me = this;
        if (!this.app) {
            return import("./salsaverde.js").then((sv) => {
                _me.kiosk = (name) => { return sv.getApp(name); };
                _me.clean = (name) => { sv.clean(name); };
                _me.claim = (message, type, ...spices) => { sv.claim(message, type, spices) };
                _me.menu = sv._enum;
                return _me;
            });
        }
        return new Promise(() => { return _me; });
    }
    /**save all data in session */
    save() {
        sessionStorage.setItem(global_session_key, JSON.stringify(this.booths));
    }
    /**refresh data from session */
    update() {
        this.booths = [];
        let _data = JSON.parse(sessionStorage.getItem(global_session_key));
        if (_data) {
            for (let i = 0; i < _data.length; i++) {
                if (this.booths.find(a => a.name == _data[i].name) == null) {
                    this.booths.push(new app.Sandwich(_data[i].name, _data[i].options));
                }
            }
        }
    }
}

//CODE EXTENSIONS
/**Replace the '{n}' characters in string with the given list of string*/
String.prototype.format = function (...args) {
    a = this;
    for (var k in args) {
        a = a.replace(new RegExp("\\{" + k + "\\}", "g"), args[k]);
    }
    return a;
};

String.prototype.escapeRegEx = function () {
    return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

Date.prototype.datatype = () => datatypes.date;
String.prototype.datatype = () => datatypes.string;
Array.prototype.datatype = () => datatypes.array;
Object.prototype.datatype = () => datatypes.object;
Number.prototype.datatype = () => datatypes.number;
Boolean.prototype.datatype = () => datatypes.boolean;

//SUPPORT
/**Execute a javascript function by name */
function runFunctionByName(script) {    
    Function(`"use strict";return (${script.replace(/'/g, "\"")})`)();
}

const _string_constructor = "".constructor;
const _array_constructor = [].constructor;
const _object_constructor = {}.constructor;
const _xhr_constructor = new XMLHttpRequest().constructor;
/**Return the current data type of item*/
function getDataType(object) {
    if (object === null || object === undefined) return datatypes.empty;
    if (object instanceof Date) return datatypes.date;
    if (object.constructor === _string_constructor) return datatypes.string;
    if (object.constructor === _array_constructor) return datatypes.array;
    if (object.constructor === _object_constructor) return datatypes.object;
    if (object.constructor === _xhr_constructor) return datatypes.xhr;
    if (typeof object == "boolean") return datatypes.boolean;
    if (!isNaN(object)) return datatypes.number;

    return "unknown";
};
/**List of supported html default events */
const triggers = {
    click: "_click",
    load: "_load",
    change: "_change",
    submit: "_submit",
    edit: "_edit"
}
/**List of supported inline html commands */
const commands = {
    for: 0,
    on: 1,
    name: 2
}
/**list of common client errors */
const errortype = {
    /**The server cannot or will not process the request due to an apparent client error */
    badrequest: "#400",
    /**Authentication is required and has failed or has not yet been provided */
    unauthorized: "#401",
    paymentrequest: "#402",
    /**The request contained valid data and was understood by the server, but the server is refusing action */
    forbidden: "#403",
    /**The requested resource could not be found but may be available in the future */
    notfound: "#404",
    /**A request method is not supported for the requested resource */
    methodnotallowed: "#405",
    /**The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request */
    notacceptable: "#406",
    /**The client must first authenticate itself with the proxy. */
    proxyauthenticationrequired: "#407",
    /**The server timed out waiting for the request */
    requesttimeout: "#408",
    /**Indicates that the request could not be processed because of conflict in the current state of the resource */
    conflict: "#409",
    /**Indicates that the resource requested was previously in use but is no longer available and will not be available again */
    gone: "#410"
}
//#endregion