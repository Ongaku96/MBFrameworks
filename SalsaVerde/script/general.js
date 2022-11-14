import __server from '../modules/server.js';
import __snack from "../modules/snack.js";

const clickid = "sv-click";

function startup(app) {
  clickevent(app);
}

/**get all framework click tag into the app and set the events */
function clickevent(app, single = false) {
  let _items = app.querySelectorAll("[" + clickid + "]");
  if (_items.length > 0) {
    for (let i = 0; i < _items.length; i++) {
      let _script = _items[i].getAttribute(clickid);
      _items[i].addEventListener("click", () => { eval(_script); });
    }
  }
}