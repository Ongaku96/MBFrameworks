const global_session_key = "svpantry";

/**Global object for the framework */
class SalsaVerde {
    static #_singleton;
    /**singleton access to framework */
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
                _me.claim = (message, type = svenum.snacktype.default, ...spices) => { sv.claim(message, type, spices) };
                _me.console = {
                    log: (message) => { console.log(message); },
                    error: (message, type = null, code = null) => { console.error(sv.getErrorMessage(type, code, message)); },
                    warn: (message) => { console.warn(message); }
                };
                return _me;
            });
            //  .catch(ex => console.error(svenum.errortype.badrequest + "-SVE6" + ex));
        }
        return new Promise(() => { return _me; });
    }

    constructor() {
        /**Collection of opened apps */
        this.booths = [];
    };

    /**save all data in session */
    store() {
        let _storage = [];
        for (const app of this.booths) {
            _storage.push(app.freeze());
        }
        sessionStorage.setItem(global_session_key, JSON.stringify(_storage));
    }
    /**refresh data from session */
    retrive() {
        this.booths = [];
        let _data = sessionStorage.getItem(global_session_key);
        if (_data) {
            for (let app of _data) {
                let _retrived = this.kiosk(app.name);
                _retrived.defrost(app);
                this.booths.push(_retrived);
            }
        }
    }

    addCustomError(code, message) {
        if (!sverrors.has(code)) sverrors.set(code, message);
    }
}

//#region GLOBAL
/**Global access to the framework */
var svglobal;

window.onload = () => {
    svglobal = SalsaVerde.instance();
    svglobal.import;
};

/**Start a new app instance */
window.openKiosk = (name) => {
    var _promise = SalsaVerde.instance().import.then((sv) => {
        let _kiosk = sv.kiosk(name);
        return _kiosk;
    });
    _promise.globalize = (global) => {
        _promise.then((kiosk) => window[Object.keys(global)] = kiosk);
        return _promise;
    };
    _promise.reserve = (instructions) => {
        _promise.then((kiosk) => {
            kiosk.cook(instructions);
            return kiosk;
        });
        return _promise;
    };
    return _promise;
};
//#endregion

