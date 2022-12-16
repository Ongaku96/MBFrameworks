import {
    attrmapper,
    renderBrackets,
    buildTempReference,
    elaborateContent,
    runFunctionByString,
    replaceHtmlNode,
    getPropertiesFromScript
} from "./setup.js";
import { getErrorMessage } from '../salsaverde.js';
/**Virtual Node for framework reference */
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
        /**list of node attributes */
        this.attributes = reference.attributes;
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
        try {
            this.findAttributes();
            //Check framework commands and store them
            this.checkElementCommands();
            //Get if node has rendering elements
            this.static = !this.commands.length && !this.properties.length;
            //get all node children and store them as vNode
            if (!this.commands.find(c => c.command == svenum.commands.for)) {
                let _children = this.reference.childNodes;
                for (const node of _children) {
                    if (node) {
                        this.children.push(new vNode(node));
                    }
                }
            }
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7", "<vnode> " + ex));
        }
    }
    render(app, target) {
        try {
            //render only if element has dynamic content
            if (!this.static && (!target || (target && this.properties.includes(target)))) {
                //render method based on type
                switch (this.type) {
                    case Node.ELEMENT_NODE:
                        this.loadAttributes(app);
                        for (const com of this.commands) {
                            com.render(app);
                        }
                        break;
                    case Node.TEXT_NODE: case Node.COMMENT_NODE:
                        this.loadInnerText(app); break;
                }
            }
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE8", "<vnode> " + ex));
        }

        for (const child of this.children) {
            child.render(app, target);
        }
    }

    /**check commands declared into element */
    checkElementCommands() {
        let _me = this;
        if (this.type == Node.ELEMENT_NODE) {
            let _if = [];
            let _for = [];
            let _model = [];
            let _on = [];
            let _attributes = this.backup.getAttributeNames();
            for (const attr of _attributes) {
                let _item = prepareAttribute(attr);
                switch (_item.command) {
                    case attrmapper.get(svenum.commands.if): _if.push(new svIf(this)); break;
                    case attrmapper.get(svenum.commands.bind): _on.push(new svBind(this, _item)); break;
                    case attrmapper.get(svenum.commands.for): _for.push(new svFor(this)); break;
                    case attrmapper.get(svenum.commands.model): _model.push(new svModel(this)); break;
                    case attrmapper.get(svenum.commands.on): _on.push(new svOn(this, _item)); break;
                }
            }
            this.commands = mergeArrays(_if, _for, _model, _on);
        }

        function prepareAttribute(attr) {
            if (attr) {
                let _temp = attr.charAt(0) === ':' ?
                    attrmapper.get(svenum.commands.bind) + attr :
                    attr.replace("@", attrmapper.get(svenum.commands.on) + ":");
                let _cmd = _temp.split(":");
                let _attributes = _cmd.length > 1 ? _cmd[1].split(".") : [_cmd[0]];
                return {
                    command: _cmd[0],
                    attribute: _attributes[0],
                    modifiers: _attributes.length > 0 ? _attributes.subarray(1) : [],
                    value: _me.backup.attributes[attr].nodeValue,
                    name: attr
                };
            }
            return { command: null };
        }
    }
    /**Check brackets in nodeValue */
    findAttributes() {
        let _me = this;
        checkNodeValue(this.text);
        if (this.type == Node.ELEMENT_NODE) checkAttributes(this.attributes);

        function checkNodeValue(text) {
            if (text) {
                let _matches = [...text.matchAll(svenum.regex.brackets)];
                for (const m of _matches) {
                    let _props = getPropertiesFromScript(m[0]);
                    for (const p of _props) {
                        _me.addProperties(p);
                    }
                }
            }
        }
        function checkAttributes(attributes) {
            for (const attr of attributes) {
                checkNodeValue(attr.nodeValue);
            }
        }
    }
    /**Render brakets content in element's inner text */
    loadAttributes(app) {
        let _attributes = this.reference.attributes;
        for (const attr of _attributes) {
            this.reference.setAttribute(attr.nodeName, renderBrackets(attr.nodeValue, app));
        }
    }
    /**Render nodeValue */
    loadInnerText(app) {
        this.reference.nodeValue = renderBrackets(this.text, app);
    }

    addProperties(...props) {
        for (const prop of props) {
            if (prop && !this.properties.includes(prop)) this.properties.push(prop);
        }
    }
}
/**Interface for framework commands */
class command {

    get check_attribute() {
        return this.name && this.reference.hasAttribute(this.name);
    }

