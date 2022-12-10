import {
    attrmapper,
    renderBrackets,
    buildTempReference,
    findPropertiestIntoHtml,
    getPropertiesFromScript,
    replaceHtmlNode,
    cleanScriptReferences
} from "./setup.js";
import { getErrorMessage } from '../salsaverde.js';

export class vNode {

    constructor(reference) {
        /**type of vnode based on framework commands*/
        this.type = reference.nodeType;
        /**unique id randomly generated */
        this.id = (this.type ? this.type.toString() : "") + uniqueID();
        /**connection with dom element that contains framework reference */
        this.reference = reference;
        /**clone of reference for original properties storage */
        this.backup = reference.cloneNode(true);
        /**list of parameters that connect reference to app data */
        this.properties = [];
        /**element tree */
        this.children = [];
        /**list of framework commands of the element */
        this.commands = [];
        /**get if element has commands or brackets components */
        this.static = false;
        /**Content of element */
        this.text = reference.nodeValue;
        this.setup();
    }

    setup() {
        //Check framework commands and store them
        this.checkElementCommands();
        //Get if node has rendering elements
        this.static = !this.commands.length &&
            !this.checkElementAttributes() &&
            !this.checkNodeValue();
        //get all node children and store them as vNode
        let _children = this.reference.childNodes;
        for (const node of _children) {
            this.children.push(new vNode(node));
        }
    }
    render(app) {
        try {
            //render only if element has dynamic content
            if (!this.static) {
                //render method based on type
                switch (this.type) {
                    case Node.ELEMENT_NODE:
                        this.loadAttributes(app);
                        for (const com of this.commands) {
                            com.render(app);
                        }
                        break;
                    case Node.TEXT_NODE:
                        this.loadInnerText(app); break;
                }
            }
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE8", "<vnode> " + ex));
        }

        for (const child of this.children) {
            child.render(app);
        }
    }
    /**check commands declared into element */
    checkElementCommands() {
        if (this.type == Node.ELEMENT_NODE) {
            let _if = [];
            let _for = [];
            let _model = [];
            let _on = [];
            let _attributes = this.backup.getAttributeNames();
            for (const attr of _attributes) {
                switch (attr) {
                    case attrmapper.get(svenum.commands.if): _if.push(new svIf(this.reference)); break;
                    case attrmapper.get(svenum.commands.for): _for.push(new svFor(this.reference)); break;
                    case attrmapper.get(svenum.commands.model): _model.push(new svModel(this.reference)); break;
                    case attrmapper.get(svenum.commands.on): _on.push(new svOn(this.reference)); break;
                }
            }
            this.commands = mergeArrays(_if, _for, _model, _on);
        }
    }
    /**check brackets on attributes */
    checkElementAttributes() {
        if (this.type == Node.ELEMENT_NODE) {
            let _attrs = this.reference.attributes;
            for (const attr of _attrs) {
                if (attr.nodeValue.match(svenum.regex.brackets)) return true;
            }
        }
        return false;
    }
    /**Check brackets in nodeValue */
    checkNodeValue() {
        return this.text && this.text.match(svenum.regex.brackets) ? true : false;
    }
    /**Render brakets content in element's inner text */
    loadAttributes(app) {
        let _attributes = this.reference.getAttributeNames();
        for (const attr of _attributes) {
            this.reference.setAttribute(attr, renderBrackets(attr, app));
        }
    }
    /**Render nodeValue */
    loadInnerText(app) {
        this.reference.nodeValue = renderBrackets(this.text, app);
    }
}

