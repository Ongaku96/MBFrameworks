import { createTemplate, BaseRecipe } from "../modules/template.js";

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
    "<div class='snackbar'>{{message}}</div>"
);

export class SnackHTMLElement extends HTMLElement {
  constructor() {
    super();
    const templateContent = snack_template.content;
    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(templateContent.cloneNode(true));
  }

  cook(message, type, ...spices){
    let _page = document.getElementsByTagName("body").innerHtml(this.component);
    let _clone = this.component.content.cloneNode(true);
    _clone.innerHtml = _clone.innerHtml.replace("{{message}}", message);
    _page.appendChild(_clone);
  }
}

/**Snacks allow on-screen messages to appear.
 * It needs to be build a text message, the type given by 'snacktype' enumerator and optionally a list of actions to perform as buttons */
export class Snack extends BaseRecipe {
  constructor() {
    super();
    this.message;
    this.type;
    this.spices;

    this.component = new SnackHTMLElement();
  }

  static eat(message, type, ...spices) {
    let _snack = new Snack();
    _snack.component.cook(message, type, spices);
  }
}
