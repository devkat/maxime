function sortByDependencies(srcFiles) {
  
  function dependencies(src) {
    var source = getFileContents(src);
    var depsMatches = source.match(/^\/{2,}\s*require\s+([\w\.\/]+)\s*$/mg);
    return depsMatches === null ? [] : depsMatches.map(function(d) {
      return (/^\/{2,}\s*require\s+([\w\.\/]+)\s*$/).exec(d)[1];
    });
  }
  
  var sources = _.map(srcFiles, function(src) {
    var absPath = path.resolve(src).replace(extensions, '');
    var name = absPath.substring(basePath.length + 1);
    return {
      src: src,
      name: name,
      deps: dependencies(src)
    };
  });
  
  function depending(src) {
    return _.filter(sources, function(s) {
      return _.contains(_.pluck(s.deps, 'name'), src.name);
    });
  }
  
  _.each(sources, function(src) {
    src.deps = _.map(src.deps, function(dep) {
      var depSrc = _.find(sources, function(s) { return s.name === dep; });
      if (depSrc) return depSrc;
      else throw 'Unknown dependency ' + dep + ' required by ' + src.name;
    });
  });
  
  // http://en.wikipedia.org/wiki/Topological_sorting
  function topologicalOrder() {
    // Empty list that will contain the sorted elements
    var L = [];
    
    // Set of all nodes with no incoming edges
    var S = _.filter(sources, function(src) {
      console.log(src.name + " <- " + depending(src).join());
      return depending(src).length === 0;
    });
    
    while (S.length > 0) {
      var n = S.shift();
      L.push(n);
      while (n.deps.length > 0) {
        var m = n.deps.shift();
        if (depending(m).length === 0) { S.push(m); }
      }
    }
    
    _.each(sources, function(src) {
      if (src.deps.length > 0)
      throw "Cyclic dependency detected: " + src.name;
    });
    
    return L;
  }
  
  var sorted = topologicalOrder().reverse();
  return _.pluck(sorted, 'src');
}

module.exports = sortByDependencies;
