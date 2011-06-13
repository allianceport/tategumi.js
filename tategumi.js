/*

Copyright (c) 2011 Alliance Port, LLC (www.allianeport.jp)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function(){

/*
	Cross-browser dynamic CSS creation based on the version from the SWFobject code
	http://code.google.com/p/swfobject/source/browse/trunk/swfobject/src/swfobject.js
    Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
    Released under the same terms: MIT License <http://www.opensource.org/licenses/mit-license.php>
*/ 
var createCSS = function() {
	var doc = document,
    	p = navigator.platform.toLowerCase(),
        u = navigator.userAgent.toLowerCase(),
        ua = {
			ie: !+"\v1",
			win: p ? /win/.test(p) : /win/.test(u),
			mac: p ? /mac/.test(p) : /mac/.test(u)
        };
    var dynamicStylesheet;
    return function( sel, decl, media, newStyle ) {
        if ( ua.ie && ua.mac ) {
            return;
        }
        var m = ( media && typeof media == "string" ) ? media : "screen";
        if ( newStyle ) {
            dynamicStylesheet = null;
            dynamicStylesheetMedia = null;
        }
        if ( !dynamicStylesheet || dynamicStylesheetMedia != m ) {
 			// create dynamic stylesheet + get a global reference to it
	        var h = document.getElementsByTagName("head")[0] || false;
    	    if ( !h ) {
        	    // to also support badly authored HTML
            	// pages that lack a head element
	            return;
    	    }
			var s = document.createElement("style");
			s.setAttribute("type", "text/css");
			s.setAttribute("media", m);
			dynamicStylesheet = h.appendChild(s);
			if ( ua.ie && ua.win && ( typeof doc.styleSheets != "undefined" ) && ( doc.styleSheets.length > 0 ) ) {
				dynamicStylesheet = doc.styleSheets[ doc.styleSheets.length - 1 ];
			}
			dynamicStylesheetMedia = m;
		}
		// add style rule
		if ( ua.ie && ua.win ) {
			if ( dynamicStylesheet && typeof dynamicStylesheet.addRule == "object" ) {
				dynamicStylesheet.addRule(sel, decl);
			}
		}
		else {
			if ( dynamicStylesheet ) {
				dynamicStylesheet.appendChild( doc.createTextNode( sel + " {" + decl + "}" ) );
			}
		}
	};
}();

var tategumi = {};
tategumi.css = function() {
	var selectors = [];
	return {
		has: function( selector ) {
			return selectors.join('').indexOf( selector );
		},
		add: function( selector, properties ) {
			selectors.push( selector );
			createCSS( selector, properties );
		}
	};
}();

tategumi.init = function( element, styles){

	var targetElement = !element.tagName ? document.getElementById( element ) : element,
		children = targetElement.childNodes;
	var paragraphs = new Array();
	
	var layout = function(){
		var html = [];
		for( var i=0; i<paragraphs.length; i++) {
			html.push( paragraphs[i].applyStyle()  );
		}
		targetElement.innerHTML= html.join('');
	}
	createCSS( '.TGLine', 'display:block;float:right;word-break:break-all;word-wrap:break-word;', 'screen', true );
	createCSS( '.TGLine span', 'display:block;position:relative;' );
	if ( targetElement.id ) {
		tategumi.css.add( '#' + targetElement.id, 'overflow:hidden;width:' + ( targetElement.offsetWidth - 20 ) + 'px;padding: 0 10px;' );
	}
	
	// styles setup
	for ( var i=0; i<styles.length; i++ ) {
		styles[styles[i].selector] = styles[i].style;	
	}
	styles['.DEFAULT'] = {glyphSize:10,glyphsPerLine:20,lineMargin:20,glyphMargin:0,blockMargin:100,kinsoku:true};
	
	//paragrps setup
	for (var i=0; i<children.length; i++ ) {
		var child = children[ i ];
		if ( child && child.nodeType == 1 ) {
			if ( child.firstChild != null ){
				var text = child.firstChild.nodeValue;
			}
			else{
				var text = '　';
			}
			var selector = [ child.id || false, child.className || false ];
			if ( selector[ 0 ] && styles[ '#' + selector[ 0 ] ] ) {
				paragraphs.push( new tategumi.element( child.tagName.toLowerCase(), selector[ 0 ], styles[ '#' + selector[ 0 ] ], text ) );
			}
			else if ( selector[ 1 ] && styles[ '.' + selector[ 1 ] ] ) {
				paragraphs.push( new tategumi.element( child.tagName.toLowerCase(), selector[ 1 ], styles[ '.' + selector[ 1 ] ], text ) );			
			}
			else {
				paragraphs.push( new tategumi.element( child.tagName.toLowerCase(), 'DEFAULT', '.DEFAULT', text ) );
			}
		}
	}

	return {
		apply: layout
	};

};

