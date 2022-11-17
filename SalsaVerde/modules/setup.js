import __server from './server.js';
import __snack from "./snack.js";
import * as __error from "./errors.js";

const clickid = "sv-click";

/**Setup all the in tag references of the html */
export function setTheTable(app, data) {
  setHtmlReferences(app, data);
  setComponents(app.coockbook);
}
/**Refresh the element tag event */
export function setTagEvent(event, item, attribute) {
  let _script = item.getAttribute(attribute);
  let _func = () => { runFunctionByName(_script); };
  item.removeEventListener(event, _func);
  item.addEventListener(event, _func);
}
/**Get all framework click tag into the app and set the events */
function clickevent(target) {
  if (target) {
    setupOnSelector(target);
    setupEventShorts(target);
  }

  function setupOnSelector() {
    for (const event of eventmapper) {

      let _selector = eventmapper.keys[i];
      let _event = eventmapper.get(_key);
  
      let _items = target.querySelectorAll("[" + _selector + "]");
      if (_items.length > 0) {
        for (let i = 0; i < _items.length; i++) {
          setTagEvent(_event, _items[i].getAttribute(_selector));
        }
      }
    }
  }
  function setupEventShorts(target) {
    let _items = target.querySelectorAll("[" + on_attribute + "]");
    if (_items.length > 0) {
      for (let i = 0; i < _items.length; i++) {
        let _attribute = _items[i].getAttribute(on_attribute);
        if (_attribute) {
          let _split = _attribute.split(" -> ");
          setTagEvent(_split[0], _split[1]);
      }
    }
  }
}
/**convert html data references to value */
function setHtmlReferences(app, data) {
  if (app && data) {
    var _keys = Object.keys(data);
    for (let d = 0; d < _keys.length; d++) {
      switch (_type) {
        case datatypes.array:
          let _refs = setupArray(_keys[d]);
          for(const ref of _refs){
            app.references.push(ref);
          }
          break;
        case datatypes.object: break;
        default:
      let _name = app.name + "-" + _keys;
          app.references.push({
            key: _keys[d],
            name: [_name],
            template: "<div name='" + _name + "'>{0}</div>",
            tag: ["{{ " + _keys[d] + " }}"]
      }
  }
  function setupArray(key) {
    let _elements = Array.from(document.querySelectorAll("[" + commapper[commands.for] + "]"));
    let _iterations = _elements.filter(n => n.getAttribute(commapper[commands.for]).includes(key));
    let _references = [];
    for (let i = 0; i < _iterations.length; i++) {
      let _names = app.name + "-" + key + i.toString();
      let _template = item;
      let _tags = item.innerHTML.match(regex.reference);

    }
  }
}
/**render html data reference on value change */
function renderHtmlReferences(app, name, value) {
  if (app && name) {
    let _nodes = document.getElementsByName(name);
    if (_nodes.length > 0) {
      switch (getDataType(value, datatypes)) {
        case datatypes.string: case datatypes.number: setupValues(); break;
        case datatypes.array: setupArray(); break;
        case datatypes.date: setupDate(); break;
        case datatypes.object: break;
      }
    }
  }
  function setupValues() {
    for (let n = 0; n < _nodes.length; n++) {
      _nodes[n].innerHTML = value == null ? "" : value;
    }
  }
  function setupDate() {
    for (let n = 0; n < _nodes.length; n++) {
      _nodes[n].innerHTML = value == null ? "" : value.toLocaleDateString();
    }
  }
  function setupArray() {
    for (let n = 0; n < value.length; n++) {
      let _items = document.getElementsByName(name + "[" + n.toString() + "]");
      for (const item of _items) {
        item.innerHTML = value[n];
      }
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

function addReference(data, name, template, path) {
  data.references.push({
    name: name,
    template: template,
    datapath: path
  });
}