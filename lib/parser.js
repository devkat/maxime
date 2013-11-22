var
  Parser = require("jison").Parser,
  sprintf = require('sprintf');

function loc(start, end) {
  end = end || start;
  return sprintf("$$.loc = yy.src.loc(@%d, @%d);", start, end);
}

module.exports = new Parser({
  "bnf": {

/* ----------------------------------------------------------------------
   Structure
   ---------------------------------------------------------------------- */

    "program": [
      [ "statements eof", "$$ = new yy.Program($1);" + loc(1) + "return $$;" ]
    ],
    
    "statements": [
      [ "statement", "$$ = [ $1 ];" ],
      [ "statements statement", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "statement": [
      [ "import", "$$ = $1;" ],
      [ "blockExpr", "$$ = $1;" ],
      [ "decl", "$$ = $1;" ]
    ],
    
    "expr": [
      [ "blockExpr", "$$ = [ $1 ]; " ],
      [ "NEWLINE INDENT statements blockExpr OUTDENT", "$$ = $2.concat([ $3 ]);" ]
    ],
    
    "blockExpr": [
      [ "caseExpr NEWLINE", "$$ = $1;" ],
      [ "call NEWLINE", "$$ = $1;" ],
      [ "atomicExpr NEWLINE", "$$ = $1;" ]
    ],
    
    "inlineExpr": [
      [ "( call )", "$$ = $2;" ],
      [ "atomicExpr", "$$ = $1;" ]
    ],
    
    "atomicExpr": [
      [ "ref", "$$ = $1;" ],
      [ "literal", "$$ = $1;" ],
      [ "nativeExpr", "$$ = $1;" ]
    ],
    
    "eof": [
      [ "EOF", "" ],
      [ "NEWLINE EOF", "" ]
    ],
    
/* ----------------------------------------------------------------------
   Import
   ---------------------------------------------------------------------- */

    "import": [
      [ "IMPORT moduleNames NEWLINE", "$$ = new yy.Import($2);" + loc(1, 3) ]
    ],

    "moduleNames": [
      [ "moduleName", "$$ = [ $1 ];" ],
      [ "moduleNames , moduleName", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "moduleName": [
      [ "stringLiteral", "$$ = $1;" ]
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
      [ "lcIdentifier args", "$$ = new yy.FunctionCall($1, $2);" + loc(1, 2) ]
    ],
    
    "ctorCall": [
      [ "ucIdentifier args", "$$ = new yy.CtorCall($1, $2);" + loc(1, 2) ]
    ],
    
    "args": [
      [ "( )", "$$ = [];" ],
      [ "argList", "$$ = $1;" ]
    ],
    
    "argList": [
      [ "inlineExpr", "$$ = [ $1 ];" ],
      [ "argList inlineExpr", "$$ = $1.concat([ $2 ]);" ]
    ],
    
/* ----------------------------------------------------------------------
   Case expressions
   ---------------------------------------------------------------------- */

    "caseExpr": [
      [ "lcIdentifier MATCH NEWLINE INDENT caseClauses OUTDENT", "$$ = new yy.CaseExpr($1, $4);" + loc(1, 5) ]
    ],
    
    "caseClauses": [
      [ "caseClause", "$$ = [ $1 ];" ],
      [ "caseClauses caseClause", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "caseClause": [
      [ "CASE pattern DOUBLE_RIGHT_ARROW expr", "$$ = new yy.CaseClause($1, $3);" + loc(1, 3) ]
    ],
    
    "pattern": [
      [ "ctorPattern", "$$ = $1;" ],
      [ "atomicPattern", "$$ = $1;" ]
    ],
    
    "atomicPattern": [
      [ "literal", "$$ = new yy.Pattern($1);" + loc(1) ],
      [ "lcIdentifier", "$$ = new yy.Pattern($1);" + loc(1) ],
      [ "wildcard", "$$ = new yy.Pattern($1);" + loc(1) ]
    ],

    "ctorPattern": [
      [ "ucIdentifier ctorPatternArgs", "$$ = new yy.Pattern($1, $2);" + loc(1, 2) ]
    ],
    
    "ctorPatternArgs": [
      [ "( )", "$$ = [];" ],
      [ "ctorPatternArg", "$$ = [ $1 ];"],
      [ "ctorPatternArgs ctorPatternArg", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "ctorPatternArg": [
      [ "( ctorPattern )", "$$ = $2;" + loc(1, 3) ],
      [ "atomicPattern", "$$ = $1;" + loc(1) ]
    ],

    "wildcard": [
      [ "_", "$$ = new yy.Wildcard();" + loc(1, 3) ]
    ],

/* ----------------------------------------------------------------------
   Declarations
   ---------------------------------------------------------------------- */

    "decl": [
      [ "defDecl", "$$ = $1;" ],
      [ "dataDecl", "$$ = $1;" ],
      [ "valDecl", "$$ = $1;" ]
    ],
    
/* ----------------------------------------------------------------------
   Function declaration
   ---------------------------------------------------------------------- */

    "defDecl": [
      [ "DEF lcIdentifier funcParams = expr", "$$ = new yy.DefDecl($2, $3, $5);" + loc(1, 5) ]
    ],
    
    "funcParams": [
      [ "", "$$ = [];" ],
      [ "funcParamList", "$$ = $1;" ]
    ],
    
    "funcParamList": [
      [ "funcParam", "$$ = [ $1 ];" ],
      [ "funcParamList funcParam", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "funcParam": [
      [ "lcIdentifier", "$$ = new yy.FunctionParam($1);" + loc(1) ],
      [ "lcIdentifier : ucIdentifier", "$$ = new yy.FunctionParam($1, $3);" + loc(1, 3) ]
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
   Type declaration
   ---------------------------------------------------------------------- */

    "dataDecl": [
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
    
/* ----------------------------------------------------------------------
   Type reference
   ---------------------------------------------------------------------- */

    "typeRef": [
      [ "ucIdentifier typeRefArgs", "$$ = new yy.TypeRef($1, $2);" + loc(1, 2) ]
    ],
    
    "typeRefArgs": [
      [ "", "$$ = [];" ],
      [ "typeRefArgs typeRefArg", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "typeRefArg": [
      [ "typeParamRef", "$$ = $1;" ],
    ]
    
  }
});