import __snack from "./modules/snack.js";
import __app from "./modules/sandwich.js";
import * as __errors from "./modules/errors.js";

/**stamp communication on screen */
export function claim(message, type = snacktype.default, ...spices) {
    __snack.apply(message, type, spices);
}
/**Get the app with specified name or create t if it doesn't exists */
export function getApp(name) {
    let _app = svglobal.booths.find(a => a.name == name);
    if (_app) {
        return _app;
    } else {
        _app = serve(name);
        svglobal.booths.push(_app);
    }
    return _app;
}
/**Creates a new app or returns it if it already exists*/
function serve(name) {
    let _app = new __app(name);
    return _app;
};
/**Close the specified app and remove it from the session memory */
export function clean(name) {
    let _app = getSandwich(name);
    _app.rearrange();
    svglobal.booths = svglobal.booths.filter(a => a.name != name);
    svglobal.save();
}
/**Return a coded standard message error from errors storage sverrors*/
export function getErrorMessage(type, code, message = "") {
    if(code || message){
        return __errors.stampError(type, code).format(message);
    }
    return message;
}