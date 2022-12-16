import __server from './server.js';
import __snack from "./snack.js";
import * as __error from "./errors.js";
import { getErrorMessage } from '../salsaverde.js';

//#region REFERENCES
/**Map of supported events */
export const eventmapper = new Map([
  [svenum.triggers.click, "click"],
  [svenum.triggers.change, "change"],
  [svenum.triggers.load, "load"],
  [svenum.triggers.submit, "submit"],
  [svenum.triggers.edit, "change textInput input keyup"],
  [svenum.triggers.hover, "hover"]
]);
const prefix = "sv-";
/**Map of framework's html references */
export const attrmapper = new Map([
  [svenum.commands.model, prefix + "model"],
  [svenum.commands.for, prefix + "for"],
  [svenum.commands.on, prefix + "on"],
  [svenum.commands.name, prefix + "name"],
  [svenum.commands.if, prefix + "if"],
  [svenum.commands.elseif, prefix + "elseif"],
  [svenum.commands.else, prefix + "else"],
  [svenum.commands.filter, prefix + "filter"],
  [svenum.commands.sort, prefix + "sort"],
  [svenum.commands.bind, prefix + "bind"]
]);
//#endregion

/**Create a Recoursive Proxy */
export function createOnChangeProxy(onChange, target, parent) {
  return new Proxy(target, {
    get(target, property) {
      const item = target[property];
      let _type = getDataType(item);
      if (item && (_type == svenum.datatypes.object || _type == svenum.datatypes.array)) {
        if (getDataType(property) == svenum.datatypes.string && isNaN(property)) parent = property;
        // if (_type == svenum.datatypes.object && target.hasOwnProperty(property)) parent = property;
        return createOnChangeProxy(onChange, item, parent);
      }
      return item;
    },
    set(target, property, newValue) {
      target[property] = newValue;
      onChange(target,
        getDataType(target) == svenum.datatypes.array ? parent : property,
        getDataType(target) == svenum.datatypes.array ? target : newValue);
      return true;
    },
  });
}
/**Return value of expression or property from app's dataset. Refer to app with $.*/
export function renderBrackets(content, app, event = null, references = []) {
  return content.replace(svenum.regex.brackets, (match) => elaborateContent(match.trim(), app, event, references, true)).replace(/\{\{|\}\}/gm, "");
}
/**Elaborate dynamic content from application data */
export function elaborateContent(content, app, event = null, references = [], output = false) {
  try {
    for (const ref of references) {
      if (compareKeys(ref, { prefix: "", value: "" })) {
        content = content.replace(new RegExp("(?:" + ref.prefix + "(?:\.[a-zA-Z_$]+[\w$]*)*)", "g"), (e) => {
          let _path = e.replace(ref.prefix + ".", "");
          let _value = _path == e ? ref.value : propByString(ref.value, _path);
          _value = app.format(_value);
          return getDataType(_value) != svenum.datatypes.number ? "'" + _value + "'" : _value;
        });
      }
    }
    let _val = propByString(app.dataset, content);
    if (_val == null || _val == undefined) _val = runFunctionByString((output ? "return " : "") + content, app.dataset, event);
    if (getDataType(_val) == svenum.datatypes.function) return _val.call(app.dataset, event);
    return app.format(_val);

  } catch (ex) {
    console.warn(ex);
  }
}
/**Return temporary DOM element that rplace reference while rendering*/
export function buildTempReference(id) {
  let _ref = document.createElement("div");
  _ref.setAttribute("hidden", "hidden");
  _ref.setAttribute("id", id);
  return _ref;
}
/**Replace a DOM element with another element */
export function replaceHtmlNode(node, replace) {
  if (node && replace) {
    if (getDataType(node) == svenum.datatypes.array && node.length > 0) {
      node[0].before(replace);
      for (let item of node) {
        item.remove();
      }
    } else {
      node.replaceWith(replace);
    }
    node = replace;
    return true;
  }
  return false;
}
/**Get list of app's dataset properties that are included in the script */
export function getPropertiesFromScript(script) {
  let _props = [];
  let _match;
  let _check_single_reference = script.match(/(?:[a-zA-Z_$]+[\w$]*)(?:\.[a-zA-Z_$]+[\w$]*)*/gm);
  if (_check_single_reference && _check_single_reference.length > 1) {
    while ((_match = svenum.regex.appdata.exec(script)) !== null) {
      _props.push(_match[0].replace("$.", ""));
    }
    return _props;
  } else {
    return [script.replace("$.", "")];
  }
}
/**Return all app's dataset properties that are included in the html section */
export function findPropertiestIntoHtml(vnode) {
  let _props = [];
  let _match;
  while ((_match = svenum.regex.brackets.exec(vnode.outerHTML)) !== null) {
    let _matches = getPropertiesFromScript(_match[0].trim());
    for (const item of _matches) {

      let _exist = _props.includes(item);
      let _is_prefix = vnode.type == svenum.commands.for && item.includes(vnode.attributes[0]);
      let _index = item == ":index";

      if (!_exist && !_is_prefix && !_index) _props.push(item);
    }
  }
  return _props;
}
/**Replace all array references with app path */
export function cleanScriptReferences(script, param, prefix, index) {
  while (script.includes(prefix)) {
    script = script.replace(prefix, "$." + param + "[" + index + "]");
  }
  return script;
}
/**Execute a javascript function by name */
export function runFunctionByString(script, context, evt) {
  try {
    var _script = script.replace(/'/g, "\"").replace(svenum.regex.appdata, (match) => {
      let _formatted_match = match.slice(1);
      return `this${_formatted_match}`;
    });
    let _function = new Function("evt", _script);
    return _function.call(context, evt);
  } catch (ex) {
    throw ex;
  }
}
//#region DEPRECATED
/**Setup all the in tag references of the html */
function setTheTable(app, data) {
  setComponents(app.coockbook);
  setupReferences(app);
}
/**set the interface components */
function setComponents(cookbook) {
  if (cookbook && cookbook.length > 0) {
    for (let i = 0; i < cookbook.length; i++) {
      let _recipe = cookbook[i];
      if ("cook" in _recipe)
        _recipe.cook();
      else
        console.error(__error.stampError(__error.errortype.methodnotallowed, "SVE2").format(this.name));
    }
  }
}
/**convert html data references to value */
function setupReferences(app) {
  if (app) {
    setupArray();
  }

  function setupModels() {

  }
  function setupArray() {
    let _elements = Array.from(app.target.querySelectorAll("[" + attrmapper.get(svenum.commands.for) + "]"));
    for (let i = 0; i < _elements.length; i++) {
      try {
        let _key = getArrayParameter(_elements[i].getAttribute(attrmapper.get(svenum.commands.for)), "key");
        let _name = buildName(app.name, _key, i.toString());
        app.references.push({
          type: svenum.commands.for,
          key: _key,
          name: _name,
          template: _elements[i].innerHTML,
          tag: _template.match(svenum.regex.reference)
        });
        _elements[i].setAttribute(attrmapper.get(svenum.commands.name), _name);
      } catch (ex) {
        console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7").format(ex));
      }
    }
  }
  function setupIf() {
    let _elements = Array.from(app.target.querySelectorAll("[" + attrmapper.get(svenum.commands.if) + "]"));
    for (let i = 0; i < _elements.length; i++) {
      try {
        app.references.push({
          type: svenum.commands.if,
          condition: _elements[i].getAttribute(attrmapper.get(svenum.commands.if)),
          name: buildName(app.name, "if", i.toString()),
          template: _elements[i].outerHTML,
          tag: getConditionalBlock()
        });
        _elements[i].setAttribute(attrmapper.get(svenum.commands.name), _name);

        function getConditionalBlock() {
          let _conditions = [];
          let _next = _elements[i].nextElementSibling;
          while (_next && !_next.hasAttribute(attrmapper.get(svenum.commands.if))) {
            if (_node_condition.hasAttribute(attrmapper.get(svenum.commands.elseif))) {
              _conditions.push({
                type: svenum.commands.elseif,
                condition: _next.getAttribute(attrmapper.get(svenum.commands.elseif)),
                template: _next.outerHTML
              });
            }
            if (_node_condition.hasAttribute(attrmapper.get(svenum.commands.elseif))) {
              _conditions.push({
                type: svenum.commands.else,
                template: _next.outerHTML
              });
            }
            _next = _next.nextElementSibling;
          }
          return _conditions;
        }
      } catch (ex) {
        console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7").format(ex));
      }
    }
  }
}
/**Refresh the element tag event */
function addTagEventListener(item, event, script, app = null) {
  let _func = (e) => { runFunctionByName(script, e, app); };
  item.removeEventListener(event, _func);
  item.addEventListener(event, _func);
}
/**render html data reference */
function renderHtmlReference(app, reference, value) {
  if (value != null) {
    switch (reference.type) {
      case svenum.commands.for: stampArray(); break;
    }
  }

  function stampArray() {
    let _nodes = app.target.querySelectorAll("[" + attrmapper.get(svenum.commands.name) + "='" + reference.name + "']");
    for (const node of _nodes) {
      node.innerHTML = "";
      let _prefix = getArrayParameter(node.getAttribute(attrmapper.get(svenum.commands.for)), "prefix");
      let _value = duplicateArray(value);
      _value = sort(_value, node.getAttribute(attrmapper.get(svenum.commands.sort)), _prefix);
      _value = filter(_value, node.getAttribute(attrmapper.get(svenum.commands.filter)), _prefix);
      for (let i = 0; i < _value.length; i++) {
        let _html = reference.template;
        for (const t of reference.tag) {
          if (t.includes(_prefix)) {
            let _path = getPathFromTag(t, _prefix);
            let _val = _path == _prefix ? _value[i] : _value[i][_path];
            _html = _html.replace(new RegExp(t), app.format(_val));
          }
        }
        _html = _html.replace(/{{ :index }}/, i.toString());
        node.innerHTML += _html;
      }
    }
  }

  function sort(array, sort, prefix) {
    if (array && sort) {
      return array.sort(dynamicSort(sort.replace(" desc", "").replace(prefix + ".", ""), sort.includes("desc")));
    }
    return array;
  }
  function filter(array, condition, prefix) {
    if (array && condition) {
      return array.filter(e => {
        let _func = new Function(prefix, "return " + condition.replace(/'/g, "\""));
        return _func(e);
      });
    }
    return array;
  }
}
/**Get all framework click tag into the app and set the events */
function applyTagEvent(app) {
  if (app.target) {
    setupOnSelector();
    setupEventShorts();
  }

  function setupOnSelector() {
    for (const event of eventmapper) {

      let _selector = event[0];
      let _event = event[1];

      let _items = app.target.querySelectorAll("[" + _selector + "]");
      if (_items.length > 0) {
        for (let i = 0; i < _items.length; i++) {
          switch (_event) {
            case "hover":
              // let _enter = "setMouseHoverTarget(e, true);";
              // let _leave = "setMouseHoverTarget(e, false);";
              let _script = _items[i].getAttribute(_selector);
              addTagEventListener(_items[i], "mouseenter", _script, app);
              addTagEventListener(_items[i], "mouseleave", _script, app);
              break;
            default: addTagEventListener(_items[i], _event, _items[i].getAttribute(_selector), app); break;
          }

        }
      }
    }
  }
  function setupEventShorts() {
    let _items = app.target.querySelectorAll("[" + attrmapper.get(svenum.commands.on) + "]");
    if (_items.length > 0) {
      for (let i = 0; i < _items.length; i++) {
        let _attribute = _items[i].getAttribute(attrmapper.get(svenum.commands.on));
        if (_attribute) {
          let _split = _attribute.split(" -> ");
          switch (_split[0]) {
            case "hover":
              let _enter = "setMouseHoverTarget(e, true);";
              let _leave = "setMouseHoverTarget(e, false);";
              addTagEventListener(_items[i], "mouseenter", _enter + _split[1], app);
              addTagEventListener(_items[i], "mouseleave", _leave + _split[1], app);
              break;
            default: addTagEventListener(_items[i], _split[0], _split[1], app); break;
          }

        }
      }
    }
  }
}
/**render html references of data value */
function renderValues(app, data) {
  app.target.innerHTML = app.target.innerHTML.replace(svenum.regex.reference, (match) => app.format(propByString(data, match.replace("{{ ", "").replace(" }}", ""))));
}
function renderIf(app) {
  let _elements = Array.from(app.target.querySelectorAll("[" + attrmapper.get(svenum.commands.if) + "]"));
  for (const item of _elements) {
    try {
      let _attr = item.getAttribute(attrmapper.get(svenum.commands.if)).split(" -> ");
      if (_attr.length == 1) {
        renderItem(item, _attr[0]);
      }
      if (_attr.length == 2) {
        let _mod = _attr[1];
        let _exp = runFunctionByName("return " + _attr[0], null, app);
        switch (_mod) {
          case "disabled": if (_exp) item.setAttribute("disabled", "disabled"); else item.removeAttribute("disabled");
            break;
          case "checked": if (_exp) item.setAttribute("checked", "checked"); else item.removeAttribute("checked");
            break;
          case "display": if (!_exp) item.style["display"] = "none !important";
            break;
          default: if (_exp) item.classList.add(_mod); else item.classList.remove(_mod);
            break;
        }
      }
    } catch (ex) {
      console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE8").format(ex));
    }
  }

  function renderItem(item, condition) {
    let _visible = runFunctionByName("return " + condition, null, app);
    let _next = item.nextElementSibling;
    if (!_visible) item.remove();
    while (_next && !_next.hasAttribute(attrmapper.get(svenum.commands.if))) {
      let _node_condition = _next;
      let _remove = false;

      if (_node_condition.hasAttribute(attrmapper.get(svenum.commands.elseif))) {
        let _else_attr = _node_condition.getAttribute(attrmapper.get(svenum.commands.elseif));
        let _temp_visible = runFunctionByName("return " + _else_attr, null, app);
        _remove = _visible || !_temp_visible;
        _visible = _visible ? _visible : _temp_visible;
      } else {
        _remove = _visible && _node_condition.hasAttribute(attrmapper.get(svenum.commands.else));
      }

      _next = _next.nextElementSibling;
      if (_remove) _node_condition.remove();
    }
  }
}
function renderModels(app, data) {
  let _elements = app.target.querySelectorAll("[" + attrmapper.get(svenum.commands.model) + "]");
  for (const item of _elements) {
    let _input = item.tagName == "INPUT" ? item : item.getElementsByTagName("INPUT")[0];
    if (_input) {
      let _attr = _input.getAttribute(attrmapper.get(svenum.commands.model));
      _input.value = propByString(data, _attr);
      let _editor = (value) => { app.dataset[_attr.split(".")] = value; };
      _input.removeEventListener("keyup", function (e) { _editor(e.target.value); });
      _input.addEventListener("keyup", function (e) { _editor(e.target.value); });
    }
  }
}
/**Get prefixes used in reading array by html tag */
function getArrayParameter(attribute, type) {
  let _split = attribute.split(" in ");
  if (_split.length > 0) {
    switch (type) {
      case "key": return _split[1];
      case "prefix": return _split[0];
    }
  }
  throw "'" + attribute + "' is not a valid attribute for array";
}
/**Build reference name */
function buildName(app, key, iteration = null) {
  return app + "-" + key + (iteration != null ? iteration : "");
}
/**Run attribute function passing by in app stored functions */
function runAttrFunction(content, event, app, references = []) {
  try {
    for (const ref of references) {
      if (compareKeys(ref, { prefix: "", value: "" })) {
        content = content.replace(new RegExp("(?:" + ref.prefix + "(?:\.[a-zA-Z_$]+[\w$]*)*)", "gi"), (e) => {
          let _path = e.replace(ref.prefix + ".", "");
          let _value = _path == e ? ref.value : propByString(ref.value, _path);
          _value = app.format(_value);
          return getDataType(_value) != svenum.datatypes.number ? "'" + _value + "'" : _value;
        });
      }
    }
    let _function = propByString(app.dataset, content);
    if (_function) {
      _function.call(app.dataset, event);
    } else {
      runFunctionByName(content, event, app);
    }
  } catch (ex) {
    console.warn(ex);
  }
}
//#endregion