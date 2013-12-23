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

Maxime.scope['dom'] = {
  Node: {
    Node: function () {
      var Node = function (parent, localName, attrs) {
        this.constructor = 'Node';
        this.properties = [
          parent,
          localName,
          attrs
        ];
        this.parent = parent;
        this.localName = localName;
        this.attrs = attrs;
      };
      Node.prototype.attr = function (name) {
        return attrs.get(name);
      };
      return Node;
    }()
  }
};
Maxime.scope['geom'] = {
  Point: {
    Point: function () {
      var Point = function (x, y) {
        this.constructor = 'Point';
        this.properties = [
          x,
          y
        ];
        this.x = x;
        this.y = y;
      };
      Point.prototype.swap = function () {
        return new Maxime.scope['geom']['Point']['Point'](y, x);
      };
      Point.prototype.bounds = function () {
        return new Maxime.scope['geom']['Rect']['Rect'](x, y, 0, 0);
      };
      return Point;
    }()
  },
  Line: {
    Line: function () {
      var Line = function (x1, y1, x2, y2) {
        this.constructor = 'Line';
        this.properties = [
          x1,
          y1,
          x2,
          y2
        ];
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
      };
      Line.prototype.bounds = function () {
        return new Maxime.scope['geom']['Rect']['Rect'](min(x1, x2), min(y1, y2), abs(x2._minus_(x1)), abs(y2._minus_(y1)));
      };
      return Line;
    }()
  },
  Rect: {
    Rect: function () {
      var Rect = function (x, y, width, height) {
        this.constructor = 'Rect';
        this.properties = [
          x,
          y,
          width,
          height
        ];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      };
      Rect.prototype.bounds = function () {
        return new Maxime.scope['geom']['Rect']['Rect'](0, 0, width, height);
      };
      return Rect;
    }()
  },
  Matrix: {
    Matrix: function () {
      var Matrix = function (a, b, c, d, e, f) {
        this.constructor = 'Matrix';
        this.properties = [
          a,
          b,
          c,
          d,
          e,
          f
        ];
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
      };
      return Matrix;
    }()
  }
};
Maxime.scope['maxime.Bool'] = {
  Bool: {
    True: function () {
      var True = function () {
        this.constructor = 'True';
        this.properties = [];
      };
      True.prototype.not = function () {
        return new Maxime.scope['maxime.Bool']['Bool']['False']();
      };
      return True;
    }(),
    False: function () {
      var False = function () {
        this.constructor = 'False';
        this.properties = [];
      };
      False.prototype.not = function () {
        return new Maxime.scope['maxime.Bool']['Bool']['True']();
      };
      return False;
    }()
  }
};
Maxime.scope['maxime.compiler.ast.BinaryExpr'] = {
  BinaryExpr: {
    BinaryExpr: function () {
      var BinaryExpr = function (left, operator, right) {
        this.constructor = 'BinaryExpr';
        this.properties = [
          left,
          operator,
          right
        ];
        this.left = left;
        this.operator = operator;
        this.right = right;
      };
      BinaryExpr.prototype.transcode = function () {
        return new Maxime.scope['maxime.String']['String']['String']('');
      };
      return BinaryExpr;
    }()
  }
};
Maxime.scope['maxime.compiler.Compiler'] = {
  Compiler: {
    Compiler: function () {
      var Compiler = function () {
        this.constructor = 'Compiler';
        this.properties = [];
      };
      Compiler.prototype.compile = function (sources, target, options) {
        return function () {
          function toString(s) {
            return s.toString();
          }
          new Maxime.scope['maxime.String']['String']['String']('Compiling ')._plus_(sources.map(toString).join(new Maxime.scope['maxime.String']['String']['String'](', ')))._plus_(new Maxime.scope['maxime.String']['String']['String'](' to '))._plus_(target).println();
          var CompilationUnit = {
              CompilationUnit: function () {
                var CompilationUnit = function (path, maxFiles, jsFiles) {
                  this.constructor = 'CompilationUnit';
                  this.properties = [
                    path,
                    maxFiles,
                    jsFiles
                  ];
                  this.path = path;
                  this.maxFiles = maxFiles;
                  this.jsFiles = jsFiles;
                };
                return CompilationUnit;
              }()
            };
          function mkCompilationUnit(path) {
            return new Maxime.scope['maxime.compiler.Compiler']['Compiler']['Compiler']['compile']['CompilationUnit']['CompilationUnit'](path, findFiles(path, new Maxime.scope['maxime.RegExp']['RegExp']['RegExp'](new Maxime.scope['maxime.String']['String']['String']('\\.max$'), new Maxime.scope['maxime.String']['String']['String'](''))), findFiles(path, new Maxime.scope['maxime.RegExp']['RegExp']['RegExp'](new Maxime.scope['maxime.String']['String']['String']('\\.js$'), new Maxime.scope['maxime.String']['String']['String'](''))));
          }
          var compilationUnits = sources.map(mkCompilationUnit);
          new Maxime.scope['maxime.String']['String']['String']('Compilation units: ')._plus_(compilationUnits.map(toString)).println();
          function compileUnit(unit) {
            return function () {
              var Source = {
                  Source: function () {
                    var Source = function (code, file) {
                      this.constructor = 'Source';
                      this.properties = [
                        code,
                        file
                      ];
                      this.code = code;
                      this.file = file;
                    };
                    return Source;
                  }()
                };
              function readSource(file) {
                return new Maxime.scope['maxime.compiler.Compiler']['Compiler']['Compiler']['compile']['compileUnit']['Source']['Source'](new Maxime.scope['maxime.io.File']['File']['File'](unit.path()._plus_(new Maxime.scope['maxime.String']['String']['String']('/'))._plus_(file)).read(), file);
              }
              function parse(source) {
                return source;
              }
              function generate(source) {
                return source;
              }
              function compileSource(source) {
                return function () {
                  var moduleName = source.file().replace(new Maxime.scope['maxime.String']['String']['String']('\\/g'), new Maxime.scope['maxime.String']['String']['String']('.')).replace(new Maxime.scope['maxime.String']['String']['String']('\\.max$g'), new Maxime.scope['maxime.String']['String']['String'](''));
                  new Maxime.scope['maxime.String']['String']['String']('Compiling module ')._plus_(moduleName).println();
                  var ast = parse(source);
                  return generate(ast);
                }();
              }
              function getCode(s) {
                return s.code();
              }
              var jsSources = unit.jsFiles().map(readSource).map(getCode);
              var maxSources = unit.maxFiles().map(readSource);
              var maxTargets = maxSources.map(compileSource);
              return jsSources._plus__plus_(maxTargets).join(new Maxime.scope['maxime.String']['String']['String']('\n'));
            }();
          }
          var codes = compilationUnits.map(compileUnit);
          var code = codes.join(new Maxime.scope['maxime.String']['String']['String']('\\n'));
          return code;
        }();
      };
      return Compiler;
    }()
  },
  compile: function (sources, target, options) {
    return new Maxime.scope['maxime.compiler.Compiler']['Compiler']['Compiler']().compile(sources, target, options);
  }
};
Maxime.scope['maxime.ecmascript.ast'] = {
  BinaryExpression: {
    BinaryExpression: function () {
      var BinaryExpression = function (left, operator, right) {
        this.constructor = 'BinaryExpression';
        this.properties = [
          left,
          operator,
          right
        ];
        this.left = left;
        this.operator = operator;
        this.right = right;
      };
      return BinaryExpression;
    }()
  }
};
Maxime.scope['maxime.io.File'] = {
  Path: {
    Path: function () {
      var Path = function () {
        this.constructor = 'Path';
        this.properties = [];
      };
      return Path;
    }()
  },
  File: {
    File: function () {
      var File = function () {
        this.constructor = 'File';
        this.properties = [];
      };
      File.prototype.read = function () {
        return new Maxime.scope['maxime.String']['String']['String']('');
      };
      return File;
    }()
  },
  findFiles: function (p, r) {
    return new Maxime.scope['maxime.List']['List']['Nil']();
  }
};
Maxime.scope['maxime.List'] = {
  List: {
    Nil: function () {
      var Nil = function () {
        this.constructor = 'Nil';
        this.properties = [];
      };
      Nil.prototype.map = function (f) {
        return new Maxime.scope['maxime.List']['List']['Nil']();
      };
      Nil.prototype.head = function () {
        return new Maxime.scope['maxime.Option']['Option']['None']();
      };
      Nil.prototype.tail = function () {
        return new Maxime.scope['maxime.List']['List']['Nil']();
      };
      Nil.prototype._plus__plus_ = function (l) {
        return l;
      };
      Nil.prototype.length = function () {
        return 0;
      };
      Nil.prototype.join = function (sep) {
        return new Maxime.scope['maxime.String']['String']['String']('');
      };
      return Nil;
    }(),
    Cons: function () {
      var Cons = function (headElem, tailList) {
        this.constructor = 'Cons';
        this.properties = [
          headElem,
          tailList
        ];
        this.headElem = headElem;
        this.tailList = tailList;
      };
      Cons.prototype.map = function (f) {
        return new Maxime.scope['maxime.List']['List']['Cons'](f(headElem), map(tailList, f));
      };
      Cons.prototype.head = function () {
        return headElem;
      };
      Cons.prototype.tail = function () {
        return tailList;
      };
      Cons.prototype._plus__plus_ = function (l) {
        return new Maxime.scope['maxime.List']['List']['Cons'](headElem, tailList._plus__plus_(l));
      };
      Cons.prototype.length = function () {
        return 1.._plus_(tailList.length());
      };
      Cons.prototype.join = function (f, sep) {
        return f(headElem)._plus_(sep)._plus_(tailList.join(sep));
      };
      return Cons;
    }()
  }
};
Maxime.scope['maxime.Map'] = {
  Map: {
    EmptyMap: function () {
      var EmptyMap = function () {
        this.constructor = 'EmptyMap';
        this.properties = [];
      };
      EmptyMap.prototype.put = function (key, value) {
        return new Maxime.scope['maxime.Map']['Map']['Map'](key, value, new Maxime.scope['maxime.Map']['Map']['EmptyMap']());
      };
      EmptyMap.prototype.get = function (key) {
        return new Maxime.scope['maxime.Option']['Option']['None']();
      };
      return EmptyMap;
    }(),
    Map: function () {
      var Map = function (key, value, rest) {
        this.constructor = 'Map';
        this.properties = [
          key,
          value,
          rest
        ];
        this.key = key;
        this.value = value;
        this.rest = rest;
      };
      Map.prototype.put = function (k, v) {
        return Maxime.patternMatch([
          {
            pattern: {
              'type': 'constructor',
              'name': 'True',
              'params': []
            },
            callback: function () {
              return new Maxime.scope['maxime.Map']['Map']['Map'](key, v, rest);
            }
          },
          {
            pattern: {
              'type': 'constructor',
              'name': 'False',
              'params': []
            },
            callback: function () {
              return new Maxime.scope['maxime.Map']['Map']['Map'](key, value, rest.put(k, v));
            }
          }
        ], eq(k, key));
      };
      Map.prototype.get = function (k) {
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
              return rest.get(key);
            }
          }
        ], eq(k, key));
      };
      return Map;
    }()
  }
};
Maxime.scope['maxime.Num'] = {
  Num: {
    Num: function () {
      var Num = function () {
        this.constructor = 'Num';
        this.properties = [];
      };
      Num.prototype.toString = function () {
        return n.toString();
      };
      Num.prototype._plus_ = function (n) {
        return 0;
      };
      Num.prototype._minus_ = function (n) {
        return 0;
      };
      Num.prototype._asterisk_ = function (n) {
        return 0;
      };
      Num.prototype._slash_ = function (n) {
        return 0;
      };
      return Num;
    }()
  },
  min: function (x, y) {
    return x;
  },
  abs: function (x) {
    return x;
  }
};
Maxime.scope['maxime.Option'] = {
  Option: {
    None: function () {
      var None = function () {
        this.constructor = 'None';
        this.properties = [];
      };
      None.prototype.map = function (f) {
        return new Maxime.scope['maxime.Option']['Option']['None']();
      };
      return None;
    }(),
    Some: function () {
      var Some = function (a) {
        this.constructor = 'Some';
        this.properties = [a];
        this.a = a;
      };
      Some.prototype.map = function (f) {
        return new Maxime.scope['maxime.Option']['Option']['Some'](f(a));
      };
      return Some;
    }()
  }
};
Maxime.scope['maxime.Printable'] = {
  Printable: {
    Printable: function () {
      var Printable = function () {
        this.constructor = 'Printable';
        this.properties = [];
      };
      Printable.prototype.toString = function () {
        return new Maxime.scope['maxime.String']['String']['String']('');
      };
      return Printable;
    }()
  }
};
Maxime.scope['maxime.RegExp'] = {
  RegExp: {
    RegExp: function () {
      var RegExp = function (s, modifiers) {
        this.constructor = 'RegExp';
        this.properties = [
          s,
          modifiers
        ];
        this.s = s;
        this.modifiers = modifiers;
      };
      return RegExp;
    }()
  }
};
Maxime.scope['maxime.String'] = {
  String: {
    String: function () {
      var String = function (s) {
        this.constructor = 'String';
        this.properties = [s];
        this.s = s;
      };
      String.prototype._plus_ = function (s) {
        return new Maxime.scope['maxime.String']['String']['String']('');
      };
      String.prototype.println = function () {
        return console.log(this.s);
      };
      String.prototype.replace = function (regex, replacement) {
        return new Maxime.scope['maxime.String']['String']['String']('');
      };
      return String;
    }()
  }
};
Maxime.scope['maxime.tuples'] = {
  Pair: {
    Pair: function () {
      var Pair = function (fst, snd) {
        this.constructor = 'Pair';
        this.properties = [
          fst,
          snd
        ];
        this.fst = fst;
        this.snd = snd;
      };
      return Pair;
    }()
  }
};
Maxime.scope['maxime.Void'] = {
  Void: {
    Void: function () {
      var Void = function () {
        this.constructor = 'Void';
        this.properties = [];
      };
      return Void;
    }()
  }
};
Maxime.scope['stdlib'] = {
  Pair: {
    Pair: function () {
      var Pair = function (first, second) {
        this.constructor = 'Pair';
        this.properties = [
          first,
          second
        ];
        this.first = first;
        this.second = second;
      };
      Pair.prototype.fst = function () {
        return first;
      };
      Pair.prototype.snd = function () {
        return second;
      };
      return Pair;
    }()
  }
};
Maxime.scope['svg'] = {
  LengthUnit: {
    LengthUnit: function () {
      var LengthUnit = function (pxFactor) {
        this.constructor = 'LengthUnit';
        this.properties = [pxFactor];
        this.pxFactor = pxFactor;
      };
      return LengthUnit;
    }()
  },
  Length: {
    Length: function () {
      var Length = function (value, unit) {
        this.constructor = 'Length';
        this.properties = [
          value,
          unit
        ];
        this.value = value;
        this.unit = unit;
      };
      Length.prototype.convert = function (l, targetUnit) {
        return new Maxime.scope['svg']['Length']['Length'](l.value()._slash_(l.unit().pxFactor())._asterisk_(targetUnit.pxFactor()), targetUnit);
      };
      return Length;
    }()
  },
  Line: {
    SvgLine: function () {
      var SvgLine = function (n) {
        this.constructor = 'SvgLine';
        this.properties = [n];
        this.n = n;
      };
      return SvgLine;
    }()
  }
};
/*console.log(Maxime.scope);*/ module.exports = Maxime.scope["maxime.compiler.Compiler"].compile;