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
        log("Matched pattern ", clause.pattern, 'against', ref.properties(), ' -> ', match.assignments);
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


var
  fs = require('fs'),
  filesystem = require('../lib/filesystem');

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

function regexp(str, mod) {
  return new RegExp(str, mod);
}

function findFiles(p, regex) {
  return array2list(filesystem.findFiles(p, regex));
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
function BinaryExpr(left, operator, right) {
  this.constructor = function () {
    return 'BinaryExpr';
  };
  this.properties = function () {
    return [
      left,
      operator,
      right
    ];
  };
  this.left = function () {
    return left;
  };
  this.operator = function () {
    return operator;
  };
  this.right = function () {
    return right;
  };
}
function transcode() {
  return '';
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
    println('Compiling ' + join(list_map(sources, toString), ', ') + ' to ' + target);
    function CompilationUnit(path, maxFiles, jsFiles) {
      this.constructor = function () {
        return 'CompilationUnit';
      };
      this.properties = function () {
        return [
          path,
          maxFiles,
          jsFiles
        ];
      };
      this.path = function () {
        return path;
      };
      this.maxFiles = function () {
        return maxFiles;
      };
      this.jsFiles = function () {
        return jsFiles;
      };
    }
    function mkCompilationUnit(path) {
      return new CompilationUnit(path, findFiles(path, regexp('\\.max$')), findFiles(path, regexp('\\.js$')));
    }
    var compilationUnits = list_map(sources, mkCompilationUnit);
    println('Compilation units: ' + list_map(compilationUnits, println));
    function compileUnit(unit) {
      return function () {
        function Source(code, file) {
          this.constructor = function () {
            return 'Source';
          };
          this.properties = function () {
            return [
              code,
              file
            ];
          };
          this.code = function () {
            return code;
          };
          this.file = function () {
            return file;
          };
        }
        function readSource(file) {
          return new Source(readFile(unit.path() + '/' + file), file);
        }
        function compileSource(source) {
          return function () {
            var moduleName = replace(replace(source.file(), regexp('\\/', 'g'), '.'), regexp('\\.max$'), '');
            println('Compiling module ' + moduleName);
            var ast = parse(source);
            return generate(ast);
          }();
        }
        function getCode(s) {
          return s.code();
        }
        var jsSources = list_map(list_map(unit.jsFiles(), readSource), getCode);
        var maxSources = list_map(unit.maxFiles(), readSource);
        var maxTargets = list_map(maxSources, compileSource);
        var targets = concat(jsSources, maxTargets);
        return join(targets, '\n');
      }();
    }
    var codes = list_map(compilationUnits, compileUnit);
    var code = join(codes);
    var runtimeLib = readFile('runtime/Maxime.js');
    writeFile(target, prop(options, 'before') + runtimeLib + code + prop(options, 'after'));
    return code;
  }();
}
function BinaryExpression(left, operator, right) {
  this.constructor = function () {
    return 'BinaryExpression';
  };
  this.properties = function () {
    return [
      left,
      operator,
      right
    ];
  };
  this.left = function () {
    return left;
  };
  this.operator = function () {
    return operator;
  };
  this.right = function () {
    return right;
  };
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
        return toString(head) + sep + join(tail, sep);
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
}module.exports = compile;