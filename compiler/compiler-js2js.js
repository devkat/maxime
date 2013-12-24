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
        if (pattern.name === ref.constructor() && pattern.params.length === ref.properties.length) {
          return _.zip([ pattern.params, ref.properties ]).reduce(function(prev, pair) {
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
        log("Matched pattern ", clause.pattern, 'against', ref.properties, ' -> ', match.assignments);
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
    return new Maxime.scope.__maxime__List._List._Nil();
  }
  else {
    return new Maxime.scope.__maxime__List._List._Cons(a[0], array2list(a.slice(1)));
  }
}

function toJson(o) {
  return JSON.stringify(o);
}

function regexp(str, mod) {
  return new RegExp(str, mod);
}

function _findFiles(p, regex) {
  return array2list(filesystem.findFiles(p._s, regex).map(function(f) {
    return new Maxime.scope.__maxime__String._String._String(f);
  }));
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
        return this._attrs._get(_name);
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
        return new Maxime.scope.__geom._Point._Point(this._y, this._x);
      };
      _Point.prototype._bounds = function () {
        return new Maxime.scope.__geom._Rect._Rect(this._x, this._y, new Maxime.scope.__maxime__Num._Num._Num(0), new Maxime.scope.__maxime__Num._Num._Num(0));
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
        return new Maxime.scope.__geom._Rect._Rect(_min(this._x1, this._x2), _min(this._y1, this._y2), _abs(this._x2.__minus_(this._x1)), _abs(this._y2.__minus_(this._y1)));
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
        return new Maxime.scope.__geom._Rect._Rect(new Maxime.scope.__maxime__Num._Num._Num(0), new Maxime.scope.__maxime__Num._Num._Num(0), this._width, this._height);
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
        return new Maxime.scope.__maxime__String._String._String('');
      };
      return _BinaryExpr;
    }()
  };
  return __maxime__compiler__ast__BinaryExpr;
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
        return function () {
          function _toString(_s) {
            return _s._toString();
          }
          function _id(_s) {
            return _s;
          }
          new Maxime.scope.__maxime__String._String._String('Compiling ').__plus_(_sources._join(_id, new Maxime.scope.__maxime__String._String._String(', '))).__plus_(new Maxime.scope.__maxime__String._String._String(' to ')).__plus_(_target)._println();
          var _CompilationUnit = {
              _CompilationUnit: function () {
                var _CompilationUnit = function (_path, _maxFiles, _jsFiles) {
                  this._constructor = 'CompilationUnit';
                  this._properties = [
                    this._path,
                    this._maxFiles,
                    this._jsFiles
                  ];
                  this._path = _path;
                  this._maxFiles = _maxFiles;
                  this._jsFiles = _jsFiles;
                };
                _CompilationUnit.prototype._toString = function () {
                  return this._path;
                };
                return _CompilationUnit;
              }()
            };
          function _mkCompilationUnit(_path) {
            return new _CompilationUnit._CompilationUnit(_path, _findFiles(_path, new Maxime.scope.__maxime__RegExp._RegExp._RegExp(new Maxime.scope.__maxime__String._String._String('\\.max$'), new Maxime.scope.__maxime__String._String._String(''))), _findFiles(_path, new Maxime.scope.__maxime__RegExp._RegExp._RegExp(new Maxime.scope.__maxime__String._String._String('\\.js$'), new Maxime.scope.__maxime__String._String._String(''))));
          }
          var _compilationUnits = _sources._map(_mkCompilationUnit);
          new Maxime.scope.__maxime__String._String._String('Compilation units: ').__plus_(_compilationUnits._map(_toString))._println();
          function _compileUnit(_unit) {
            return function () {
              var _Source = {
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
                    return _Source;
                  }()
                };
              function _readSource(_file) {
                return new _Source._Source(new Maxime.scope.__maxime__io__File._File._File(_unit._path.__plus_(new Maxime.scope.__maxime__String._String._String('/')).__plus_(_file))._read(), _file);
              }
              function _parse(_source) {
                return _source;
              }
              function _generate(_source) {
                return _source;
              }
              function _compileSource(_source) {
                return function () {
                  var _moduleName = _source._file._replace(new Maxime.scope.__maxime__String._String._String('\\/'), new Maxime.scope.__maxime__String._String._String('.'))._replace(new Maxime.scope.__maxime__String._String._String('\\.max$'), new Maxime.scope.__maxime__String._String._String(''));
                  new Maxime.scope.__maxime__String._String._String('Compiling module ').__plus_(_moduleName)._println();
                  var _ast = _parse(_source);
                  return _generate(_ast);
                }();
              }
              function _getCode(_s) {
                return _s._code;
              }
              var _jsSources = _unit._jsFiles._map(_readSource)._map(_getCode);
              var _maxSources = _unit._maxFiles._map(_readSource);
              var _maxTargets = _maxSources._map(_compileSource);
              return _jsSources.__plus__plus_(_maxTargets)._join(_toString, new Maxime.scope.__maxime__String._String._String('\n'));
            }();
          }
          var _codes = _compilationUnits._map(_compileUnit);
          var _code = _codes._join(new Maxime.scope.__maxime__String._String._String('\\n'));
          return _code;
        }();
      };
      return _Compiler;
    }()
  };
  __maxime__compiler__Compiler._compile = function (_sources, _target, _options) {
    return function () {
      function _mkString(_s) {
        return new Maxime.scope.__maxime__String._String._String(_s);
      }
      return new Maxime.scope.__maxime__compiler__Compiler._Compiler._Compiler()._compile(_sources._map(_mkString), _target, _options);
    }();
  };
  return __maxime__compiler__Compiler;
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
  __maxime__io__File._Path = {
    _Path: function () {
      var _Path = function () {
        this._constructor = 'Path';
        this._properties = [];
      };
      return _Path;
    }()
  };
  __maxime__io__File._File = {
    _File: function () {
      var _File = function () {
        this._constructor = 'File';
        this._properties = [];
      };
      _File.prototype._read = function () {
        return new Maxime.scope.__maxime__String._String._String('');
      };
      return _File;
    }()
  };
  __maxime__io__File._findFiles = function (_p, _r) {
    return new Maxime.scope.__maxime__List._List._Nil();
  };
  return __maxime__io__File;
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
        return new Maxime.scope.__maxime__List._List._Nil();
      };
      _Nil.prototype._head = function () {
        return new Maxime.scope.__maxime__Option._Option._None();
      };
      _Nil.prototype._tail = function () {
        return new Maxime.scope.__maxime__List._List._Nil();
      };
      _Nil.prototype.__plus__plus_ = function (_l) {
        return _l;
      };
      _Nil.prototype._length = function () {
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      _Nil.prototype._join = function (_sep) {
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
        return new Maxime.scope.__maxime__List._List._Cons(_f(this._headElem), this._tailList._map(_f));
      };
      _Cons.prototype._head = function () {
        return this._headElem;
      };
      _Cons.prototype._tail = function () {
        return this._tailList;
      };
      _Cons.prototype.__plus__plus_ = function (_l) {
        return new Maxime.scope.__maxime__List._List._Cons(this._headElem, this._tailList.__plus__plus_(_l));
      };
      _Cons.prototype._length = function () {
        return new Maxime.scope.__maxime__Num._Num._Num(1).__plus_(this._tailList._length());
      };
      _Cons.prototype._join = function (_f, _sep) {
        return Maxime.patternMatch([
          {
            pattern: {
              'type': 'constructor',
              'name': 'Nil',
              'params': []
            },
            callback: function () {
              return _f(this._headElem);
            }
          },
          {
            pattern: { 'type': 'wildcard' },
            callback: function () {
              console.log("HEAD", this._headElem);
              return _f(this._headElem).__plus_(_sep).__plus_(this._tailList._join(_f, _sep));
            }
          }
        ], this._tailList);
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
        return new Maxime.scope.__maxime__Map._Map._Map(_key, _value, new Maxime.scope.__maxime__Map._Map._EmptyMap());
      };
      _EmptyMap.prototype._get = function (_key) {
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
        return Maxime.patternMatch([
          {
            pattern: {
              'type': 'constructor',
              'name': 'True',
              'params': []
            },
            callback: function () {
              return new Maxime.scope.__maxime__Map._Map._Map(this._key, _v, this._rest);
            }
          },
          {
            pattern: {
              'type': 'constructor',
              'name': 'False',
              'params': []
            },
            callback: function () {
              return new Maxime.scope.__maxime__Map._Map._Map(this._key, this._value, this._rest._put(_k, _v));
            }
          }
        ], _k.__equals__equals_(this._key));
      };
      _Map.prototype._get = function (_k) {
        return Maxime.patternMatch([
          {
            pattern: {
              'type': 'constructor',
              'name': 'True',
              'params': []
            },
            callback: function () {
              return this._value;
            }
          },
          {
            pattern: {
              'type': 'constructor',
              'name': 'False',
              'params': []
            },
            callback: function () {
              return this._rest._get(this._key);
            }
          }
        ], _k.__equals__equals_(this._key));
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
        return n.toString();
      };
      _Num.prototype.__plus_ = function (_n) {
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      _Num.prototype.__minus_ = function (_n) {
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      _Num.prototype.__asterisk_ = function (_n) {
        return new Maxime.scope.__maxime__Num._Num._Num(0);
      };
      _Num.prototype.__slash_ = function (_n) {
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
        return new Maxime.scope.__maxime__Option._Option._Some(_f(this._a));
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
      var _RegExp = function (_s, _modifiers) {
        this._constructor = 'RegExp';
        this._properties = [
          this._s,
          this._modifiers
        ];
        this._s = _s;
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
        return new Maxime.scope.__maxime__String._String._String(this._s + _s._s);
      };
      _String.prototype._println = function () {
        return console.log(this._s);
      };
      _String.prototype._replace = function (_regex, _replacement) {
        return new Maxime.scope.__maxime__String._String._String(this._s.replace(new RegExp(_regex._s, 'g'), _replacement._s));
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
        return this._first;
      };
      _Pair.prototype._snd = function () {
        return this._second;
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
/*console.log(Maxime.scope);*/ module.exports = function(sources, target, options) { Maxime.scope.__maxime__compiler__Compiler._compile(array2list(sources), target, options); };