export class Sandwich {
  #_components = [];
  constructor(name) {
    this.name = name;
  }

  cook() {
    for (let i in this.#_components) {
      this.#_components[i].do(actioncomponent.cook);
    }
  }
  component(id) {
    return this.#_components.find((c) => c.id == id);
  }
}
