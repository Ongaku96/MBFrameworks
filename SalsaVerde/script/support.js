/**Execute a javascript function by name */
function runFunctionByName(name, ...args) {
    return window[name](args);
}

const stringConstructor = "".constructor;
const arrayConstructor = [].constructor;
const objectConstructor = {}.constructor;
const xhrConstructor = new XMLHttpRequest().constructor;
/**Return the current data type of item*/
function getDataType(object) {
  if (object === null || object === undefined) return datatypes.empty;
  if (object instanceof Date) return datatypes.date;
  if (object.constructor === stringConstructor) return datatypes.string;
  if (object.constructor === arrayConstructor) return datatypes.array;
  if (object.constructor === objectConstructor) return datatypes.object;
  if (object.constructor === xhrConstructor) return datatypes.xhr;
  if (typeof object == "boolean") return datatypes.boolean;
  if (!isNaN(object)) return datatypes.number;

  return "unknown";
};