//#region EXTENSIONS
/**Replace the '{n}' characters in string with the given list of string*/
String.prototype.format = function (...args) {
    a = this;
    for (var k in args) {
        a = a.replace(new RegExp("\\{" + k + "\\}", "g"), args[k]);
    }
    return a;
};
/**Escaper RegExp characters */
String.prototype.escapeRegEx = function () {
    return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

Date.prototype.datatype = () => svenum.datatypes.date;
String.prototype.datatype = () => svenum.datatypes.string;
Array.prototype.datatype = () => svenum.datatypes.array;
Object.prototype.datatype = () => svenum.datatypes.object;
Number.prototype.datatype = () => svenum.datatypes.number;
Boolean.prototype.datatype = () => svenum.datatypes.boolean;

function* nextAll(parent, selector) {
    while (parent = parent.nextElementSibiling) {
        if (parent.matches(selector)) {
            yield parent;
        }
    }
}
function* prevAll(parent, selector) {
    while (parent = parent.previousElementSibling) {
        if (parent.matches(selector)) {
            yield parent;
        }
    }
}
//#endregion

//#region SUPPORT
/**Execute a javascript function by name */
function runFunctionByName(script, e, app) {
    var _script = script.replace(/'/g, "\"").replace(svenum.regex.app, (match) => `app.dataset${match}`);
    let _function = new Function("e", "app", _script);
    return _function(e, app);
}

const _string_constructor = "".constructor;
const _array_constructor = [].constructor;
const _object_constructor = {}.constructor;
const _xhr_constructor = new XMLHttpRequest().constructor;
/**Return the current data type of item*/
function getDataType(object) {
    if (object === null || object === undefined) return svenum.datatypes.empty;
    if (object instanceof Date) return svenum.datatypes.date;
    if (object.constructor === _string_constructor) return svenum.datatypes.string;
    if (object.constructor === _array_constructor) return svenum.datatypes.array;
    if (object.constructor === _object_constructor) return svenum.datatypes.object;
    if (object.constructor === _xhr_constructor) return svenum.datatypes.xhr;
    if (typeof object == "boolean") return svenum.datatypes.boolean;
    if (typeof object == "function") return svenum.datatypes.function;
    if (!isNaN(object)) return svenum.datatypes.number;
    return "unknown";
};
//#endregion

//#region ENUMERATORS
/**Collection of system enumerators */
const svenum = {
    /**Enumerator that reference the most common var data types */
    datatypes: {
        empty: 1,
        string: 2,
        array: 3,
        object: 4,
        number: 5,
        xhr: 6,
        date: 7,
        function: 8
    },
    /**List of useful regex */
    regex: {
        numeric: /^(([0-9]*)|(([0-9]*)[\.\,]([0-9]*)))$/,
        textual: /\d/,
        mail: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        multiplemail:
            /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9\-]+\.)+([a-zA-Z0-9\-\.]+)+([;]([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9\-]+\.)+([a-zA-Z0-9\-\.]+))*$/,
        date: /(^(\d{2}|\d{1})[\/|\-|\.]+(\d{2}|\d{1})[\/|\-|\.]+\d{4})|(^(\d{4}[\/|\-|\.]+\d{2}|\d{1})[\/|\-|\.]+(\d{2}|\d{1}))$/,
        dateformat:
            /([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])[/|.|-|,|;]([0][1-9]|[1][0-2])[/|.|-|,|;](([1][9][0-9]{2}|[2][0-9]{3})|(\d{2}))/,
        reference: /{{\s[a-zA-Z0-9._]+\s}}/gm,
        app: /(?:\.[a-zA-Z_$]+[\w$]*)(?:\.[a-zA-Z_$]+[\w$]*)*/g
    },
    /**Enumerator for the file size formatter */
    filesize: {
        byte: {
            name: "Bytes",
            size: 8
        },
        kilobyte: {
            name: "KB",
            size: 8192
        },
        megabyte: {
            name: "MB",
            size: 8e+6
        },
        gigabyte: {
            name: "GB",
            size: 8e+9
        }
    },
    /**Type of actions that can be executed with the spice class */
    spicetype: {
        /**It open a given link in a blank page */
        link: 0,
        /**Execute a function in javascript */
        script: 1,
        /**Run a Server Request with a javascript function execution as output */
        server: 2,
        /**Open system default email app to send an email */
        email: 3,
    },
    /**enumerator of on-screen message types */
    snacktype: {
        /**default message */
        default: 0,
        /**message of success */
        success: 1,
        /**notificate that something gone wrong but it don't block the process */
        warning: 2,
        /**indicate that a process failed */
        danger: 3,
        /**indicate a server internal error */
        server: 4,
    },
    /**List of supported events in components */
    eventrecipe: {
        /**server call to load data*/
        fire: "fire",
        /**render component completely or partially on the html page */
        cook: "cook",
        /**refresh partial item with some updated data */
        flash: "flash",
        /**abort all active server call */
        deadplate: "deadplate",
        /**End of server call either if it's a success or it ran into errors */
        ondeck: "ondeck",
        /**triggered when a server call is executed succesfully */
        tastegood: "tastegood",
        /**triggered when a server call ran into a problem */
        tastebad: "tastebad"
    },
    /**Enum for component state of elaboration */
    staterecipe: {
        /**indicate that the item is ready and waiting for events */
        mise: 0,
        /**indicate that the item is elaborating data to build template */
        cooking: 1,
        /**indicate that the item has called the server and it is waiting a response */
        weeded: 2,
        /**set if the server call run into an error */
        error: 3,
        /**set if the server call is executed succesfully */
        heard: 4
    },
    /**List of supported html default events */
    triggers: {
        click: "_click",
        load: "_load",
        change: "_change",
        submit: "_submit",
        edit: "_edit"
    },
    /**List of supported inline html commands */
    commands: {
        value: 0,
        for: 1,
        on: 2,
        name: 3,
        if: 4,
        else: 5,
        elseif: 6
    },
    /**list of common client errors */
    errortype: {
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
}

/**Collection of the framework errors with details*/
const sverrors = new Map();
sverrors.set("SVE1", "No application with the name {0} has been found");
sverrors.set("SVE2", "Cannot cook item {0}. Cooking instruction not found.");
sverrors.set("SVE3", "Server connection timeout for the component {0}");
sverrors.set("SVE4", "The Spice {0} ran into a problem while running: {1}");
sverrors.set("SVE5", "An error occurred in the conversion of the json to Spice: {0}");
sverrors.set("SVE6", "Impossible to load the framework: {0}");
sverrors.set("SVE7", "An error occurred while the application setup: {0}");
sverrors.set("SVE8", "An error occurred while the application rendering: {0}");
//#endregion