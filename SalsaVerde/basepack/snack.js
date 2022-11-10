import { createTemplate } from "../script/template.js";

const snack_template = createTemplate(
  "<style>" +
    ".snackbar{" +
      "position: absolute;" +
      "bottom: 0;" +
      "right: 0;" +
      "border-radius: 8px;" +
      "border: 1px solid black;" +
    "}" +
    ".snackbar.success{" +
      "background-color: green;" +
    "}" +
    ".snackbar.warning{" +
      "background-color: yellow;" +
    "}" +
    ".snackbar.danger{" +
      "background-color: red;" +
    "}" +
    "</style>" +
    "<div class='snackbar'>TEST TEMPLATE</div>"
);

class SnackHTMLElement extends HTMLElement {
  constructor(message, type) {
    super();
    const templateContent = snack_template.content;
    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(templateContent.cloneNode(true));
  }
}

/**enumerator of on-screen message types */
snacktype = {
  success: 0,
  warning: 1,
  danger: 2,
  server: 3,
};
/**Snacks allow on-screen messages to appear.
 * It needs to be build a text message, the type given by 'snacktype' enumerator and optionally a list of actions to perform as buttons */
class Snack extends BaseRecipe {
  constructor() {
    super();
    this.message;
    this.type;
    this.spices;

    this.component = new SnackHTMLElement(this.message, this.type);
  }

  static eat(message, type, ...spices) {
    alert(message);
  }
}
