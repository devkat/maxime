var
  parser = require('../dist/parser').parser,
  sprintf = require('sprintf'),
  os = require('os'),
  newline = os.EOL,
  yy = require('./parser').yy;

function quote(char, str) {
  return char + str + char;
}

yy.FunctionCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)', this.identifier.print(), this.args.map(prettyprint).join(', '));
};

yy.CtorCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)', this.identifier.print(), this.args.map(prettyprint).join(', '));
};

yy.DefDecl.prototype.print = function(ind) {
  return ind + sprintf('def %s(%s) = ', this.identifier.print(), this.params.map(prettyprint).join(', '))
    + this.body.map(function(s) {
      return ind + prettyprint(s, ind);
    }).join(newline)
    + newline;
};

yy.Identifier.prototype.print = function(ind) {
  return this.name;
};

yy.Literal.prototype.print = function(ind) {
  return typeof this.value === 'string' ? quote('"', this.value) : this.value;
};

yy.NativeExpr.prototype.print = function(ind) {
  return quote('`', this.expr);
};

yy.Param.prototype.print = function(ind) {
  return this.valueIdentifier.print() + (
    this.typeIdentifier ? ':' + this.typeIdentifier.print() : ''
  );
};

yy.Program.prototype.print = function(ind) {
  return this.statements.map(function(s) {
    return ind + prettyprint(s, ind);
  }).join(newline);
};

yy.Reference.prototype.print = function(ind) {
  return this.identifier.name;
};

yy.TypeDecl.prototype.print = function(ind) {
  return ind + sprintf('type %s', this.typeIdentifier.print());
};

yy.ValDecl.prototype.print = function(ind) {
  return ind + sprintf('val %s = %s',
    this.identifier.print(),
    this.expr.print('')
  );
};

function prettyprint(ast, ind) {
  return ast.print(ind || '');
}

module.exports = prettyprint;
