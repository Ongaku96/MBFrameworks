import * as app from "./script/general.js";
import * as __enum from "./modules/enumerators.js";

var pos = [];

window.svglobal = {
    /**get the app */
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
}

/**Get the app with specified name or create t if it doesn't exists */
function getApp(name) {
    let _app = svglobal.pos.find(a => a.name == name);
    if(_app){
        return _app;
    }else{
        _app = serve(name);
        svglobal.pos.push(_app);
    }
    return _app;
}
/**Creates a new app or returns it if it already exists*/
function serve(name) {
    let _app = new __app(name);
    return _app;
};