const _input_change_event = "change textInput input keyup";

/**Component that represent forms */
class Cooktop extends BaseRecipe {
  constructor() {
    super();
  }

  startInputAnimation() {
    $(super.reference)
      .find(
        "sv-input > .input-container, sv-button, sv-input[is='checkbox'], sv-input[is='checkbutton'], sv-input[is='radio']"
      )
      .each(function () {
        if (getFirstParent($(this), "sv-menu").length == 0) {
          $(this).addClass("add-skeleton");
        }
      });
  }

  stopInputAnimation() {
    $(super.reference)
      .find(".add-skeleton")
      .each(function () {
        $(this).removeClass("add-skeleton");
      });
  }
}