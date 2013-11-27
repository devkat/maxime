var _ = require("lodash");var Maxime = function() {
  
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
  
};

(function() {
  
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
        if (pattern.name === ref.constructor() && pattern.params.length === ref.properties().length) {
          return _.zip([ pattern.params, ref.properties() ]).reduce(function(prev, pair) {
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
        console.log("Matched pattern ", clause.pattern, 'against', ref.properties(), ' -> ', match.assignments);
        return clause.callback.apply(null, match.assignments);
      }
    }
    throw new Error('No pattern matched value ' + JSON.stringify(ref));
  };

})();



var
  Parser = require("jison").Parser,
  sprintf = require('sprintf');

function loc(start, end) {
  end = end || start;
  // console.log($$.toString(), $$);
  return sprintf("$$.loc = yy.src.loc(@%d, @%d);", start, end);
}

module.exports = new Parser({
  "bnf": {

/* ----------------------------------------------------------------------
   Structure
   ---------------------------------------------------------------------- */

    "program": [
      [ "statements EOF", "$$ = new yy.Program($1);" + loc(1, 2) + "return $$;" ],
      [ "NEWLINE statements EOF", "$$ = new yy.Program($2);" + loc(1, 3) + "return $$;" ]
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
      [ "call", "$$ = $1;" ],
      [ "propertyAccess", "$$ = $1;" ],
      [ "atomicExpr", "$$ = $1;" ],
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
      [ "IMPORT qualifiedModuleNames NEWLINE", "$$ = new yy.Import($2);" + loc(1, 2) ]
    ],

    "qualifiedModuleNames": [
      [ "qualifiedModuleName", "$$ = [ $1 ];" ],
      [ "qualifiedModuleName , qualifiedModuleName", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "qualifiedModuleName": [
      [ "identifier", "$$ = [ $1 ];" ],
      [ "qualifiedModuleName . identifier", "$$ = $1.concat($3);" ]
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
      [ "ctorCall", "$$ = $1;" ]
    ],

    "functionCall": [
      [ "lcIdentifier ( args )", "$$ = new yy.FunctionCall($1, $3);" + loc(1, 4) ]
    ],
    
    "ctorCall": [
      [ "ucIdentifier ( args )", "$$ = new yy.CtorCall($1, $3);" + loc(1, 4) ]
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
      [ "inlineExpr . lcIdentifier", "$$ = new yy.PropertyAccess($1, $3);" + loc(1, 3) ]
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
      [ "methodDecl", "$$ = $1;" ],
      [ "funcDecl", "$$ = $1;" ],
      [ "classDecl", "$$ = $1;" ],
      [ "valDecl", "$$ = $1;" ]
    ],
    
/* ----------------------------------------------------------------------
   Class declaration
   ---------------------------------------------------------------------- */

    "classDecl": [
      [ "CLASS ucIdentifier typeParams extendsClause NEWLINE INDENT ctorList methodList OUTDENT",
        "$$ = new yy.ClassDecl($2, $3, $4, $7, $8);" + loc(1, 9) ]
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
      [ "lcIdentifier", "$$ = new yy.TypeParam($1);" + loc(1) ]
    ],
    
    "extendsClause": [
      [ "", "$$ = [];" ],
      [ "IS classList", "$$ = $1;" ]
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
      [ "ucIdentifier ( params ) NEWLINE", "$$ = new yy.CtorDecl($1, $3);" + loc(1, 5) ]
    ],
    
    "methodList": [
      [ "", "$$ = [];" ],
      [ "methodList funcDecl", "$$ = $1.concat([ $2 ]);" ]
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
      [ "DEF lcIdentifier ( params ) returnTypeDecl NEWLINE",
        "$$ = new yy.FunctionDecl($2, $4, $6, null);" + loc(1, 7) ],
      [ "DEF lcIdentifier ( params ) returnTypeDecl = blockExpr",
        "$$ = new yy.FunctionDecl($2, $4, $6, $8);" + loc(1, 8) ]
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
      [ "RIGHT_ARROW typeRef", "$$ = $2" ]
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
});

function array2list(a) {
  if (a.length === 0) {
    return new Nil();
  }
  else {
    return new Cons(a[0], array2list(a.slice(1)));
  }
}

function toJson(o) {
  return JSON.stringify(o);
}

function Node(parent, localName, attrs) {
  this.constructor = function () {
    return 'Node';
  };
  this.properties = function () {
    return [
      parent,
      localName,
      attrs
    ];
  };
  this.parent = function () {
    return parent;
  };
  this.localName = function () {
    return localName;
  };
  this.attrs = function () {
    return attrs;
  };
}
function localName(n) {
  return n.localName();
}
function parent(n) {
  return n.parent();
}
function attr(n, name) {
  return get(attrs, name);
}
function bounds(shape) {
}
function Point(x, y) {
  this.constructor = function () {
    return 'Point';
  };
  this.properties = function () {
    return [
      x,
      y
    ];
  };
  this.x = function () {
    return x;
  };
  this.y = function () {
    return y;
  };
}
function swap(p) {
  return new Point(p.y(), p.x());
}
function Line(x1, y1, x2, y2) {
  this.constructor = function () {
    return 'Line';
  };
  this.properties = function () {
    return [
      x1,
      y1,
      x2,
      y2
    ];
  };
  this.x1 = function () {
    return x1;
  };
  this.y1 = function () {
    return y1;
  };
  this.x2 = function () {
    return x2;
  };
  this.y2 = function () {
    return y2;
  };
}
function bounds(l) {
  return new Rect(min(l.x1(), l.x2()), min(l.y1(), l.y2()), abs(minus(l.x2(), l.x1())), abs(minus(l.y2(), l.y1())));
}
function Rect(x, y, w, h) {
  this.constructor = function () {
    return 'Rect';
  };
  this.properties = function () {
    return [
      x,
      y,
      w,
      h
    ];
  };
  this.x = function () {
    return x;
  };
  this.y = function () {
    return y;
  };
  this.w = function () {
    return w;
  };
  this.h = function () {
    return h;
  };
}
function bounds(r) {
  return new Rect(0, 0, r.w(), r.h());
}
function True() {
  this.constructor = function () {
    return 'True';
  };
  this.properties = function () {
    return [];
  };
}
function False() {
  this.constructor = function () {
    return 'False';
  };
  this.properties = function () {
    return [];
  };
}
function not(b) {
  return Maxime.patternMatch([
    {
      pattern: {
        'type': 'constructor',
        'name': 'True',
        'params': []
      },
      callback: function () {
        return new False();
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'False',
        'params': []
      },
      callback: function () {
        return new True();
      }
    }
  ], b);
}
function Compiler() {
  this.constructor = function () {
    return 'Compiler';
  };
  this.properties = function () {
    return [];
  };
}
function compile(sourceArray, target, options) {
  return function () {
    var sources = array2list(sourceArray);
    println('sources: ' + (toJson(sources) + (', ' + sourceArray)));
    return println('Compiling ' + (join(list_map(sources, toString), ', ') + (' to ' + target)));
  }();
}
function Cons(head, tail) {
  this.constructor = function () {
    return 'Cons';
  };
  this.properties = function () {
    return [
      head,
      tail
    ];
  };
  this.head = function () {
    return head;
  };
  this.tail = function () {
    return tail;
  };
}
function Nil() {
  this.constructor = function () {
    return 'Nil';
  };
  this.properties = function () {
    return [];
  };
}
function list_map(list, f) {
  return Maxime.patternMatch([
    {
      pattern: {
        'type': 'constructor',
        'name': 'Cons',
        'params': [
          {
            'type': 'variable',
            'name': 'head'
          },
          {
            'type': 'variable',
            'name': 'tail'
          }
        ]
      },
      callback: function (head, tail) {
        return new Cons(f(head), list_map(tail, f));
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'Nil',
        'params': []
      },
      callback: function () {
        return new Nil();
      }
    }
  ], list);
}
function head(list) {
  return list.head();
}
function tail(list) {
  return list.tail();
}
function concat(l1, l2) {
  return Maxime.patternMatch([
    {
      pattern: {
        'type': 'constructor',
        'name': 'Nil',
        'params': []
      },
      callback: function () {
        return l2;
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'Cons',
        'params': [
          {
            'type': 'variable',
            'name': 'head'
          },
          {
            'type': 'variable',
            'name': 'tail'
          }
        ]
      },
      callback: function (head, tail) {
        return new Cons(head, concat(tail, l2));
      }
    }
  ], l1);
}
function length(l) {
  return Maxime.patternMatch([
    {
      pattern: {
        'type': 'constructor',
        'name': 'Nil',
        'params': []
      },
      callback: function () {
        return 0;
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'Cons',
        'params': [
          {
            'type': 'variable',
            'name': 'head'
          },
          {
            'type': 'variable',
            'name': 'tail'
          }
        ]
      },
      callback: function (head, tail) {
        return 1 + length(tail);
      }
    }
  ], l);
}
function join(l, sep) {
  return Maxime.patternMatch([
    {
      pattern: {
        'type': 'constructor',
        'name': 'Nil',
        'params': []
      },
      callback: function () {
        return '';
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'Cons',
        'params': [
          {
            'type': 'variable',
            'name': 'head'
          },
          {
            'type': 'constructor',
            'name': 'Nil',
            'params': []
          }
        ]
      },
      callback: function (head) {
        return toString(head);
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'Cons',
        'params': [
          {
            'type': 'variable',
            'name': 'head'
          },
          {
            'type': 'variable',
            'name': 'tail'
          }
        ]
      },
      callback: function (head, tail) {
        return toString(head) + (sep + join(tail, sep));
      }
    }
  ], l);
}
function EmptyMap() {
  this.constructor = function () {
    return 'EmptyMap';
  };
  this.properties = function () {
    return [];
  };
}
function Map(m, key, value) {
  this.constructor = function () {
    return 'Map';
  };
  this.properties = function () {
    return [
      m,
      key,
      value
    ];
  };
  this.m = function () {
    return m;
  };
  this.key = function () {
    return key;
  };
  this.value = function () {
    return value;
  };
}
function put(m, key, value) {
  return Maxime.patternMatch([
    {
      pattern: {
        'type': 'constructor',
        'name': 'True',
        'params': []
      },
      callback: function () {
        return replace(m, a, b);
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'False',
        'params': []
      },
      callback: function () {
        return m;
      }
    }
  ], containsKey(m, a));
}
function get(m, key) {
  return Maxime.patternMatch([
    {
      pattern: {
        'type': 'constructor',
        'name': 'EmptyMap',
        'params': []
      },
      callback: function () {
        return new None();
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'Map',
        'params': [
          {
            'type': 'variable',
            'name': 'm'
          },
          {
            'type': 'variable',
            'name': 'k'
          },
          {
            'type': 'variable',
            'name': 'value'
          }
        ]
      },
      callback: function (m, k, value) {
        return Maxime.patternMatch([
          {
            pattern: {
              'type': 'constructor',
              'name': 'True',
              'params': []
            },
            callback: function () {
              return value;
            }
          },
          {
            pattern: {
              'type': 'constructor',
              'name': 'False',
              'params': []
            },
            callback: function () {
              return get(m, key);
            }
          }
        ], eq(k, key));
      }
    }
  ], m);
}
function toString(n) {
  return n.toString();
}
function None() {
  this.constructor = function () {
    return 'None';
  };
  this.properties = function () {
    return [];
  };
}
function Some(a) {
  this.constructor = function () {
    return 'Some';
  };
  this.properties = function () {
    return [a];
  };
  this.a = function () {
    return a;
  };
}
function map(o, f) {
  return Maxime.patternMatch([
    {
      pattern: {
        'type': 'constructor',
        'name': 'Some',
        'params': [{
            'type': 'variable',
            'name': 's'
          }]
      },
      callback: function (s) {
        return new Some(f(s));
      }
    },
    {
      pattern: {
        'type': 'constructor',
        'name': 'None',
        'params': []
      },
      callback: function () {
        return new None();
      }
    }
  ], o);
}
function toStringDISABLED(n) {
}
function println(s) {
  return console.log(s);
}
function map(functor, func) {
}
function Pair(fst, snd) {
  this.constructor = function () {
    return 'Pair';
  };
  this.properties = function () {
    return [
      fst,
      snd
    ];
  };
  this.fst = function () {
    return fst;
  };
  this.snd = function () {
    return snd;
  };
}
function fst(p) {
  return p.fst();
}
function snd(p) {
  return p.snd();
}
function LengthUnit(pxFactor) {
  this.constructor = function () {
    return 'LengthUnit';
  };
  this.properties = function () {
    return [pxFactor];
  };
  this.pxFactor = function () {
    return pxFactor;
  };
}
var px = new LengthUnit(1);
var mm = new LengthUnit(25.4);
function Length(value, unit) {
  this.constructor = function () {
    return 'Length';
  };
  this.properties = function () {
    return [
      value,
      unit
    ];
  };
  this.value = function () {
    return value;
  };
  this.unit = function () {
    return unit;
  };
}
function convert(l, targetUnit) {
  return new Length(times(div(l.value(), l.unit().pxFactor()), targetUnit.pxFactor()), targetUnit);
}
function setMatrix(node, m) {
}
function SvgLine(n) {
  this.constructor = function () {
    return 'SvgLine';
  };
  this.properties = function () {
    return [n];
  };
  this.n = function () {
    return n;
  };
}
module.exports = compile;