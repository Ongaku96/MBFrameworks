export const snack_template = "<div class='snack {{type}}'>{{message}}</div>";
const snack_area_id = "snackbar";

/**Snacks allow on-screen messages to appear.
 * It needs to be build a text message, the type given by 'snacktype' enumerator and optionally a list of actions to perform as buttons */
export default class Snack {
  constructor(instructions) {
    this.app = instructions.app ? document.getElementById(instructions.app) : document.getElementById(snack_area_id);
    this.message = instructions.message;
    this.type = !instructions.type || instructions.type == svenum.snacktype.default ? "" : instructions.type;
    this.spices = instructions.spices;
    this.template = snack_template;
  }

  /**render message on page */
  cook() {
    if (this.app) {
      let _clone = this.template;
      _clone = _clone.replace("{{message}}", this.message);
      _clone = _clone.replace("{{type}}", this.type);
      this.renderSpices();
      this.app.innerHTML += _clone;
    } else {
      alert(this.message);
    }
  }
  /**build interactive buttons */
  renderSpices() {

  }

  /**Render snack on interface */
  static apply(message, type = svenum.snacktype.standard, ...spices) {
    let _snack = new Snack({
      message: message,
      type: type,
      spices: spices
    });
    _snack.cook();
  }
}
