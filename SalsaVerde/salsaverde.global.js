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

Object.defineProperty(String.prototype, "format", {
    value: function (...args) {
        a = this.toString();
        for (let k = 0; k < args.length; k++) {
            let _replace = args[k];
            a = a.replace(new RegExp(`\\{${k}\\}`), _replace);
        }
        return a;
    },
    writable: true,
    configurable: true,
});
// String.prototype.format = function (...args) {
//     if (this && this.length > 0) {
//         a = this.toArray().join();
//         for (let k = 0; k < args.length; k++) {
//             a = a.replace(new RegExp("\\{" + k.toString() + "\\}"), args[k]);
//         }
//         return a;
//     }
//     return this;
// };
/**Escaper RegExp characters */
String.prototype.escapeRegEx = function () {
    return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
/**Slice array */
Array.prototype.subarray = function(start, end = null) {
    if (!end) { end = -1; } 
    return this.slice(start, this.length + 1 - (end * -1));
};

Date.prototype.datatype = () => svenum.datatypes.date;
String.prototype.datatype = () => svenum.datatypes.string;
Array.prototype.datatype = () => svenum.datatypes.array;
Object.prototype.datatype = () => svenum.datatypes.object;
Number.prototype.datatype = () => svenum.datatypes.number;
Boolean.prototype.datatype = () => svenum.datatypes.boolean;

//#endregion

//#region SUPPORT
/**Execute a javascript function by name */
function runFunctionByName(script, e, app) {
    try {
        var _script = script.replace(/'/g, "\"").replace(svenum.regex.appdata, (match) => {
            let _formatted_match = match.slice(1);
            return `app.dataset${_formatted_match}`;
        });
        let _function = new Function("e", "app", _script);
        return _function(e, app);
    } catch (ex) { throw ex; }
}
/**Get or set Property of object by string path */
function propByString(obj, path, value = undefined) {
    try {
        for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
            if (obj) {
                if (value != undefined && i == len - 2) obj[path[i]] = value;
                obj = obj[path[i]];
            }
        };
        return obj;
    } catch (ex) {
        throw ex;
    }
}
/**
 * Function to sort alphabetically an array of objects by some specific key.
 * 
 * @param {String}; property Key of the object to sort.
 */
function dynamicSort(property, desc) {
    try {
        return function (a, b) {
            let _first = property ? propByString(a, property) : a;
            let _second = property ? propByString(b, property) : b;

            if (isNaN(_first)) {
                if (desc) {
                    return _second.localeCompare(_first);
                } else {
                    return _first.localeCompare(_second);
                };
            } else {
                if (desc) {
                    return _second - _first;
                } else {
                    return _first - _second;
                };
            };
        };
    } catch (ex) { throw ex; }
}
/**Deep copy of array values copied by value and not by ref*/
function duplicateArray(array) {
    try {
        return JSON.parse(JSON.stringify(array));
    } catch (ex) { throw ex; }
}
/**merge multiple array in one */
function mergeArrays(...arrays) {
    try {
        let _result = [];
        for (const array of arrays) {
            for (const item of array) {
                if (!_result.includes(item)) {
                    _result.push(item);
                }
            }
        }
        return _result;
    } catch (ex) { throw ex; }
}
/**get unique ID */
function uniqueID() {
    return Math.floor(Math.random() * Date.now()).toString(36);
}
/**Elaborate tag and return object path stored inside */
function getPathFromTag(tag, prefix = "") {
    try {
        if (prefix) tag = tag.replace(prefix + ".", "");
        return tag.replace("{{", "").replace("}}", "").trim();
    } catch (ex) { throw ex; }
}
/**Check if two objects has the same keys */
function compareKeys(obj1, obj2) {
    try {
        let _a = Object.keys(obj1).sort();
        let _b = Object.keys(obj2).sort();
        return JSON.stringify(_a) === JSON.stringify(_b);
    } catch (ex) { throw ex; }
}

const _string_constructor = "".constructor;
const _array_constructor = [].constructor;
const _object_constructor = {}.constructor;
const _xhr_constructor = new XMLHttpRequest().constructor;
/**Return the current data type of item*/
function getDataType(object) {
    try {
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
    } catch (ex) { throw ex; }
};

function castDataType(value, type) {
    if (value != null) {
        switch (type) {
            case svenum.datatypes.array:
                try { value = JSON.parse(value); } catch (ex) { }
                return getDataType(value) == svenum.datatypes.array ? value : [value];
            case svenum.datatypes.date: return new Date(value);
            case svenum.datatypes.object: return JSON.parse(value);
            default: return value;
        }
    }
    return value;
}

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
        /**match all integer and decimal values */
        numeric: /^(([0-9]*)|(([0-9]*)[\.\,]([0-9]*)))$/g,
        /**match all textual values */
        textual: /\d/,
        /**match email format */
        mail: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g,
        /**match multiple email format */
        multiplemail:
            /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9\-]+\.)+([a-zA-Z0-9\-\.]+)+([;]([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9\-]+\.)+([a-zA-Z0-9\-\.]+))*$/g,
        /**match date format */
        date: /(^(\d{2}|\d{1})[\/|\-|\.]+(\d{2}|\d{1})[\/|\-|\.]+\d{4})|(^(\d{4}[\/|\-|\.]+\d{2}|\d{1})[\/|\-|\.]+(\d{2}|\d{1}))$/g,
        dateformat:
            /([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])[/|.|-|,|;]([0][1-9]|[1][0-2])[/|.|-|,|;](([1][9][0-9]{2}|[2][0-9]{3})|(\d{2}))/g,
        reference: /{{[\s]?[a-zA-Z0-9._]+[\s]?}}/g,
        /**match in tag script reference */
        brackets: /(?<=\{\{)(.*?)(?=\}\})/g,
        /**match property path into script references */
        appdata: /(?:\$\.[a-zA-Z_$]+[\w$]*)(?:\.[a-zA-Z_$]+[\w$]*)*/g,
        /**match function path into script references */
        appfunction: /(?:\&\.[a-zA-Z_$]+[\w$]*)(?:\.[a-zA-Z_$]+[\w$]*)*/g
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
        edit: "_edit",
        hover: "_hover"
    },
    /**List of supported inline html commands */
    commands: {
        model: 0,
        for: 1,
        on: 2,
        name: 3,
        if: 4,
        else: 5,
        elseif: 6,
        filter: 7,
        sort: 8,
        bind: 9
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