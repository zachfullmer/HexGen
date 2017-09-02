define(
    function () {
        var parseXml;
        if (typeof window.DOMParser != "undefined") {
            parseXml = function (xmlStr) {
                return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
            };
        }
        else if (typeof window.ActiveXObject != "undefined" &&
            new window.ActiveXObject("Microsoft.XMLDOM")) {
            parseXml = function (xmlStr) {
                var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(xmlStr);
                return xmlDoc;
            };
        }
        else {
            throw new Error("No XML parser found");
        }
        function get(parent, childTag) {
            let children = parent.childNodes;
            let filteredChildren = Array.from(children).filter((child) => {
                return child.tagName == childTag;
            })
            return filteredChildren;
        }
        function getFirstChild(n) {
            var y = n.firstChild;
            if (y === null) {
                return null;
            }
            while (y.nodeType != 1) {
                y = y.nextSibling;
                if (y === null) {
                    return null;
                }
            }
            return y;
        }
        function nextSibling(n) {
            var y = n.nextSibling;
            if (y === null) {
                return null;
            }
            while (y.nodeType != 1) {
                y = y.nextSibling;
                if (y === null) {
                    return null;
                }
            }
            return y;
        }
        return {
            parse: parseXml,
            get: get,
            getFirstChild: getFirstChild,
            nextSibling: nextSibling
        };
    }
);