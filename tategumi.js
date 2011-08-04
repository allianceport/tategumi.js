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


var tategumi = function( element, columnStyles, pager ) {

    var config = {
		targetElement: !element.tagName ? document.getElementById( element ) : element,
		viewport: {
			size: {
				width: 0,
				height: 0
			},
			orientations: {
				portrait: false,
				landscape: false
			}
		}
	};

	var models = {}, views = {}, controllers = {};

	models.inArray = function( ) {
		if ( window.jQuery ) {
			return jQuery.inArray;
		}
		else {
            return function( value, array ) {
				var idx = -1;
				for ( var i = 0; i < array.length; i++ ) {
	                if ( value == array[ i ] ) {
						idx = i;
						break;
					}
				}
				return idx;
			}
		}
	}();

    models.viewport = {
		getSize: function() {
		    if ( typeof window.innerWidth != 'undefined') {
				return {
					width: window.innerWidth,
				    height: window.innerHeight
				};
		    }
		    else if ( typeof document.documentElement != 'undefined'
		    && typeof document.documentElement.clientWidth != 'undefined'
		    && document.documentElement.clientWidth != 0) {
				return {
					width: document.documentElement.clientWidth,
					height: document.documentElement.clientHeight
				};
		    }
		    else {
				return {
					width: document.getElementsByTagName('body')[0].clientWidth,
				    height: document.getElementsByTagName('body')[0].clientHeight
				};
		    }
		}
    };

    models.css = function() {
        var selectors = [],
            add = function( selector, properties ) {
                selectors.push( selector );
				var stringProperties = [];
				for ( var p in properties ) {
					stringProperties.push( p.replace( /([A-Z]{1})/, "-$1" ).toLowerCase() + ':' + properties[ p ] + ';' );
				}
                createCSS( selector, stringProperties.join('') );
            },
			addStyles = function( cssSelector, cssStyles ) {
				add( cssSelector, cssStyles );
			},
            createStyles = function( cssSelector, styles ) {
                add( '.' + cssSelector, {
                    overflow: 'visible',
                    position: 'relative', 
                    margin: '0 0 ' + styles.blockMargin + 'px ' + styles.lineMargin + 'px',
                    width: styles.glyphSize + 'px',
                    height: ( parseInt( styles.glyphSize, 10 ) * parseInt( styles.glyphsPerLine, 10 ) ) + 'px',
                    lineHeight: styles.glyphSize + 'px',
                    fontSize: styles.glyphSize + 'px',
                    textAlign: 'center'
				} );
                add( '.' + cssSelector + ' span', {
                    margin: '0 0 ' + styles.glyphMargin + 'px 0',
                    width: styles.glyphSize + 'px',
                    height: styles.glyphSize + 'px',
                    lineHeight: styles.glyphSize + 'px',
                    fontSize: styles.glyphSize + 'px'
				} );
                add( '.' + cssSelector + ' rt', {
                    display: 'inline',
                    position: 'static'
				} );
                add( '.' + cssSelector + ' rt span', {
                    position: 'absolute',
                    top: '0px',
                    left: styles.glyphSize + 'px',
                    width: styles.rubySize + 'px',
                    height: styles.rubySize + 'px',
                    lineHeight: styles.rubySize + 'px',
                    fontSize: styles.rubySize + 'px'
				} );
            };
		// Create a new style style sheet
		createCSS( '.TGLine', [
			'display:block;',
			'float:right;',
			'word-break:break-all;',
			'word-wrap:break-word;'
		].join(''), 'all', true );
		addStyles( '.TGLine *', {
			display: 'inline',
			position: 'relative',
			textDecoration: 'none',
			lineHeight: '1',
			fontSize: '100%'
		} );
		addStyles( '.TGLine span, .TGLine ruby', {
			display: 'block',
			position: 'relative'
		} );
		if ( config.targetElement.id ) {
			addStyles( '#' + config.targetElement.id, {
				overflow: 'hidden',
				width: ( config.targetElement.offsetWidth - 20 ) + 'px',
				padding: '0 10px'
			} );
		}
        return {
            has: function( selector ) {
                return selectors.join('').indexOf( selector );
            },
            createStyles: createStyles,
			addStyles: addStyles
        };
    }();

    models.rotatedGlyph = function() {
        var horizontalGlyphs = [
			'（', '）', '｛', '｝', '「', '」', '『', '』', 'ー', '…', '(', ')', '{', '}', '[', ']', '【', '】', '―'
        ];
		var verticalGlyphs = [
			'︵', '︶', '︷', '︸', '﹁', '﹂', '﹃', '﹄', '︱', '︰', '︵', '︶', '︷', '︸', '︵', '︶', '︵', '︶', '︱'
		];
        return function( glyph ) {
			var idx = models.inArray( glyph, horizontalGlyphs );
			return ( idx > -1 ) ? verticalGlyphs[ idx ] : glyph;
        };
    }();

    models.prohibitedCharacters = function() {
        var characters = [
            '、', '。', '（', '）', '｛', '｝', '「', '」', '『', '』', 'ー', '…', '(', ')', '{', '}', '[', ']', '【', '】'
        ];
        return function( character ) {
			var idx = models.inArray( character, characters );
			return ( idx > -1 ) ? true : false;
        };
    }();


	/* @namespace models
	 * @Class column
	 * @description model to manage a column
 	 */
    models.column = function( ops ) {

        var element = ops.element,
            selector = ops.selector,
            styles = ops.styles;
    
        /*
		 var html = [];
        var numGlypL = styles.glyphsPerLine;
        var charNumL = 1;
        var tagName = element.tagName.toLowerCase();
		*/   
        var yakumonoShiftVerical = Math.floor( -1 * styles.glyphSize * 3/5 );
        var yakumonoShiftHorizontal = Math.floor( styles.glyphSize * 2/3 );

        var cssSelector = 'TGLine-' + selector.replace( '.', 'class-' ).replace( '#', 'id-' );
        if ( models.css.has( cssSelector ) == -1 ) {
            models.css.createStyles( cssSelector, styles );
        }

		var parser = function() {

			var charCounter = 1,
				charPerLines = styles.glyphsPerLine,
				unclosed = 0,
				lineTagName = element.tagName.toLowerCase();

			var html = function() {
				var source = []; // We stock in an html array
				var activeTags = [];
				return {
					tagIsFirst: function( kinsoku ) {
						var tagIsFirst = true;
						return function() {
		                    if ( kinsoku && tagIsFirst ) {
		                        source.push( '<span>&nbsp;</span>' );
		                        tagIsFirst = false;
		                        charCounter++;
		                    }
						}
					}( styles.kinsoku ),
					add: function( str ) {
						source.push( str );
					},
					open: function( node ) {
						html.tagIsFirst();
						var currentTagName = node.tagName.toLowerCase();
						activeTags.push( '<' + currentTagName + '>' );
						source.push( '<' + currentTagName );
						var currentAttributes = node.attributes || [];
						for ( var a = 0; a < currentAttributes.length; a++ ) {
							var attr = currentAttributes[ a ];
							if ( attr.name != "style" ) {
								source.push( ' ' + attr.name + '="' + attr.value + '"' );
							}
						}
						source.push( '>' );
					},
					close: function( closeMethod ) {
						switch ( closeMethod || false ) {
							case 'splitLine':
								source.push( activeTags.reverse().join('').replace( '<', '</') + '</' + lineTagName + '><' + lineTagName + ' class="TGLine ' + cssSelector +'">' + activeTags.join('') );
							break;
							case 'line':
								source.push( '</' + lineTagName + '><' + lineTagName + ' class="TGLine ' + cssSelector + '">' );
							break;
							default:
								source.push( activeTags.pop().replace( '<', '</' ) );
							break;
						}
					},
					getSource: function() {
						return source.join('');
					}
				};
			}(  );


			var rubyLength = 0;
			var parseText = function( textOptions ) {

				var extraCSS = false;
				var text = textOptions.text;
				var currentTagName = textOptions.tagName;

				switch (  currentTagName ) {
					case 'RUBY': case 'ruby':
						rubyLength = text.length;
					break;
					case 'RT': case 'rt':
						extraCSS = function( textLength, rubyLength, glyphSize, rubySize ) {
							var rubyTop = ( glyphSize * rubyLength ) - ( rubySize * textLength );
							rubyTop = Math.ceil( rubyTop / 2 );
							return function( n ) {
								return "top:" + ( rubyTop + n * rubySize ) + "px";
							};
						}( text.length, rubyLength, parseInt( styles.glyphSize, 10 ), parseInt( styles.rubySize, 10 ) );
						rubyLength = 0;
					break;
				}

				if ( unclosed > 0 ) {
					unclosed++;
					if ( unclosed > 2 ) {
				        html.close( 'splitLine' );
				        unclosed = 0;
				    }
				}

	            for ( var i = 0 ; i < text.length; i++ ) {
	                if ( text.charAt(i) == '\n' ) {
	                    html.close( 'line' );
	                    charCounter = 1;
	                }
	                else {
	                    //kinsoku - oidashi
	                    if ( styles.kinsoku ) {
	                        if ( (charCounter)%charPerLines == 0 && text.charAt(i+1) != null ) {    
	                           if ( models.prohibitedCharacters( text.charAt(i+1) ) ) {                                
	                               html.close( 'line' );        
	                               charCounter++;
	                           }                                                    
	                       }
						}
                    }
                    //shift 'kutou-ten'    
                    if ( /(、|。)/.test( text.charAt(i) ) ) {
						html.add( '<span style="top:'+yakumonoShiftVerical+'px; left:' + yakumonoShiftHorizontal + 'px;">' + models.rotatedGlyph( text.charAt(i) ) + '</span>' );
                    }
                    else if ( extraCSS ) {
                        html.add( '<span style="' + extraCSS( i ) + '">' + models.rotatedGlyph( text.charAt(i) ) + '</span>' );
                    }
                    else {
                        html.add( '<span>' + models.rotatedGlyph( text.charAt(i) ) + '</span>' );
                    }
                    if (  currentTagName != "RT" ) {
						if ( (charCounter)%charPerLines == 0 ) {
	                    	if ( currentTagName != "RUBY" ) {
	                        	html.close( 'splitLine' );
	                       	}
	                       	else {
								unclosed = 1;
	                       	}
						}
						charCounter++;
                    }
                }
            };

			var parseNode = function( node ) {
				var currentTagName = node.tagName.toUpperCase();
				for ( var n = 0, children = node.childNodes; n < children.length; n++ ) {
		            var currentChild = children[ n ];
					switch ( currentChild.nodeType ) {
			            case 3: // Text node
						    html.tagIsFirst();
			                parseText({
			                	tagName: currentTagName,
			                	text: currentChild.nodeValue ? currentChild.nodeValue : '　'
			                });
			            break;
						case 1: // Html Tag node
							html.open( currentChild );
							parseNode( currentChild );
							html.close();
						break;
					}
		        }
		    };

			return {
					do: function() {
						html.add(  '<' + lineTagName + ' class="TGLine ' + cssSelector + '">' );
						parseNode( ops.element );
						html.add( '</' + lineTagName + '>' );
						return html.getSource();
					}
			};

		};

		var parser = new parser();

        return {
            applyStyle: function() {
				return parser.do();
            }
        };

    };

	controllers.pager = function() {
		var pages = 0,
			touchPositions = {
				start: {
					x: 0,
					y: 0
				},
				end: {
					x: 0,
					y: 0
				}
			},
			touchStamp = {
				start: 0,
				end: 0
			},
			viewPosition = {
				x: 0,
				y: 0
			};
		var touchEvents = {};
		var $view = document.getElementById("TGWrapper");
		$view.style.left = "0px";
		$view.style.top = "0px";
		$view.style.position = "relative";
		if ( !document.ontouchstart ) {
			touchEvents = {
				down: "mousedown",
				up: "mouseup",
				move: "mousemove"
			};
		}
		else {
			touchEvents = {
				down: "touchstart",
				up: "touchend",
				move: "touchmove"
			};
		}
		var MathAbs = Math.abs;
		var touchDown = function( event ) {
			var touch = event.touches ? event.touches[0] : event;
			touchStamp.start = new Date().getTime();
			touchPositions.start.x = touch.clientX;
			touchPositions.start.y = touch.clientY;
			$view = document.getElementById("TGWrapper");
			viewPosition = {
				x: parseInt( $view.style.left, 10 ),
				y: parseInt( $view.style.top, 10 ),
				min: -1 * ( $view.offsetHeight - config.viewport.size.height ),
				max: 0
			};
			document.addEventListener( touchEvents.move, touchMove, false );
			document.addEventListener( touchEvents.up, touchUp, false );
		};
		var touchMove = function( event ) {
			var touch = event.touches ? event.touches[0] : event;
			var newPosition = viewPosition.y + ( touch.clientY - touchPositions.start.y );
			if ( newPosition >= viewPosition.min && newPosition <= viewPosition.max ) {
				$view.style.top = newPosition + 'px';
			}
		};
		var touchUp = function( event ) {
			var touch = event.touches ? event.touches[0] : event;
			touchStamp.end = new Date().getTime();
			touchPositions.end.x = touch.clientX;
			touchPositions.end.y = touch.clientY;
			var touchDistance = { // Pixels
				x: MathAbs( MathAbs( touchPositions.start.x ) - MathAbs( touchPositions.end.x ) ),
				y: MathAbs( MathAbs( touchPositions.start.y ) - MathAbs( touchPositions.end.y ) )
			};
			var touchDuration = touchStamp.end - touchStamp.start; // Milliseconds
			document.removeEventListener( touchEvents.move, touchMove, false );
			document.removeEventListener( touchEvents.up, touchUp, false );
		};
		document.addEventListener( touchEvents.down, touchDown, false );
	};

	controllers.init = function() {
		if ( !document.addEventListener ) {
			document.addEventListener = function( type, listener, useCapture ) {
				document.attachEvent( 'on' + type, listener );
			};
		}
		if ( !document.removeEventListener ) {
			document.removeEventListener = function( type, listener, useCapture ) {
				document.detachEvent( 'on' + type, listener );
			};
		}
		var viewportSize = function() {
			var viewportSize = models.viewport.getSize();
			config.viewport = {
				size: {
					width: viewportSize.width,
					height: viewportSize.height
				},
				orientations: {
					landscape: viewportSize.width > viewportSize.height ? true : false,
					portrait: viewportSize.height > viewportSize.width ? true : false
				}
			};
		};
		window.onresize = viewportSize;
		viewportSize(); // Trigger
		controllers.pager();
	};

    /*
     * From here initialize
     */

    // Setup the element styles
	var userColumnStyles = columnStyles;
	columnStyles = [];
    for ( var i = 0; i < userColumnStyles.length; i++ ) {
        columnStyles[ userColumnStyles[i].selector ] = userColumnStyles[i].style;    
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

	// Setup pager if need be
	if ( !pager ) {}
	else {
		models.viewport.size = models.viewport.getSize();
		for ( var s in columnStyles ) {
			if ( columnStyles.hasOwnProperty( s ) ) {
				columnStyles[ s ].glyphsPerLine = Math.floor( models.viewport.size.height / columnStyles[ s ].glyphSize );
			}
		}
	
	}
        
    // Setup columns
    var columns = [];
    for ( var i = 0, children = config.targetElement.childNodes; i < children.length; i++ ) {
        var child = children[ i ];
        if ( child && child.nodeType == 1 ) {
            var childSelector = [ child.id || false, child.className || false ];
            if ( childSelector[ 0 ] && columnStyles[ '#' + childSelector[ 0 ] ] ) {
                columns.push( models.column({
                    element: child,
                    selector: childSelector[ 0 ],
                    styles: columnStyles[ '#' + childSelector[ 0 ] ]
                }) );
            }
            else if ( childSelector[ 1 ] && columnStyles[ '.' + childSelector[ 1 ] ] ) {
                columns.push( models.column({
                    element: child,
                    selector: childSelector[ 1 ],
                    styles: columnStyles[ '.' + childSelector[ 1 ] ]
                }) );
            }
            else {
                columns.push( models.column({
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
            var clone = config.targetElement.cloneNode( false );
            clone.innerHTML = html.join('');
            var wrapper = document.createElement('div');
            wrapper.id = 'TGWrapper';
            wrapper.appendChild( clone );
            var targetElementParent =config. targetElement.parentNode;
            targetElementParent.replaceChild( wrapper, config.targetElement );
			controllers.init();
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

                var tategumi = new Tategumi( this, o.styles, o.pager );
                if ( o.apply ) {
                    tategumi.apply();
                }

            }
        );
    };

}

})();