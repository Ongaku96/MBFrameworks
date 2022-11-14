import __server from './server.js';
import __snack from "./snack.js";
import * as __error from "./errors.js";

const clickid = "sv-click";

/**Setup all the in tag references of the html */
export function setTheTable(app) {
  setHtmlReferences(app.name, app.dataset);
  setComponents(app.coockbook);
  clickevent(app.target);
}

/**Get all framework click tag into the app and set the events */
function clickevent(target) {
  if (target) {
    let _items = target.querySelectorAll("[" + clickid + "]");
    if (_items.length > 0) {
      for (let i = 0; i < _items.length; i++) {
        setTagEvent("click", _items[i], clickid);
      }
    }
  }
}

/**Refresh the element tag event */
export function setTagEvent(event, item, attribute) {
  let _script = item.getAttribute(attribute);
  let _func = () => { runFunctionByName(_script); };
  item.removeEventListener(event, _func);
  item.addEventListener(event, _func);
}
/**Connect data to html elements */
export function getProxy(name, data) {
  if (name && data) {
    let _handler = {
      set(target, prop, value, receiver) {
        let _name = name + "-" + prop;
        let _nodes = document.getElementsByName(_name);
        for (let n = 0; n < _nodes.length; n++) {
          _nodes[n].innerHTML = value;
        }
        target[prop] = value;
        return true;
      }
    }
    return new Proxy(data, _handler);
  }
  return null;
}
/**convert html data references to value */
function setHtmlReferences(name, data) {
  if (name && data) {
    var _keys = Object.keys(data);
    for (let d = 0; d < _keys.length; d++) {
      let _name = name + "-" + _keys[d];
      let _key = "{{ " + _keys[d] + " }}";
      document.getElementById(name).innerHTML = document.getElementById(name).innerHTML.replace(new RegExp(_key, 'g'), "<span name='" + _name + "'>" + data[_keys[d]] + "</span>");
    }
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