tategumi.element = function( tagName, selector, style, text ) {
	this.selector = selector;

	this.style = {
		glyphSize:		style.glyphSize,
		glyphsPerLine:	style.glyphsPerLine,
		glyphMargin:	style.glyphMargin,
		lineMargin:		style.lineMargin,
		blockMargin:	style.blockMargin,
		kinsoku:		style.kinsoku
	}
	this.text = text;

	this.applyStyle = function(){

		var css = [],
			cssSelector = 'TGLine-' + this.selector.replace( '.', 'class-' ).replace( '#', 'id-' );

		if ( tategumi.css.has( cssSelector ) == -1 ) {
			tategumi.css.add( '.' + cssSelector,
				'overflow:visible;'
				+ 'margin: 0 0 0 ' + this.style.lineMargin + 'px;'
				+ 'width:' + this.style.glyphSize + 'px;'
				+ 'height:' + ( parseInt( this.style.glyphSize, 10 ) * parseInt( this.style.glyphsPerLine, 10 ) ) +'px; '
				+ 'line-height:' + this.style.glyphSize + 'px;'
				+ 'margin-bottom:' + this.style.blockMargin + 'px;'
				+ 'font-size:' + this.style.glyphSize + 'px;'
				+ 'letter-spacing: 1px;'
				+ 'text-align:center;'
			);
		}
		var html = '<' + tagName + ' class="TGLine ' + cssSelector + '">';
		var stringArr ='';
		var numGlypL = this.style.glyphsPerLine;
		var charNumL =1;
		
		var yakumonoShiftVerical = Math.floor( -1 * this.style.glyphSize * 3/5 );
		var yakumonoShiftHorizontal = Math.floor( this.style.glyphSize * 2/3 );
		
		for(var i = 0 ; i < this.text.length; i++ ){
			if(this.text.charAt(i) =='\n'){
				html += '</' + tagName + '><' + tagName + ' class="TGLine ' + cssSelector + '" style="float:right; '+paragraphStyle+'">';
				charNumL = 1;
			}
			else{
				
				//kinsoku - oidashi
				if(this.style.kinsoku){
					if((charNumL)%numGlypL ==0 && this.text.charAt(i+1)!=null){				
						if(prohibiCh(this.text.charAt(i+1))){								
							stringArr += '</' + tagName + '><' + tagName + ' class="TGLine ' + cssSelector + '" style="float:right; '+paragraphStyle+'">';		
							charNumL ++;												
						}															
					}
				}
				
				//shift 'kutou-ten' 
				
				if(this.text.charAt(i) =='、'||this.text.charAt(i) =='。'){
					stringArr += '<span style="margin:'+yakumonoShiftVerical+'px 0 ' + ( -1 * yakumonoShiftVerical / 2 ) + 'px ' + yakumonoShiftHorizontal + 'px;">'+glyphRotate(this.text.charAt(i))+'</span>';
				}
				else{
					stringArr += glyphRotate(this.text.charAt(i));
				}
				
				if((charNumL)%numGlypL ==0){
					stringArr += '</' + tagName + '><' + tagName + ' class="TGLine ' + cssSelector +'">';
				}
				charNumL ++;
			}
		}
		
		html += stringArr+ '</' + tagName + '>';
		return html;
	}
};