    constructor(vnode, command) {
        this.node = vnode;
        this.reference = this.node.reference;
        this.backup = this.node.backup;
        this.command = command;
        this.name = attrmapper.get(this.command);
        this.attribute = this.check_attribute ? this.reference.getAttribute(this.name) : "";
        this.setup();
    }
    setup() {
        if (this.check_attribute) this.reference.removeAttribute(this.name);
        this.setProperties();
    }
    replaceReference(temp = null) {
        let _temp = temp ? temp : buildTempReference(this.node.id);
        if (replaceHtmlNode(this.reference, _temp)) this.reference = _temp;
    }

    setProperties() {
        let _props = getPropertiesFromScript(this.attribute);
        for (const p of _props) {
            this.node.addProperties(p);
        }
    }
}
/**Virtual Node for <model> command */
export class svModel extends command {

    get input() {
        return this.backup.nodeName == "INPUT" || this.backup.nodeName == "TEXTAREA" || this.backup.nodeName == "SELECT";
    }
    constructor(vnode) {
        super(vnode, svenum.commands.model);
        this.value = this.reference.getAttribute("value");
        if (this.input) this.reference.setAttribute("trigger", "notset");
    }
    render(app) {
        let _me = this;
        try {
            let _value = propByString(app.dataset, this.attribute);
            if (_value != null)
                switch (this.backup.nodeName) {
                    case "INPUT": case "TEXTAREA":
                        let _type = this.reference.getAttribute("type");
                        switch (_type) {
                            case "checkbox": case "radio":
                                let _checked = this.value != null ?
                                    (getDataType(_value) == svenum.datatypes.array ? _value.includes(this.value) : _value == this.value) : _value;
                                this.reference.checked = _checked;
                                break;
                            default: this.reference.value = _value; break;
                        }
                        refreshValue(this.reference, this.attribute);
                        break;
                    case "SELECT":
                        this.reference.value = _value;
                        refreshValue(this.reference, this.attribute);
                        break;
                    default:
                        if (this.reference.contentEditable || this.reference.designMode == "on") {
                            refreshValue(this.reference, this.attribute);
                        }
                        this.reference.innerHTML = app.format(_value);
                        break;
                }
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE8", "<model> " + this.attribute + " - " + ex.message));
        }

        function refreshValue(reference, props) {
            if (reference.hasAttribute("trigger")) {
                reference.addEventListener("input", function (evt) {
                    let _type = this.getAttribute("type");
                    let _nodename = this.nodeName;
                    switch (_nodename) {
                        case "SELECT":
                            if (getDataType(app.dataset[props]) == svenum.datatypes.array) {
                                if (app.dataset[props].includes(this.value)) {
                                    app.dataset[props] = app.dataset[props].filter(e => e !== this.value);
                                } else {
                                    app.dataset[props].push(this.value);
                                }
                            } else {
                                app.dataset[props] = this.value;
                            }
                            break;
                        default:
                            switch (_type) {
                                case "checkbox": case "radio":
                                    if (_me.value) {
                                        if (getDataType(app.dataset[props]) == svenum.datatypes.array) {
                                            if (_type == "radio") app.dataset[props] = [];
                                            if (app.dataset[props].includes(_me.value)) {
                                                app.dataset[props] = app.dataset[props].filter(e => e !== _me.value);
                                            } else {
                                                app.dataset[props].push(_me.value);
                                            }
                                        } else {
                                            app.dataset[props] = this.checked ? _me.value : "";
                                        }
                                    } else {
                                        app.dataset[props] = this.checked;
                                    }
                                    break;
                                default: app.dataset[props] = this.value; break;
                            }
                            break;
                    }
                });
                reference.removeAttribute("trigger");
            }
        }
    }
}
/**Virtual node for attaching dynamic events statement */
export class svOn extends command {
    constructor(vnode, setup) {
        super(vnode, svenum.commands.on);
        this.event = setup.attribute;
        this.attribute = setup.value;
        this.reference.removeAttribute(setup.name);
        this.reference.setAttribute("trigger", "notset");
    }

    render(app) {
        let _me = this;
        let _function = function (evt) {
            elaborateContent(_me.attribute, app, evt);
        };
        if (this.reference.hasAttribute("trigger")) {
            this.reference.addEventListener(this.event, _function);
            this.reference.removeAttribute("trigger");
        }
    }
}
/**Virtual node for binding html attributes */
export class svBind extends command {

    constructor(reference, setup) {
        super(reference, svenum.commands.bind);
        this.attribute = setup.attribute;
        this.value = setup.value
        this.reference.removeAttribute(setup.name);
    }

    setup() {

    }
    render(app) {
        this.reference.setAttribute(this.attribute, elaborateContent(this.value, app));
    }

