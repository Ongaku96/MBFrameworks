/**Snacks allow on-screen messages to appear.
 * It needs to be build a text message, the type given by 'snacktype' enumerator and optionally a list of actions to perform as buttons */
export default class Snack {
  constructor(app) {
    this.app = app;
    this.message;
    this.type;
    this.spices;
    this.template = "<div class='snack'>{{message}}</div>";
  }

  cook(message, type, ...spices) {
    let _page = document.getElementById(this.app);
    let _clone = this.template;
    _clone = _clone.replace("{{message}}", message);
    _page.innerHTML += _clone;
  }
}
