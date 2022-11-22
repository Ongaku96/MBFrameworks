import __server from './server.js';
import __snack from "./snack.js";
import * as __error from "./errors.js";
import { getErrorMessage } from '../salsaverde.js';

//#region REFERENCES
const eventmapper = new Map();
eventmapper.set(svenum.triggers.click, "click");
eventmapper.set(svenum.triggers.change, "change");
eventmapper.set(svenum.triggers.load, "load");
eventmapper.set(svenum.triggers.submit, "submit");
eventmapper.set(svenum.triggers.edit, "change textInput input keyup");
eventmapper.set(svenum.triggers.hover, "hover");

const prefix = "_";
const custommapper = new Map();
custommapper.set(svenum.commands.for, prefix + "for");
custommapper.set(svenum.commands.on, prefix + "on");
custommapper.set(svenum.commands.name, prefix + "name");
custommapper.set(svenum.commands.if, prefix + "if");
custommapper.set(svenum.commands.elseif, prefix + "elseif");
custommapper.set(svenum.commands.else, prefix + "else");
custommapper.set(svenum.commands.filter, prefix + "filter");
custommapper.set(svenum.commands.sort, prefix + "sort");
//#endregion

//#region SETUP
/**Setup all the in tag references of the html */
export function setTheTable(app, data) {
  setComponents(app.coockbook);
  setHtmlReferences(app, data);
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
function setHtmlReferences(app, data) {
  if (app && data) {
    setupArray();
  }
  function setupArray() {
    let _elements = Array.from(app.target.querySelectorAll("[" + custommapper.get(svenum.commands.for) + "]"));
    for (let i = 0; i < _elements.length; i++) {
      try {
        let _key = getArrayParameter(_elements[i].getAttribute(custommapper.get(svenum.commands.for)), "key");
        let _name = buildName(app.name, _key, i.toString());
        let _template = _elements[i].innerHTML;
        let _tags = _template.match(svenum.regex.reference);
        _elements[i].setAttribute(custommapper.get(svenum.commands.name), _name);
        app.references.push({
          type: svenum.commands.for,
          key: _key,
          name: _name,
          template: _template,
          tag: _tags
        });
      } catch (ex) {
        console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7").format(ex));
      }
    }
  }
}
/**Create a Recoursive Proxy */
export function createOnChangeProxy(onChange, target, parent) {
  return new Proxy(target, {
    get(target, property) {
      const item = target[property];
      if (item && (getDataType(item) == svenum.datatypes.object || getDataType(item) == svenum.datatypes.array)) {
        parent = property;
        return createOnChangeProxy(onChange, item, parent);
      }
      return item;
    },
    set(target, property, newValue) {
      target[property] = newValue
      let _prop = getDataType(target) == svenum.datatypes.array ? parent : property;
      let _val = getDataType(target) == svenum.datatypes.array ? target : newValue;
      onChange(target, _prop, _val)
      return true
    },
  });
}
//#endregion

//#region RENDER
/**Refresh the element tag event */
export function addTagEventListener(item, event, script, app = null) {
  let _func = (e) => { runFunctionByName(script, e, app); };
  item.removeEventListener(event, _func);
  item.addEventListener(event, _func);
}
/**render html data reference */
export function renderHtmlReference(app, reference, value) {
  if (value != null) {
    switch (reference.type) {
      case svenum.commands.for: stampArray(); break;
    }
  }

  function stampArray() {
    let _nodes = app.target.querySelectorAll("[" + custommapper.get(svenum.commands.name) + "='" + reference.name + "']");
    for (const node of _nodes) {
      node.innerHTML = "";
      let _prefix = getArrayParameter(node.getAttribute(custommapper.get(svenum.commands.for)), "prefix");
      let _value = duplicateArray(value);
      _value = sort(_value, node.getAttribute(custommapper.get(svenum.commands.sort)), _prefix);
      _value = filter(_value, node.getAttribute(custommapper.get(svenum.commands.filter)), _prefix);
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
export function applyTagEvent(app) {
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
    let _items = app.target.querySelectorAll("[" + custommapper.get(svenum.commands.on) + "]");
    if (_items.length > 0) {
      for (let i = 0; i < _items.length; i++) {
        let _attribute = _items[i].getAttribute(custommapper.get(svenum.commands.on));
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
export function renderValues(app, data) {
  app.target.innerHTML = app.target.innerHTML.replace(svenum.regex.reference, (match) => app.format(propByString(data, match.replace("{{ ", "").replace(" }}", ""))));
}
export function renderIf(app) {
  let _elements = Array.from(app.target.querySelectorAll("[" + custommapper.get(svenum.commands.if) + "]"));
  for (const item of _elements) {
    try {
      let _attr = item.getAttribute(custommapper.get(svenum.commands.if)).split(" -> ");
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
    while (_next && !_next.hasAttribute(custommapper.get(svenum.commands.if))) {
      let _node_condition = _next;
      let _remove = false;

      if (_node_condition.hasAttribute(custommapper.get(svenum.commands.elseif))) {
        let _else_attr = _node_condition.getAttribute(custommapper.get(svenum.commands.elseif));
        let _temp_visible = runFunctionByName("return " + _else_attr, null, app);
        _remove = _visible || !_temp_visible;
        _visible = _visible ? _visible : _temp_visible;
      } else {
        _remove = _visible && _node_condition.hasAttribute(custommapper.get(svenum.commands.else));
      }

      _next = _next.nextElementSibling;
      if (_remove) _node_condition.remove();
    }
  }
}
//#endregion

//#region SUPPORT
/**Elaborate tag and return object path stored inside */
function getPathFromTag(tag, prefix) {
  try {
    return tag.replace("{{ ", "").replace(" }}", "").replace(prefix + ".", "");
  } catch (ex) { throw ex; }
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
//#endregion