import * as app from "./script/general.js";
import * as __enum from "./modules/enumerators.js";

var pos = [];

window.svglobal = {
    app: (id) => { return getSandwich(id); },
    save: () => { sessionStorage.setItem("svstore", JSON.stringify(pos)); },
    update: () => {
        pos = [];
        let _data = JSON.parse(sessionStorage.getItem("svstore"));
        if (_data) {
            for (let i = 0; i < _data.length; i++) {
                if (pos.find(a => a.name == _data[i].name) == null) {
                    pos.push(new app.Sandwich(_data[i].name, _data[i].options));
                }
            }
        }
    },
    enum: {
        datatypes: __enum.datatypes,
        regex: __enum.regex,
        spicetype: __enum.spicetype,
        snacktype: __enum.snacktype,
        eventrecipe: __enum.eventrecipe,
        staterecipe: __enum.staterecipe
    }
}

function getSandwich(id) {
    svglobal.update();
    return pos.find(a => a.name == id);
}

export function start(id, options = {}) {
    let _app = new app.Sandwich(id, options);
    if (getSandwich(id) == null) pos.push(_app);
    _app.cook();
    return _app;
};
