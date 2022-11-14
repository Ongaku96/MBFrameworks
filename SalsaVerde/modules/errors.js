/**list of common client errors */
export const errortype = {
    /**The server cannot or will not process the request due to an apparent client error */
    badrequest: "#400",
    /**Authentication is required and has failed or has not yet been provided */
    unauthorized: "#401",
    paymentrequest: "#402",
    /**The request contained valid data and was understood by the server, but the server is refusing action */
    forbidden: "#403",
    /**The requested resource could not be found but may be available in the future */
    notfound: "#404",
    /**A request method is not supported for the requested resource */
    methodnotallowed: "#405",
    /**The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request */
    notacceptable: "#406",
    /**The client must first authenticate itself with the proxy. */
    proxyauthenticationrequired: "#407",
    /**The server timed out waiting for the request */
    requesttimeout: "#408",
    /**Indicates that the request could not be processed because of conflict in the current state of the resource */
    conflict: "#409",
    /**Indicates that the resource requested was previously in use but is no longer available and will not be available again */
    gone: "#410"
}
/**Collection of the framework errors with details*/
export var sverrors = new Map();
sverrors.set("SVE1", "No application with the name {0} has been found");
sverrors.set("SVE2", "Cannot cook item {0}. Cooking instruction not found.");
sverrors.set("SVE3", "Server connection timeout for the component {0}");
sverrors.set("SVE4", "The Spice {0} ran into a problem while running: {1}");
sverrors.set("SVE5", "An error occurred in the conversion of the json to Spice: {0}");

export function stampError(type, code) {
    return type + "-" + sverrors.get(code);
}