    setProperties() {
        let _props = getPropertiesFromScript(this.value);
        for (const p of _props) {
            this.node.addProperties(p);
        }
    }

}
/**Virtual Node for <for> command */
export class svFor extends command {
    /**Get list of attributes [0] -> prefix; [1] -> data name */
    get attributes() {
        return this.attribute.split(" in ");
    }
    constructor(vnode) {
        super(vnode, svenum.commands.for);
        this.iters = [];
    }
    setup() {
        try {
            this.filter = this.reference.getAttribute(attrmapper.get(svenum.commands.filter));
            this.sort = this.reference.getAttribute(attrmapper.get(svenum.commands.sort));
            this.reference.removeAttribute(attrmapper.get(svenum.commands.filter));
            this.reference.removeAttribute(attrmapper.get(svenum.commands.sort));
            super.setup();
            this.template = this.reference.outerHTML;
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7", "<for> " + ex.message));
        }
    }
    render(app) {
        let _me = this;
        try {
            this.reset();
            let _value = duplicateArray(propByString(app.dataset, this.attributes[1]));
            if (this.sort) _value = sort(_value, this.sort);
            for (let i = 0; i < _value.length; i++) {
                if (filter(this.filter, _value[i], i)) {
                    let _html = renderBrackets(this.template, app, null, [
                        { prefix: this.attributes[0], value: _value[i] },
                        { prefix: ":index", value: i }
                    ]);
                    let _iter = htmlToElement(_html);
                    this.reference.before(_iter);
                    this.iters.push(_iter);
                }
            }
            if (this.iters.length > 0) {
                this.reference.remove();
                this.reference = this.iters[0];
            }
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
        function filter(condition, item, i) {
            if (condition) {
                // let _function = "return " + cleanScriptReferences(condition.replace(new RegExp(":index"), i), _me.attributes[1], _me.attributes[0], i);
                let _function = "return " + condition.replace(new RegExp(":index"), i).replace(new RegExp(_me.attributes[0], "g"), "this");
                return runFunctionByString(_function, item);
            }
            return true;
        }
        function htmlToElement(html) {
            var template = document.createElement('template');
            html = html.trim(); // Never return a text node of whitespace as the result
            template.innerHTML = html;
            return template.content.firstChild;
        }
    }
    reset() {
        let _temp = buildTempReference(this.node.id);
        this.reference.before(_temp);
        this.reference.remove();
        this.reference = _temp;
        for (const iter of this.iters) {
            if (iter) iter.remove();
        }
        this.iters = [];
    }
    setProperties() {
        if (this.attributes.length > 0) this.node.addProperties(this.attributes[1]);

        let _matches = [...this.backup.innerHTML.matchAll(svenum.regex.brackets)];
        for (const m of _matches) {
            let _props = getPropertiesFromScript(m[0]);
            for (const p of _props) {
                if (!p.includes(this.attributes[0])) {
                    this.node.addProperties(p);
                }
            }
        }
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
        let _me = this;
        try {
            this.block = [];
            let _next = addBlockItem(svenum.commands.if, this.reference, false);
            while (_next) {
                if (_next.hasAttribute(attrmapper.get(svenum.commands.elseif))) {
                    _next = addBlockItem(svenum.commands.elseif, _next, true);
                } else if (_next.hasAttribute(attrmapper.get(svenum.commands.else))) {
                    _next = addBlockItem(svenum.commands.else, _next, true);
                } else {
                    _next = _next.nextElementSibling;
                }
            }
            super.replaceReference();
            super.setup();
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE7", "<if> " + ex.message));
        }

        function addBlockItem(type, element, remove) {
            _me.block.push({ type: type, template: element, script: element.getAttribute(attrmapper.get(type)) });
            let _temp = element;
            element = element.nextElementSibling;
            if (remove) _temp.remove();
            return element;
        }
    }
    /**Replace reference with the valid block element in accord with app data*/
    render(app) {
        try {
            this.replaceReference(elaborate(this.block, this.node.id));
        } catch (ex) {
            console.error(getErrorMessage(svenum.errortype.methodnotallowed, "SVE8", "<if> " + ex.message));
        }

        function elaborate(block, id) {
            let _node = buildTempReference(id);
            for (const item of block) {
                if (item.type == svenum.commands.else ? true : runFunctionByName("return " + item.script, null, app)) {
                    _node = item.template.cloneNode(true);
                    _node.removeAttribute(attrmapper.get(item.type));
                    break;
                }
            }
            return _node;
        }
    }

    setProperties() {
        for (const item of this.block) {
            let _props = getPropertiesFromScript(item.script);
            for (const p of _props) {
                this.node.addProperties(p);
            }
        }
    }
}