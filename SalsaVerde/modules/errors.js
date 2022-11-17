
export function stampError(type, code) {
    return type + (code ? "-" + sverrors.get(code) : "");
}