class command {
    constructor(reference, command) {
        this.reference = reference;
        this.backup = reference.cloneNode();
        this.command = command;
        this.attribute = this.command != null ? this.reference.getAttribute(attrmapper.get(this.command)) : "";
        this.setup();
    }
    setup() {
        if (this.command != null) this.reference.removeAttribute(attrmapper.get(this.command));
    }
}
/**Virtual Node for <model> command */
export class svModel extends command {
    constructor(reference) {
        super(reference, svenum.commands.model);
    }
    render(app) {
        try {
            let _value = propByString(app.dataset, this.attribute);
            switch (this.backup.nodeName) {
                case "INPUT": case "TEXTAREA":
                    if (this.reference.value != _value) this.reference.value = _value;
                    refreshValue(this.reference, this.attribute);
                    break;
                case "SELECT":
                    if (this.reference.selectedIndex != _value) this.reference.selectedIndex = _value;
                    refreshValue(this.reference, this.attribute);
                    break;
                default:
                    this.reference.innerText = app.format(_value);
                    this.reference.removeAttribute(attrmapper.get(this.command));
                    break;
            }
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE8", "<model> " + this.attribute + " - " + ex.message));
        }

        function refreshValue(reference, props) {
            if (reference.hasAttribute(attrmapper.get(svenum.commands.model))) {
                reference.addEventListener("keyup", function (e) {
                    app.dataset[props] = this.value;
                    // propByString(app.dataset, props, this.value);
                    if (reference.hasAttribute(attrmapper.get(svenum.commands.model))) reference.removeAttribute(attrmapper.get(svenum.commands.model));
                });
            }
        }
    }
}
/**Virtual Node for <for> command */
export class svFor extends command {
    /**Get list of attributes [0] -> prefix; [1] -> data name */
    get attributes() {
        return this.attribute.split(" in ");
    }
    constructor(reference) {
        super(reference, svenum.commands.for);
        this.iters = [this.reference];
    }
    setup() {
        super.setup();
        try {
            this.filter = this.reference.getAttribute(attrmapper.get(svenum.commands.filter));
            this.sort = this.reference.getAttribute(attrmapper.get(svenum.commands.sort));
            this.reference.removeAttribute(attrmapper.get(svenum.commands.filter));
            this.reference.removeAttribute(attrmapper.get(svenum.commands.sort));
            this.template = this.reference.outerHTML;
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7", "<for> " + ex.message));
        }
    }
    render(app) {
        let _me = this;
        let _iters = [];
        try {
            reset();
            let _value = duplicateArray(propByString(app.dataset, this.attributes[1]));
            if (this.sort) _value = sort(_value, this.sort);
            if (this.filter) _value = filter(_value, this.filter);
            for (let i = 0; i < _value.length; i++) {
                let _node = this.backup.cloneNode(true);
                let _iter = cleanContent(this.template, i);
                _node.outerHTML = renderBrackets(_iter, app);
                _iters.push(_node);

                this.reference.before(_node);
            }
            replaceHtmlNode(document.getElementById(this.id), _node);
            return _iters;
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE8", "<for> " + ex.message));
        }

        function sort(array, sort) {
            if (array && sort) {
                let _param = sort.replace(" desc", "").replace(_me.attributes[0] + ".", "").replace(_me.attributes[0], "").trim();
                return array.sort(dynamicSort(_param, sort.includes("desc")));
            }
            return array;
        }
        function filter(array, condition) {
            if (array && condition) {
                return array.filter(e => {
                    let _function = "return " + cleanScriptReferences(condition, _me.attributes[1], _me.attributes[0], array.indexOf(e));
                    return runFunctionByName(_function, null, app);
                });
            }
            return array;
        }

        function cleanContent(content, i) {
            return content.replace(svenum.regex.brackets, function (match) {
                return cleanScriptReferences(match.replace(new RegExp(":index"), i), _me.attributes[1], _me.attributes[0], i);
            });
        }
    }

    reset() {
        let _temp = buildTempReference(this.id);
        this.reference.before(_temp);
        replaceHtmlNode(this.reference,);
        for (const iter of this.iters) {
            if (iter) iter.remove();
        }
        this.iters = [];
        this.reference = _temp;
    }
}
/**Virtual Node for <if, elseif and else> command */
export class svIf extends command {
    /**Get list of attributes */
    get attributes() {
        return this.attribute.split(" -> ");
    }
    constructor(reference, type = svenum.commands.if) {
        super(reference, type);
    }
    /**Store block of references and replace dom element with a temporary reference */
    setup() {
        super.setup();
        try {
            this.properties = getPropertiesFromScript(this.attributes[0]);
            if (this.attribute && this.command == svenum.commands.if) {
                this.block = [{ type: svenum.commands.if, template: this.reference }];
                let _next = this.reference.nextElementSibling;
                while (_next && !_next.hasAttribute(attrmapper.get(this.command))) {
                    if (_next.hasAttribute(attrmapper.get(svenum.commands.elseif))) {
                        let _attr = _next.getAttribute(attrmapper.get(svenum.commands.elseif));
                        let _props = getPropertiesFromScript(_attr);
                        for (const prop of _props) { if (!this.properties.includes(prop)) this.properties.push(prop); }
                        this.block.push({ type: svenum.commands.elseif, template: _next });
                    } else if (_next.hasAttribute(attrmapper.get(svenum.commands.else))) {
                        this.block.push({ type: svenum.commands.else, template: _next });
                    }
                    let _temp = _next;
                    _next = _next.nextElementSibling;
                    _temp.remove();
                }
            }
            replaceHtmlNode(this.reference, buildTempReference(this.id));
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7", "<if> " + ex.message));
        }
    }
    /**Replace reference with the valid block element in accord with app data*/
    render(app) {
        try {
            replaceHtmlNode(this.reference, buildTempReference(this.id));
            for (const item of this.block) {
                let _attr = item.template.getAttribute(attrmapper.get(item.type));
                if (item.type == svenum.commands.else ? true : runFunctionByName("return " + _attr.split(" in ")[0], null, app)) {
                    let _template = item.template.cloneNode(true);
                    _template.removeAttribute(attrmapper.get(item.type));
                    replaceHtmlNode(document.getElementById(this.id), _template);
                    this.reference = _template;
                    break;
                }
            }
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE8", "<if> " + ex.message));
        }
    }
}
/**Virtual node for attaching dynamic events statement */
export class svOn extends command {
    get attributes() {
        return this.attribute.split(" -> ");
    }
    constructor(reference) {
        super(reference, svenum.commands.on);
    }
    setup() {
        super.setup();
        try {
            this.properties = this.attributes[1].match(svenum.regex.reference, function (match) { return getPathFromTag(match); });
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7", "<on> " + ex));
        }
    }
    render(app) {
        let _me = this;
        let _event = this.attributes[0];
        let _function = function (e) { return runFunctionByName(_me.attributes[1], e, app); };
        if (this.reference.hasAttribute(attrmapper.get(this.command))) {
            this.reference.addEventListener(_event, _function);
            this.reference.removeAttribute(attrmapper.get(this.command));
        }
    }
}