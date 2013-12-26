var _ = require("lodash");var MaximeCtor = function() {
  
  this.scope = {};
  
  var
    modules = {},
    modulesInitialized = false;
  
  function initModules() {
    var name;
    if (!modulesInitialized) {
      for (name in modules) {
        if (modules.hasOwnProperty(name)) {
          modules[name] = modules[name]();
        }
      }
      this.modulesInitialized = true;
    }
  }
  
  this.addModule = function(name, func) {
    modules[name] = func;
  };
  
  this.getModule = function(name) {
    initModules();
    var module = modules[name];
    if (!module) {
      throw new Error('Module ' + name + ' not found.');
    }
    return module;
  };
  
  this.declare = function(name, obj) {
    
    function addScope(names, parent) {
      if (names.length === 0) {
        return parent;
      }
      else {
        var name = names[0];
        parent[name] = parent[name] || {};
        return addScope(names.slice(1), parent[name]);
      }
    }
    
    var chain = name.split(/\./);
    var scope = addScope(chain.slice(0, chain.length - 1), this.scope);
    scope[chain[chain.length - 1]] = obj;
  };
  
};

var Maxime = new MaximeCtor();

(function() {
  
  function log() {
    debug = false;
    if (debug) {
      console.log.apply(null, arguments);
    }
  }
  
  function mergeAssignments(prev, next) {
    var existing = _.pluck(prev, 'name');
    next.forEach(function(assignment) {
      if (_.contains(existing, next.name)) {
        throw new Error('Duplicate variable in pattern: ' + next.name);
      }
    });
    return prev.concat(next);
  }
  
  function patternMatch(pattern, ref) {
    switch (pattern.type) {
      case "wildcard":
        return {
          match: true,
          assignments: []
        };
      case "variable":
        return {
          match: true,
          assignments: [ ref ]
        };
      case "literal":
        return {
          match: val === ref.value(),
          assignments: []
        };
      case "constructor":
        if (pattern.name === ref._constructor && pattern.params.length === ref._properties.length) {
          return _.zip([ pattern.params, ref._properties ]).reduce(function(prev, pair) {
            var
              subPattern = pair[0],
              ref = pair[1],
              match = patternMatch(subPattern, ref);
            return {
              match: prev.match && match.match,
              assignments: prev.assignments.concat(match.assignments) //mergeAssignments(prev.assignments, match.assignments)
            };
          }, { match: true, assignments: [] });
        }
        else { return { match: false, assignments: [] }; }
      default: throw new Error("Unknown pattern type: " + pattern.type);
    }
  }
  
  Maxime.patternMatch = function(clauses, ref) {
    var i, clause, match;
    for (i = 0; i < clauses.length; i++) {
      clause = clauses[i];
      match = patternMatch(clause.pattern, ref);
      if (match.match) {
        log("Matched pattern ", clause.pattern, 'against', ref._properties, ' -> ', match.assignments);
        return clause.callback.apply(null, match.assignments);
      }
    }
    throw new Error('No pattern matched value ' + JSON.stringify(ref));
  };

})();


var parser = require("../lib/parser");
parser.lexer = require("../lib/lexer");
parser.yy = require('../lib/nodes');

function parse(source) {
  var file = source.file();
  console.log('\n----\nParsing file ' + file);
  parser.yy.start(file);
  return parser.parse(source.code() + '\n');
}



var
  escodegen = require('escodegen');

function generate(maxAst) {
  
  //console.log("Max AST: ", maxAst);
  var jsAst = maxAst.transcode();
  
  //console.log("JS AST: " + JSON.stringify(jsAst, null, ' '));
  return escodegen.generate(jsAst, {
    format: {
      indent: {
        style: '  '
      }
    }
  });
}


function loc(start, end) {
  end = end || start;
  // console.log($$.toString(), $$);
  var sprintf = require('sprintf');
  return sprintf("$$.loc = yy.src.loc(@%d, @%d);", start, end);
}
        
