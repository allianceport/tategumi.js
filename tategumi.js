/*
 * Copyright (c) 2011 Alliance Port, LLC (www.allianceport.jp)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function(){


/*
 * Cross-browser dynamic CSS creation based on the version from the SWFobject code
 * http://code.google.com/p/swfobject/source/browse/trunk/swfobject/src/swfobject.js
 * Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
 * Released under the same terms: MIT License <http://www.opensource.org/licenses/mit-license.php>
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
        var m = ( media && typeof media == "string" ) ? media : "all";
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
            if ( ua.ie && ua.win
                && ( typeof doc.styleSheets != "undefined" )
                && ( doc.styleSheets.length > 0 ) ) {
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


var tategumi = function( element, columnStyles ) {

    var css = function() {
        var selectors = [];
        return {
            has: function( selector ) {
                return selectors.join('').indexOf( selector );
            },
            add: function( selector, properties ) {
                selectors.push( selector );
                createCSS( selector, properties.join('') );
            }
        };
    }();

    var glyphRotate = function() {
        var horisontalGlyphs = [
            '（',
            '︵',
            '）',
            '︶',
            '｛',
            '︷',
            '｝',
            '︸',
            '「',
            '﹁',
            '」',
            '﹂',
            '『',
            '﹃',
            '』',
            '﹄',
            'ー',
            '︱',
            '…',
            '︰',
            '(',
            '︵',
            ')',
            '︶',
            '{',
            '︷',
            '}',
            '︸',
            '[',
            '︵',
            ']',
            '︶',
            '【',
            '︵',
            '】',
            '︶',
            '―',
            '︱'
        ];
        return function( x ) {
            var temp = '';
            for ( var i = 0; i < horisontalGlyphs.length; i++) {
                if ( x == horisontalGlyphs[i] ) {
                    temp = horisontalGlyphs[i+1];
                    break;
                }
            }
            if ( temp == '' ) temp = x;
            return temp;
        };
    }();

    var prohibiCh = function() {
        var pchVerArr = [
            '、',
            '。',
            '（',
            '）',
            '｛',
            '｝',
            '「',
            '」',
            '『',
            '』',
            'ー',
            '…',
            '(',
            ')',
            '{',
            '}',
            '[',
            ']',
            '【',
            '】'
        ];
        return function( str ) {
            for ( var i = 0; i < pchVerArr.length; i++ ) {
                if ( str == pchVerArr[i] ) {
                    return true;
                    break;
                }
            }
            return false;
        };
    }();

    var column = function( ops ) {

        var element = ops.element,
            selector = ops.selector,
            styles = ops.styles;
    
        var html = [];
        var cssSelector = 'TGLine-' + selector.replace( '.', 'class-' ).replace( '#', 'id-' );
        var numGlypL = styles.glyphsPerLine;
        var charNumL = 1;
        var tagName = element.tagName.toLowerCase();
            
        var yakumonoShiftVerical = Math.floor( -1 * styles.glyphSize * 3/5 );
        var yakumonoShiftHorizontal = Math.floor( styles.glyphSize * 2/3 );
    
        if ( css.has( cssSelector ) == -1 ) {
            css.add( '.' + cssSelector, [
                'overflow: visible;',
                'position: relative;', 
                'margin: 0 0 ' + styles.blockMargin + 'px ' + styles.lineMargin + 'px;',
                'width:' + styles.glyphSize + 'px;',
                'height:' + ( parseInt( styles.glyphSize, 10 ) * parseInt( styles.glyphsPerLine, 10 ) ) + 'px;',
                'line-height:' + styles.glyphSize + 'px;',
                'font-size:' + styles.glyphSize + 'px;',
                'text-align: center;'
            ] );
            css.add( '.' + cssSelector + ' span', [
                'margin: 0 0 ' + styles.glyphMargin + 'px 0;',
                'width:' + styles.glyphSize + 'px;',
                'height:' + styles.glyphSize + 'px;',
                'line-height:' + styles.glyphSize + 'px;',
                'font-size:' + styles.glyphSize + 'px;'
            ] );
            css.add( '.' + cssSelector + ' rt', [
                'position: absolute;',
                'top: 0px;',
                'left:' + styles.glyphSize + 'px;'
            ] );
            css.add( '.' + cssSelector + ' rt span', [
                'width:' + styles.rubySize + 'px;',
                'height:' + styles.rubySize + 'px;',
                'line-height:' + styles.rubySize + 'px;',
                'font-size:' + styles.rubySize + 'px;'
            ] );
        }

        var activeTags = [],
            isFirst = true;
        var addHTML = function( text, skipCounter ) {
            var rubyTop = false;
            if ( skipCounter ) { // RT tag from ruby
                var rubyTop = parseInt( styles.glyphSize, 10 ) - ( parseInt( styles.rubySize, 10 ) * text.length );
                rubyTop = Math.ceil( rubyTop / 2 );
            }
            for ( var i = 0 ; i < text.length; i++ ) {
                if ( text.charAt(i) == '\n' ) {
                    html.push( '</' + tagName + '><' + tagName + ' class="TGLine ' + cssSelector + '">' );
                    charNumL = 1;
                }
                else{
                    //kinsoku - oidashi
                    if ( styles.kinsoku ) {
                        if ( (charNumL)%numGlypL == 0 && text.charAt(i+1) != null ) {    
                            if ( prohibiCh( text.charAt(i+1) ) ) {                                
                                html.push( '</' + tagName + '><' + tagName + ' class="TGLine ' + cssSelector + '">' );        
                                charNumL++;
                                isFirst = false;
                            }                                                    
                        }
                    }
                    //shift 'kutou-ten'    
                    if ( text.charAt(i) == '、' || text.charAt(i) == '。' ) {
						html.push( '<span style="top:'+yakumonoShiftVerical+'px; left:' + yakumonoShiftHorizontal + 'px;">' + glyphRotate( text.charAt(i) ) + '</span>' );
                    }
                    else if ( rubyTop ) {
                        html.push( '<span style="top:' + rubyTop + 'px;">' + glyphRotate( text.charAt(i) ) + '</span>' );                        
                    }
                    else{
                        html.push( '<span>' + glyphRotate( text.charAt(i) ) + '</span>' );
                    }
                    if ( (charNumL)%numGlypL == 0 ) {
                        html.push( activeTags.reverse().join('').replace( '<', '</') + '</' + tagName + '><' + tagName + ' class="TGLine ' + cssSelector +'">' + activeTags.join('') );
                    }
                    if ( !skipCounter ) {
                        charNumL ++;
                    }
                }
            }
        };
        var parseNode = function( node ) {
            var currentTagName = node.tagName.toLowerCase();
            for ( var n = 0, children = node.childNodes; n <children.length; n++ ) {
                var currentChild = children[ n ];
                if ( currentChild.nodeType == 3 ) { // Text node
                    if ( styles.kinsoku && isFirst ) {
                        html.push( '<span></span>' );
                        isFirst = false;
                        charNumL++;
                    }
                    addHTML( currentChild.nodeValue ? currentChild.nodeValue : '　', ( currentTagName == 'rt' ) ? true : false );
                }
                else if ( currentChild.nodeType == 1 ) { // Html Tag node
                    if ( styles.kinsoku && isFirst ) {
                        html.push( '<span></span>' );
                        isFirst = false;
                        charNumL++;
                    }
                    var currentTagName = currentChild.tagName.toLowerCase();
                    activeTags.push( '<' + currentTagName + '>' );
                    html.push( '<' + currentTagName + ( currentChild.href ? ' href="' + currentChild.href + '"' : '' ) + '>' );
                    parseNode( currentChild );
                    html.push( activeTags.pop().replace( '<', '</' ) );
                }
                else {
                    // Skipping other nodes
                }
            }
        };
    
        return {
            applyStyle: function() {
                html.push(  '<' + tagName + ' class="TGLine ' + cssSelector + '">' );
                parseNode( ops.element );
                html.push( '</' + tagName + '>' );
                return html.join('');
            }
        };

    };

    /*
     * From here initialize
     */
    var targetElement = !element.tagName ? document.getElementById( element ) : element;

    // Create a new style style sheet
    createCSS( '.TGLine', [
        'display:block;',
        'float:right;',
        'word-break:break-all;',
        'word-wrap:break-word;'
        ].join(''), 'all', true );
    css.add( '.TGLine *', [
        'display:inline;',
        'position:relative;',
        'text-decoration:none;'
    ]);
    css.add( '.TGLine span, .TGLine ruby', [
        'display:block;',
        'position:relative;'
    ]);
    if ( targetElement.id ) {
        css.add( '#' + targetElement.id, [
            'overflow:hidden;',
            'width:' + ( targetElement.offsetWidth - 20 ) + 'px;',
            'padding: 0 10px;'
        ]);
    }
        
    // Setup the element styles
    for ( var i = 0; i < columnStyles.length; i++ ) {
        columnStyles[ columnStyles[i].selector ] = columnStyles[i].style;    
    }
    if ( !columnStyles['.default'] ) {
        columnStyles['.default'] = {
            glyphSize: 10,
            glyphsPerLine: 20,
            lineMargin: 20,
            glyphMargin: 0,
            blockMargin: 100,
            kinsoku: true
        };
    }
        
    // Setup columns
    var columns = [];
    for ( var i = 0, children = targetElement.childNodes; i < children.length; i++ ) {
        var child = children[ i ];
        if ( child && child.nodeType == 1 ) {
            var childSelector = [ child.id || false, child.className || false ];
            if ( childSelector[ 0 ] && columnStyles[ '#' + childSelector[ 0 ] ] ) {
                columns.push( column({
                    element: child,
                    selector: childSelector[ 0 ],
                    styles: columnStyles[ '#' + childSelector[ 0 ] ]
                }) );
            }
            else if ( childSelector[ 1 ] && columnStyles[ '.' + childSelector[ 1 ] ] ) {
                columns.push( column({
                    element: child,
                    selector: childSelector[ 1 ],
                    styles: columnStyles[ '.' + childSelector[ 1 ] ]
                }) );
            }
            else {
                columns.push( column({
                    element: child,
                    selector: 'default',
                    styles: columnStyles[ '.default' ]
                }) );
            }
        }
    }

    return {
        apply: function() {
           var html = [];
            for( var i = 0; i < columns.length; i++ ) {
                html.push( columns[i].applyStyle()  );
            }
            targetElement.innerHTML= html.join('');
        }
    }
    
};

window.Tategumi = tategumi;

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