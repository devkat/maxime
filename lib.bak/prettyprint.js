var
  parser = require('../dist/parser').parser,
  sprintf = require('sprintf'),
  os = require('os'),
  newline = os.EOL;

function quote(char, str) {
  return char + str + char;
}

parser.ast.FunctionCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)', this.identifier.print(), this.args.map(prettyprint).join(', '));
};

parser.ast.ConstructorCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)', this.identifier.print(), this.args.map(prettyprint).join(', '));
};

parser.ast.DefDecl.prototype.print = function(ind) {
  return ind + sprintf('def %s(%s) = ', this.identifier.print(), this.params.map(prettyprint).join(', '))
    + this.body.map(function(s) {
      return ind + prettyprint(s, ind);
    }).join(newline)
    + newline;
};

parser.ast.Identifier.prototype.print = function(ind) {
  return this.name;
};

parser.ast.Literal.prototype.print = function(ind) {
  return typeof this.value === 'string' ? quote('"', this.value) : this.value;
};

parser.ast.NativeExpr.prototype.print = function(ind) {
  return quote('`', this.expr.value);
};

parser.ast.Param.prototype.print = function(ind) {
  return this.valueIdentifier.print() + (
    this.typeIdentifier ? ':' + this.typeIdentifier.print() : ''
  );
};

parser.ast.Program.prototype.print = function(ind) {
  return this.statements.map(function(s) {
    return ind + prettyprint(s, ind);
  }).join(newline);
};

parser.ast.TypeDecl.prototype.print = function(ind) {
  return ind + sprintf('type %s', this.typeIdentifier.print());
};

parser.ast.ValDecl.prototype.print = function(ind) {
  return ind + sprintf('val %s = %s',
    this.identifier.print(),
    this.expr.print('')
  );
};

function prettyprint(ast, ind) {
  return ast.print(ind || '');
}

module.exports = prettyprint;
