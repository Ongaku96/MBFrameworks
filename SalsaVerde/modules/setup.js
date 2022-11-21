import __server from './server.js';
import __snack from "./snack.js";
import * as __error from "./errors.js";

const eventmapper = new Map();
eventmapper.set(svenum.triggers.click, "click");
eventmapper.set(svenum.triggers.change, "change");
eventmapper.set(svenum.triggers.load, "load");
eventmapper.set(svenum.triggers.submit, "submit");
eventmapper.set(svenum.triggers.edit, "change textInput input keyup");

const prefix = "_";
const custommapper = new Map();
custommapper.set(svenum.commands.for, prefix + "for");
custommapper.set(svenum.commands.on, prefix + "on");
custommapper.set(svenum.commands.name, prefix + "name");
custommapper.set(svenum.commands.if, prefix + "if");

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
    var _keys = Object.keys(data);
    for (let d = 0; d < _keys.length; d++) {
      let _type = getDataType(data[_keys[d]]);
      switch (_type) {
        case svenum.datatypes.array:
          for (const ref of setupArray(_keys[d])) {
            app.references.push(ref);
          }
          break;
        case svenum.datatypes.object: break;
        default:
          app.references.push(setupValue(_keys[d]));
          break;
      }
    }
  }
  function setupValue(key) {
    let _name = buildName(app.name, key);
    return {
      type: svenum.commands.value,
      key: key,
      name: _name,
      template: "<span " + custommapper.get(svenum.commands.name) + "='" + _name + "'>{0}</span>",
      tag: "{{ " + key + " }}"
    }
  }
  function setupArray(key) {
    let _elements = Array.from(document.querySelectorAll("[" + custommapper.get(svenum.commands.for) + "]"));
    let _iterations = _elements.filter(n => n.getAttribute(custommapper.get(svenum.commands.for)).includes(key));
    let _references = [];
    for (let i = 0; i < _iterations.length; i++) {
      let _name = buildName(app.name, key, i.toString());
      let _template = _iterations[i].innerHTML;
      let _tags = _template.match(svenum.regex.reference);
      _iterations[i].setAttribute(custommapper.get(svenum.commands.name), _name);
      _references.push({
        type: svenum.commands.for,
        key: key,
        name: _name,
        template: _template,
        tag: _tags
      });
      } catch (ex) {
        console.error(getErrorMessage(svenum.errortype.methodnotallowed, "ESV7").format(ex));
      }
    }
    return _references;
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
export function addTagEventListener(item, event, script) {
  let _func = (e) => { runFunctionByName(script, e); };
  item.removeEventListener(event, _func);
  item.addEventListener(event, _func);
}
/**render html data reference */
export function renderHtmlReference(app, reference, value) {
  if (value != null) {
    switch (getDataType(value)) {
      case svenum.datatypes.array: stampArray(); break;
      case svenum.datatypes.object: break;
      default: stampValue(); break;
    }
  }
  function stampValue() {
    let _nodes = _app_ref.querySelectorAll("[" + custommapper.get(svenum.commands.name) + "='" + reference.name + "']");
    if (_nodes.length > 0) {
      for (const node of _nodes) {
        node.innerHTML = app.format(value);
      }
    } else {
      let _html = reference.template.format(app.format(value));
      _app_ref.innerHTML = _app_ref.innerHTML.replace(new RegExp(reference.tag), _html);
    }
  }
  function stampArray() {
    let _nodes = _app_ref.querySelectorAll("[" + custommapper.get(svenum.commands.name) + "='" + reference.name + "']");
    for (const node of _nodes) {
      node.innerHTML = "";
      let _prefix = getPrefix(node.getAttribute(custommapper.get(svenum.commands.for)));
      for (let i = 0; i < value.length; i++) {
        let _html = reference.template;
        for (const t of reference.tag) {
          let _path = getPathFromTag(t, _prefix);
          let _val = _path == _prefix ? value[i] : value[i][_path];
          _html = _html.replace(new RegExp(t), app.format(_val));
        }
        _html = _html.replace(/{{ :index }}/, i.toString());
        node.innerHTML += _html;
      }
    }
  }
}
/**Get all framework click tag into the app and set the events */
export function applyTagEvent(target) {
  if (target) {
    setupOnSelector();
    setupEventShorts();
  }

  function setupOnSelector() {
    for (const event of eventmapper) {

      let _selector = event[0];
      let _event = event[1];

      let _items = target.querySelectorAll("[" + _selector + "]");
      if (_items.length > 0) {
        for (let i = 0; i < _items.length; i++) {
          addTagEventListener(_items[i], _event, _items[i].getAttribute(_selector));
        }
      }
    }
  }
  function setupEventShorts() {
    let _items = target.querySelectorAll("[" + custommapper.get(svenum.commands.on) + "]");
    if (_items.length > 0) {
      for (let i = 0; i < _items.length; i++) {
        let _attribute = _items[i].getAttribute(custommapper.get(svenum.commands.on));
        if (_attribute) {
          let _split = _attribute.split(" -> ");
          addTagEventListener(_items[i], _split[0], _split[1]);
        }
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
/**convert html data references to value */
function setHtmlReferences(app, data) {
  if (app && data) {
    var _keys = Object.keys(data);
    for (let d = 0; d < _keys.length; d++) {
      let _type = getDataType(data[_keys[d]]);
      switch (_type) {
        case svenum.datatypes.array:
          for (const ref of setupArray(_keys[d])) {
            app.references.push(ref);
          }
          break;
        case svenum.datatypes.object: break;
        default:
          app.references.push(setupValue(_keys[d]));
          break;
      }
    }
  }
  function setupValue(key) {
    let _name = app.name + "-" + key;
    return {
      key: key,
      name: _name,
      template: "<span " + custommapper.get(svenum.commands.name) + "='" + _name + "'>{0}</span>",
      tag: "{{ " + key + " }}"
    }
  }
  function setupArray(key) {
    let _elements = Array.from(document.querySelectorAll("[" + custommapper.get(svenum.commands.for) + "]"));
    let _iterations = _elements.filter(n => n.getAttribute(custommapper.get(svenum.commands.for)).includes(key));
    let _references = [];
    for (let i = 0; i < _iterations.length; i++) {
      let _name = app.name + "-" + key + i.toString();
      let _template = _iterations[i].innerHTML;
      let _tags = _template.match(svenum.regex.reference);
      _iterations[i].setAttribute(custommapper.get(svenum.commands.name), _name);
      _references.push({
        key: key,
        name: _name,
        template: _template,
        tag: _tags
      });
    }
    return _references;
  }
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
/**Elaborate tag and return object path stored inside */
function getPathFromTag(tag, prefix) {
  return tag.replace("{{ ", "").replace(" }}", "").replace(prefix + ".", "");
}
/**Get prefixes used in reading array by html tag */
function getPrefix(attribute) {
  let _split = attribute.split(" in ");
  if (_split.length > 0) return _split[0];
  return null;
}