/* Laura Doktorova https://github.com/olado/doT */
(function(){function p(b,a,d){return("string"===typeof a?a:a.toString()).replace(b.define||h,function(a,c,e,g){0===c.indexOf("def.")&&(c=c.substring(4));c in d||(":"===e?(b.defineParams&&g.replace(b.defineParams,function(a,b,l){d[c]={arg:b,text:l}}),c in d||(d[c]=g)):(new Function("def","def['"+c+"']="+g))(d));return""}).replace(b.use||h,function(a,c){b.useParams&&(c=c.replace(b.useParams,function(a,b,c,l){if(d[c]&&d[c].arg&&l)return a=(c+":"+l).replace(/'|\\/g,"_"),d.__exp=d.__exp||{},d.__exp[a]=
d[c].text.replace(new RegExp("(^|[^\\w$])"+d[c].arg+"([^\\w$])","g"),"$1"+l+"$2"),b+"def.__exp['"+a+"']"}));var e=(new Function("def","return "+c))(d);return e?p(b,e,d):e})}function k(b){return b.replace(/\\('|\\)/g,"$1").replace(/[\r\t\n]/g," ")}var f={version:"1.0.3",templateSettings:{evaluate:/\{\{([\s\S]+?(\}?)+)\}\}/g,interpolate:/\{\{=([\s\S]+?)\}\}/g,encode:/\{\{!([\s\S]+?)\}\}/g,use:/\{\{#([\s\S]+?)\}\}/g,useParams:/(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
define:/\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,defineParams:/^\s*([\w$]+):([\s\S]+)/,conditional:/\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,iterate:/\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,varname:"it",strip:!0,append:!0,selfcontained:!1,doNotSkipEncoded:!1},template:void 0,compile:void 0},m;f.encodeHTMLSource=function(b){var a={"&":"&#38;","<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","/":"&#47;"},d=b?/[&<>"'\/]/g:/&(?!#?\w+;)|<|>|"|'|\//g;return function(b){return b?
b.toString().replace(d,function(b){return a[b]||b}):""}};m=function(){return this||(0,eval)("this")}();"undefined"!==typeof module&&module.exports?module.exports=f:"function"===typeof define&&define.amd?define(function(){return f}):m.doT=f;var r={start:"'+(",end:")+'",startencode:"'+encodeHTML("},s={start:"';out+=(",end:");out+='",startencode:"';out+=encodeHTML("},h=/$^/;f.template=function(b,a,d){a=a||f.templateSettings;var n=a.append?r:s,c,e=0,g;b=a.use||a.define?p(a,b,d||{}):b;b=("var out='"+(a.strip?
b.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ").replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""):b).replace(/'|\\/g,"\\$&").replace(a.interpolate||h,function(b,a){return n.start+k(a)+n.end}).replace(a.encode||h,function(b,a){c=!0;return n.startencode+k(a)+n.end}).replace(a.conditional||h,function(b,a,c){return a?c?"';}else if("+k(c)+"){out+='":"';}else{out+='":c?"';if("+k(c)+"){out+='":"';}out+='"}).replace(a.iterate||h,function(b,a,c,d){if(!a)return"';} } out+='";e+=1;g=d||"i"+e;a=k(a);return"';var arr"+
e+"="+a+";if(arr"+e+"){var "+c+","+g+"=-1,l"+e+"=arr"+e+".length-1;while("+g+"<l"+e+"){"+c+"=arr"+e+"["+g+"+=1];out+='"}).replace(a.evaluate||h,function(a,b){return"';"+k(b)+"out+='"})+"';return out;").replace(/\n/g,"\\n").replace(/\t/g,"\\t").replace(/\r/g,"\\r").replace(/(\s|;|\}|^|\{)out\+='';/g,"$1").replace(/\+''/g,"");c&&(a.selfcontained||!m||m._encodeHTML||(m._encodeHTML=f.encodeHTMLSource(a.doNotSkipEncoded)),b="var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("+f.encodeHTMLSource.toString()+
"("+(a.doNotSkipEncoded||"")+"));"+b);try{return new Function(a.varname,b)}catch(q){throw"undefined"!==typeof console&&console.log("Could not create a template function: "+b),q;}};f.compile=function(b,a){return f.template(b,null,a)}})();

/**
 * dedalus.js v0.9.4
 * 2013, Gustavo Di Pietro
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl-2.0.html)
**/


/* Dedalus defines the core functionalities and a base class that must be
 * implemented by a Dedalus implementation.
 *
 * Its constructor loads source story and defines a global "story" variable
 * that can be openly accessed at runtime by the story script.

 * Dedalus depens on:
 *     jQuery: http://jquery.com/
 *     doT.js: http://olado.github.io/doT/index.html
 */

/* ** STRING EXTENSIONS ** */
if (!String.prototype.trim) String.prototype.trim             = function () { return this.replace(/^\s+|\s+$/g, ''); };
if (!String.prototype.ltrim) String.prototype.ltrim           = function () { return this.replace(/^\s+/,''); };
if (!String.prototype.rtrim) String.prototype.rtrim           = function () { return this.replace(/\s+$/,''); };
if (!String.prototype.startsWith) String.prototype.startsWith = function (str) { return this.lastIndexOf(str, 0) === 0; };

var Dedalus,
    story;

(function () {
    "use strict";
    /*jslint evil: true, white: true, nomen: true */
    /*global $, jQuery, doT*/

    /**
     * Base class Dedalus
     * @param  {JSON} options A dictionary of configuration options:
     *                              {
     *                                  domSource:    A jQuery object with the root
     *                                                element containing the story
     *                                                source
     *                                  dedleeSource: If this jQuery element is set,
     *                                                assume that the story is in dadlee
     *                                                format and hosted in this element
     *                              }
     * @return                      A Dedalus instance
     */
    Dedalus = function (options) {
        // Ignore parsing the story source if called as prototype constructor by
        // a class inheriting from this
        this.options       = options;
        if (this.options) {
            this.dedleeSource  = this.options.dedleeSource;
            this.domSource     = this.options.domSource;
            this._story        = this.options ? this.parseStory() : {};
        }

        // Make sure that story is not undefined
        this._story || (this._story = {});

        // Variables to store previous running states to be restored by undo
        // actions
        this.storyUndo     = {};
        this._storyUndo    = {};

        // Publish / Subscribe dispatcher
        this.messageCenter = makeMessageCenter();

        // Set global story
        story = this.generateEmptyStory();
    };

    /**
     * Parse the story file passed by domSource
     * @param  {jQuery} domSource A jQuery object with the root element
     *                            containing the story source
     *
     * @return {JSON}             An object containing all the information
     *                            about the story. This is different from the global
     *                            story variable since its contains more infos that
     *                            are not shared outside the class
     */
    Dedalus.prototype.parseStory = function () {
        var _story = {
                currentPage                 : '',
                title                       : '',
                inventory                   : [],
                pages                       : {},
                paragraphs                  : {},
                objects                     : {},
                initialization              : '',
                intro                       : '',
                numParagraphsShown          : 0,
                numPagesTurned              : 0,
                numParagraphsShownInPage    : 0,
                numTotalActions             : 0,
                numActionsPerformedInPage   : 0,
                combinationActionInProgress : false,
                beforeEveryThing            : function () {},
                beforeEveryPageTurn         : function () {},
                beforeEveryParagraphShown   : function () {},
                afterEveryThing             : function () {},
                afterEveryPageTurn          : function () {},
                afterEveryParagraphShown    : function () {}
            },
            temporaryDomSourceCopy;

        /**
         * Get the title of the story
         * @param  {jQuery} parent Element containing <title>
         * @return {String}        The title of the story
         */
        function getTitleLocal (parent) {
            return parent.find('title').html() || "A Dedalus Story";
        }

        /**
         * Get the custom javascript code to be executed when the story starts
         * running
         * @param  {jQuery} parent Element containing <initscript>
         * @return {String}        Javascript source code to be executed in the
         *                         story initialization fase
         */
        function getInitScript (parent) {
            return parent.find('initscript').text();
        }

        /**
         * Get the html to be present to the player (only once) as introductory
         * text
         * @param  {jQuery} parent Element containing <id="#intro">
         * @return {String}        HTML to be presented
         */
        function getIntroLocal (parent) {
            return parent.find('#intro').html();
        }

        /**
         * Get all the objects and character elements defined within parent. Parent
         * can be either the top level story or one of its sub elements (for example
         * get the objects defined within a page)
         * text
         * @param  {jQuery} parent Element to be searched for <obj> and <character>
         * @return {JSON}   A dictionary mapping the objects found:
         *                  {
         *                      'Object Name': {
         *                          actions:          {
         *                                                'Action Name': {
         *                                                    when:        Function (returning a bool) determining whether
         *                                                                 the action must be presented in a given context
         *                                                    content:     doT template to be printed when the action is executed
         *                                                    with:    {   "with" combinations
         *                                                        'Object to combine with': doT template to be printed when the action is executed
         *                                                    },
         *                                                    hasWith:     Boolean: true if "with" has any value
         *                                                }
         *                                            }
         *                          inventoryName:    Name to be used to present
         *                                            the object once added to
         *                                            the inventory
         *                          getActiveActions: Function returning the actions active in a given moment
         *                                            (determined by calling "when" of actions)
         *                      }
         *                  }
         */
        function getObjects (parent) {
            var objects = {};

            parent.find('>obj, >character').each(function () {
                var obj           = $(this),
                    id            = obj.attr('id'),
                    inventoryName = obj.attr('inventoryName');

                objects[id] = {
                    actions       : {},
                    inventoryName : inventoryName
                };

                /**
                 * Run "when" on every object action and return those for which
                 * it is true
                 * @return {JSON} A dictionary of active action objects
                 */
                function getActiveActions () {
                    var action,
                        actions = {},
                        object = objects[id];

                    for (action in object.actions) {
                        if (object.actions.hasOwnProperty(action)) {
                            if (object.actions[action].when()) {
                                actions[action] = object.actions[action];
                            }
                        }
                    }
                    return actions;
                }

                // object actions
                obj.find('action').each(function () {
                    var whenCheck        = function () { return true; },
                        action           = $(this),
                        when             = action.find('when').text() || undefined,
                        withCombinations = {},
                        hasCombinations  = false;

                    if (when !== undefined) {
                        whenCheck = function () { return eval(when); };
                    }

                    action.find('when').remove();

                    // combination actions ("with" interactions)
                    action.find('with').each(function () {
                        var withElement  = $(this),
                            withPartner  = withElement.attr('id'),
                            withContent  = doT.template(Dedalus.getRawContent(withElement));

                        withCombinations[withPartner] = withContent;
                        hasCombinations               = true;

                        withElement.remove();
                    });

                    objects[id].actions[action.attr('id')] = {
                        'when'    : whenCheck,
                        'content' : doT.template(Dedalus.getRawContent(action)),
                        'hasWith' : hasCombinations,
                        'with'    : withCombinations
                    };
                });

                objects[id].getActiveActions = getActiveActions;
            });

            return objects;
        }

        /**
         * Get all the paragraphs within parent. Parent can be either the top level
         * story or one of its pages
         * @param  {jQuery} parent Element to be searched for <paragraph>
         * @return {JSON}   A dictionary of paragraph objects:
         *                  {
         *                      'Paragraph Name': {
         *                          content: a doT template for later execution
         *                      }
         *                  }
         */
        function getParagraphs (parent) {
            var paragraphs = {};

            parent.find('paragraph').each(function () {
                var paragraph = $(this),
                    id        = paragraph.attr('id');

                paragraphs[id] = {
                    content: doT.template(Dedalus.getRawContent(paragraph))
                };
            });
            return paragraphs;
        }

        /**
         * Get all the paragraphs within parent
         * @param  {jQuery} parent Element to be searched for <page>
         * @return {JSON}   A dictionary of page objects:
         *                  {
         *                      'Page Name': {
         *                          content:    a doT template for later execution
         *                          objects:    a dictionary of objects (see above)
         *                                      only accesible from within the page
         *                          paragraphs: a dictionary of paragraphs (see above)
         *                                      only accesible from within the page
         *                          isFirst:    true if this is the first page to be
         *                                      shown at startup after displaying the
         *                                      intro (<class="first">)
         *                      }
         *                  }
         */
        function getPages (parent) {
            var pages = {};

            parent.find('page').each(function () {
                var page = $(this),
                    id  = page.attr('id');


                pages[id] = {
                    objects    : getObjects(page),
                    paragraphs : getParagraphs(page),
                    isFirst    : page.hasClass('first')
                };
                page.find('obj, paragraph, character').remove();
                pages[id].content = doT.template(Dedalus.getRawContent(page));

            });
            return pages;
        }

        /**
         * Get the d of the page defined as first to be displayed after the
         * intro
         * @param  {jQuery} parent Element to be searched for <page class="first">
         * @return {String}        Id of the page
         */
        function getInitialCurrentPage (parent) {
            return parent.find('page.first').attr('id');
        }

        /**
         * Get the initial inventory (empty)
         * @return {Array} Empty array
         */
        function getInitialInventory () {
            return [];
        }

        /**
         * Set up _story functions for timed events to be executed before or after
         * page turns, paragraph showing and so on
         * @param  {jQuery} parent Element to be searched for:
         *                         <beforeEveryThing>
         *                         <beforeEveryPageTurn>
         *                         <beforeEveryParagraphShown>
         *                         <afterEveryThing>
         *                         <afterEveryPageTurn>
         *                         <afterEveryParagraphShown>
         */
        function setBeforeAfterActions (parent) {
            _story.beforeEveryThing          = parent.find('beforeEveryThing').text();
            _story.beforeEveryPageTurn       = parent.find('beforeEveryPageTurn').text();
            _story.beforeEveryParagraphShown = parent.find('beforeEveryParagraphShown').text();
            _story.afterEveryThing           = parent.find('afterEveryThing').text();
            _story.afterEveryPageTurn        = parent.find('afterEveryPageTurn').text();
            _story.afterEveryParagraphShown  = parent.find('afterEveryParagraphShown').text();
        }

        // If the story is in dadlee format, first convert it into the normal
        // HTML-like format
        if (this.dedleeSource) {
            this.parseDedlee(this.dedleeSource, this.domSource);
        }

        // Make a temporary copy of domSource so that the destructive process
        // of parsing it can be restored
        temporaryDomSourceCopy = this.domSource.children().clone(true);


        // Prepare _story and returns it
        _story.currentPage    = getInitialCurrentPage(this.domSource);
        _story.initialization = getInitScript(this.domSource);
        _story.intro          = getIntroLocal(this.domSource);
        _story.inventory      = getInitialInventory(this.domSource);
        _story.objects        = getObjects(this.domSource);
        _story.pages          = getPages(this.domSource);
        _story.paragraphs     = getParagraphs(this.domSource);
        _story.title          = getTitleLocal(this.domSource);
        setBeforeAfterActions(this.domSource);

        // Restore untouched domSource
        this.domSource.html('').append(temporaryDomSourceCopy);
        return _story;
    };

    /**
     * Generate a dictionary with the public methods of the global "story" object
     * @return {JSON} A dictionary representing the initial "story" variable
     */
    Dedalus.prototype.generateEmptyStory = function () {
        return {
            currentPageIs                : this.currentPageIs.bind(this),
            removeFromInventory          : this.removeFromInventory.bind(this),
            putInInventory               : this.putInInventory.bind(this),
            isInInventory                : this.isInInventory.bind(this),
            getNumTotalActions           : this.getNumTotalActions.bind(this),
            getNumActionsPerformedInPage : this.getNumActionsPerformedInPage.bind(this),
            getNumPagesTurned            : this.getNumPagesTurned.bind(this),
            getNumParagraphsShown        : this.getNumParagraphsShown.bind(this),
            getNumParagraphsShownInPage  : this.getNumParagraphsShownInPage.bind(this),
            turnTo                       : this.turnTo.bind(this),
            disable                      : this.disable.bind(this),
            enable                       : this.enable.bind(this),
            showParagraph                : this.showParagraph.bind(this),
            endGame                      : this.endGame.bind(this)
        };
    };

    /**
     * Main method for the handle of output. Its concrete realization is implementation
     * specific and is delegated to executePrinting()
     * @param  {doT}    content  A doT template function with the contend to display
     * @param  {Bool}   turnPage True if the printing must generate a change of page
     */
    Dedalus.prototype.print = function (content, turnPage) {
        // Saves the current application state before changin it in order to gather
        // data for the undo
        this.storyUndo      = jQuery.extend(true, {}, story);
        this._storyUndo     = jQuery.extend(true, {}, this._story);
        this.afterUndoSave();

        this.executeBeforeEveryThing();

        this.executePrinting(content, turnPage);

        this.executeAfterEveryThing();

        this._story.numTotalActions += 1;
        this._story.numActionsPerformedInPage += 1;
    };

    /**
     * Display a page.
     * @param  {String} target Id of the page to present
     * @param  {Bool}   noTurn Whether the page must generate a page turn. Defauls
     *                         to true
     */
    Dedalus.prototype.turnTo = function (target, noTurn) {
        var isNoTurn    = noTurn || false,
            pageToPrint = this.getPage(target),
            content     = pageToPrint.content;

        this.executeBeforeEveryPageTurn();

        if (!isNoTurn) {
            this.print(content, true);

            // Set current page unless it is the intro page that must be shown
            // only once and right before page.first
            if (target !== 'intro') {
                this.setCurrentPageId(target);
            }
        } else {
            this.print(content);
        }

        this.executeAfterEveryPageTurn();

        // Update counters.
        this._story.numParagraphsShownInPage  =  0;
        this._story.numActionsPerformedInPage =  0;
        this._story.numPagesTurned            += 1;
    };

    /**
     * Display a paragraph.
     * @param  {String} target Id of the paragraph to present
     */
    Dedalus.prototype.showParagraph = function (target) {
        var paragraphToPrint = this.getParagraph(target),
            content          = paragraphToPrint.content;

        this.executeBeforeEveryParagraphShown();

        this.print(content);

        this.executeAfterEveryParagraphShown();

        // Update counters.
        this._story.numParagraphsShown       += 1;
        this._story.numParagraphsShownInPage += 1;
    };

    /**
     * Return the page object with a given id
     * @param  {String} id Id of the page to return
     * @return {JSON}      Page object
     */
    Dedalus.prototype.getPage = function  (id) {
        return this._story.pages[id];
    };

    /**
     * Return the object with a given id. Try to search it within the current
     * page objects array and if not found return the top level one
     * @param  {String} id Id of the object to return
     * @return {JSON}      Object found
     */
    Dedalus.prototype.getObject = function  (id) {
        var maybeObject = this.getCurrentPage().objects[id];

        return maybeObject !== undefined ? maybeObject : this._story.objects[id];
    };

    /**
     * Get the active actions for the given object in a context
     * @param  {String} id Id of the object whose actions are to return
     * @return {JSON}   Dictionary of active actions (see parseStory.getObjects)
     */
    Dedalus.prototype.getActionsForObject = function (id) {
        var action,
            actions = [],
            object  = this.getObject(id);

        // filter actions whose "when" parameter is currently true
        for (action in object.actions) {
            if (object.actions.hasOwnProperty(action)) {
                if (object.actions[action].when()) {
                    actions.push(object.actions[action]);
                }
            }
        }

        return actions;
    };

    /**
     * Return the paragraph with a given id. Try to search it within the current
     * page paragraphs array and if not found return the top level one
     * @param  {String} id Id of the paragraph to return
     * @return {JSON}      Paragraph found
     */
    Dedalus.prototype.getParagraph = function (id) {
        var maybeParagraph = this.getCurrentPage().paragraphs[id];

        return maybeParagraph !== undefined ? maybeParagraph : this._story.paragraphs[id];
    };

    /**
     * Keep track of an ongoind combination action
     */
    Dedalus.prototype.activateCombinationAction = function () {
        this._story.combinationActionInProgress = true;
    };

    /**
     * Stop keeping track of an ongoind combination action
     */
    Dedalus.prototype.disactivateCombinationAction = function () {
        this._story.combinationActionInProgress = false;
    };

    /**
     * Whether a combination action is awaiting for a target
     * @return {Boolean} true if there is a combination action awaiting
     *                        for a target
     */
    Dedalus.prototype.isCombinationAction = function () {
        return this._story.combinationActionInProgress;
    };

    /**
     * Check if the current page is the provided one
     * @param  {String} page Id of the page to check against
     * @return {Bool}        Whether current page id is the given page id
     */
     Dedalus.prototype.currentPageIs = function (page) {
        return this._story.currentPage === page;
    };

    /**
     * Remove an item from the inventory and trigger a "modified invetory" event
     * on the message center
     * @param  {String} object Id of the object to remove
     */
    Dedalus.prototype.removeFromInventory = function (object) {
        var i;

        for (i = 0; i < this._story.inventory.length; i += 1) {
            if (this._story.inventory[i] === object) {
                this._story.inventory = this._story.inventory.splice(i, i);
            }
        }

        this.messageCenter.publish('inventory', 'inventoryChanged');
    };

    /**
     * Add an item to the inventory and trigger a "modified invetory" event
     * on the message center
     * @param  {String} object Id of the object to add
     */
    Dedalus.prototype.putInInventory = function (object) {
        this.removeFromInventory(object);
        this._story.inventory.push(object);

        this.messageCenter.publish('inventory', 'inventoryChanged');
    };

    /**
     * Check if an object is currenlty in the inventory
     * @param  {String} object Id of teh object to check the presence of
     * @return {Bool}          Whether the object is in the inventory
     */
    Dedalus.prototype.isInInventory = function (object) {
        return this._story.inventory.indexOf(object) !== -1;
    };

    /**
     * Run the initialization javascript peculiar to the story being executed
     */
    Dedalus.prototype.executeInitialization = function () {
        eval(this._story.initialization);
    };

    /**
     * Return the introductory content of the story
     * @return {String} HTML to be present at startup
     */
    Dedalus.prototype.getIntro = function () {
        return this._story.intro;
    };

    /**
     * Return the stry title
     * @return {String} Story title
     */
    Dedalus.prototype.getTitle = function () {
        return this._story.title;
    };

    /**
     * Return the inventory object
     * @return {JSON} Dictionary with all the objects currently in inventory
     */
    Dedalus.prototype.getInventory = function () {
        return this._story.inventory;
    };

    /**
     * Return the current page id
     * @return {String} Id of the current page
     */
    Dedalus.prototype.getCurrentPageId = function () {
        return this._story.currentPage;
    };

    /**
     * Set the current page
     * @param  {String} id Id of the page wanted as current page
     */
    Dedalus.prototype.setCurrentPageId = function (id) {
        this._story.currentPage = id;
    };

    /**
     * Return the current page object
     * @return {JSON} Page object
     */
    Dedalus.prototype.getCurrentPage = function () {
        return this.getPage(this._story.currentPage);
    };

    /**
     * Return the number of actions (everything that triggered a display action)
     * @return {Integer} Number of actions performed at the current moment
     */
    Dedalus.prototype.getNumTotalActions = function () {
        return this._story.numTotalActions;
    };

    /**
     * Return the number of actions (everything that triggered a display action)
     * since entering the current page
     * @return {Integer} Number of actions performed at the current moment in the
     * current page
     */
    Dedalus.prototype.getNumActionsPerformedInPage = function () {
        return this._story.numActionsPerformedInPage;
    };

    /**
     * Return the total number of pages shown so far
     * @return {Integer} Number of pages shown at the current moment
     */
    Dedalus.prototype.getNumPagesTurned = function () {
        return this._story.numPagesTurned;
    };

    /**
     * Return the total number of paragraphs shown so far
     * @return {Integer} Number of paragraphs shown at the current moment
     */
    Dedalus.prototype.getNumParagraphsShown = function () {
        return this._story.numParagraphsShown;
    };

     /**
     * Return the total number of paragraphs shown from the last page turn
     * @return {Integer} Number of paragraphs shown in the page at the current moment
     */
    Dedalus.prototype.getNumParagraphsShownInPage = function () {
        return this._story.numParagraphsShownInPage;
    };

    /**
     * Reset the page and paragraph counters
     */
    Dedalus.prototype.resetCounters = function () {
        this._story.numPagesTurned            = 0;
        this._story.numParagraphsShown        = 0;
        this._story.numParagraphsShownInPage  = 0;
        this._story.numTotalActions           = 0;
        this._story.numActionsPerformedInPage = 0;
    };

    /**
     * Undo the last issued action. The concrete implementation is delegated to
     * executeUndo()
     */
    Dedalus.prototype.undo  = function () {
        story       = jQuery.extend({}, this.storyUndo);
        this._story = jQuery.extend({}, this._storyUndo);
        this.executeUndo();
    };

    /**
     * Save the current story running state. The concrete implementation is
     * delegated to executeSave
     */
    Dedalus.prototype.save = function () {
        this.executeSave(story, this._story);
    };

    /**
     * Restore the application to the last saved position. The concrete implementation
     * is delegated to executeRestore(). Execute the restore of if there is any
     * save available. The check of save avaibility is implementation specific.
     */
    Dedalus.prototype.restore = function () {
        var savedData   = this.getRestoreData(),
            savedStory  = savedData[0],
            saved_Story = savedData[1];

        if (this.saveAvailable()) {
            // Restores story and _story to the initial state and merges into them
            // the saved stated
            this._story = jQuery.extend(true, this.parseStory(this.options.domSource), saved_Story);
            story       = jQuery.extend(true, this.generateEmptyStory(), savedStory);

            this.executeRestore();
        }

    };

    /**
     * Restart the execution of the story
     */
    Dedalus.prototype.reset = function () {
        this._story = this.parseStory(this.options.domSource);
        story       = this.generateEmptyStory();

        this.executeReset();
    };

    /**
     * If the story defines a <beforeEveryThing> script, execute it
     */
    Dedalus.prototype.executeBeforeEveryThing  = function () {
        eval(this._story.beforeEveryThing);
    };

    /**
     * If the story defines a <beforeEveryPageTurn> script, execute it
     */
    Dedalus.prototype.executeBeforeEveryPageTurn  = function () {
        eval(this._story.beforeEveryPageTurn);
    };

    /**
     * If the story defines a <beforeEveryParagraphShown> script, execute it
     */
    Dedalus.prototype.executeBeforeEveryParagraphShown  = function () {
        eval(this._story.beforeEveryParagraphShown);
    };

    /**
     * If the story defines a <afterEveryThing> script, execute it
     */
    Dedalus.prototype.executeAfterEveryThing  = function () {
        eval(this._story.afterEveryThing);
    };

    /**
     * If the story defines a <afterEveryPageTurn> script, execute it
     */
    Dedalus.prototype.executeAfterEveryPageTurn  = function () {
        eval(this._story.afterEveryPageTurn);
    };

    /**
     * If the story defines a <afterEveryParagraphShown> script, execute it
     */
    Dedalus.prototype.executeAfterEveryParagraphShown  = function () {
        eval(this._story.afterEveryParagraphShown);
    };



    /* ** TO BE CUSTOMIZED BY IMPLEMENTATIONS ** */

    /**
     * Implementation-specific display action
     * @param  {doT}  content  dotT template function whose result must be displayed
     * @param  {Bool} turnPage Whether to turn page before the display. Defaults to false
     */
    Dedalus.prototype.executePrinting = function (content, turnPage) {};

    /**
     * Implementation-specific undo action
     */
    Dedalus.prototype.executeUndo = function () {};

    /**
     * Implementation-specific save action
     * @param  {JSON} story    Dedalus story object to save
     * @param  {JSON} _story   Dedalus _story object to save
     */
    Dedalus.prototype.executeSave = function (story, _story) {};

    /**
     * Check if there is any save state available
     * @return {Bool} Whether there is any saved state available
     */
    Dedalus.prototype.saveAvailable = function () {};

    /**
     * Implementation-specific restore action
     */
    Dedalus.prototype.executeRestore = function () {};

    /**
     * Implementation-specific reset action
     */
    Dedalus.prototype.executeReset = function () {};

    /**
     * Return restored data
     * @return {Array} An array whose first element is the restored from save
     *                 Dedauls story object, and the second is Dedalus _story:
     *                 [story, _story]
     */
    Dedalus.prototype.getRestoreData = function () {};

    /**
     * Implementation specific action executed after the freezing of a state for
     * undoing purposes
     */
    Dedalus.prototype.afterUndoSave = function () {};

    /**
     * Implementation specific method to convert an interactive element (such as
     * "turn to" or "interact with") into a normal text. The process can be
     * restored by Dedalus.prototype.enable()
     * @param  {jQUery} element Link to be disabled
     */
    Dedalus.prototype.disable = function (element) {};

    /**
     * Implementation specific method to revert a previously disabled interactive
     * element (see Dedalus.prototype.enable())
     */
    Dedalus.prototype.enable = function () {};

    /**
     * Implementation specific action executed when the story comes to an end
     */
    Dedalus.prototype.endGame = function () {};

    /**
     * Get the content of a given jQuery element and returns is "as is", without
     * any encoding that may occur with the use of .html() or .text()
     * @param  {jQuery} element jQuery element whose content has to be returned as
     *                          string
     * @return {String}         String with the raw content of element
     */
    Dedalus.getRawContent = function (element) {
        var contents = element.contents(),
            out      = '';

        contents.each(function () {
            out += this.nodeType === 3 ? this.nodeValue : this.outerHTML;
        });

        return out;
    };

    /* ** UTILTY FUNCTIONS ** */


    /**
     * Generate a message dispatcher that implements the Publish/Subscribe pattern
     * @return {JSON} A message center object:
     *                {
     *                    publish     : Function to issue messages
     *                    subscribe   : Function to subscribe to the message center
     *                    unsubscribe : Function to unsubscribe to the message center
     *                }
     */
    function makeMessageCenter () {
        // A dictionary of channel objects:
        //      {
        //          'Channel name': {
        //              'Subscriber name': Function to be called when a message is
        //                                 published to the channel
        //          }
        //      }
        var channels = {};

        /**
         * Called with a functions, agrees to receive notifications when new
         * messages are issued to that channel
         * @param  {String}   channel    Identifier of the channel
         * @param  {String}   subscriber Identifier of the subscriber
         * @param  {Function} callback   Function to be called when a new message
         *                               message is published to the channel
         */
        function subscribe (channel, subscriber, callback) {
            if (!channels.hasOwnProperty(channel)) { channels[channel] = {}; }
            channels[channel][subscriber] = callback;
        }

        /**
         * Removes a subscriber from the channel
         * @param  {String} channel    Identifier of the channel to be removed from
         * @param  {String} subscriber Identifier of the subscriber that wants to
         *                             be removed
         */
        function unsubscribe (channel, subscriber) {
            if (!channels.hasOwnProperty(channel)) { channels[channel] = {}; }
            if (channels[channel].hasOwnProperty(subscriber)) {
                delete channels[channel][subscriber];
            }
        }

        /**
         * Calls the function (passing message) defined by every subscriber that
         * subscribed the channel where the message is issued
         * @param  {String} channel Identifier of the channel where the message
         *                          is published
         * @param  {Object} message Object to pass to the function
         */
        function publish (channel, message) {
            var subscriber;

            if (channels.hasOwnProperty(channel)) {
                for (subscriber in channels[channel]) {
                    if (channels[channel].hasOwnProperty(subscriber)) {
                        channels[channel][subscriber](message);
                    }
                }
            }
        }

        return {
            publish     : publish,
            subscribe   : subscribe,
            unsubscribe : unsubscribe
        };
    }

}());

/**
 * dedalus-web.js v0.9.6
 * 2013, Gustavo Di Pietro
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl-2.0.html)
**/

/**
 * DedalusWeb is an implementatio on Dedalus (that DedalusWeb depens on) that
 * runs a Dedalus story in a browser
 */

var DedalusWeb;

(function () {
    "use strict";
    /*jslint evil: true, white: true, nomen: true */
    /*global Dedalus, $, jQuery, doT, localStorage*/

    /**
     * DedalusWeb class inheriting from Dedalus
     * @param  {JSON} options A dictionary of configuration options:
     *                            {
     *                                domTarget:         jQuery element that will contain the output
     *                                                   of the running story
     *                                inventoryTarget:   jQuery element that will contain the inventory
     *                                                   items
     *                                titleTarget:       jQuery element that will contain the title
     *                                                   of the story
     *                                interactionTarget: jQuery element that will contain the dynamic
     *                                                   action menu. Should have "position: absolute"
     *                                undoTarget:        jQuery <a> element that, clicked, runs the undo
     *                                                   action
     *                                saveTarget:        jQuery <a> element that, clicked, runs the save
     *                                                   action
     *                                restoreTarget:     jQuery <a> element that, clicked, runs the restore
     *                                                   action
     *                                resetTarget:       jQuery <a> element that, clicked, runs the reset
     *                                                   action
     *                                undoStageTarget:   jQuery element that will contain a temporary copy
     *                                                   of domTarget. Should have "display: none"
     *                            }
     * @return                    A DedalusWeb instance
     */
    DedalusWeb = function (options) {
        var self = this;

        Dedalus.call(this, options);

        this.domTarget         = options.domTarget;
        this.inventoryTarget   = options.inventoryTarget;
        this.titleTarget       = options.titleTarget;
        this.interactionTarget = options.interactionTarget;
        this.undoTarget        = options.undoTarget;
        this.saveTarget        = options.saveTarget;
        this.restoreTarget     = options.restoreTarget;
        this.resetTarget       = options.resetTarget;
        this.undoStageTarget   = options.undoStageTarget;
        this.domTargetParent   = options.domTargetParent;
        this.onPrint           = options.onPrint ? options.onPrint.bind(this) : this.onPrint;
        this.onInventoryUpdate = options.onInventoryUpdate ? options.onInventoryUpdate.bind(this) : this.onInventoryUpdate;

        // Set the utility buttons functionality
        this.undoTarget.on('click', this.undo.bind(this));
        this.saveTarget.on('click', this.save.bind(this));
        this.restoreTarget.on('click', this.restore.bind(this));
        this.resetTarget.on('click', this.reset.bind(this));

        // Set the title
        this.titleTarget.html(this.getTitle());

        // Set the story to its initial state
        this.executeReset();

        // Subscribe to inventory changes
        this.messageCenter.subscribe('inventory', 'dedalusWeb', this.updateInventory.bind(this));

        // Make the interaction menu disappear on body click if there is no combination
        // action awaiting for a parameter
        $('body, html').on('click', function () {
            if(!self.isCombinationAction()) {
                self.interactionTarget.hide();
                self.disactivateCombinationAction();
            }
        });

    };

    DedalusWeb.prototype = new Dedalus();

    /**
     * Convert all the meningful tags (<turn to>, <interact with>, <show paragraph>)
     * withing domTarget into action links
     */
    DedalusWeb.prototype.handleInteractions = function () {
        var self = this;

        /**
         * Convert a target element into a link than, when clicked, runs fn with
         * argument attrib
         * @param  {String}   element Element to convert into <a>
         * @param  {String}   attrib  Attribute to pass to fn
         * @param  {String}   type    object|parapgraph|page added as class to the newly
         *                            created link
         * @param  {Function} fn      Function to be executed when the newly created
         *                            link is clicked
         */
        function handle (element, attrib, type, fn) {
            self.domTarget.find(element).each(function () {
                var elem       = $(this),
                    target     = elem.attr(attrib),
                    originalId = elem.attr('id'),
                    elemId     = originalId ? 'data-id="' + elem.attr('id') + '"' : '',
                    targetId   = 'data-target-id="' + target + '"',
                    isDisabled = elem.hasClass('disabled'),
                    text       = elem.text(),
                    link       = $('<a href="#" ' + elemId + ' ' + targetId + '>' + text + '</a>');

                link.on('click', function (e) {
                    fn(target, e);
                    e.stopPropagation();
                    return false;
                });

                link.addClass(type);

                elem.after(link);
                elem.remove();

                // Actually disable a pre-desabled link (has class="disabled"). Must have an id
                if (isDisabled) {
                    self.disable(originalId);
                }

            });
        }

        // Convert <turn to> (turn page action)
        handle('turn', 'to', 'page', function (target) {
            self.turnTo(target);
            self.interactionTarget.hide();
        });

        // Convert <interact with> (object or character action)
        handle('interact', 'with', 'object', function (target, e) {
            self.interactWith(target, e);
        });

        // Convert <show paragraph> (paragraph element)
        handle('show', 'paragraph', 'paragraph', function (target) {
            self.showParagraph(target);
            self.interactionTarget.hide();
        });
    };

    /**
     * Return the actions available for the interaction with a given object
     * @param  {String}       target Id of the object or character to interact with
     * @param  {jQuery Event} e      Event generated when clicking on the element
     * @return {JSON}                A dictionary with the available actions
     */
    DedalusWeb.prototype.interactWith = function (target, e) {
        var action,
            content, link,
            self           = this,
            object         = this.getObject(target),
            actions        = object.getActiveActions(),
            clickedElement = $(e.target);

        this.interactionTarget.html('<ul></ul>');

        /**
         * Generate a function to be attached to an action menu item that, when
         * clicked, prints cont
         * @param  {JSON} action Dedalus object action to make "onClick" for
         * @return {Function}    The function to be called on object click
         */
        function makeOnClick (action) {
            return function () {

                // If the action is of type "use this in combination with something else"
                // set the current combination action and populate interactionTarget
                // with possible candidates (all the objects visible in domTarget and
                // those in the inventory, exluding the object calling the combination
                // action), else execute the action
                if (action.hasWith) {
                    self.activateCombinationAction();
                    self.interactionTarget.html('<ul></ul>');

                    $(self.domTarget).find('a.object').add($(self.inventoryTarget).find('a')).each(function(idx, elem) {
                        var element                  = $(elem),
                            link                     = $(element.prop('outerHTML')),
                            targetId                 = link.attr('data-target-id'),
                            object                   = self.getObject(targetId),
                            elemText                 = link.text(),
                            linkText                 = object.inventoryName || elemText,
                            combinationActionContent = action['with'][targetId] || action.content;

                        // Skip current object, it cannot be associated with itself!
                        if (targetId === target) {
                            return;
                        }

                        // Set the text of the new <a> to inventoryName of the object
                        // or to the current link text
                        link.text(linkText);

                        link.on('click', function () {
                            self.print(combinationActionContent);
                            self.interactionTarget.hide();
                            self.handleInteractions();
                            self.disactivateCombinationAction();
                        });

                        self.interactionTarget.find('ul').append(link);
                        self.interactionTarget.find('ul>a').wrap('<li>');
                    });
                } else {
                    self.print(action.content);
                    self.interactionTarget.hide();
                    self.handleInteractions();
                    self.disactivateCombinationAction();
                }
            };
        }

        for (action in actions) {
            if (actions.hasOwnProperty(action)) {
                content = actions[action].content;
                link    = $('<a href="#" data-target-id="' + target + '">' + action + '</a>');

                link.on('click', makeOnClick(actions[action]));

                // Create the <a> within a <li> within the target <ul>
                this.interactionTarget.find('ul').append(link);
                this.interactionTarget.find('ul>a').wrap('<li>');

                // Position teh interaction host element under the clicked link
                // and centered to it
                this.interactionTarget.css('left', clickedElement.offset().left - (this.interactionTarget.width() / 2) + (clickedElement.width() / 2));
                this.interactionTarget.css('top',  clickedElement.offset().top + 20);

                this.interactionTarget.show();
            }
        }

        return actions;
    };

    /**
     * Refresh the inventory host element with the items currently in inventory
     */
    DedalusWeb.prototype.updateInventory = function () {
        var i, link, object, inventoryName,
            self  = this,
            items = this.getInventory(),
            links = [];

        this.inventoryTarget.html('<ul></ul>');

        /**
         * Generate a function to be attached to an action menu item that, when
         * clicked, triggers the object action
         * @param  {JSON} obj A story object item
         * @return {Function} The function to be called on object action click
         */
        function makeOnClick (obj) {
            return function (e) {
                self.interactWith(obj, e);
                e.stopPropagation();
                return false;
            };
        }

        for (i = 0; i < items.length; i += 1) {
            object        = this.getObject(items[i]);
            inventoryName = object.inventoryName;
            link          = $('<a href="#" data-target-id="' + items[i] + '">' + inventoryName + '</a>');

            link.on('click', makeOnClick(items[i]));

            links.push(link);
        }

        // Call optional custom bevavior
        links = this.onInventoryUpdate(links);

        for (i = 0; i < links.length; i += 1) {
            // Create the <a> within a <li> within the target <ul>
            this.inventoryTarget.find('ul').append(links);
        }

        this.inventoryTarget.find('ul>a').wrap('<li>');
    };

    DedalusWeb.prototype.executePrinting = function (content, turnPage) {
        var isTurn          = turnPage || false,
            wrappedContent  = '<p>' + content() + '</p>';

        if (!isTurn) {
            if (this.onPrint(wrappedContent, false)) {
                this.domTarget.append(wrappedContent);
            }
        } else {
            if (this.onPrint(wrappedContent, true)) {
                this.domTarget.html(wrappedContent);
            }
        }

        this.handleInteractions();
    };

    DedalusWeb.prototype.executeUndo = function () {
        // Empty domTarget and refill it with the previous state stored in
        // undoStageTarget
        this.domTarget.html('');
        this.undoStageTarget.appendTo(this.domTarget);
        this.updateInventory();
    };

    DedalusWeb.prototype.afterUndoSave = function () {
        // Empty undoStageTarget and refill it with a deep cloned copy of
        // domTarget
        this.undoStageTarget.html('');
        this.undoStageTarget = this.domTarget.children().clone(true);
    };

    DedalusWeb.prototype.executeSave = function (story, _story) {
        // Save story data in localStorage
        localStorage.story  = JSON.stringify(story);
        localStorage._story = JSON.stringify(_story);
    };

    DedalusWeb.prototype.saveAvailable = function () {
        return localStorage.story && localStorage._story;
    };

    DedalusWeb.prototype.getRestoreData = function () {
        return [jQuery.parseJSON(localStorage.story), jQuery.parseJSON(localStorage._story)];
    };

    DedalusWeb.prototype.executeRestore = function () {
        this.updateInventory();
        this.turnTo(this.getCurrentPageId());
    };

    DedalusWeb.prototype.executeReset = function () {
        this.turnTo('intro');
        this.turnTo(this.getCurrentPageId(), true);
        this.resetCounters();
        this.updateInventory();
        this.executeInitialization();

        this.interactionTarget.hide();
    };

    DedalusWeb.prototype.disable = function (id) {
        // Subsitute the matched <a> with a <span> remembering the click function
        var element = this.domTarget.find('a[data-id="' + id + '"]'),
            elementDom,
            spanElement,
            originalClickFn;

        if (element.length > 0) {
            elementDom      = element.get(0),
            spanElement     = '<span data-id="' + id + '">' + element.text() + '</span>',

            // Trick to get the current click event
            // http://stackoverflow.com/questions/2518421/jquery-find-events-handlers-registered-with-an-object
            originalClickFn = $._data(elementDom, 'events').click[0].handler;

            // Make the <a> a <span>
            element.after($(spanElement).data('originalClickFn', originalClickFn));
            element.remove();
        }
    };

    DedalusWeb.prototype.enable = function (id) {
        // Subsitute the matched <span> with a <a> restoring the click function
        var element         = this.domTarget.find('span[data-id="' + id + '"]'),
            aElement        = '<a href="#" data-id="' + id + '">' + element.text() + '</a>',
            originalClickFn = element.data('originalClickFn');

        // Restore original click function
        element.after($(aElement).on('click', originalClickFn));
        element.remove();
    };

    DedalusWeb.prototype.endGame = function () {
        // Disable all the links available in domTarget and inventoryTarget
        this.domTarget.find('a').off('click').contents().unwrap();
        this.inventoryTarget.find('a').off('click').contents().unwrap();
    };

    /**
     * Called before printing anything. Made to be extended, can be used to
     * customize the printing behavior.
     * @param  {doT template} content The content about to be printed
     * @param  {Boolean}      turn    Whether the printing triggers a page turn
     *                                or the text is just appended to the current
     *                                content
     * @return {Boolean}              If true, execute the normal printing, else
     *                                let the custom behavior handle the displaye
     *                                of the new content
     */
    DedalusWeb.prototype.onPrint = function (content, turn) {
        return true;
    };

    /**
     * Function to customize the items to be added to the inventory
     * @param  {Array<jQuery>} items A list of jQuery items to be added to the inventory
     * @return {Array<jQuery>}       like @param items, eventually manipulated
     */
    DedalusWeb.prototype.onInventoryUpdate = function (items) {
        return items;
    };

}());

/**
 * DedalusWeb.prototype.onPrint plugin. Present the new content with a nice fade,
 * by adding the page or paragraph completely transparent and then fading it in
 */
function onPrintFade (content, turn)
{
    "use strict";
    /*jslint white: true */

    var self = this, newElement;
    var time = 750;

    if (turn)
    {
        this.domTarget.css('opacity', 0);
        self.domTarget.html(content);
        this.domTarget.animate(
        {
            'opacity': 1
        }, time);
    }
    else
    {
        newElement = $(content).css('opacity', 0);
        this.domTarget.append(newElement);
        newElement.animate(
        {
            'opacity': 1
        }, time);
    }

    return false;
}

window.Artists = {}

function CleanName(name)
{
	return name.replace(/\W/g, '');
}

function Artist(name)
{
	this.Name = name;
	this.Examine = function() { return "a rare " + this.Name; }
	this.Get = function()
	{
		story.putInInventory(this.Name);
		return "you collect " + this.Name;
	}
	this.Activated = false;
	this.ActivateText = "you activate " + this.Name;

	var cleanName = CleanName(name);
	createArtistTag(name);

	Artists[cleanName] = this;
}

function makeArtists()
{
	window.characterNames =
	[
		"Angeli",
		"Angus",
		"Bex",
		"Callym",
		"Lu",
		"Ruth Spencer-Jolly",
		"Ruth Smith"
	];

	for (var i = 0; i < characterNames.length; ++i)
	{
		new Artist(characterNames[i]);
	}
}

function createArtistTag(artist)
{
	var cleanName = CleanName(artist);

	var obj = $('<obj/>',
	{
		id: artist,
		inventoryName: artist
	});

	var actionCollect = $('<action/>',
	{
		id: "Collect",
		text: "{{= Artists['" + cleanName + "'].Get() }}"
	});

	var whenCollect = $('<when/>',
	{
		text: "!story.isInInventory('" + artist + "')"
	});

	var actionExamine = $('<action/>',
	{
		id: "Examine",
		text: "{{= Artists['" + cleanName + "'].Examine() }}"
	});

	var actionActivate = $('<action/>',
	{
		id: "Activate",
		text: "{{= Activate('" + artist + "') }}"
	});

	var whenActivate = $('<when/>',
	{
		text: "CanActivate('" + artist + "')"
	});

	obj.append(actionCollect.append(whenCollect));
	obj.append(actionExamine);
	obj.append(actionActivate.append(whenActivate));

	$("#story").append(obj);
}

function Activate(artist)
{
	console.log("activate" + artist);

	var cleanNew = CleanName(artist);

	if (story.activatedArtist != null || typeof story.activatedArtist != 'undefined')
	{
		var cleanCurrent = CleanName(story.activatedArtist);
		var name = Artists[cleanCurrent].Name;
		Artists[cleanCurrent].Activated = false;
		$('#artistsList > #' + cleanCurrent + ' > a').removeClass("activated");
		console.log("Deactivated: " + name);
	}

	if (Artists.hasOwnProperty(cleanNew))
	{
		var name = Artists[cleanNew].Name;
		Artists[cleanNew].Activated = true;
		story.activatedArtist = name;
		$('#artistsList > #' + cleanNew + ' > a').addClass("activated");
		console.log("Activated: " + name);
		return Artists[cleanNew].ActivateText;
	}
	return "";
}

function CanActivate(artist)
{
	return (story.activatedArtist != artist) && (story.isInInventory(artist));
}

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;"undefined"!=typeof window?t=window:"undefined"!=typeof global?t=global:"undefined"!=typeof self&&(t=self),t.Slideout=e()}}(function(){var e,t,n;return function i(e,t,n){function o(r,a){if(!t[r]){if(!e[r]){var u=typeof require=="function"&&require;if(!a&&u)return u(r,!0);if(s)return s(r,!0);var l=new Error("Cannot find module '"+r+"'");throw l.code="MODULE_NOT_FOUND",l}var f=t[r]={exports:{}};e[r][0].call(f.exports,function(t){var n=e[r][1][t];return o(n?n:t)},f,f.exports,i,e,t,n)}return t[r].exports}var s=typeof require=="function"&&require;for(var r=0;r<n.length;r++)o(n[r]);return o}({1:[function(e,t,n){"use strict";var i=e("decouple");var o=e("emitter");var s;var r=false;var a=window.document;var u=a.documentElement;var l=window.navigator.msPointerEnabled;var f={start:l?"MSPointerDown":"touchstart",move:l?"MSPointerMove":"touchmove",end:l?"MSPointerUp":"touchend"};var c=function v(){var e=/^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/;var t=a.getElementsByTagName("script")[0].style;for(var n in t){if(e.test(n)){return"-"+n.match(e)[0].toLowerCase()+"-"}}if("WebkitOpacity"in t){return"-webkit-"}if("KhtmlOpacity"in t){return"-khtml-"}return""}();function h(e,t){for(var n in t){if(t[n]){e[n]=t[n]}}return e}function p(e,t){e.prototype=h(e.prototype||{},t.prototype)}function d(e){e=e||{};this._startOffsetX=0;this._currentOffsetX=0;this._opening=false;this._moved=false;this._opened=false;this._preventOpen=false;this._touch=e.touch===undefined?true:e.touch&&true;this.panel=e.panel;this.menu=e.menu;if(this.panel.className.search("slideout-panel")===-1){this.panel.className+=" slideout-panel"}if(this.menu.className.search("slideout-menu")===-1){this.menu.className+=" slideout-menu"}this._fx=e.fx||"ease";this._duration=parseInt(e.duration,10)||300;this._tolerance=parseInt(e.tolerance,10)||70;this._padding=this._translateTo=parseInt(e.padding,10)||256;this._orientation=e.side==="right"?-1:1;this._translateTo*=this._orientation;if(this._touch){this._initTouchEvents()}}p(d,o);d.prototype.open=function(){var e=this;this.emit("beforeopen");if(u.className.search("slideout-open")===-1){u.className+=" slideout-open"}this._setTransition();this._translateXTo(this._translateTo);this._opened=true;setTimeout(function(){e.panel.style.transition=e.panel.style["-webkit-transition"]="";e.emit("open")},this._duration+50);return this};d.prototype.close=function(){var e=this;if(!this.isOpen()&&!this._opening){return this}this.emit("beforeclose");this._setTransition();this._translateXTo(0);this._opened=false;setTimeout(function(){u.className=u.className.replace(/ slideout-open/,"");e.panel.style.transition=e.panel.style["-webkit-transition"]=e.panel.style[c+"transform"]=e.panel.style.transform="";e.emit("close")},this._duration+50);return this};d.prototype.toggle=function(){return this.isOpen()?this.close():this.open()};d.prototype.isOpen=function(){return this._opened};d.prototype._translateXTo=function(e){this._currentOffsetX=e;this.panel.style[c+"transform"]=this.panel.style.transform="translate3d("+e+"px, 0, 0)"};d.prototype._setTransition=function(){this.panel.style[c+"transition"]=this.panel.style.transition=c+"transform "+this._duration+"ms "+this._fx};d.prototype._initTouchEvents=function(){var e=this;this._onScrollFn=i(a,"scroll",function(){if(!e._moved){clearTimeout(s);r=true;s=setTimeout(function(){r=false},250)}});this._preventMove=function(t){if(e._moved){t.preventDefault()}};a.addEventListener(f.move,this._preventMove);this._resetTouchFn=function(t){if(typeof t.touches==="undefined"){return}e._moved=false;e._opening=false;e._startOffsetX=t.touches[0].pageX;e._preventOpen=!e._touch||!e.isOpen()&&e.menu.clientWidth!==0};this.panel.addEventListener(f.start,this._resetTouchFn);this._onTouchCancelFn=function(){e._moved=false;e._opening=false};this.panel.addEventListener("touchcancel",this._onTouchCancelFn);this._onTouchEndFn=function(){if(e._moved){e._opening&&Math.abs(e._currentOffsetX)>e._tolerance?e.open():e.close()}e._moved=false};this.panel.addEventListener(f.end,this._onTouchEndFn);this._onTouchMoveFn=function(t){if(r||e._preventOpen||typeof t.touches==="undefined"){return}var n=t.touches[0].clientX-e._startOffsetX;var i=e._currentOffsetX=n;if(Math.abs(i)>e._padding){return}if(Math.abs(n)>20){e._opening=true;var o=n*e._orientation;if(e._opened&&o>0||!e._opened&&o<0){return}if(o<=0){i=n+e._padding*e._orientation;e._opening=false}if(!e._moved&&u.className.search("slideout-open")===-1){u.className+=" slideout-open"}e.panel.style[c+"transform"]=e.panel.style.transform="translate3d("+i+"px, 0, 0)";e.emit("translate",i);e._moved=true}};this.panel.addEventListener(f.move,this._onTouchMoveFn)};d.prototype.enableTouch=function(){this._touch=true;return this};d.prototype.disableTouch=function(){this._touch=false;return this};d.prototype.destroy=function(){this.close();a.removeEventListener(f.move,this._preventMove);this.panel.removeEventListener(f.start,this._resetTouchFn);this.panel.removeEventListener("touchcancel",this._onTouchCancelFn);this.panel.removeEventListener(f.end,this._onTouchEndFn);this.panel.removeEventListener(f.move,this._onTouchMoveFn);a.removeEventListener("scroll",this._onScrollFn);this.open=this.close=function(){};return this};t.exports=d},{decouple:2,emitter:3}],2:[function(e,t,n){"use strict";var i=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(e){window.setTimeout(e,1e3/60)}}();function o(e,t,n){var o,s=false;function r(e){o=e;a()}function a(){if(!s){i(u);s=true}}function u(){n.call(e,o);s=false}e.addEventListener(t,r,false)}t.exports=o},{}],3:[function(e,t,n){"use strict";var i=function(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}};n.__esModule=true;var o=function(){function e(){i(this,e)}e.prototype.on=function t(e,n){this._eventCollection=this._eventCollection||{};this._eventCollection[e]=this._eventCollection[e]||[];this._eventCollection[e].push(n);return this};e.prototype.once=function n(e,t){var n=this;function i(){n.off(e,i);t.apply(this,arguments)}i.listener=t;this.on(e,i);return this};e.prototype.off=function o(e,t){var n=undefined;if(!this._eventCollection||!(n=this._eventCollection[e])){return this}n.forEach(function(e,i){if(e===t||e.listener===t){n.splice(i,1)}});if(n.length===0){delete this._eventCollection[e]}return this};e.prototype.emit=function s(e){var t=this;for(var n=arguments.length,i=Array(n>1?n-1:0),o=1;o<n;o++){i[o-1]=arguments[o]}var s=undefined;if(!this._eventCollection||!(s=this._eventCollection[e])){return this}s=s.slice(0);s.forEach(function(e){return e.apply(t,i)});return this};return e}();n["default"]=o;t.exports=n["default"]},{}]},{},[1])(1)});
