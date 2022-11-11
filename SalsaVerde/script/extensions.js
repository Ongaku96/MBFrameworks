import { datatypes } from "../modules/enumerators.js";

/**Replace the '{n}' characters in string with the given list of string*/
String.prototype.format = function () {
  a = this;
  for (var k in arguments) {
    a = a.replace(new RegExp("\\{" + k + "\\}", "g"), arguments[k]);
  }
  return a;
};

Date.prototype.datatype = () => datatypes.date;
String.prototype.datatype = () => datatypes.string;
Array.prototype.datatype = () => datatypes.array;
Object.prototype.datatype = () => datatypes.object;
Number.prototype.datatype = () => datatypes.number;
Boolean.prototype.datatype = () => datatypes.boolean;