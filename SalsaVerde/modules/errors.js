/**Collection of the framework errors with details*/
export var sverrors = new Map();
sverrors.set("SVE1", "No application with the name {0} has been found");
sverrors.set("SVE2", "Cannot cook item {0}. Cooking instruction not found.");
sverrors.set("SVE3", "Server connection timeout for the component {0}");
sverrors.set("SVE4", "The Spice {0} ran into a problem while running: {1}");
sverrors.set("SVE5", "An error occurred in the conversion of the json to Spice: {0}");
sverrors.set("SVE6", "Impossible to load the framework: {0}");

export function stampError(type, code) {
    return type + "-" + sverrors.get(code);
}