var maximeGrammar = {
  "bnf": {

/* ----------------------------------------------------------------------
   Structure
   ---------------------------------------------------------------------- */

    "module": [
      [ "statements EOF", "$$ = new yy.ModuleDecl($1);" + loc(1, 2) + "return $$;" ],
      [ "NEWLINE statements EOF", "$$ = new yy.ModuleDecl($2);" + loc(1, 3) + "return $$;" ]
    ],
    
    "statements": [
      [ "statement", "$$ = [ $1 ];" ],
      [ "statements statement", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "statement": [
      [ "import", "$$ = $1;" ],
      [ "statementExpr", "$$ = $1;" ],
      [ "decl", "$$ = $1;" ]
    ],
    
    "inlineExpr": [
      [ "atomicExpr", "$$ = $1;" ],
      [ "lambdaExpr", "$$ = $1;" ],
      [ "inlineExpr operator atomicExpr", "$$ = new yy.MethodCall($1, $2, [ $3 ]);" + loc(1, 3) ]
    ],
    
    "operator": [
      [ "OPERATOR", "$$ = new yy.Identifier($1);" + loc(1) ],
    ],
    
    "atomicExpr": [
      [ "call", "$$ = $1;" ],
      [ "propertyAccess", "$$ = $1;" ],
      [ "ref", "$$ = $1;" ],
      [ "literal", "$$ = $1;" ],
      [ "nativeExpr", "$$ = $1;" ]
    ],
    
    "statementExpr": [
      [ "caseExpr", "$$ = $1;" ],
      [ "inlineExpr NEWLINE", "$$ = $1;" ]
    ],
    
    "blockExpr": [
      [ "statementExpr", "$$ = new yy.BlockExpr([ $1 ]);" + loc(1) ],
      [ "NEWLINE INDENT statements OUTDENT", "$$ = new yy.BlockExpr($3);" ]
    ],
    
/* ----------------------------------------------------------------------
   Import
   ---------------------------------------------------------------------- */

    "import": [
      [ "IMPORT qualifiedModuleNames NEWLINE", "$$ = new yy.ImportDecl($2);" + loc(1, 3) ]
    ],

    "qualifiedModuleNames": [
      [ "qualifiedModuleName", "$$ = [ $1 ];" ],
      [ "qualifiedModuleNames , qualifiedModuleName", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "qualifiedModuleName": [
      [ "identifier", "$$ = [ $1 ];" ],
      [ "qualifiedModuleName . identifier", "$$ = $1.concat([ $3 ]);" ]
    ],

/* ----------------------------------------------------------------------
   Native
   ---------------------------------------------------------------------- */

    "nativeExpr": [
      [ "BACKTICK_LITERAL", "$$ = new yy.NativeExpr($1);" + loc(1) ]
    ],
    
/* ----------------------------------------------------------------------
   Identifiers
   ---------------------------------------------------------------------- */
  
    "methodIdentifier": [
      [ "lcIdentifier", "$$ = $1;" ],
      [ "operator", "$$ = $1;" ]
    ],
  
    "identifier": [
      [ "lcIdentifier", "$$ = $1;" ],
      [ "ucIdentifier", "$$ = $1;" ]
    ],
    
    "lcIdentifier": [
      [ "LC_IDENTIFIER", "$$ = new yy.Identifier($1);" + loc(1) ]
    ],
    
    "ucIdentifier": [
      [ "UC_IDENTIFIER", "$$ = new yy.Identifier($1);" + loc(1) ]
    ],
    
/* ----------------------------------------------------------------------
   Literals
   ---------------------------------------------------------------------- */

    "literal": [
      [ "stringLiteral", "$$ = $1;" ],
      [ "numericLiteral", "$$ = $1;" ],
      [ "regexpLiteral", "$$ = $1;" ]
    ],

    "stringLiteral": [
      [ "STRING_LITERAL", "$$ = new yy.Literal(yytext);" + loc(1) ]
    ],

    "numericLiteral": [
      [ "NUMERIC_LITERAL", "$$ = new yy.Literal(yytext);" + loc(1) ]
    ],
    
    "regexpLiteral": [
      [ "REGEXP_LITERAL", "$$ = new yy.Literal(yytext);" + loc(1) ]
    ],

/* ----------------------------------------------------------------------
   Calls
   ---------------------------------------------------------------------- */

    "call": [
      [ "functionCall", "$$ = $1;" ],
      [ "methodCall", "$$ = $1;" ],
      [ "ctorCall", "$$ = $1;" ]
    ],

    "functionCall": [
      [ "lcIdentifier ( args )", "$$ = new yy.FunctionCall($1, $3);" + loc(1, 4) ]
    ],
    
    "ctorCall": [
      [ "ucIdentifier", "$$ = new yy.CtorCall($1, []);" + loc(1, 1) ],
      [ "ucIdentifier ( args )", "$$ = new yy.CtorCall($1, $3);" + loc(1, 4) ]
    ],
    
    "methodCall": [
      [ "atomicExpr . lcIdentifier ( args )", "$$ = new yy.MethodCall($1, $3, $5);" + loc(1, 6) ],
      [ "( inlineExpr ) . lcIdentifier ( args )", "$$ = new yy.MethodCall($2, $5, $7);" + loc(1, 8) ]
    ],
    
    "args": [
      [ "", "$$ = [];" ],
      [ "argList", "$$ = $1;" ]
    ],
    
    "argList": [
      [ "arg", "$$ = [ $1 ];" ],
      [ "argList , arg", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "arg": [
      [ "inlineExpr", "$$ = $1;" ]
    ],
    
/* ----------------------------------------------------------------------
   Property access
   ---------------------------------------------------------------------- */

    "propertyAccess": [
      [ "atomicExpr . lcIdentifier", "$$ = new yy.PropertyAccess($1, $3);" + loc(1, 3) ],
      [ "( inlineExpr ) . lcIdentifier", "$$ = new yy.PropertyAccess($2, $4);" + loc(1, 5) ]
    ],
    
/* ----------------------------------------------------------------------
   Lambda expressions
   ---------------------------------------------------------------------- */
  
    "lambdaExpr": [
      [ "LAMBDA lambdaParams RIGHT_ARROW atomicExpr", "$$ = new yy.LambdaExpr($2, $4);" + loc(1, 4) ]
    ],
    
    "lambdaParams": [
      [ "", "$$ = [];" ],
      [ "lambdaParamList", "$$ = $1;"]
    ],
    
    "lambdaParamList": [
      [ "lcIdentifier", "$$ = [ $1 ];" ],
      [ "lambdaParamList , lcIdentifier", "$$ = $1.concat([ $3 ]);" ]
    ],
  
/* ----------------------------------------------------------------------
   Case expressions
   ---------------------------------------------------------------------- */

    "caseExpr": [
      [ "inlineExpr MATCH NEWLINE INDENT caseClauses OUTDENT", "$$ = new yy.CaseExpr($1, $5);" + loc(1, 6) ]
    ],
    
    "caseClauses": [
      [ "caseClause", "$$ = [ $1 ];" ],
      [ "caseClauses caseClause", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "caseClause": [
      [ "CASE pattern DOUBLE_RIGHT_ARROW blockExpr", "$$ = new yy.CaseClause($2, $4);" + loc(1, 4) ],
    ],
    
    "pattern": [
      [ "ctorPattern", "$$ = $1;" ],
      [ "literal", "$$ = new yy.LiteralPattern($1);" + loc(1) ],
      [ "lcIdentifier", "$$ = new yy.VariablePattern($1);" + loc(1) ],
      [ "wildcard", "$$ = new yy.WildcardPattern();" + loc(1) ]
    ],

    "ctorPattern": [
      [ "ucIdentifier", "$$ = new yy.CtorPattern($1, []);" + loc(1) ],
      [ "ucIdentifier ( ctorPatternArgs )", "$$ = new yy.CtorPattern($1, $3);" + loc(1, 4) ]
    ],
    
    "ctorPatternArgs": [
      [ "", "$$ = [];" ],
      [ "ctorPatternArgList", "$$ = $1;" ]
    ],
    
    "ctorPatternArgList": [
      [ "pattern", "$$ = [ $1 ];" ],
      [ "ctorPatternArgList , pattern", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "wildcard": [
      [ "_", "$$ = new yy.Wildcard();" + loc(1, 1) ]
    ],

/* ----------------------------------------------------------------------
   Declarations
   ---------------------------------------------------------------------- */

    "decl": [
      [ "funcDecl", "$$ = $1;" ],
      [ "featureDecl", "$$ = $1;" ],
      [ "classDecl", "$$ = $1;" ],
      [ "valDecl", "$$ = $1;" ]
    ],
    
/* ----------------------------------------------------------------------
   Feature declaration
   ---------------------------------------------------------------------- */

    "featureDecl": [
      [ "FEATURE ucIdentifier typeParam NEWLINE INDENT abstractMethodList OUTDENT",
        "$$ = new yy.FeatureDecl($2, $3, $6);" + loc(1, 7) ]
    ],
    
    "abstractMethodList": [
      [ "", "$$ = [];" ],
      [ "abstractMethodList abstractMethodDecl", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "abstractMethodDecl": [
      [ "methodIdentifier typeParams ( params ) returnTypeDecl NEWLINE",
        "$$ = new yy.FunctionDecl($1, $2, $4, $6, null);" + loc(1, 7) ]
    ],
    
/* ----------------------------------------------------------------------
   Class declaration
   ---------------------------------------------------------------------- */

    "classDecl": [
      [ "CLASS ucIdentifier typeParams extendsClause NEWLINE INDENT ctorList OUTDENT",
        "$$ = new yy.ClassDecl($2, $3, $4, $7);" + loc(1, 8) ]
    ],
    
    "typeParams": [
      [ "", "$$ = [];" ],
      [ "[ typeParamList ]", "$$ = $2;" ]
    ],
    
    "typeParamList": [
      [ "typeParam", "$$ = [ $1 ];" ],
      [ "typeParamList , typeParam", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "typeParam": [
      [ "lcIdentifier typeParams typeBounds", "$$ = new yy.TypeParam($1, $2, $3);" + loc(1, 3) ]
    ],
    
    "typeBounds": [
      [ "", "$$ = [];" ],
      [ "IS classRef", "$$ = [ $2 ];" ],
      [ "IS ( classList )", "$$ = $3;" ]
    ],
    
    "extendsClause": [
      [ "", "$$ = [];" ],
      [ "IS classList", "$$ = $2;" ]
    ],
    
    "classList": [
      [ "classRef", "$$ = [ $1 ];" ],
      [ "classList , classRef", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    /*
    "typeParams": [
      [ "", "$$ = [];" ],
      [ "[ typeParamList ]", "$$ = $1;" ]
    ],
    
    "typeParamList": [
      [ "typeParam", "$$ = [ $1 ]; " ],
      [ "typeParamList typeParam", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "typeParam": [
      [ "lcIdentifier", "$$ = new yy.TypeParam($1);" + loc(1) ]
    ],
    */
   
    "ctorList": [
      [ "", "$$ = [];" ],
      [ "ctorList ctorDecl", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "ctorDecl": [
      [ "ucIdentifier NEWLINE methodList", "$$ = new yy.CtorDecl($1, [], $3);" + loc(1, 3) ],
      [ "ucIdentifier ( propertyList ) NEWLINE methodList", "$$ = new yy.CtorDecl($1, $3, $6);" + loc(1, 6) ]
    ],
    
    "propertyList": [
      [ "property", "$$ = [ $1 ];" ],
      [ "propertyList , property", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "property": [
      [ "lcIdentifier", "$$ = new yy.Property($1, null);" + loc(1) ],
      [ "lcIdentifier : typeRef", "$$ = new yy.Property($1, $3);" + loc(1, 3) ]
    ],
    
    "methodList": [
      [ "", "$$ = [];" ],
      [ "methodList methodDecl", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "methodDecl": [
      [ "methodIdentifier typeParams ( params ) returnTypeDecl = blockExpr",
        "$$ = new yy.FunctionDecl($1, $2, $4, $6, $8);" + loc(1, 8) ]
    ],
    
/* ----------------------------------------------------------------------
   Method declaration
   ---------------------------------------------------------------------- */
/*
    "methodDecl": [
      [ "DEF lcIdentifier ( params ) = expr", "$$ = new yy.MethodDecl($4, $6, $9);" + loc(1, 9) ]
    ],
    
    "classRef": [
      [ "ucIdentifier typeParams" ]
    ],
*/
/* ----------------------------------------------------------------------
   Function declaration
   ---------------------------------------------------------------------- */

    "funcDecl": [
      [ "DEF lcIdentifier typeParams ( params ) returnTypeDecl NEWLINE",
        "$$ = new yy.FunctionDecl($2, $3, $5, $7, null);" + loc(1, 8) ],
      [ "DEF lcIdentifier typeParams ( params ) returnTypeDecl = blockExpr",
        "$$ = new yy.FunctionDecl($2, $3, $5, $7, $9);" + loc(1, 9) ]
    ],
    
    "params": [
      [ "", "$$ = [];" ],
      [ "paramList", "$$ = $1;" ],
    ],
    
    "paramList": [
      [ "param", "$$ = [ $1 ];" ],
      [ "paramList , param", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "param": [
      [ "lcIdentifier", "$$ = new yy.Param($1, null);" + loc(1) ],
      [ "lcIdentifier : typeRef", "$$ = new yy.Param($1, $3);" + loc(1, 3) ]
    ],
    
    "returnTypeDecl": [
      [ "", "$$ = null;" ],
      [ "RIGHT_ARROW typeRef", "$$ = $2;" ]
    ],
    
/* ----------------------------------------------------------------------
   Value declaration
   ---------------------------------------------------------------------- */

    "valDecl": [
      [ "VAL lcIdentifier = blockExpr", "$$ = new yy.ValDecl($2, $4);" + loc(1, 4) ]
    ],
    
/* ----------------------------------------------------------------------
   Reference
   ---------------------------------------------------------------------- */

    "ref": [
      [ "lcIdentifier", "$$ = new yy.Ref($1);" + loc(1) ]
    ],
    
/* ----------------------------------------------------------------------
   Constructor declaration
   ---------------------------------------------------------------------- */

/*    "dataDecl": [
      [ "DATA ucIdentifier typeParams = ctorDecls NEWLINE", "$$ = new yy.DataDecl($2, $3, $5);" + loc(1, 6) ]
    ],
    
    "typeParams": [
      [ "", "$$ = [];" ],
      [ "typeParams typeParam", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "typeParam": [
      [ "lcIdentifier", "$$ = new yy.TypeParam($1);" + loc(1) ]
    ],
    
    "ctorDecls": [
      [ "ctorDecl", "$$ = [ $1 ];" ],
      [ "ctorDecls | ctorDecl", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "ctorDecl": [
      [ "ucIdentifier ctorParams", "$$ = new yy.CtorDecl($1, $2);" + loc(1, 2) ]
    ],
    
    "ctorParams": [
      [ "", "$$ = [];" ],
      [ "ctorParams ctorParam", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "ctorParam": [
      [ "typeParamRef", "$$ = $1;" ],
      [ "ucIdentifier", "$$ = new yy.TypeRef($1, []);" + loc(1) ],
      [ "( ucIdentifier typeRefArgs )", "$$ = new yy.TypeRef($2, $3);" + loc(1, 4) ]
    ],
    
    "typeParamRef": [
      [ "lcIdentifier", "$$ = new yy.TypeParamRef($1);" + loc(1) ]
    ],
    */
/* ----------------------------------------------------------------------
   Type reference
   ---------------------------------------------------------------------- */

    "typeRef": [
      [ "atomicTypeRef", "$$ = $1;" ],
      [ "funcTypeRef", "$$ = $1; "]
    ],
    
    "atomicTypeRef": [
      [ "classRef", "$$ = $1;" ],
      [ "wildcard", "$$ = new yy.WildcardTypeRef($1);" + loc(1) ]
    ],
    
    "classRef": [
      [ "identifier typeArgs", "$$ = new yy.ClassRef($1, $2);" + loc(1, 2) ]
    ],
    
    "typeArgs": [
      [ "", "$$ = [];" ],
      [ "[ typeRefList ]", "$$ = $2;" ]
    ],
    
    "funcTypeRef": [
      [ "atomicTypeRef RIGHT_ARROW funcResultTypeRef", "$$ = new yy.FunctionTypeRef([ $1 ], $3);" + loc(1, 3) ],
      [ "( funcParamTypeRefList ) RIGHT_ARROW funcResultTypeRef", "$$ = new yy.FunctionTypeRef($2, $5);" + loc(1, 5) ]
    ],
    
    "funcParamTypeRefList": [
      [ "", "$$ = [];" ],
      [ "funcParamTypeRefList , typeRef", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "funcResultTypeRef": [
      [ "atomicTypeRef", "$$ = $1;" ],
      [ "( funcTypeRef )", "$$ = $2;" ]
    ],
    
    "typeRefs": [
      [ "", "$$ = [];" ],
      [ "[ typeRefList ]", "$$ = $2;" ]
    ],
    
    "typeRefList": [
      [ "typeRef", "$$ = [ $1 ];" ],
      [ "typeRefList , typeRef", "$$ = $1.concat([ $3 ]);" ]
      ]
      
  }
};

Maxime.scope.__maxime__compiler__Parser = function () {
  var __maxime__compiler__Parser = {};
  __maxime__compiler__Parser._Parser = {
    _Parser: function () {
      var _Parser = function () {
        this._constructor = 'Parser';
        this._properties = [];
      };
      _Parser.prototype._parse = function (_source) {
        var that = this;
        
        var
          Parser = require("jison").Parser,
          sprintf = require('sprintf');
        
        var parser = new Parser(maximeGrammar);
        parser.lexer = require('../lib/lexer');
        
        var yy = {};
        
        yy.start = function(file) {
          this.src.file = file;
        };
        
        yy.src = {};
        
        yy.src.loc = function(firstToken, lastToken) {
          return new yy.src.SourceLocation(
            new yy.src.Position(firstToken.first_line, firstToken.first_column),
            new yy.src.Position(lastToken.last_line, lastToken.last_column));
        };
        
        yy.src.SourceLocation = function(file, start, end) {
          this.file = yy.src.file;
          this.start = start;
          this.end = end;
        };
        
        yy.src.Position = function(line, column) {
          this.line = line;
          this.column = column;
        };
        
        parser.yy = yy;
        
        var
          code = EcmaScript.max2js(_source._code),
          src = EcmaScript.max2js(_source._file._path._segments).join('/');
        console.log('\n----\nParsing file ' + src);
        parser.yy.start(src);
        return parser.parse(code + '\n');
      };
      return _Parser;
    }()
  };
  return __maxime__compiler__Parser;
} ();

var EcmaScript = {};

var
  _ = require('lodash'),
  fs = require('fs'),
  filesystem = require('../lib/filesystem');

EcmaScript.array2list = function(a) {
  if (a.length === 0) {
    return new Maxime.scope.__maxime__List._List._Nil();
  }
  else {
    return new Maxime.scope.__maxime__List._List._Cons(
      EcmaScript.js2max(a[0]),
      EcmaScript.array2list(a.slice(1))
    );
  }
};

EcmaScript.js2max = function(x) {
  if (typeof x._constructor === 'string') {
    return x;
  }
  if (_.isArray(x)) {
    return EcmaScript.array2list(x);
  }
  if (typeof x === 'string') {
    return new Maxime.scope.__maxime__String._String._String(x);
  }
  if (typeof x === 'number') {
    return new Maxime.scope.__maxime__Num._Num._Num(x);
  }
  if (typeof x === 'boolean') {
    return x
      ? new Maxime.scope.__maxime__Bool._Bool._True()
      : new Maxime.scope.__maxime__Bool._Bool._False();
  }
  throw new Error(JSON.stringify(x));
};

EcmaScript.max2js = function(x) {
  if (x.constructor === Maxime.scope.__maxime__List._List._Cons) {
    return [ EcmaScript.max2js(x._headElem) ].concat(EcmaScript.max2js(x._tailList));
  }
  if (x.constructor === Maxime.scope.__maxime__List._List._Nil) {
    return [];
  }
  if (x.constructor === Maxime.scope.__maxime__String._String._String) {
    return x._s;
  }
  throw new Error(JSON.stringify(x));
};

function toJson(o) {
  return JSON.stringify(o);
}

function regexp(str, mod) {
  return new RegExp(str, mod);
}

function readFile(p) {
  return fs.readFileSync(p, 'utf-8');
}

function writeFile(p, content) {
  fs.writeFileSync(p, content);
}

function replace(str, regex, rep) {
  return str.replace(regex, rep);
}

function prop(obj, name) {
  return obj[name];
}

module.exports = EcmaScript;
Maxime.scope.__maxime__io__FileSystem = function () {
  var __maxime__io__FileSystem = {};
  __maxime__io__FileSystem._FileSystem = {
    _FileSystem: function () {
      var _FileSystem = function () {
        this._constructor = 'Path';
        this._properties = [];
      };
      
      function path2string(path) {
        return EcmaScript.max2js(path._segments).join('/');
      }
      
      _FileSystem.prototype._findFiles = function (_file, _regexp) {
        var that = this;
        var
          fs = require('fs'),
          filesystem = require('../lib/filesystem');
        var path = path2string(_file._path);
        var files = filesystem.findFiles(path, _regexp._pattern).map(function(f) {
          var segments = EcmaScript.js2max(f.split(/\//));
          var path = new Maxime.scope.__maxime__io__Path._Path._Path(segments, EcmaScript.js2max(true));
          return new Maxime.scope.__maxime__io__File._File._File(path);
        });
        return EcmaScript.js2max(files);
      };
      
      _FileSystem.prototype._read = function(_file) {
        var that = this;
        var path = path2string(_file._path);
        return EcmaScript.js2max(fs.readFileSync(path, 'utf8'));
      };
      
      return _FileSystem;
    }()
  };
  return __maxime__io__FileSystem;
}();

Maxime.scope.__dom = function () {
  var __dom = {};
  __dom._Node = {
    _Node: function () {
      var _Node = function (_parent, _localName, _attrs) {
        this._constructor = 'Node';
        this._properties = [
          this._parent,
          this._localName,
          this._attrs
        ];
        this._parent = _parent;
        this._localName = _localName;
        this._attrs = _attrs;
      };
      _Node.prototype._attr = function (_name) {
        var that = this;
        return that._attrs._get(_name);
      };
      return _Node;
    }()
  };
  return __dom;
}();
Maxime.scope.__geom = function () {
  var __geom = {};
  __geom._Point = {
    _Point: function () {
      var _Point = function (_x, _y) {
        this._constructor = 'Point';
        this._properties = [
          this._x,
          this._y
        ];
        this._x = _x;
        this._y = _y;
      };
      _Point.prototype._swap = function () {
        var that = this;
        return new Maxime.scope.__geom._Point._Point(that._y, that._x);
      };
      _Point.prototype._bounds = function () {
        var that = this;
        return new Maxime.scope.__geom._Rect._Rect(that._x, that._y, new Maxime.scope.__maxime__Num._Num._Num(0), new Maxime.scope.__maxime__Num._Num._Num(0));
      };
      return _Point;
    }()
  };
  __geom._Line = {
    _Line: function () {
      var _Line = function (_x1, _y1, _x2, _y2) {
        this._constructor = 'Line';
        this._properties = [
          this._x1,
          this._y1,
          this._x2,
          this._y2
        ];
        this._x1 = _x1;
        this._y1 = _y1;
        this._x2 = _x2;
        this._y2 = _y2;
      };
      _Line.prototype._bounds = function () {
        var that = this;
        return new Maxime.scope.__geom._Rect._Rect(_min(that._x1, that._x2), _min(that._y1, that._y2), _abs(that._x2.__minus_(that._x1)), _abs(that._y2.__minus_(that._y1)));
      };
      return _Line;
    }()
  };
  __geom._Rect = {
    _Rect: function () {
      var _Rect = function (_x, _y, _width, _height) {
        this._constructor = 'Rect';
        this._properties = [
          this._x,
          this._y,
          this._width,
          this._height
        ];
        this._x = _x;
        this._y = _y;
        this._width = _width;
        this._height = _height;
      };
      _Rect.prototype._bounds = function () {
        var that = this;
        return new Maxime.scope.__geom._Rect._Rect(new Maxime.scope.__maxime__Num._Num._Num(0), new Maxime.scope.__maxime__Num._Num._Num(0), that._width, that._height);
      };
      return _Rect;
    }()
  };
  __geom._Matrix = {
    _Matrix: function () {
      var _Matrix = function (_a, _b, _c, _d, _e, _f) {
        this._constructor = 'Matrix';
        this._properties = [
          this._a,
          this._b,
          this._c,
          this._d,
          this._e,
          this._f
        ];
        this._a = _a;
        this._b = _b;
        this._c = _c;
        this._d = _d;
        this._e = _e;
        this._f = _f;
      };
      return _Matrix;
    }()
  };
  return __geom;
}();
Maxime.scope.__maxime__Bool = function () {
  var __maxime__Bool = {};
  __maxime__Bool._Bool = {
    _True: function () {
      var _True = function () {
        this._constructor = 'True';
        this._properties = [];
      };
      _True.prototype._not = function () {
        var that = this;
        return new Maxime.scope.__maxime__Bool._Bool._False();
      };
      return _True;
    }(),
    _False: function () {
      var _False = function () {
        this._constructor = 'False';
        this._properties = [];
      };
      _False.prototype._not = function () {
        var that = this;
        return new Maxime.scope.__maxime__Bool._Bool._True();
      };
      return _False;
    }()
  };
  return __maxime__Bool;
}();
Maxime.scope.__maxime__compiler__ast__BinaryExpr = function () {
  var __maxime__compiler__ast__BinaryExpr = {};
  __maxime__compiler__ast__BinaryExpr._Expr = {
    _Expr: function () {
      var _Expr = function () {
        this._constructor = 'Expr';
        this._properties = [];
      };
      return _Expr;
    }()
  };
  __maxime__compiler__ast__BinaryExpr._Operator = {
    _Operator: function () {
      var _Operator = function () {
        this._constructor = 'Operator';
        this._properties = [];
      };
      return _Operator;
    }()
  };
  __maxime__compiler__ast__BinaryExpr._BinaryExpr = {
    _BinaryExpr: function () {
      var _BinaryExpr = function (_left, _operator, _right) {
        this._constructor = 'BinaryExpr';
        this._properties = [
          this._left,
          this._operator,
          this._right
        ];
        this._left = _left;
        this._operator = _operator;
        this._right = _right;
      };
      _BinaryExpr.prototype._transcode = function () {
        var that = this;
        return new Maxime.scope.__maxime__String._String._String('');
      };
      return _BinaryExpr;
    }()
  };
  return __maxime__compiler__ast__BinaryExpr;
}();
Maxime.scope.__maxime__compiler__ast__Module = function () {
  var __maxime__compiler__ast__Module = {};
  __maxime__compiler__ast__Module._Module = {
    _Module: function () {
      var _Module = function (_loc) {
        this._constructor = 'Module';
        this._properties = [this._loc];
        this._loc = _loc;
      };
      return _Module;
    }()
  };
  return __maxime__compiler__ast__Module;
}();
Maxime.scope.__maxime__compiler__Compiler = function () {
  var __maxime__compiler__Compiler = {};
  __maxime__compiler__Compiler._Compiler = {
    _Compiler: function () {
      var _Compiler = function () {
        this._constructor = 'Compiler';
        this._properties = [];
      };
      _Compiler.prototype._compile = function (_sources, _target, _options) {
        var that = this;
        return function () {
          function _toString(_s) {
            return _s._toString();
          }
          function _id(_s) {
            return _s;
          }
          new Maxime.scope.__maxime__String._String._String('Compiling ').__plus_(_sources._join(_id, new Maxime.scope.__maxime__String._String._String(', '))).__plus_(new Maxime.scope.__maxime__String._String._String(' to ')).__plus_(_target)._println();
          function _mkFile(_s) {
            return new Maxime.scope.__maxime__io__File._File._File(new Maxime.scope.__maxime__io__Path._Path._Path(_s._split(new Maxime.scope.__maxime__String._String._String('/')), new Maxime.scope.__maxime__Bool._Bool._True()));
          }
          var _sourceDirs = _sources._map(_mkFile);
          var _CompilationUnit = {
              _CompilationUnit: function () {
                var _CompilationUnit = function (_root, _maxFiles, _jsFiles) {
                  this._constructor = 'CompilationUnit';
                  this._properties = [
                    this._root,
                    this._maxFiles,
                    this._jsFiles
                  ];
                  this._root = _root;
                  this._maxFiles = _maxFiles;
                  this._jsFiles = _jsFiles;
                };
                _CompilationUnit.prototype._toString = function () {
                  var that = this;
                  return that._root;
                };
                return _CompilationUnit;
              }()
            };
          function _mkCompilationUnit(_root) {
            return function () {
              var _maxFiles = new Maxime.scope.__maxime__io__FileSystem._FileSystem._FileSystem()._findFiles(_root, new Maxime.scope.__maxime__RegExp._RegExp._RegExp(new Maxime.scope.__maxime__String._String._String('\\.max$'), new Maxime.scope.__maxime__String._String._String('')));
              var _jsFiles = new Maxime.scope.__maxime__io__FileSystem._FileSystem._FileSystem()._findFiles(_root, new Maxime.scope.__maxime__RegExp._RegExp._RegExp(new Maxime.scope.__maxime__String._String._String('\\.js$'), new Maxime.scope.__maxime__String._String._String('')));
              return new _CompilationUnit._CompilationUnit(_root, _maxFiles, _jsFiles);
            }();
          }
          var _compilationUnits = _sourceDirs._map(_mkCompilationUnit);
          new Maxime.scope.__maxime__String._String._String('Compilation units: ').__plus_(_compilationUnits._map(_toString)._join(_id, new Maxime.scope.__maxime__String._String._String(',')))._println();
          function _compileUnit(_unit) {
            return function () {
              function _readSource(_file) {
                return new Maxime.scope.__maxime__compiler__Source._Source._Source(new Maxime.scope.__maxime__io__FileSystem._FileSystem._FileSystem()._read(new Maxime.scope.__maxime__io__File._File._File(_unit._root._path.__slash_(_file._path))), _file);
              }
              function _generate(_source) {
                return _source;
              }
              function _compileSource(_source) {
                return function () {
                  var _moduleName = _source._file._path._segments._join(_id, new Maxime.scope.__maxime__String._String._String('.'))._replace(new Maxime.scope.__maxime__String._String._String('\\.max$'), new Maxime.scope.__maxime__String._String._String(''));
                  new Maxime.scope.__maxime__String._String._String('Compiling module ').__plus_(_moduleName)._println();
                  var _ast = new Maxime.scope.__maxime__compiler__Parser._Parser._Parser()._parse(_source);
                  return _generate(_ast);
                }();
              }
              function _getCode(_s) {
                return _s._code;
              }
              var _jsSources = _unit._jsFiles._map(_readSource)._map(_getCode);
              var _maxSources = _unit._maxFiles._map(_readSource);
              var _maxTargets = _maxSources._map(_compileSource);
              return _jsSources.__plus__plus_(_maxTargets._map(_toString))._join(_id, new Maxime.scope.__maxime__String._String._String('\n'));
            }();
          }
          var _codes = _compilationUnits._map(_compileUnit);
          var _code = _codes._join(_id, new Maxime.scope.__maxime__String._String._String('\\n'));
          return _code;
        }();
      };
      return _Compiler;
    }()
  };
  __maxime__compiler__Compiler._compile = function (_sources, _target, _options) {
    return new Maxime.scope.__maxime__compiler__Compiler._Compiler._Compiler()._compile(_sources, _target, _options);
  };
  return __maxime__compiler__Compiler;
}();
Maxime.scope.__maxime__compiler__Location = function () {
  var __maxime__compiler__Location = {};
  __maxime__compiler__Location._Location = {
    _Location: function () {
      var _Location = function () {
        this._constructor = 'Location';
        this._properties = [];
      };
      return _Location;
    }()
  };
  return __maxime__compiler__Location;
}();
Maxime.scope.__maxime__compiler__Source = function () {
  var __maxime__compiler__Source = {};
  __maxime__compiler__Source._Source = {
    _Source: function () {
      var _Source = function (_code, _file) {
        this._constructor = 'Source';
        this._properties = [
          this._code,
          this._file
        ];
        this._code = _code;
        this._file = _file;
      };
      _Source.prototype._toString = function () {
        var that = this;
        return that._file._toString();
      };
      return _Source;
    }()
  };
  return __maxime__compiler__Source;
}();
Maxime.scope.__maxime__compiler__Tree = function () {
  var __maxime__compiler__Tree = {};
  __maxime__compiler__Tree._Tree = {
    _Tree: function () {
      var _Tree = function () {
        this._constructor = 'Tree';
        this._properties = [];
      };
      return _Tree;
    }()
  };
  return __maxime__compiler__Tree;
}();
Maxime.scope.__maxime__ecmascript__ast = function () {
  var __maxime__ecmascript__ast = {};
  __maxime__ecmascript__ast._Expr = {
    _Expr: function () {
      var _Expr = function () {
        this._constructor = 'Expr';
        this._properties = [];
      };
      return _Expr;
    }()
  };
  __maxime__ecmascript__ast._BinaryExpression = {
    _BinaryExpression: function () {
      var _BinaryExpression = function (_left, _operator, _right) {
        this._constructor = 'BinaryExpression';
        this._properties = [
          this._left,
          this._operator,
          this._right
        ];
        this._left = _left;
        this._operator = _operator;
        this._right = _right;
      };
      return _BinaryExpression;
    }()
  };
  return __maxime__ecmascript__ast;
}();
Maxime.scope.__maxime__Eq = function () {
  var __maxime__Eq = {};
  return __maxime__Eq;
}();
Maxime.scope.__maxime__Functor = function () {
  var __maxime__Functor = {};
  return __maxime__Functor;
}();
Maxime.scope.__maxime__io__File = function () {
  var __maxime__io__File = {};
  __maxime__io__File._File = {
    _File: function () {
      var _File = function (_path) {
        this._constructor = 'File';
        this._properties = [this._path];
        this._path = _path;
      };
      _File.prototype._toString = function () {
        var that = this;
        return that._path._toString();
      };
      return _File;
    }()
  };
  return __maxime__io__File;
}();
Maxime.scope.__maxime__io__Path = function () {
  var __maxime__io__Path = {};
  __maxime__io__Path._Path = {
    _Path: function () {
      var _Path = function (_segments, _absolute) {
        this._constructor = 'Path';
        this._properties = [
          this._segments,
          this._absolute
        ];
        this._segments = _segments;
        this._absolute = _absolute;
      };
      _Path.prototype._toString = function () {
        var that = this;
        return function () {
          function _id(_s) {
            return _s;
          }
          return that._segments._join(_id, new Maxime.scope.__maxime__String._String._String('/'));
        }();
      };
      _Path.prototype.__slash_ = function (_p) {
        var that = this;
        return new Maxime.scope.__maxime__io__Path._Path._Path(that._segments.__plus__plus_(_p._segments), that._absolute);
      };
      return _Path;
    }()
  };
  return __maxime__io__Path;
}();
Maxime.scope.__maxime__List = function () {
  var __maxime__List = {};
  __maxime__List._List = {
    _Nil: function () {
      var _Nil = function () {
        this._constructor = 'Nil';
        this._properties = [];
      };
      _Nil.prototype._map = function (_f) {
        var that = this;
        return new Maxime.scope.__maxime__List._List._Nil();
      };
      _Nil.prototype._head = function () {
        var that = this;
        return new Maxime.scope.__maxime__Option._Option._None();
      };
      _Nil.prototype._tail = function () {
        var that = this;
        return new Maxime.scope.__maxime__List._List._Nil();
      };
      _Nil.prototype.__plus__plus_ = function (_l) {
        var that = this;
        return _l;
      };
      _Nil.prototype._length = function () {
        var that = this;
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      _Nil.prototype._join = function (_sep) {
        var that = this;
        return new Maxime.scope.__maxime__String._String._String('');
      };
      return _Nil;
    }(),
    _Cons: function () {
      var _Cons = function (_headElem, _tailList) {
        this._constructor = 'Cons';
        this._properties = [
          this._headElem,
          this._tailList
        ];
        this._headElem = _headElem;
        this._tailList = _tailList;
      };
      _Cons.prototype._map = function (_f) {
        var that = this;
        return new Maxime.scope.__maxime__List._List._Cons(_f(that._headElem), that._tailList._map(_f));
      };
      _Cons.prototype._head = function () {
        var that = this;
        return that._headElem;
      };
      _Cons.prototype._tail = function () {
        var that = this;
        return that._tailList;
      };
      _Cons.prototype.__plus__plus_ = function (_l) {
        var that = this;
        return new Maxime.scope.__maxime__List._List._Cons(that._headElem, that._tailList.__plus__plus_(_l));
      };
      _Cons.prototype._length = function () {
        var that = this;
        return new Maxime.scope.__maxime__Num._Num._Num(1).__plus_(that._tailList._length());
      };
      _Cons.prototype._join = function (_f, _sep) {
        var that = this;
        return Maxime.patternMatch([
          {
            pattern: {
              'type': 'constructor',
              'name': 'Nil',
              'params': []
            },
            callback: function () {
              return _f(that._headElem);
            }
          },
          {
            pattern: { 'type': 'wildcard' },
            callback: function () {
              return _f(that._headElem).__plus_(_sep).__plus_(that._tailList._join(_f, _sep));
            }
          }
        ], that._tailList);
      };
      return _Cons;
    }()
  };
  return __maxime__List;
}();
Maxime.scope.__maxime__Map = function () {
  var __maxime__Map = {};
  __maxime__Map._Map = {
    _EmptyMap: function () {
      var _EmptyMap = function () {
        this._constructor = 'EmptyMap';
        this._properties = [];
      };
      _EmptyMap.prototype._put = function (_key, _value) {
        var that = this;
        return new Maxime.scope.__maxime__Map._Map._Map(_key, _value, new Maxime.scope.__maxime__Map._Map._EmptyMap());
      };
      _EmptyMap.prototype._get = function (_key) {
        var that = this;
        return new Maxime.scope.__maxime__Option._Option._None();
      };
      return _EmptyMap;
    }(),
    _Map: function () {
      var _Map = function (_key, _value, _rest) {
        this._constructor = 'Map';
        this._properties = [
          this._key,
          this._value,
          this._rest
        ];
        this._key = _key;
        this._value = _value;
        this._rest = _rest;
      };
      _Map.prototype._put = function (_k, _v) {
        var that = this;
        return Maxime.patternMatch([
          {
            pattern: {
              'type': 'constructor',
              'name': 'True',
              'params': []
            },
            callback: function () {
              return new Maxime.scope.__maxime__Map._Map._Map(that._key, _v, that._rest);
            }
          },
          {
            pattern: {
              'type': 'constructor',
              'name': 'False',
              'params': []
            },
            callback: function () {
              return new Maxime.scope.__maxime__Map._Map._Map(that._key, that._value, that._rest._put(_k, _v));
            }
          }
        ], _k.__equals__equals_(that._key));
      };
      _Map.prototype._get = function (_k) {
        var that = this;
        return Maxime.patternMatch([
          {
            pattern: {
              'type': 'constructor',
              'name': 'True',
              'params': []
            },
            callback: function () {
              return that._value;
            }
          },
          {
            pattern: {
              'type': 'constructor',
              'name': 'False',
              'params': []
            },
            callback: function () {
              return that._rest._get(that._key);
            }
          }
        ], _k.__equals__equals_(that._key));
      };
      return _Map;
    }()
  };
  return __maxime__Map;
}();
Maxime.scope.__maxime__Num = function () {
  var __maxime__Num = {};
  __maxime__Num._Num = {
    _Num: function () {
      var _Num = function () {
        this._constructor = 'Num';
        this._properties = [];
      };
      _Num.prototype._toString = function () {
        var that = this;
        return n.toString();
      };
      _Num.prototype.__plus_ = function (_n) {
        var that = this;
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      _Num.prototype.__minus_ = function (_n) {
        var that = this;
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      _Num.prototype.__asterisk_ = function (_n) {
        var that = this;
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      _Num.prototype.__slash_ = function (_n) {
        var that = this;
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      return _Num;
    }()
  };
  __maxime__Num._min = function (_x, _y) {
    return _x;
  };
  __maxime__Num._abs = function (_x) {
    return _x;
  };
  return __maxime__Num;
}();
Maxime.scope.__maxime__Option = function () {
  var __maxime__Option = {};
  __maxime__Option._Option = {
    _None: function () {
      var _None = function () {
        this._constructor = 'None';
        this._properties = [];
      };
      _None.prototype._map = function (_f) {
        var that = this;
        return new Maxime.scope.__maxime__Option._Option._None();
      };
      return _None;
    }(),
    _Some: function () {
      var _Some = function (_a) {
        this._constructor = 'Some';
        this._properties = [this._a];
        this._a = _a;
      };
      _Some.prototype._map = function (_f) {
        var that = this;
        return new Maxime.scope.__maxime__Option._Option._Some(_f(that._a));
      };
      return _Some;
    }()
  };
  return __maxime__Option;
}();
Maxime.scope.__maxime__Printable = function () {
  var __maxime__Printable = {};
  __maxime__Printable._Printable = {
    _Printable: function () {
      var _Printable = function () {
        this._constructor = 'Printable';
        this._properties = [];
      };
      _Printable.prototype._toString = function () {
        var that = this;
        return new Maxime.scope.__maxime__String._String._String('');
      };
      return _Printable;
    }()
  };
  return __maxime__Printable;
}();
Maxime.scope.__maxime__RegExp = function () {
  var __maxime__RegExp = {};
  __maxime__RegExp._RegExp = {
    _RegExp: function () {
      var _RegExp = function (_pattern, _modifiers) {
        this._constructor = 'RegExp';
        this._properties = [
          this._pattern,
          this._modifiers
        ];
        this._pattern = _pattern;
        this._modifiers = _modifiers;
      };
      return _RegExp;
    }()
  };
  return __maxime__RegExp;
}();
Maxime.scope.__maxime__String = function () {
  var __maxime__String = {};
  __maxime__String._String = {
    _String: function () {
      var _String = function (_s) {
        this._constructor = 'String';
        this._properties = [this._s];
        this._s = _s;
      };
      _String.prototype.__plus_ = function (_s) {
        var that = this;
        return new Maxime.scope.__maxime__String._String._String(this._s + _s._s);
      };
      _String.prototype._println = function () {
        var that = this;
        return console.log(this._s);
      };
      _String.prototype._replace = function (_regex, _replacement) {
        var that = this;
        return new Maxime.scope.__maxime__String._String._String(this._s.replace(new RegExp(_regex._s, 'g'), _replacement._s));
      };
      _String.prototype._split = function (_s) {
        var that = this;
        return EcmaScript.js2max(this._s.split(_s));
      };
      return _String;
    }()
  };
  return __maxime__String;
}();
Maxime.scope.__maxime__tuples = function () {
  var __maxime__tuples = {};
  __maxime__tuples._Pair = {
    _Pair: function () {
      var _Pair = function (_fst, _snd) {
        this._constructor = 'Pair';
        this._properties = [
          this._fst,
          this._snd
        ];
        this._fst = _fst;
        this._snd = _snd;
      };
      return _Pair;
    }()
  };
  return __maxime__tuples;
}();
Maxime.scope.__maxime__Void = function () {
  var __maxime__Void = {};
  __maxime__Void._Void = {
    _Void: function () {
      var _Void = function () {
        this._constructor = 'Void';
        this._properties = [];
      };
      return _Void;
    }()
  };
  return __maxime__Void;
}();
Maxime.scope.__stdlib = function () {
  var __stdlib = {};
  __stdlib._Pair = {
    _Pair: function () {
      var _Pair = function (_first, _second) {
        this._constructor = 'Pair';
        this._properties = [
          this._first,
          this._second
        ];
        this._first = _first;
        this._second = _second;
      };
      _Pair.prototype._fst = function () {
        var that = this;
        return that._first;
      };
      _Pair.prototype._snd = function () {
        var that = this;
        return that._second;
      };
      return _Pair;
    }()
  };
  return __stdlib;
}();
Maxime.scope.__svg = function () {
  var __svg = {};
  __svg._LengthUnit = {
    _LengthUnit: function () {
      var _LengthUnit = function (_pxFactor) {
        this._constructor = 'LengthUnit';
        this._properties = [this._pxFactor];
        this._pxFactor = _pxFactor;
      };
      return _LengthUnit;
    }()
  };
  __svg._Length = {
    _Length: function () {
      var _Length = function (_value, _unit) {
        this._constructor = 'Length';
        this._properties = [
          this._value,
          this._unit
        ];
        this._value = _value;
        this._unit = _unit;
      };
      _Length.prototype._convert = function (_l, _targetUnit) {
        var that = this;
        return new Maxime.scope.__svg._Length._Length(_l._value.__slash_(_l._unit._pxFactor).__asterisk_(_targetUnit._pxFactor), _targetUnit);
      };
      return _Length;
    }()
  };
  __svg._Line = {
    _SvgLine: function () {
      var _SvgLine = function (_n) {
        this._constructor = 'SvgLine';
        this._properties = [this._n];
        this._n = _n;
      };
      return _SvgLine;
    }()
  };
  return __svg;
}();
/*console.log(Maxime.scope);*/ module.exports = function(sources, target, options) { Maxime.scope.__maxime__compiler__Compiler._compile(EcmaScript.js2max(sources), EcmaScript.js2max(target), options); };