//define -rotated 

var horisontalGlyphs = new Array();
horisontalGlyphs[0] = '（';
horisontalGlyphs[1] = '︵';
horisontalGlyphs[2] = '）';
horisontalGlyphs[3] = '︶';
horisontalGlyphs[4] = '｛';
horisontalGlyphs[5] = '︷';
horisontalGlyphs[6] = '｝';
horisontalGlyphs[7] = '︸';
horisontalGlyphs[8] = '「';
horisontalGlyphs[9] = '﹁';
horisontalGlyphs[10] = '」';
horisontalGlyphs[11] = '﹂';
horisontalGlyphs[12] = '『';
horisontalGlyphs[13] = '﹃';
horisontalGlyphs[14] = '』';
horisontalGlyphs[15] = '﹄';
horisontalGlyphs[18] = 'ー';
horisontalGlyphs[19] = '︱';
horisontalGlyphs[20] = '…';
horisontalGlyphs[21] = '︰';
horisontalGlyphs[22] = '(';
horisontalGlyphs[23] = '︵';
horisontalGlyphs[24] = ')';
horisontalGlyphs[25] = '︶';
horisontalGlyphs[26] = '{';
horisontalGlyphs[27] = '︷';
horisontalGlyphs[28] = '}';
horisontalGlyphs[29] = '︸';
horisontalGlyphs[30] = '[';
horisontalGlyphs[31] = '︵';
horisontalGlyphs[32] = ']';
horisontalGlyphs[33] = '︶';
horisontalGlyphs[34] = '【';
horisontalGlyphs[35] = '︵';
horisontalGlyphs[36] = '】';
horisontalGlyphs[37] = '︶';
horisontalGlyphs[38] = '―';
horisontalGlyphs[39] = '︱';


function glyphRotate(x){
	var temp = '';
	for(var i =0; i<horisontalGlyphs.length; i++){
		if(x == horisontalGlyphs[i]){
  			temp = horisontalGlyphs[i+1];
  			break;
		}
	}
	if(temp =='') temp=x;
	return temp;
}


//define -kinsoku

var pchVerArr = new Array();
pchVerArr[0] = '、';
pchVerArr[1] = '。';
pchVerArr[2] = '（';
pchVerArr[3] = '）';
pchVerArr[4] = '｛';
pchVerArr[5] = '｝';
pchVerArr[6] = '「';
pchVerArr[7] = '」';
pchVerArr[8] = '『';
pchVerArr[9] = '』';
pchVerArr[10] = 'ー';
pchVerArr[11] = '…';
pchVerArr[12] = '(';
pchVerArr[13] = ')';
pchVerArr[14] = '{';
pchVerArr[15] = '}';
pchVerArr[16] = '[';
pchVerArr[17] = ']';
pchVerArr[18] = '【';
pchVerArr[19] = '】';
	function prohibiCh(str){
		for(var i=0; i<pchVerArr.length; i++){
			if(str==pchVerArr[i]){
					return true;
					break;
			}
		}
		return false;
	}

window.Tategumi = tategumi.init;

// A simple jQuery wrapper
if ( window.jQuery ) {

	$.Tategumi = {};
	$.Tategumi.o = [];
	$.Tategumi.op = {};
	$.Tategumi.defaults = {
		styles: []
	};

	$.fn.Tategumi = function( op ) {

    	return this.each(
        	function() {

            	var s = this.serial = $.Tategumi.o.length;
            	var o = $.extend( {}, $.Tategumi.defaults, op );
            	$.Tategumi.o[s] = $.Tategumi.op = o;

				var tategumi = new Tategumi( this, o.styles );
				if ( o.apply ) {
					tategumi.apply();
				}

			}
		);
	};

}

})();