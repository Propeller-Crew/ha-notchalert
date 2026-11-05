var jt=Object.defineProperty;var qt=(s,t,e)=>t in s?jt(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var j=(s,t,e)=>qt(s,typeof t!="symbol"?t+"":t,e);var q=globalThis,Z=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),pt=new WeakMap,P=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(Z&&t===void 0){let n=e!==void 0&&e.length===1;n&&(t=pt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&pt.set(e,t))}return t}toString(){return this.cssText}},ut=s=>new P(typeof s=="string"?s:s+"",void 0,G),J=(s,...t)=>{let e=s.length===1?s[0]:t.reduce((n,i,r)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+s[r+1],s[0]);return new P(e,s,G)},ft=(s,t)=>{if(Z)s.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let n=document.createElement("style"),i=q.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=e.cssText,s.appendChild(n)}},Q=Z?s=>s:s=>s instanceof CSSStyleSheet?(t=>{let e="";for(let n of t.cssRules)e+=n.cssText;return ut(e)})(s):s;var{is:Zt,defineProperty:Wt,getOwnPropertyDescriptor:Vt,getOwnPropertyNames:Ft,getOwnPropertySymbols:Kt,getPrototypeOf:Gt}=Object,W=globalThis,mt=W.trustedTypes,Jt=mt?mt.emptyScript:"",Qt=W.reactiveElementPolyfillSupport,T=(s,t)=>s,X={toAttribute(s,t){switch(t){case Boolean:s=s?Jt:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,t){let e=s;switch(t){case Boolean:e=s!==null;break;case Number:e=s===null?null:Number(s);break;case Object:case Array:try{e=JSON.parse(s)}catch{e=null}}return e}},vt=(s,t)=>!Zt(s,t),gt={attribute:!0,type:String,converter:X,reflect:!1,useDefault:!1,hasChanged:vt};Symbol.metadata??=Symbol("metadata"),W.litPropertyMetadata??=new WeakMap;var $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=gt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(t,n,e);i!==void 0&&Wt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,n){let{get:i,set:r}=Vt(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:i,set(o){let c=i?.call(this);r?.call(this,o),this.requestUpdate(t,c,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??gt}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;let t=Gt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){let e=this.properties,n=[...Ft(e),...Kt(e)];for(let i of n)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[n,i]of e)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[e,n]of this.elementProperties){let i=this._$Eu(e,n);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let i of n)e.unshift(Q(i))}else t!==void 0&&e.push(Q(t));return e}static _$Eu(t,e){let n=e.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let n of e.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ft(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,n){this._$AK(t,n)}_$ET(t,e){let n=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,n);if(i!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:X).toAttribute(e,n.type);this._$Em=t,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){let n=this.constructor,i=n._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let r=n.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:X;this._$Em=i;let c=o.fromAttribute(e,r.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(t,e,n,i=!1,r){if(t!==void 0){let o=this.constructor;if(i===!1&&(r=this[t]),n??=o.getPropertyOptions(t),!((n.hasChanged??vt)(r,e)||n.useDefault&&n.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,n))))return;this.C(t,e,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:n,reflect:i,wrapped:r},o){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),r!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,r]of n){let{wrapped:o}=r,c=this[i];o!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,r,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(e)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[T("elementProperties")]=new Map,$[T("finalized")]=new Map,Qt?.({ReactiveElement:$}),(W.reactiveElementVersions??=[]).push("2.1.2");var ot=globalThis,$t=s=>s,V=ot.trustedTypes,_t=V?V.createPolicy("lit-html",{createHTML:s=>s}):void 0,Lt="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,kt="?"+y,Xt=`<${kt}>`,k=document,N=()=>k.createComment(""),R=s=>s===null||typeof s!="object"&&typeof s!="function",rt=Array.isArray,Yt=s=>rt(s)||typeof s?.[Symbol.iterator]=="function",Y=`[ 	
\f\r]`,U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,yt=/-->/g,wt=/>/g,A=RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),xt=/'/g,bt=/"/g,St=/^(?:script|style|textarea|title)$/i,at=s=>(t,...e)=>({_$litType$:s,strings:t,values:e}),m=at(1),Et=at(2),xe=at(3),S=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),At=new WeakMap,L=k.createTreeWalker(k,129);function Ct(s,t){if(!rt(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return _t!==void 0?_t.createHTML(t):t}var te=(s,t)=>{let e=s.length-1,n=[],i,r=t===2?"<svg>":t===3?"<math>":"",o=U;for(let c=0;c<e;c++){let a=s[c],d,h,l=-1,p=0;for(;p<a.length&&(o.lastIndex=p,h=o.exec(a),h!==null);)p=o.lastIndex,o===U?h[1]==="!--"?o=yt:h[1]!==void 0?o=wt:h[2]!==void 0?(St.test(h[2])&&(i=RegExp("</"+h[2],"g")),o=A):h[3]!==void 0&&(o=A):o===A?h[0]===">"?(o=i??U,l=-1):h[1]===void 0?l=-2:(l=o.lastIndex-h[2].length,d=h[1],o=h[3]===void 0?A:h[3]==='"'?bt:xt):o===bt||o===xt?o=A:o===yt||o===wt?o=U:(o=A,i=void 0);let f=o===A&&s[c+1].startsWith("/>")?" ":"";r+=o===U?a+Xt:l>=0?(n.push(d),a.slice(0,l)+Lt+a.slice(l)+y+f):a+y+(l===-2?c:f)}return[Ct(s,r+(s[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},z=class s{constructor({strings:t,_$litType$:e},n){let i;this.parts=[];let r=0,o=0,c=t.length-1,a=this.parts,[d,h]=te(t,e);if(this.el=s.createElement(d,n),L.currentNode=this.el.content,e===2||e===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=L.nextNode())!==null&&a.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(let l of i.getAttributeNames())if(l.endsWith(Lt)){let p=h[o++],f=i.getAttribute(l).split(y),B=/([.?@])?(.*)/.exec(p);a.push({type:1,index:r,name:B[2],strings:f,ctor:B[1]==="."?et:B[1]==="?"?nt:B[1]==="@"?st:M}),i.removeAttribute(l)}else l.startsWith(y)&&(a.push({type:6,index:r}),i.removeAttribute(l));if(St.test(i.tagName)){let l=i.textContent.split(y),p=l.length-1;if(p>0){i.textContent=V?V.emptyScript:"";for(let f=0;f<p;f++)i.append(l[f],N()),L.nextNode(),a.push({type:2,index:++r});i.append(l[p],N())}}}else if(i.nodeType===8)if(i.data===kt)a.push({type:2,index:r});else{let l=-1;for(;(l=i.data.indexOf(y,l+1))!==-1;)a.push({type:7,index:r}),l+=y.length-1}r++}}static createElement(t,e){let n=k.createElement("template");return n.innerHTML=t,n}};function C(s,t,e=s,n){if(t===S)return t;let i=n!==void 0?e._$Co?.[n]:e._$Cl,r=R(t)?void 0:t._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(s),i._$AT(s,e,n)),n!==void 0?(e._$Co??=[])[n]=i:e._$Cl=i),i!==void 0&&(t=C(s,i._$AS(s,t.values),i,n)),t}var tt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:n}=this._$AD,i=(t?.creationScope??k).importNode(e,!0);L.currentNode=i;let r=L.nextNode(),o=0,c=0,a=n[0];for(;a!==void 0;){if(o===a.index){let d;a.type===2?d=new H(r,r.nextSibling,this,t):a.type===1?d=new a.ctor(r,a.name,a.strings,this,t):a.type===6&&(d=new it(r,this,t)),this._$AV.push(d),a=n[++c]}o!==a?.index&&(r=L.nextNode(),o++)}return L.currentNode=k,i}p(t){let e=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,e),e+=n.strings.length-2):n._$AI(t[e])),e++}},H=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,n,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=C(this,t,e),R(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Yt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(k.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:n}=t,i=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=z.createElement(Ct(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(e);else{let r=new tt(i,this),o=r.u(this.options);r.p(e),this.T(o),this._$AH=r}}_$AC(t){let e=At.get(t.strings);return e===void 0&&At.set(t.strings,e=new z(t)),e}k(t){rt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,n,i=0;for(let r of t)i===e.length?e.push(n=new s(this.O(N()),this.O(N()),this,this.options)):n=e[i],n._$AI(r),i++;i<e.length&&(this._$AR(n&&n._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let n=$t(t).nextSibling;$t(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,n,i,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=u}_$AI(t,e=this,n,i){let r=this.strings,o=!1;if(r===void 0)t=C(this,t,e,0),o=!R(t)||t!==this._$AH&&t!==S,o&&(this._$AH=t);else{let c=t,a,d;for(t=r[0],a=0;a<r.length-1;a++)d=C(this,c[n+a],e,a),d===S&&(d=this._$AH[a]),o||=!R(d)||d!==this._$AH[a],d===u?t=u:t!==u&&(t+=(d??"")+r[a+1]),this._$AH[a]=d}o&&!i&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},et=class extends M{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},nt=class extends M{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},st=class extends M{constructor(t,e,n,i,r){super(t,e,n,i,r),this.type=5}_$AI(t,e=this){if((t=C(this,t,e,0)??u)===S)return;let n=this._$AH,i=t===u&&n!==u||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,r=t!==u&&(n===u||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},it=class{constructor(t,e,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){C(this,t)}};var ee=ot.litHtmlPolyfillSupport;ee?.(z,H),(ot.litHtmlVersions??=[]).push("3.3.3");var Mt=(s,t,e)=>{let n=e?.renderBefore??t,i=n._$litPart$;if(i===void 0){let r=e?.renderBefore??null;n._$litPart$=i=new H(t.insertBefore(N(),r),r,void 0,e??{})}return i._$AI(s),i};var lt=globalThis,_=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Mt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};_._$litElement$=!0,_.finalized=!0,lt.litElementHydrateSupport?.({LitElement:_});var ne=lt.litElementPolyfillSupport;ne?.({LitElement:_});(lt.litElementVersions??=[]).push("4.2.2");var Ot={drone:{d:"M50 0 L56 10 L56 24 L90 66 L90 56 L98 56 L98 92 L90 92 L90 80 L56 80 L56 96 L44 96 L44 80 L10 80 L10 92 L2 92 L2 56 L10 56 L10 66 L44 24 L44 10 Z"},cruise:{d:"M98 50 L80 39 L30 39 L12 16 L4 16 L10 39 L2 39 L2 61 L10 61 L4 84 L12 84 L30 61 L80 61 Z"},ballistic:{d:"M98 50 L80 39 L30 39 L12 16 L4 16 L10 39 L2 39 L2 61 L10 61 L4 84 L12 84 L30 61 L80 61 Z",rotate:90},mig:{d:"M50 0 L57 18 L58 40 L97 66 L97 74 L59 66 L60 80 L82 92 L82 99 L56 97 L44 97 L18 99 L18 92 L40 80 L41 66 L3 74 L3 66 L42 40 L43 18 Z"},aircraft:{d:"M50 0 L57 18 L58 40 L97 66 L97 74 L59 66 L60 80 L82 92 L82 99 L56 97 L44 97 L18 99 L18 92 L40 80 L41 66 L3 74 L3 66 L42 40 L43 18 Z"},kab:{d:"M30 58 A20 42 0 1 0 70 58 A20 42 0 1 0 30 58 Z M0 50 L32 36 L68 36 L100 50 L100 60 L68 52 L32 52 L0 60 Z M22 0 L78 0 L64 22 L36 22 Z"},massive:{d:"M18 24 L28.5 41 L28.5 85 L33.5 98 L2.5 98 L7.5 85 L7.5 41 Z M50 0 L60.5 17 L60.5 63 L65.5 76 L34.5 76 L39.5 63 L39.5 17 Z M82 24 L92.5 41 L92.5 85 L97.5 98 L66.5 98 L71.5 85 L71.5 41 Z"}};var se="Europe/Kyiv",ie=["massive","ballistic","cruise","mig","kab","aircraft","drone"],ht={calm:["\u0422\u0440\u0438\u0432\u043E\u0433\u0438 \u043D\u0435\u043C\u0430\u0454","\u0422\u0438\u0445\u043E","\u0421\u043F\u043E\u043A\u0456\u0439\u043D\u043E","\u0412\u0441\u0435 \u0441\u043F\u043E\u043A\u0456\u0439\u043D\u043E"],yellow:"\u0416\u043E\u0432\u0442\u0438\u0439 \u0440\u0456\u0432\u0435\u043D\u044C",red:"\u0427\u0435\u0440\u0432\u043E\u043D\u0438\u0439 \u0440\u0456\u0432\u0435\u043D\u044C",unknown:"\u041D\u0435\u043C\u0430\u0454 \u0434\u0430\u043D\u0438\u0445",since:"\u0437 {0}",clear:"\u0432\u0456\u0434\u0431\u0456\u0439 \u043E {0}",noThreats:"\u0417\u0430\u0433\u0440\u043E\u0437 \u043D\u0435 \u0432\u0438\u0434\u043D\u043E",noType:"\u0422\u0438\u043F \u0437\u0430\u0433\u0440\u043E\u0437\u0438 \u043D\u0435 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u044F\u043B\u0438",threat:{massive:"\u041C\u0430\u0441\u043E\u0432\u0430\u043D\u0430 \u0430\u0442\u0430\u043A\u0430",ballistic:"\u0411\u0430\u043B\u0456\u0441\u0442\u0438\u043A\u0430",cruise:"\u0420\u0430\u043A\u0435\u0442\u0438",mig:"\u041C\u0456\u0413-31\u041A",kab:"\u041A\u0410\u0411\u0438",aircraft:"\u0410\u0432\u0456\u0430\u0446\u0456\u044F",drone:"\u0414\u0440\u043E\u043D\u0438"},near:"\u0414\u0440\u043E\u043D \u043F\u043E\u0440\u0443\u0447",km:"{0} \u043A\u043C",min:"{0} \u0445\u0432",hour:"{0} \u0433\u043E\u0434",hourMin:"{0} \u0433\u043E\u0434 {1} \u0445\u0432",tomorrow:"\u0437\u0430\u0432\u0442\u0440\u0430 {0}",powerOn:"\u0421\u0432\u0456\u0442\u043B\u043E \u0454 \u0434\u043E {0}",powerOnOpen:"\u0421\u0432\u0456\u0442\u043B\u043E \u0454, \u0432\u0456\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u044C \u0443 \u0433\u0440\u0430\u0444\u0456\u043A\u0443 \u0431\u0456\u043B\u044C\u0448\u0435 \u043D\u0435\u043C\u0430\u0454",powerOff:"\u0421\u0432\u0456\u0442\u043B\u0430 \u043D\u0435\u043C\u0430\u0454 \u0434\u043E {0}",maybe:"\u041C\u043E\u0436\u043B\u0438\u0432\u0435 \u0432\u0456\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044F \u0434\u043E {0}",powerUnknown:"\u0413\u0440\u0430\u0444\u0456\u043A\u0430 \u043D\u0430 \u0441\u044C\u043E\u0433\u043E\u0434\u043D\u0456 \u0449\u0435 \u043D\u0435\u043C\u0430\u0454",offFor:"\u0432\u0438\u043C\u043A\u043D\u0443\u0442\u044C \u043D\u0430 {0}",thenOn:"\u043F\u043E\u0442\u0456\u043C \u0441\u0432\u0456\u0442\u043B\u043E \u0434\u043E {0}",queue:"\u0447\u0435\u0440\u0433\u0430 {0}",sky:["{0} \u0446\u0456\u043B\u044C \u043D\u0430\u0434 \u043E\u0431\u043B\u0430\u0441\u0442\u044E","{0} \u0446\u0456\u043B\u0456 \u043D\u0430\u0434 \u043E\u0431\u043B\u0430\u0441\u0442\u044E","{0} \u0446\u0456\u043B\u0435\u0439 \u043D\u0430\u0434 \u043E\u0431\u043B\u0430\u0441\u0442\u044E"],approach:"{0} \u0434\u043E \u043D\u0430\u0441",shot:"\u0437\u0431\u0438\u0442\u043E {0}",noDevice:"\u0414\u043E\u0434\u0430\u0439\u0442\u0435 \u0456\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0456\u044E \xAB\u0422\u0440\u0438\u0432\u043E\u0433\u0430 \u0432 \u043D\u043E\u0442\u0447\u0456\xBB, \u0456 \u043A\u0430\u0440\u0442\u043A\u0430 \u043F\u043E\u043A\u0430\u0436\u0435 \u0442\u0440\u0438\u0432\u043E\u0433\u0443 \u0439 \u0441\u0432\u0456\u0442\u043B\u043E \u0432\u0430\u0448\u043E\u0433\u043E \u043C\u0456\u0441\u0446\u044F.",editor:{device:"\u041C\u0456\u0441\u0446\u0435",layout:"\u0412\u0438\u0433\u043B\u044F\u0434",auto:"\u0421\u0430\u043C \u0437\u0430 \u0448\u0438\u0440\u0438\u043D\u043E\u044E",compact:"\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u0438\u0439",wide:"\u0428\u0438\u0440\u043E\u043A\u0438\u0439",light:"\u0421\u0432\u0456\u0442\u043B\u043E",sky:"\u0426\u0456\u043B\u0456 \u043D\u0430\u0434 \u043E\u0431\u043B\u0430\u0441\u0442\u044E"},cardDescription:"\u0422\u0440\u0438\u0432\u043E\u0433\u0430, \u0437\u0430\u0433\u0440\u043E\u0437\u0438, \u0434\u0440\u043E\u043D \u043F\u043E\u0440\u0443\u0447 \u0456 \u0441\u0432\u0456\u0442\u043B\u043E \u0432\u0430\u0448\u043E\u0433\u043E \u043C\u0456\u0441\u0446\u044F, \u044F\u043A \u0443 \u043D\u043E\u0442\u0447\u0456."},oe={calm:["No alert","Quiet","Calm","All calm"],yellow:"Yellow level",red:"Red level",unknown:"No data",since:"since {0}",clear:"all clear at {0}",noThreats:"No threats seen",noType:"Threat type not reported",threat:{massive:"Massive attack",ballistic:"Ballistic",cruise:"Missiles",mig:"MiG-31K",kab:"Guided bombs",aircraft:"Aircraft",drone:"Drones"},near:"Drone nearby",km:"{0} km",min:"{0} min",hour:"{0} h",hourMin:"{0} h {1} min",tomorrow:"tomorrow {0}",powerOn:"Power on until {0}",powerOnOpen:"Power on, no more outages scheduled",powerOff:"No power until {0}",maybe:"Possible outage until {0}",powerUnknown:"No schedule for today yet",offFor:"off for {0}",thenOn:"then power until {0}",queue:"queue {0}",sky:["{0} target over the oblast","{0} targets over the oblast","{0} targets over the oblast"],approach:"{0} heading our way",shot:"{0} shot down",noDevice:"Add the NotchAlert integration, and the card shows the alert and the power of your place.",editor:{device:"Place",layout:"Layout",auto:"By width",compact:"Compact",wide:"Wide",light:"Power",sky:"Targets over the oblast"},cardDescription:"Alert, threats, drone nearby and power for your place, as in the notch."};function D(s){return String(s||"").toLowerCase().startsWith("uk")?ht:oe}function g(s,...t){return s.replace(/\{(\d)\}/g,(e,n)=>String(t[+n]))}function re(s,t,e){let n=t%10,i=t%100,r=e?n===1&&i!==11?0:n>=2&&n<=4&&(i<12||i>14)?1:2:t===1?0:1;return g(s[r],t)}var ae=new Intl.DateTimeFormat("en-GB",{timeZone:se,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});function v(s){let t=Object.fromEntries(ae.formatToParts(new Date(s)).map(e=>[e.type,e.value]));return{y:+t.year,mo:+t.month,d:+t.day,h:+t.hour,mi:+t.minute}}var w=s=>s.y*1e4+s.mo*100+s.d,x=s=>String(s).padStart(2,"0");function b(s,t=!1){let e=v(s);return`${x(t&&e.h===0&&e.mi===0?24:e.h)}:${x(e.mi)}`}function ct(s,t,e,n=!1){let i=v(n?s-1:s),r=v(t),o=v(t+864e5);return w(i)===w(r)?b(s,n):w(i)===w(o)?g(e.tomorrow,b(s,n)):`${i.d}.${x(i.mo)} ${b(s,n)}`}function le(s,t){let e=Math.max(0,Math.floor(s/60));if(e<60)return g(t.min,e);let n=Math.floor(e/60),i=e%60;return i?g(t.hourMin,n,i):g(t.hour,n)}function ce(s,t,e){let n=Math.round(s/60);if(n<60)return g(t.min,n);let i=Math.round(n/30),r=i%2?`${Math.floor(i/2)}${e?",":"."}5`:String(i/2);return g(t.hour,r)}function he(s){let t=Math.max(0,Math.floor(s)),e=Math.floor(t/3600),n=Math.floor(t%3600/60),i=t%60;return e?`${e}:${x(n)}:${x(i)}`:`${n}:${x(i)}`}function de(s,t){let e=v(s),n=Math.floor(Date.UTC(e.y,e.mo-1,e.d)/864e5)+719163;return t.calm[n%t.calm.length]}function F(s){return[...new Set(Object.values(s?.entities||{}).filter(e=>e.platform==="notchalert").map(e=>e.device_id))].filter(Boolean).map(e=>({id:e,name:Pt(s,e)}))}function Pt(s,t){let e=s?.devices?.[t];return e?.name_by_user||e?.name||""}function dt(s,t){let e={};for(let n of Object.values(s?.entities||{}))n.platform==="notchalert"&&n.device_id===t&&n.translation_key&&(e[n.translation_key]=n.entity_id);return e}var O=s=>{let t=Date.parse(s);return Number.isFinite(t)?t:null},E=s=>s&&s.state!=="unavailable";function Tt(s,t,e){let n=dt(s,t),i=l=>n[l]?s.states[n[l]]:void 0,r=i("alert"),o={ids:n,name:Pt(s,t),level:"unknown",threats:[],since:null,reason:null};if(E(r)){let l=r.state==="on",p=r.attributes||{};o.level=l?p.level==="red"?"red":"yellow":"green",o.threats=l?ie.filter(f=>(p.threats||[]).includes(f)):[],o.since=l?O(p.since):null,o.reason=l&&p.reason||null}let c=i("last_clear");o.lastClear=E(c)?O(c.state):null;let a=i("drone_near");o.near=E(a)&&a.state==="on"?{km:a.attributes?.km??null,detail:a.attributes?.detail||null}:null;let d=i("sky_targets");o.sky=E(d)&&Number(d.state)>0?{targets:Number(d.state),approach:d.attributes?.approach||0,shot:d.attributes?.shot_down||0}:null;let h=i("power_state");if(h){let l=h.attributes||{},p=i("power_change");o.power={available:E(h),state:E(h)?h.state:"unavailable",group:l.group||null,until:E(p)?O(p.state):null,intervals:(l.intervals||[]).map(f=>({start:O(f.start),end:O(f.end),state:f.state})).filter(f=>f.start&&f.end),knownUntil:O(l.known_until)}}else o.power=null;return o}function Ut(s,t,e){return s.level==="green"?de(t,e):s.level==="unknown"?e.unknown:e[s.level]}function Nt(s,t,e){if(s.since){let n=v(s.since),i=v(t),r=w(n)===w(i)?b(s.since):`${n.d}.${x(n.mo)}`;return{since:g(e.since,r),lasted:le((t-s.since)/1e3,e)}}if(s.level==="green"&&s.lastClear){let n=v(s.lastClear),i=v(t),r=w(n)===w(i)?b(s.lastClear):`${n.d}.${x(n.mo)} ${b(s.lastClear)}`;return{since:g(e.clear,r),lasted:null}}return null}function Rt(s,t){if(!s)return null;let e=[t.near];return s.detail&&e.push(s.detail),s.km!=null&&!/\d\s*(км|km)/.test(s.detail||"")&&e.push(g(t.km,String(s.km).replace(".",t===ht?",":"."))),e.join(" \xB7 ")}function zt(s,t){if(!s)return null;let e=t===ht,n=[re(t.sky,s.targets,e)];return s.approach&&n.push(g(t.approach,s.approach)),s.shot&&n.push(g(t.shot,s.shot)),n.join(" \xB7 ")}function pe(s,t){if(s.knownUntil)return s.knownUntil;let e=v(t),n=t+((24-e.h)*60-e.mi)*6e4;n-=n%6e4;let i=Math.max(0,...s.intervals.map(r=>r.end));return Math.max(n,i)}function Ht(s,t,e,n){if(!s)return null;let i=s.intervals,r=i.find(p=>p.start<=t&&t<p.end),o=s.state,c=s.until;r?(o=r.state,c=r.end):(o==="off"||o==="maybe")&&(o="on"),o==="on"&&!r&&(c=i.find(p=>p.start>t)?.start??(c&&c>t?c:null));let a,d=null;if(o==="unavailable")a=e.unknown;else if(o==="unknown")a=e.powerUnknown;else if(o==="on"){a=c?g(e.powerOn,ct(c,t,e)):e.powerOnOpen;let p=c&&i.find(f=>f.start===c);p&&(d=g(e.offFor,ce((p.end-p.start)/1e3,e,n)))}else{a=g(o==="maybe"?e.maybe:e.powerOff,ct(c,t,e,!0));let p=i.find(f=>f.start>c);p&&(d=g(e.thenOn,ct(p.start,t,e)))}let h=c?(c-t)/6e4:1/0,l=o==="on"&&c?h<=30?3:h<=90?2:0:0;return{state:o,until:c,headline:a,detail:d,heat:l,countdown:c&&c>t?he((c-t)/1e3):null}}function Dt(s,t,e=24){let n=v(t),i=t-n.mi*6e4-t%6e4,r=i+e*36e5,o=pe(s,t),c=h=>{if(h>=o)return"unknown";let l=s.intervals.find(p=>p.start<=h&&h<p.end);return l?l.state:"on"},a=Array.from({length:e},(h,l)=>c(i+(l+.5)*36e5)),d=[];for(let h of s.intervals)for(let[l,p]of[[h.start,!1],[h.end,!0]])l>i&&l<r&&l<=o&&!d.some(f=>f.at===l)&&d.push({at:l,x:(l-i)/(r-i),text:b(l,p),kind:p?"on":h.state});return o>i&&o<r&&!d.some(h=>h.at===o)&&d.push({at:o,x:(o-i)/(r-i),text:b(o,!0),kind:"unknown"}),d.sort((h,l)=>h.at-l.at),{start:i,end:r,cells:a,now:(t-i)/(r-i),edges:d}}function It(s,t){let e=[];for(let n of s)n.x<.02||n.x>.98||e.length&&n.x-e[e.length-1].x<t||e.push(n);return e}var fe="0.2.0",me=560;function Bt(s,t=""){let e=Ot[s];return e?m`<svg class="ti ${t} ${s}" viewBox="0 0 100 100" aria-hidden="true">${Et`<path d=${e.d} fill-rule="nonzero" transform=${e.rotate?`rotate(${e.rotate} 50 50)`:""}></path>`}</svg>`:u}function ge(s){if(s==="red")return m`<svg class="mark" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5 L19 18 L1 18 Z"></path></svg>`;let t=s!=="yellow";return m`<svg class="mark ${t?"hollow":""}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r=${t?7.5:9}></circle></svg>`}var I=class extends _{static getConfigElement(){return document.createElement("notchalert-card-editor")}static getStubConfig(t){let e=F(t)[0];return e?{device_id:e.id}:{}}setConfig(t){this._config={layout:"auto",light:!0,sky:!0,...t||{}}}getCardSize(){return this._wide?4:6}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}connectedCallback(){super.connectedCallback(),this._now=Date.now(),this._timer=setInterval(()=>this._now=Date.now(),1e3),this._ro=new ResizeObserver(([t])=>{this._width=t.contentRect.width,this._wide=this._width>=me}),this.updateComplete.then(()=>this._ro?.observe(this))}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._timer),this._ro?.disconnect()}get _deviceId(){return this._config?.device_id||F(this.hass)[0]?.id}_more(t){t&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return u;let t=D(this.hass.locale?.language||this.hass.language),e=t===D("uk"),n=!!this.hass.themes?.darkMode,i=this._deviceId;if(!i)return m`<ha-card class="empty ${n?"dark":"light"}"><div class="hint">${t.noDevice}</div></ha-card>`;let r=this._now||Date.now(),o=Tt(this.hass,i,r),c=this._config.layout==="auto"?this._wide?"wide":"compact":this._config.layout,a=this._config.light!==!1&&o.power?o.power:null;return m`
      <ha-card class="${c} lvl-${o.level} ${n?"dark":"light"} ${a?"has-power":""}">
        <div class="sky"></div>
        <div class="body">
          ${this._alert(o,r,t,e)}
          ${a?this._light(a,r,t,e,c):u}
        </div>
      </ha-card>
    `}_alert(t,e,n,i){let r=Nt(t,e,n),o=Rt(t.near,n),c=t.threats.filter(h=>!(o&&h==="drone")),a=this._config.sky!==!1?zt(t.sky,n):null,d=null;return!c.length&&!o&&t.level!=="unknown"&&(d=t.level==="green"?n.noThreats:t.reason?null:n.noType),m`
      <section class="alert" @click=${()=>this._more(t.ids.alert)}>
        <div class="top">
          ${ge(t.level)}
          <span class="place">${t.name}</span>
        </div>
        <div class="title">${Ut(t,e,n)}</div>
        ${r?m`<div class="sub">${r.since}${r.lasted?m`<span class="dot">·</span><b>${r.lasted}</b>`:u}</div>`:u}
        ${t.reason?m`<div class="reason">${t.reason}</div>`:u}
        ${c.length?m`<div class="threats">
              ${c.map(h=>m`<span class="chip">${Bt(h)}<span>${n.threat[h]}</span></span>`)}
            </div>`:u}
        ${o?m`<div class="near">${Bt("drone")}<span>${o}</span></div>`:u}
        ${d?m`<div class="quiet">${d}</div>`:u}
        ${a?m`<div class="skyline">${a}</div>`:u}
      </section>
    `}_light(t,e,n,i,r){let o=Ht(t,e,n,i),a=t.available&&o.state!=="unknown"?Dt(t,e):null,d=this._width||360,h=r==="wide"?d/2-60:d-36,l=a?It(a.edges,42/Math.max(h,120)):[],p=o.state==="on"||o.state==="unavailable";return m`
      <section class="power st-${o.state} heat-${o.heat}" @click=${()=>this._more(this._entity("power_state"))}>
        <div class="ptop">
          <ha-icon icon=${p?"mdi:flash":"mdi:flash-off"}></ha-icon>
          ${t.group?m`<span class="queue">${g(n.queue,t.group)}</span>`:u}
        </div>
        <div class="headline">${o.headline}</div>
        ${o.countdown?m`<div class="count">${o.countdown}</div>`:u}
        ${o.detail?m`<div class="pdetail">${o.detail}</div>`:u}
        ${a?m`<div class="strip">
                <div class="cells">${a.cells.map(f=>m`<i class="c-${f}"></i>`)}</div>
                <div class="now" style="left:${(a.now*100).toFixed(2)}%"></div>
              </div>
              <div class="labels">
                ${l.map(f=>m`<span class="lb k-${f.kind}" style="left:${(f.x*100).toFixed(2)}%">${f.text}</span>`)}
              </div>`:u}
      </section>
    `}_entity(t){return dt(this.hass,this._deviceId)[t]}};j(I,"properties",{hass:{attribute:!1},_config:{state:!0},_now:{state:!0},_wide:{state:!0},_width:{state:!0}}),j(I,"styles",J`
    :host {
      display: block;
    }
    ha-card {
      position: relative;
      overflow: hidden;
      height: 100%;
      box-sizing: border-box;
      cursor: pointer;
      /* Кольори рівня й світла — нотча на темному й глибші на світлому, де жовтий острівця не читається
         (WidgetLook.swift, Ink). */
      --na-green: #33d659;
      --na-yellow: #ffd10a;
      --na-red: #ff3b30;
      --na-grey: #808080;
      --na-on: #ffcc33;
      --na-warm: #ff8c26;
      --na-hot: #ff453b;
      --na-tile: rgba(255, 255, 255, 0.1);
      --na-unknown: rgba(255, 255, 255, 0.04);
      --na-text: var(--primary-text-color);
      --na-secondary: var(--secondary-text-color);
      --na-sky: 0.24;
    }
    ha-card.light {
      --na-green: #1a993d;
      --na-yellow: #c78c00;
      --na-red: #db2921;
      --na-grey: #737373;
      --na-on: #cc8f00;
      --na-warm: #e66b0d;
      --na-hot: #db2921;
      --na-tile: rgba(20, 20, 20, 0.07);
      --na-unknown: rgba(20, 20, 20, 0.03);
      --na-sky: 0.16;
    }
    .lvl-green { --na-level: var(--na-green); }
    .lvl-yellow { --na-level: var(--na-yellow); }
    .lvl-red { --na-level: var(--na-red); }
    .lvl-unknown { --na-level: var(--na-grey); }

    /* Небо рівня зверху, як фон віджета айфона (WidgetSkyBackground): видно здалеку, навіть не читаючи. */
    .sky {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(180deg, var(--na-level) 0%, transparent 78%);
      opacity: var(--na-sky);
    }
    .lvl-green .sky { opacity: calc(var(--na-sky) * 0.45); }
    .lvl-unknown .sky { opacity: 0.08; }

    .body {
      position: relative;
      display: grid;
      gap: 18px;
      padding: 18px 18px 16px;
    }
    .wide .body {
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 28px;
      padding: 24px 26px 22px;
    }
    .compact.has-power .power {
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      padding-top: 16px;
    }
    .wide.has-power .power {
      border-left: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
      padding-left: 26px;
    }

    .top, .ptop {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 20px;
    }
    .mark {
      width: 14px;
      height: 14px;
      fill: var(--na-level);
      stroke: var(--na-level);
      stroke-width: 0;
      filter: drop-shadow(0 0 4px color-mix(in srgb, var(--na-level) 70%, transparent));
      flex: none;
    }
    .mark.hollow { fill: none; stroke-width: 3; filter: none; }
    .place, .queue {
      margin-left: auto;
      font-size: 13px;
      font-weight: 500;
      color: var(--na-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .title {
      margin-top: 10px;
      font-size: 30px;
      line-height: 1.1;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--na-level);
    }
    .wide .title { font-size: 40px; margin-top: 14px; }
    .sub {
      margin-top: 6px;
      font-size: 15px;
      color: var(--na-secondary);
      font-variant-numeric: tabular-nums;
    }
    .sub b { color: var(--na-text); font-weight: 600; }
    .wide .sub { font-size: 17px; }
    .dot { margin: 0 6px; opacity: 0.6; }
    .reason {
      margin-top: 4px;
      font-size: 13px;
      color: var(--na-secondary);
    }

    .threats {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px 6px 7px;
      border-radius: 10px;
      background: var(--na-tile);
      font-size: 14px;
      font-weight: 600;
      color: var(--na-text);
    }
    .wide .chip { font-size: 16px; padding: 8px 14px 8px 9px; }
    .ti {
      width: 18px;
      height: 18px;
      fill: var(--na-text);
      flex: none;
    }
    .wide .ti { width: 22px; height: 22px; }
    .ti.massive { fill: var(--na-yellow); }
    .light .ti.massive { fill: var(--na-red); }

    /* «Дрон поруч» — найближча загроза, тож тонований рівнем рядок, а не ще один значок. */
    .near {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--na-level) 16%, transparent);
      font-size: 15px;
      font-weight: 600;
      color: var(--na-text);
    }
    .lvl-green .near { background: color-mix(in srgb, var(--na-red) 14%, transparent); }
    .wide .near { font-size: 17px; }
    .near .ti { width: 20px; height: 20px; }
    .quiet, .skyline {
      margin-top: 12px;
      font-size: 14px;
      color: var(--na-secondary);
    }
    .skyline { font-size: 13px; }

    .power ha-icon {
      --mdc-icon-size: 22px;
      color: var(--na-on);
    }
    .power.heat-2 ha-icon { color: var(--na-warm); }
    .power.heat-3 ha-icon { color: var(--na-hot); }
    .power.st-off ha-icon, .power.st-unknown ha-icon, .power.st-unavailable ha-icon { color: var(--na-secondary); }
    .power.st-maybe ha-icon { color: color-mix(in srgb, var(--na-on) 60%, transparent); }
    .queue { margin-left: auto; }
    .headline {
      margin-top: 8px;
      font-size: 20px;
      line-height: 1.2;
      font-weight: 700;
      color: var(--na-text);
    }
    .wide .headline { font-size: 24px; margin-top: 14px; }
    .count {
      margin-top: 4px;
      font-size: 15px;
      font-weight: 500;
      color: var(--na-secondary);
      font-variant-numeric: tabular-nums;
    }
    .wide .count { font-size: 17px; }
    .pdetail {
      margin-top: 2px;
      font-size: 13px;
      color: var(--na-secondary);
    }

    .strip {
      position: relative;
      margin-top: 14px;
      height: 12px;
    }
    .wide .strip { height: 16px; margin-top: 20px; }
    .cells {
      display: grid;
      grid-template-columns: repeat(24, 1fr);
      gap: 2px;
      height: 100%;
    }
    .cells i { border-radius: 3px; }
    .c-on { background: var(--na-on); }
    .c-maybe { background: color-mix(in srgb, var(--na-on) 55%, transparent); }
    .c-off { background: var(--na-tile); }
    /* Далі графіка ще нема: не світло й не темрява, а штрих, як «невідомо» на смузі апки. */
    .c-unknown {
      background: repeating-linear-gradient(135deg, var(--na-tile) 0 1.5px, transparent 1.5px 5px);
    }
    .now {
      position: absolute;
      top: -3px;
      bottom: -3px;
      width: 2px;
      margin-left: -1px;
      border-radius: 1px;
      background: var(--na-text);
    }
    .labels {
      position: relative;
      height: 14px;
      margin-top: 4px;
    }
    .lb {
      position: absolute;
      transform: translateX(-50%);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--na-secondary);
    }
    .lb.k-off { color: var(--na-text); font-weight: 600; }
    .lb.k-on { color: var(--na-on); font-weight: 600; }
    .lb.k-unknown { opacity: 0.7; }
    .wide .lb { font-size: 12px; }

    .hint {
      padding: 18px;
      color: var(--na-secondary);
      font-size: 14px;
    }
  `);var K=class extends _{setConfig(t){this._config=t}connectedCallback(){super.connectedCallback(),customElements.get("ha-form")||window.loadCardHelpers?.().then(t=>t.createCardElement({type:"entities",entities:[]}).constructor.getConfigElement?.())}render(){if(!this.hass||!this._config)return u;let t=D(this.hass.locale?.language||this.hass.language).editor,e=[{name:"device_id",selector:{device:{integration:"notchalert"}}},{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"auto",label:t.auto},{value:"compact",label:t.compact},{value:"wide",label:t.wide}]}}},{type:"grid",name:"",schema:[{name:"light",selector:{boolean:{}}},{name:"sky",selector:{boolean:{}}}]}],n={device_id:t.device,layout:t.layout,light:t.light,sky:t.sky},i={layout:"auto",light:!0,sky:!0,...this._config};return i.device_id||(i.device_id=F(this.hass)[0]?.id),m`<ha-form
      .hass=${this.hass}
      .data=${i}
      .schema=${e}
      .computeLabel=${r=>n[r.name]??r.name}
      @value-changed=${this._changed}
    ></ha-form>`}_changed(t){let e={...t.detail.value};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}};j(K,"properties",{hass:{attribute:!1},_config:{state:!0}});if(!customElements.get("notchalert-card")){customElements.define("notchalert-card",I),customElements.define("notchalert-card-editor",K);let s=navigator.language;try{s=JSON.parse(localStorage.getItem("selectedLanguage"))||s}catch{}let t=D(s);window.customCards=window.customCards||[],window.customCards.push({type:"notchalert-card",name:"\u0422\u0440\u0438\u0432\u043E\u0433\u0430 \u0432 \u043D\u043E\u0442\u0447\u0456 (NotchAlert)",description:t.cardDescription,preview:!0,documentationURL:"https://github.com/Propeller-Crew/ha-notchalert#card"}),console.info(`%c NOTCHALERT-CARD %c ${fe} `,"background:#ff3b30;color:#fff;font-weight:700","background:#222;color:#fff")}
