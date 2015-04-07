/*  nwmatcher.js  Version: 1.2.3 Diego Perini <diego.perini at gmail com> freely distributable under the terms of the MIT license - http://javascript.nwbox.com/NWMatcher/MIT-LICENSE  */
(function(global){var version="nwmatcher-1.2.3",doc=global.document,root=doc.documentElement,slice=Array.prototype.slice,lastError="",lastSlice="",lastMatcher="",lastSelector="",isSingleMatch=false,isSingleSelect=false,lastMatchContext=doc,lastSelectContext=doc,prefixes="[.:#]?",operators="([~*^$|!]?={1})",whitespace="[\\x20\\t\\n\\r\\f]*",combinators="[\\x20]|[>+~][^>+~]",pseudoparms="[-+]?\\d*n?[-+]?\\d*",quotedvalue='"[^"]*"'+"|'[^']*'",encoding="(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)+",identifier="(?:-?[_a-zA-Z]{1}[-\\w]*|[^\\x00-\\xa0]+|\\\\.+)+",attributes=whitespace+"("+encoding+":?"+encoding+")"+whitespace+"(?:"+operators+whitespace+"("+quotedvalue+"|"+identifier+"))?"+whitespace,pseudoclass="((?:"+pseudoparms+"|"+quotedvalue+"|"+prefixes+"|"+encoding+"|"+"\\["+attributes+"\\]|"+"\\(.+\\)|"+whitespace+"|"+",)+)",extensions=".+",standardValidator="(?=s*[^>+~(){}<>])"+"("+"\\*"+"|(?:"+prefixes+identifier+")"+"|"+combinators+"|\\["+attributes+"\\]"+"|\\("+pseudoclass+"\\)"+"|\\{"+extensions+"\\}"+"|,"+")+",reValidator=new RegExp(standardValidator,"g"),extendedValidator=standardValidator.replace(pseudoclass,".*"),reTrimSpaces=new RegExp("^"+whitespace+"|"+whitespace+"$","g"),reSimpleNot=new RegExp("^("+"(?!:not)"+"("+prefixes+"|"+identifier+"|\\([^()]*\\))+"+"|\\["+attributes+"\\]"+")$"),skipround="\\([^()]+\\)|\\(.*\\)",skipcurly="\\{[^{}]+\\}|\\{.*\\}",skipsquare="\\[[^[\\]]*\\]|\\[.*\\]",skipgroup="\\[.*\\]|\\(.*\\)|\\{.*\\}",reSplitGroup=new RegExp("("+"[^(,)\\\\\\[\\]]+"+"|\\[(?:"+skipsquare+"|"+quotedvalue+"|[^\\[\\]]+)+\\]"+"|"+skipround+"|"+skipcurly+"|\\\\."+")+","g"),reSplitToken=new RegExp("("+"\\("+pseudoclass+"\\)|"+"\\["+attributes+"\\]|"+"[^\x20>+~]|\\\\.)+","g"),reClassValue=new RegExp("("+identifier+")"),reIdSelector=new RegExp("#("+identifier+")"),reWhiteSpace=/[\x20\t\n\r\f]+/g,reLeftContext=/^\s*[>+~]{1}/,reRightContext=/[>+~]{1}\s*$/,isNative=(function(){var s=(global.open+"").replace(/open/g,"");return function(object,method){var m=object?object[method]:false,r=new RegExp(method,"g");return !!(m&&typeof m!="string"&&s===(m+"").replace(r,""))}})(),isQuirks=function(document){return typeof document.compatMode=="string"?document.compatMode.indexOf("CSS")<0:(function(){var div=document.createElement("div"),isStrict=div.style&&(div.style.width=1)&&div.style.width!="1px";div=null;return !isStrict})()},isXML="xmlVersion" in doc?function(document){return !!document.xmlVersion||(/xml$/).test(document.contentType)||!(/html/i).test(document.documentElement.nodeName)}:function(document){return document.firstChild.nodeType==7&&(/xml/i).test(document.firstChild.nodeName)||!(/html/i).test(document.documentElement.nodeName)},isQuirksMode=isQuirks(doc),isXMLDocument=isXML(doc),NATIVE_FOCUS=isNative(doc,"hasFocus"),NATIVE_QSAPI=isNative(doc,"querySelector"),NATIVE_GEBID=isNative(doc,"getElementById"),NATIVE_GEBTN=isNative(root,"getElementsByTagName"),NATIVE_GEBCN=isNative(root,"getElementsByClassName"),NATIVE_GET_ATTRIBUTE=isNative(root,"getAttribute"),NATIVE_HAS_ATTRIBUTE=isNative(root,"hasAttribute"),NATIVE_SLICE_PROTO=(function(){var isBuggy=false,id=root.id;root.id="length";try{isBuggy=!!slice.call(doc.childNodes,0)[0]}catch(e){}root.id=id;return isBuggy})(),NATIVE_TRAVERSAL_API="nextElementSibling" in root&&"previousElementSibling" in root,BUGGY_GEBID=NATIVE_GEBID?(function(){var isBuggy=true,x="x"+String(+new Date),a=doc.createElementNS?"a":'<a name="'+x+'">';(a=doc.createElement(a)).name=x;root.insertBefore(a,root.firstChild);isBuggy=!!doc.getElementById(x);root.removeChild(a);a=null;return isBuggy})():true,BUGGY_GEBTN=NATIVE_GEBTN?(function(){var isBuggy,div=doc.createElement("div");div.appendChild(doc.createComment(""));isBuggy=div.getElementsByTagName("*")[0];div.removeChild(div.firstChild);div=null;return !!isBuggy})():true,BUGGY_GEBCN=NATIVE_GEBCN?(function(){var isBuggy,div=doc.createElement("div"),test="\u53f0\u5317";div.appendChild(doc.createElement("span")).setAttribute("class",test+"abc "+test);div.appendChild(doc.createElement("span")).setAttribute("class","x");isBuggy=!div.getElementsByClassName(test)[0];div.lastChild.className=test;if(!isBuggy){isBuggy=div.getElementsByClassName(test).length!==2}div.removeChild(div.firstChild);div.removeChild(div.firstChild);div=null;return isBuggy})():true,BUGGY_GET_ATTRIBUTE=NATIVE_GET_ATTRIBUTE?(function(){var isBuggy,input;(input=doc.createElement("input")).setAttribute("value","5");return isBuggy=input.defaultValue!=5})():true,BUGGY_HAS_ATTRIBUTE=NATIVE_HAS_ATTRIBUTE?(function(){var isBuggy,option=doc.createElement("option");option.setAttribute("selected","selected");isBuggy=!option.hasAttribute("selected");return isBuggy})():true,RE_BUGGY_QSAPI=NATIVE_QSAPI?(function(){var pattern=[],div=doc.createElement("div"),input;div.appendChild(doc.createElement("p")).setAttribute("class","xXx");div.appendChild(doc.createElement("p")).setAttribute("class","xxx");if(isQuirks(doc)&&(div.querySelectorAll("[class~=xxx]").length!=2||div.querySelectorAll(".xXx").length!=2)){pattern.push("(?:\\[[\\x20\\t\\n\\r\\f]*class\\b|\\."+identifier+")")}div.removeChild(div.firstChild);div.removeChild(div.firstChild);div.appendChild(doc.createElement("p")).setAttribute("class","");try{div.querySelectorAll('[class^=""]').length===1&&pattern.push("\\[\\s*.*(?=\\^=|\\$=|\\*=).*]")}catch(e){}div.removeChild(div.firstChild);input=doc.createElement("input");input.setAttribute("type","checkbox");input.setAttribute("checked","checked");div.appendChild(input);try{div.querySelectorAll(":checked").length!==1&&pattern.push(":checked")}catch(e){}div.removeChild(div.firstChild);(input=doc.createElement("input")).setAttribute("type","hidden");div.appendChild(input);try{div.querySelectorAll(":enabled").length===1&&pattern.push(":enabled",":disabled")}catch(e){}div.removeChild(div.firstChild);div.appendChild(doc.createElement("a")).setAttribute("href","x");div.querySelectorAll(":link").length!==1&&pattern.push(":link");div.removeChild(div.firstChild);if(BUGGY_HAS_ATTRIBUTE){pattern.push("\\[\\s*value","\\[\\s*ismap","\\[\\s*checked","\\[\\s*disabled","\\[\\s*multiple","\\[\\s*readonly","\\[\\s*selected")}div=null;return pattern.length?new RegExp(pattern.join("|")):{"test":function(){return false}}})():true,RE_SIMPLE_SELECTOR=new RegExp(!(BUGGY_GEBTN&&BUGGY_GEBCN)?"^(?:\\*|[.#]?-?[_a-zA-Z]{1}"+encoding+")$":"^#?-?[_a-zA-Z]{1}"+encoding+"$"),LINK_NODES={"a":1,"A":1,"area":1,"AREA":1,"link":1,"LINK":1},QSA_NODE_TYPES={"9":1,"11":1},ATTR_BOOLEAN={checked:1,disabled:1,ismap:1,multiple:1,readonly:1,selected:1},ATTR_DEFAULT={value:"defaultValue",checked:"defaultChecked",selected:"defaultSelected"},ATTR_MAPPING={"class":"className","for":"htmlFor"},ATTR_URIDATA={"action":2,"cite":2,"codebase":2,"data":2,"href":2,"longdesc":2,"lowsrc":2,"src":2,"usemap":2},HTML_TABLE={"class":0,"accept":1,"accept-charset":1,"align":1,"alink":1,"axis":1,"bgcolor":1,"charset":1,"checked":1,"clear":1,"codetype":1,"color":1,"compact":1,"declare":1,"defer":1,"dir":1,"direction":1,"disabled":1,"enctype":1,"face":1,"frame":1,"hreflang":1,"http-equiv":1,"lang":1,"language":1,"link":1,"media":1,"method":1,"multiple":1,"nohref":1,"noresize":1,"noshade":1,"nowrap":1,"readonly":1,"rel":1,"rev":1,"rules":1,"scope":1,"scrolling":1,"selected":1,"shape":1,"target":1,"text":1,"type":1,"valign":1,"valuetype":1,"vlink":1},XHTML_TABLE={"accept":1,"accept-charset":1,"alink":1,"axis":1,"bgcolor":1,"charset":1,"codetype":1,"color":1,"enctype":1,"face":1,"hreflang":1,"http-equiv":1,"lang":1,"language":1,"link":1,"media":1,"rel":1,"rev":1,"target":1,"text":1,"type":1,"vlink":1},Selectors={},Operators={"=":"n=='%m'","^=":"n.indexOf('%m')==0","*=":"n.indexOf('%m')>-1","|=":"(n+'-').indexOf('%m-')==0","~=":"(' '+n+' ').indexOf(' %m ')>-1","$=":"n.substr(n.length-'%m'.length)=='%m'"},Optimize={ID:new RegExp("^#("+encoding+")|"+skipgroup),TAG:new RegExp("^("+encoding+")|"+skipgroup),CLASS:new RegExp("^\\.("+encoding+"$)|"+skipgroup),NAME:/\[\s*name\s*=\s*((["']*)([^'"()]*?)\2)?\s*\]/},Patterns={spseudos:/^\:(root|empty|nth)?-?(first|last|only)?-?(child)?-?(of-type)?(?:\(([^\x29]*)\))?(.*)/,dpseudos:/^\:([\w]+|[^\x00-\xa0]+)(?:\((["']*)(.*?(\(.*\))?[^'"()]*?)\2\))?(.*)/,attribute:new RegExp("^\\["+attributes+"\\](.*)"),children:/^[\x20\t\n\r\f]*\>[\x20\t\n\r\f]*(.*)/,adjacent:/^[\x20\t\n\r\f]*\+[\x20\t\n\r\f]*(.*)/,relative:/^[\x20\t\n\r\f]*\~[\x20\t\n\r\f]*(.*)/,ancestor:/^[\x20\t\n\r\f]+(.*)/,universal:/^\*(.*)/,id:new RegExp("^#("+encoding+")(.*)"),tagName:new RegExp("^("+encoding+")(.*)"),className:new RegExp("^\\.("+encoding+")(.*)")},CSS3PseudoClasses={Structural:{"root":3,"empty":3,"nth-child":3,"nth-last-child":3,"nth-of-type":3,"nth-last-of-type":3,"first-child":3,"last-child":3,"only-child":3,"first-of-type":3,"last-of-type":3,"only-of-type":3},Others:{"link":3,"visited":3,"target":3,"lang":3,"not":3,"active":3,"focus":3,"hover":3,"checked":3,"disabled":3,"enabled":3}},concatList=function(data,elements){var i=-1,element;if(data.length===0&&Array.slice){return Array.slice(elements)}while((element=elements[++i])){data[data.length]=element}return data},concatCall=function(data,elements,callback){var i=-1,element;while((element=elements[++i])){callback(data[data.length]=element)}return data},byIdRaw=function(id,elements){var i=-1,element=null;while((element=elements[++i])){if(element.getAttribute("id")==id){break}}return element},byId=!BUGGY_GEBID?function(id,from){from||(from=doc);id=id.replace(/\\/g,"");if(isXMLDocument||from.nodeType!=9){return byIdRaw(id,from.getElementsByTagName("*"))}return from.getElementById(id)}:function(id,from){var element=null;from||(from=doc);id=id.replace(/\\/g,"");if(isXMLDocument||from.nodeType!=9){return byIdRaw(id,from.getElementsByTagName("*"))}if((element=from.getElementById(id))&&element.name==id&&from.getElementsByName){return byIdRaw(id,from.getElementsByName(id))}return element},byTagRaw=function(tag,from){var any=tag=="*",element=from,elements=[],next=element.firstChild;any||(tag=tag.toUpperCase());while((element=next)){if(element.tagName>"@"&&(any||element.tagName.toUpperCase()==tag)){elements[elements.length]=element}if(next=element.firstChild||element.nextSibling){continue}while(!next&&(element=element.parentNode)&&element!=from){next=element.nextSibling}}return elements},byTag=!BUGGY_GEBTN&&NATIVE_SLICE_PROTO?function(tag,from){from||(from=doc);return slice.call(from.getElementsByTagName?from.getElementsByTagName(tag):byTagRaw(tag,from),0)}:function(tag,from){var i=-1,data=[],element,elements=(from||doc).getElementsByTagName(tag);if(tag=="*"){var j=-1;while((element=elements[++i])){if(element.nodeName>"@"){data[++j]=element}}}else{while((element=elements[++i])){data[i]=element}}return data},byName=function(name,from){return select('[name="'+name.replace(/\\/g,"")+'"]',from||doc)},byClass=!BUGGY_GEBCN&&NATIVE_SLICE_PROTO?function(className,from){return slice.call((from||doc).getElementsByClassName(className.replace(/\\/g,"")),0)}:function(className,from){from||(from=doc);var i=-1,j=i,data=[],element,elements=byTag("*",from),host=from.ownerDocument||from,quirks=isQuirks(host),xml=isXML(host),n=quirks?className.toLowerCase():className;className=" "+n.replace(/\\/g,"")+" ";while((element=elements[++i])){n=xml?element.getAttribute("class"):element.className;if(n&&n.length&&(" "+(quirks?n.toLowerCase():n).replace(reWhiteSpace," ")+" ").indexOf(className)>-1){data[++j]=element}}return data},contains="compareDocumentPosition" in root?function(container,element){return(container.compareDocumentPosition(element)&16)==16}:"contains" in root?function(container,element){return container!==element&&container.contains(element)}:function(container,element){while((element=element.parentNode)){if(element===container){return true}}return false},getIndexesByNodeType=function(element){var i=0,indexes,id=element[CSS_INDEX]||(element[CSS_INDEX]=++CSS_ID);if(!indexesByNodeType[id]){indexes={};element=element.firstChild;while(element){if(element.nodeName>"@"){indexes[element[CSS_INDEX]||(element[CSS_INDEX]=++CSS_ID)]=++i}element=element.nextSibling}indexes.length=i;indexesByNodeType[id]=indexes}return indexesByNodeType[id]},getIndexesByNodeName=function(element,name){var i=0,indexes,id=element[CSS_INDEX]||(element[CSS_INDEX]=++CSS_ID);if(!indexesByNodeName[id]||!indexesByNodeName[id][name]){indexes={};element=element.firstChild;while(element){if(element.nodeName.toUpperCase()==name){indexes[element[CSS_INDEX]||(element[CSS_INDEX]=++CSS_ID)]=++i}element=element.nextSibling}indexes.length=i;indexesByNodeName[id]||(indexesByNodeName[id]={});indexesByNodeName[id][name]=indexes}return indexesByNodeName[id]},getAttribute=!BUGGY_GET_ATTRIBUTE?function(node,attribute){return node.getAttribute(attribute)||""}:function(node,attribute){attribute=attribute.toLowerCase();if(ATTR_DEFAULT[attribute] in node){return node[ATTR_DEFAULT[attribute]]||""}return(ATTR_URIDATA[attribute]?node.getAttribute(attribute,2)||"":ATTR_BOOLEAN[attribute]?node.getAttribute(attribute)?attribute:"":((node=node.getAttributeNode(attribute))&&node.value)||"")},hasAttribute=!BUGGY_HAS_ATTRIBUTE?function(node,attribute){return node.hasAttribute(attribute)}:function(node,attribute){attribute=attribute.toLowerCase();attribute=attribute in ATTR_MAPPING?ATTR_MAPPING[attribute]:attribute;if(ATTR_DEFAULT[attribute] in node){return !!node[ATTR_DEFAULT[attribute]]}node=node.getAttributeNode(attribute);return !!(node&&(node.specified||node.nodeValue))},isEmpty=function(node){node=node.firstChild;while(node){if(node.nodeType==3||node.nodeName>"@"){return false}node=node.nextSibling}return true},isLink=function(element){return hasAttribute(element,"href")&&LINK_NODES[element.nodeName]},compile=function(selector,mode){return compileGroup(selector,"",mode||false)},configure=function(options){for(var i in options){if(i=="VERBOSITY"){VERBOSITY=!!options[i]}else{if(i=="SIMPLENOT"){SIMPLENOT=!!options[i];HTMLResolvers={};XMLResolvers={};HTMLMatchers={};XMLMatchers={};USE_QSAPI=false;reValidator=new RegExp(extendedValidator,"g")}else{if(i=="SHORTCUTS"){SHORTCUTS=!!options[i]}else{if(i=="USE_QSAPI"){USE_QSAPI=!!options[i]&&NATIVE_QSAPI;reValidator=new RegExp(standardValidator,"g")}}}}}},emit=function(message){if(VERBOSITY){if(typeof global.DOMException!=="undefined"){var err=new Error();err.name="SYNTAX_ERR";err.message="(Selectors) "+message;err.code=12;throw err}else{throw new Error(12,"SYNTAX_ERR: (Selectors) "+message)}}else{var console=global.console;if(console&&console.log){console.log(message)}else{if(/exception/i.test(message)){global.status=message;global.defaultStatus=message}else{global.status+=message}}}},SIMPLENOT=true,SHORTCUTS=false,VERBOSITY=true,USE_QSAPI=NATIVE_QSAPI,ACCEPT_NODE="f&&f(c[k]);r[r.length]=c[k];continue main;",TO_UPPER_CASE=doc.createElement("nAv").nodeName=="nAv"?".toUpperCase()":"",compileGroup=function(selector,source,mode){var i=-1,seen={},parts,token;if((parts=selector.match(reSplitGroup))){while((token=parts[++i])){token=token.replace(reTrimSpaces,"");if(!seen[token]){seen[token]=true;source+=i>0?(mode?"e=c[k];":"e=k;"):"";source+=compileSelector(token,mode?ACCEPT_NODE:"f&&f(k);return true;")}}}if(mode){return new Function("c,s,r,d,h,g,f","var N,n,x=0,k=-1,e;main:while(e=c[++k]){"+source+"}return r;")}else{return new Function("e,s,r,d,h,g,f","var N,n,x=0,k=e;"+source+"return false;")}},compileSelector=function(selector,source){var i,a,b,n,k,expr,match,result,status,test,type;k=0;while(selector){if((match=selector.match(Patterns.universal))){i=true}else{if((match=selector.match(Patterns.id))){source="if("+(isXMLDocument?'s.getAttribute(e,"id")':'(e.submit?s.getAttribute(e,"id"):e.id)')+'=="'+match[1]+'"'+"){"+source+"}"}else{if((match=selector.match(Patterns.tagName))){source="if(e.nodeName"+(isXMLDocument?'=="'+match[1]+'"':TO_UPPER_CASE+'=="'+match[1].toUpperCase()+'"')+"){"+source+"}"}else{if((match=selector.match(Patterns.className))){source="if((n="+(isXMLDocument?'s.getAttribute(e,"class")':"e.className")+')&&n.length&&(" "+'+(isQuirksMode?"n.toLowerCase()":"n")+".replace("+reWhiteSpace+'," ")+" ").indexOf(" '+(isQuirksMode?match[1].toLowerCase():match[1])+' ")>-1'+"){"+source+"}"}else{if((match=selector.match(Patterns.attribute))){if(match[3]){match[3]=match[3].replace(/^\x22|\x22$/g,"").replace(/^\x27|\x27$/g,"")}expr=match[1].split(":");expr=expr.length==2?expr[1]:expr[0]+"";if(match[2]&&!Operators[match[2]]){emit('Unsupported operator in attribute selectors "'+selector+'"');return""}if(match[2]&&match[3]&&(type=Operators[match[2]])){HTML_TABLE["class"]=isQuirksMode?1:0;match[3]=match[3].replace(/\\([0-9a-f]{2,2})/,"\\x$1");test=(isXMLDocument?XHTML_TABLE:HTML_TABLE)[expr.toLowerCase()];type=type.replace(/\%m/g,test?match[3].toLowerCase():match[3])}else{test=false;type=match[2]=="="?'n==""':"false"}expr="n=s."+(match[2]?"get":"has")+'Attribute(e,"'+match[1]+'")'+(test?".toLowerCase();":";");source=expr+"if("+(match[2]?type:"n")+"){"+source+"}"}else{if((match=selector.match(Patterns.adjacent))){k++;source=NATIVE_TRAVERSAL_API?"var N"+k+"=e;if(e&&(e=e.previousElementSibling)){"+source+"}e=N"+k+";":"var N"+k+'=e;while(e&&(e=e.previousSibling)){if(e.nodeName>"@"){'+source+"break;}}e=N"+k+";"}else{if((match=selector.match(Patterns.relative))){k++;source=NATIVE_TRAVERSAL_API?("var N"+k+"=e;e=e.parentNode.firstElementChild;"+"while(e&&e!=N"+k+"){"+source+"e=e.nextElementSibling;}e=N"+k+";"):("var N"+k+"=e;e=e.parentNode.firstChild;"+"while(e&&e!=N"+k+'){if(e.nodeName>"@"){'+source+"}e=e.nextSibling;}e=N"+k+";")}else{if((match=selector.match(Patterns.children))){k++;source="var N"+k+"=e;if(e&&e!==h&&e!==g&&(e=e.parentNode)){"+source+"}e=N"+k+";"}else{if((match=selector.match(Patterns.ancestor))){k++;source="var N"+k+"=e;while(e&&e!==h&&e!==g&&(e=e.parentNode)){"+source+"}e=N"+k+";"}else{if((match=selector.match(Patterns.spseudos))&&CSS3PseudoClasses.Structural[selector.match(reClassValue)[0]]){switch(match[1]){case"root":source="if(e===h){"+source+"}";break;case"empty":source="if(s.isEmpty(e)){"+source+"}";break;default:if(match[1]&&match[5]){if(match[5]=="n"){source="if(e!==h){"+source+"}";break}else{if(match[5]=="even"){a=2;b=0}else{if(match[5]=="odd"){a=2;b=1}else{b=((n=match[5].match(/(-?\d+)$/))?parseInt(n[1],10):0);a=((n=match[5].match(/(-?\d*)n/))?parseInt(n[1],10):0);if(n&&n[1]=="-"){a=-1}}}}type=match[4]?"n[N]":"n";expr=match[2]=="last"&&b>=0?type+".length-("+(b-1)+")":b;type=type+"[e."+CSS_INDEX+"]";test=b<1&&a>1?"("+type+"-("+expr+"))%"+a+"==0":a>+1?(match[2]=="last")?"("+type+"-("+expr+"))%"+a+"==0":type+">="+expr+"&&("+type+"-("+expr+"))%"+a+"==0":a<-1?(match[2]=="last")?"("+type+"-("+expr+"))%"+a+"==0":type+"<="+expr+"&&("+type+"-("+expr+"))%"+a+"==0":a===0?type+"=="+expr:(match[2]=="last")?a==-1?type+">="+expr:type+"<="+expr:a==-1?type+"<="+expr:type+">="+expr;source=(match[4]?"N=e.nodeName"+TO_UPPER_CASE+";":"")+"if(e!==h){"+"n=s.getIndexesBy"+(match[4]?"NodeName":"NodeType")+"(e.parentNode"+(match[4]?",N":"")+");"+"if("+test+"){"+source+"}"+"}"}else{a=match[2]=="first"?"previous":"next";n=match[2]=="only"?"previous":"next";b=match[2]=="first"||match[2]=="last";type=match[4]?"&&n.nodeName!=e.nodeName":'&&n.nodeName<"@"';source="if(e!==h){"+("n=e;while((n=n."+a+"Sibling)"+type+");if(!n){"+(b?source:"n=e;while((n=n."+n+"Sibling)"+type+");if(!n){"+source+"}")+"}")+"}"}break}}else{if((match=selector.match(Patterns.dpseudos))&&CSS3PseudoClasses.Others[selector.match(reClassValue)[0]]){switch(match[1]){case"not":expr=match[3].replace(reTrimSpaces,"");if(SIMPLENOT&&!reSimpleNot.test(expr)){emit('Negation pseudo-class only accepts simple selectors "'+selector+'"');return""}else{if("compatMode" in doc){source="N="+compileGroup(expr,"",false)+"(e,s,r,d,h,g);if(!N){"+source+"}"}else{source='if(!s.match(e, "'+expr.replace(/\x22/g,'\\"')+'",r)){'+source+"}"}}break;case"checked":source='if(((typeof e.form!=="undefined"&&(/radio|checkbox/i).test(e.type))||/option/i.test(e.nodeName))&&(e.checked||e.selected)){'+source+"}";break;case"enabled":source='if(((typeof e.form!=="undefined"&&!(/hidden/i).test(e.type))||s.isLink(e))&&!e.disabled){'+source+"}";break;case"disabled":source='if(((typeof e.form!=="undefined"&&!(/hidden/i).test(e.type))||s.isLink(e))&&e.disabled){'+source+"}";break;case"lang":test="";if(match[3]){test=match[3].substr(0,2)+"-"}source='do{(n=e.lang||"").toLowerCase();'+'if((n==""&&h.lang=="'+match[3].toLowerCase()+'")||'+'(n&&(n=="'+match[3].toLowerCase()+'"||n.substr(0,3)=="'+test.toLowerCase()+'")))'+"{"+source+"break;}}while((e=e.parentNode)&&e!==g);";break;case"target":n=doc.location?doc.location.hash:"";if(n){source='if(e.id=="'+n.slice(1)+'"){'+source+"}"}break;case"link":source="if(s.isLink(e)&&!e.visited){"+source+"}";break;case"visited":source="if(s.isLink(e)&&e.visited){"+source+"}";break;case"active":if(isXMLDocument){break}source="if(e===d.activeElement){"+source+"}";break;case"hover":if(isXMLDocument){break}source="if(e===d.hoverElement){"+source+"}";break;case"focus":if(isXMLDocument){break}source=NATIVE_FOCUS?"if(e===d.activeElement&&d.hasFocus()&&(e.type||e.href)){"+source+"}":"if(e===d.activeElement&&(e.type||e.href)){"+source+"}";break;default:break}}else{expr=false;status=true;for(expr in Selectors){if((match=selector.match(Selectors[expr].Expression))){result=Selectors[expr].Callback(match,source);source=result.source;status=result.status;if(status){break}}}if(!status){emit('Unknown pseudo-class selector "'+selector+'"');return""}if(!expr){emit('Unknown token in selector "'+selector+'"');return""}}}}}}}}}}}}if(!match){emit('Invalid syntax in selector "'+selector+'"');return""}selector=match&&match[match.length-1]}return source},match=function(element,selector,from,callback){var changed,parts,resolver;if(!element||element.nodeName<"A"||!selector){return false}if(from&&from.nodeType==1){if(!contains(from,element)){return false}}selector=selector.replace(reTrimSpaces,"");from||(from=doc);if(lastMatchContext!=from){lastMatchContext=from;root=(doc=element.ownerDocument||element).documentElement;isQuirksMode=isQuirks(doc);isXMLDocument=isXML(doc)}if(changed=lastMatcher!=selector){if((parts=selector.match(reValidator))&&parts[0]==selector){lastMatcher=selector;isSingleMatch=(parts=selector.match(reSplitGroup)).length<2}else{emit('The string "'+selector+'", is not a valid CSS selector');return false}}if(isXMLDocument&&!(resolver=XMLMatchers[selector])){resolver=XMLMatchers[selector]=isSingleMatch?new Function("e,s,r,d,h,g,f","var N,n,x=0,k=e;"+compileSelector(selector,"f&&f(k);return true;")+"return false;"):compileGroup(selector,"",false)}else{if(!(resolver=HTMLMatchers[selector])){resolver=HTMLMatchers[selector]=isSingleMatch?new Function("e,s,r,d,h,g,f","var N,n,x=0,k=e;"+compileSelector(selector,"f&&f(k);return true;")+"return false;"):compileGroup(selector,"",false)}}indexesByNodeType={};indexesByNodeName={};return resolver(element,snap,[],doc,root,from||doc,callback)},select=function(selector,from,callback){var i,changed,element,elements,parts,resolver,token;if(arguments.length===0){emit("Missing required selector parameters");return[]}else{if(selector===""){emit("Empty selector string");return[]}else{if(typeof selector!="string"){return[]}}}selector=selector.replace(reTrimSpaces,"");from||(from=doc);if(SHORTCUTS){if(reLeftContext.test(selector)){selector=from.nodeType==9?"* "+selector:from.id?"#"+from.id+" "+selector:selector}if(reRightContext.test(selector)){selector=selector+" *"}}if(RE_SIMPLE_SELECTOR.test(selector)){switch(selector.charAt(0)){case"#":if((element=byId(selector.slice(1),from))){callback&&callback(element);return[element]}return[];case".":elements=byClass(selector.slice(1),from);break;default:elements=byTag(selector,from);break}return callback?concatCall([],elements,callback):elements}if(USE_QSAPI&&!RE_BUGGY_QSAPI.test(selector)&&QSA_NODE_TYPES[from.nodeType]){lastError=null;try{elements=from.querySelectorAll(selector)}catch(e){lastError=e;if(selector===""){throw e}}if(elements){switch(elements.length){case 0:return[];case 1:element=elements.item(0);callback&&callback(element);return[element];default:return callback?concatCall([],elements,callback):NATIVE_SLICE_PROTO?slice.call(elements):concatList([],elements)}}}if(lastSelectContext!=from){lastSelectContext=from;root=(doc=from.ownerDocument||from).documentElement;isQuirksMode=isQuirks(doc);isXMLDocument=isXML(doc)}if(changed=lastSelector!=selector){if((parts=selector.match(reValidator))&&parts[0]==selector){lastSelector=selector;isSingleSelect=(parts=selector.match(reSplitGroup)).length<2}else{emit('The string "'+selector+'", is not a valid CSS selector');return[]}}if(isSingleSelect&&from.nodeType!=11){if(changed){parts=selector.match(reSplitToken);token=parts[parts.length-1];lastSlice=token.split(":not")[0]}if((parts=lastSlice.match(Optimize.ID))&&(token=parts[1])){if((element=byId(token,from))){if(match(element,selector)){callback&&callback(element);return[element]}}return[]}else{if((parts=selector.match(Optimize.ID))&&(token=parts[1])){if((element=byId(token,doc))){if(/[>+~]/.test(selector)){from=element.parentNode}else{selector=selector.replace("#"+token,"*");from=element}}else{return[]}}}if(NATIVE_GEBCN){if((parts=lastSlice.match(Optimize.CLASS))&&(token=parts[1])){if((elements=byClass(token,from)).length===0){return[]}}else{if((parts=lastSlice.match(Optimize.TAG))&&(token=parts[1])){if((elements=byTag(token,from)).length===0){return[]}}}}else{if((parts=lastSlice.match(Optimize.TAG))&&(token=parts[1])){if((elements=byTag(token,from)).length===0){return[]}}else{if((parts=lastSlice.match(Optimize.CLASS))&&(token=parts[1])){if((elements=byClass(token,from)).length===0){return[]}}}}}if(!elements){elements=byTag("*",from)}if(isXMLDocument&&!(resolver=XMLResolvers[selector])){resolver=XMLResolvers[selector]=isSingleSelect?new Function("c,s,r,d,h,g,f","var N,n,x=0,k=-1,e;main:while(e=c[++k]){"+compileSelector(selector,ACCEPT_NODE)+"}return r;"):compileGroup(selector,"",true)}else{if(!(resolver=HTMLResolvers[selector])){resolver=HTMLResolvers[selector]=isSingleSelect?new Function("c,s,r,d,h,g,f","var N,n,x=0,k=-1,e;main:while(e=c[++k]){"+compileSelector(selector,ACCEPT_NODE)+"}return r;"):compileGroup(selector,"",true)}}indexesByNodeType={};indexesByNodeName={};return resolver(elements,snap,[],doc,root,from,callback)},CSS_ID=1,CSS_INDEX="uniqueID" in root?"uniqueID":"CSS_ID",indexesByNodeType={},indexesByNodeName={},HTMLResolvers={},XMLResolvers={},HTMLMatchers={},XMLMatchers={},snap={getIndexesByNodeType:getIndexesByNodeType,getIndexesByNodeName:getIndexesByNodeName,getAttribute:getAttribute,hasAttribute:hasAttribute,byClass:byClass,byName:byName,byTag:byTag,byId:byId,isEmpty:isEmpty,isLink:isLink,select:select,match:match};global.NW||(global.NW={});NW.Dom={byId:byId,byTag:byTag,byName:byName,byClass:byClass,getAttribute:getAttribute,hasAttribute:hasAttribute,match:match,select:select,compile:compile,contains:contains,configure:configure,registerOperator:function(symbol,resolver){if(!Operators[symbol]){Operators[symbol]=resolver}},registerSelector:function(name,rexp,func){if(!Selectors[name]){Selectors[name]={};Selectors[name].Expression=rexp;Selectors[name].Callback=func}}}})(this);