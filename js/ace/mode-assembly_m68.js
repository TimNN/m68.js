define("ace/mode/assembly_m68_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var AssemblyM68HighlightRules = function() {

    var comments = [
        {
            token: 'comment.assembly',
            regex: '[*;].*$'
        }
    ];

    var new_line = [
        {
            token: 'text',
            regex: '$',
            next: 'start'
        }
    ];

    var ident_rx = '[a-zA-Z_][a-zA-Z0-9_]*'

    var tests = [
        'hi', 'ls',
        'cc', 'cs',
        'ne', 'eq',
        'vc', 'vs',
        'pl', 'mi',
        'ge', 'lt', 'gt', 'le',
    ];

    tests = '(?:' + tests.join('|') + ')'

    var instructions = [
        'abcd',
        'add[aiqx]?',
        'andi?',
        'as[lr]',
        'b' + tests,
        'bchg', 'bclr',
        'bra',
        'bset',
        'bsr',
        'btst',
        'chk',
        'clr',
        'cmp[aim]?',
        'db' + tests,
        'div[su]',
        'eori?',
        'exg',
        'ext',
        'illegal',
        'jmp',
        'jsr',
        'lea',
        'link',
        'ls[lr]',
        'move[ampq]?',
        'mul[su]',
        'nbcd',
        'negx?',
        'nop',
        'not',
        'ori?',
        'pea',
        'reset',
        'rox?[lr]',
        'rt[ers]',
        'sbcd',
        's' + tests,
        'stop',
        'sub[aiqx]?',
        'swap',
        'tas',
        'trapv?',
        'tst',
        'unlk,'
    ];

    var directives = [
        'org',
        'equ',
        'simhalt',
        'end',
    ];

    var commands = '(' + instructions.concat(directives).join('|') + ')';

    this.$rules = {
        start: [
            {
                token: 'entitiy.name.function.assembly',
                regex: '^' + ident_rx + '$',
                caseInsensitive: true,
                next: 'start'
            }, {
                token: 'entitiy.name.function.assembly',
                regex: '^' + ident_rx + '\\b',
                caseInsensitive: true,
                next: 'instruction'
            }, {
                token: 'text',
                regex: '^\\s+(?=\\w)',
                next: 'instruction'
            }

        ].concat(comments),

        instruction: [
            {
                token: ['keyword.control.assembly', 'keyword.operator.assembly', 'keyword.control.assembly'],
                regex: '\\b' + commands + '(?:(\\.)([bwl]))?$',
                caseInsensitive: true,
                next: 'start'
            }, {
                token: ['keyword.control.assembly', 'keyword.operator.assembly', 'keyword.control.assembly'],
                regex: '\\b' + commands + '(?:(\\.)([bwl]))?\\b',
                caseInsensitive: true,
                next: 'values'
            }, {
                token: 'invalid',
                regex: '\\w+(?:\\.(?:b|w|l))?',
                caseInsensitive: true,
                next: 'values'
            }
        ].concat(comments),

        values: [
            {
                token: 'variable.parameter.register.assembly',
                regex: '\\b(?:[DA][0-7]|PC|SP)\\b',
                caseInsensitive: true
            }, {
                token: 'constant.character.hexadecimal.assembly',
                regex: '\\B\\$[A-F0-9]+\\b',
                caseInsensitive: true
            }, {
                token: 'constant.character.binary.assembly',
                regex: '\\B%[01]+\\b',
            }, {
                token: 'constant.character.octal.assembly',
                regex: '\\B@[0-7]+\\b',
            }, {
                token: 'constant.character.decimal.assembly',
                regex: '\\b[0-9]+\\b'
            }, {
                token: 'keyword.operator.assembly',
                regex: '(?:[#,\\-~+/&|^\\\\()]|<<|>>|\\*\\*)',
                merge: false
            }, {
                token: 'string',
                regex: '\'.*?\'',
                merge: false
            }, {
                token: 'entity.name.function.assembly',
                regex: '\\b' + ident_rx + '\\b',
            },
        ].concat(new_line).concat(comments ),
    }

    this.normalizeRules();
};

AssemblyM68HighlightRules.metaData = { fileTypes: [ 'x68' ],
      name: 'Assembly M68000',
      scopeName: 'source.assembly' }


oop.inherits(AssemblyM68HighlightRules, TextHighlightRules);

exports.AssemblyM68HighlightRules = AssemblyM68HighlightRules;
});

define("ace/mode/folding/coffee",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"], function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var BaseFoldMode = require("./fold_mode").FoldMode;
var Range = require("../../range").Range;

var FoldMode = exports.FoldMode = function() {};
oop.inherits(FoldMode, BaseFoldMode);

(function() {

    this.getFoldWidgetRange = function(session, foldStyle, row) {
        var range = this.indentationBlock(session, row);
        if (range)
            return range;

        var re = /\S/;
        var line = session.getLine(row);
        var startLevel = line.search(re);
        if (startLevel == -1 || line[startLevel] != "#")
            return;

        var startColumn = line.length;
        var maxRow = session.getLength();
        var startRow = row;
        var endRow = row;

        while (++row < maxRow) {
            line = session.getLine(row);
            var level = line.search(re);

            if (level == -1)
                continue;

            if (line[level] != "#")
                break;

            endRow = row;
        }

        if (endRow > startRow) {
            var endColumn = session.getLine(endRow).length;
            return new Range(startRow, startColumn, endRow, endColumn);
        }
    };
    this.getFoldWidget = function(session, foldStyle, row) {
        var line = session.getLine(row);
        var indent = line.search(/\S/);
        var next = session.getLine(row + 1);
        var prev = session.getLine(row - 1);
        var prevIndent = prev.search(/\S/);
        var nextIndent = next.search(/\S/);

        if (indent == -1) {
            session.foldWidgets[row - 1] = prevIndent!= -1 && prevIndent < nextIndent ? "start" : "";
            return "";
        }
        if (prevIndent == -1) {
            if (indent == nextIndent && line[indent] == "#" && next[indent] == "#") {
                session.foldWidgets[row - 1] = "";
                session.foldWidgets[row + 1] = "";
                return "start";
            }
        } else if (prevIndent == indent && line[indent] == "#" && prev[indent] == "#") {
            if (session.getLine(row - 2).search(/\S/) == -1) {
                session.foldWidgets[row - 1] = "start";
                session.foldWidgets[row + 1] = "";
                return "";
            }
        }

        if (prevIndent!= -1 && prevIndent < indent)
            session.foldWidgets[row - 1] = "start";
        else
            session.foldWidgets[row - 1] = "";

        if (indent < nextIndent)
            return "start";
        else
            return "";
    };

}).call(FoldMode.prototype);

});

define("ace/mode/assembly_m68",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/assembly_m68_highlight_rules","ace/mode/folding/coffee"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var AssemblyX86HighlightRules = require("./assembly_m68_highlight_rules").AssemblyM68HighlightRules;
var FoldMode = require("./folding/coffee").FoldMode;

var Mode = function() {
    this.HighlightRules = AssemblyM68HighlightRules;
    this.foldingRules = new FoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = ";";
    this.$id = "ace/mode/assembly_m868";
}).call(Mode.prototype);

exports.Mode = Mode;
});
