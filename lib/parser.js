var Parser = require("jison").Parser;

module.exports = new Parser({
  "bnf": {

/* ----------------------------------------------------------------------
   Structure
   ---------------------------------------------------------------------- */

    "program": [
      [ "statements eof", "$$ = new yy.Program($1, yy.src.loc(null, @1, @2)); return $$;" ]
    ],
    
    "statements": [
      [ "statement", "$$ = [ $1 ];" ],
      [ "statements statement", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "statement": [
      [ "blockExpr", "$$ = $1;" ],
      [ "decl", "$$ = $1;" ]
    ],
    
    "blockExpr": [
      [ "call NEWLINE", "$$ = $1;" ],
      [ "atomicExpr NEWLINE", "$$ = $1;" ]
    ],
    
    "inlineExpr": [
      [ "( call )", "$$ = $2;" ],
      [ "atomicExpr", "$$ = $1;" ]
    ],
    
    "atomicExpr": [
      [ "reference", "$$ = $1;" ],
      [ "literal", "$$ = $1;" ],
      [ "nativeExpr", "$$ = $1;" ]
    ],
    
    "eof": [
      [ "EOF", "" ],
      [ "NEWLINE EOF", "" ]
    ],
    
/* ----------------------------------------------------------------------
   Native
   ---------------------------------------------------------------------- */

    "nativeExpr": [
      [ "BACKTICK_LITERAL", "$$ = new yy.NativeExpr($1);" ]
    ],
    
/* ----------------------------------------------------------------------
   Identifiers
   ---------------------------------------------------------------------- */
    
    "lcIdentifier": [
      [ "LC_IDENTIFIER", "$$ = new yy.Identifier($1, yy.src.loc(null, @1, @1));" ]
    ],
    
    "ucIdentifier": [
      [ "UC_IDENTIFIER", "$$ = new yy.Identifier($1, yy.src.loc(null, @1, @1));" ]
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
      [ "STRING_LITERAL", "$$ = new yy.Literal(yytext, yy.src.loc(null, @1, @1));" ]
    ],

    "numericLiteral": [
      [ "NUMERIC_LITERAL", "$$ = new yy.Literal(yytext, yy.src.loc(null, @1, @1));" ]
    ],
    
    "regexpLiteral": [
      [ "REGEXP_LITERAL", "$$ = new yy.Literal(yytext, yy.src.loc(null, @1, @1));" ]
    ],

/* ----------------------------------------------------------------------
   Calls
   ---------------------------------------------------------------------- */

    "call": [
      [ "functionCall", "$$ = $1;" ],
      [ "ctorCall", "$$ = $1;" ]
    ],

    "functionCall": [
      [ "lcIdentifier args", "$$ = new yy.FunctionCall($1, $2, yy.src.loc(null, @1, @2));" ]
    ],
    
    "ctorCall": [
      [ "ucIdentifier args", "$$ = new yy.CtorCall($1, $2, yy.src.loc(null, @1, @2));" ]
    ],
    
    "args": [
      [ "( )", "$$ = [];" ],
      [ "argList", "$$ = $1;" ]
    ],
    
    "argList": [
      [ "inlineExpr", "$$ = [ $1 ];" ],
      [ "argList inlineExpr", "$1.concat([ $2 ]);" ]
    ],
    
/* ----------------------------------------------------------------------
   Declarations
   ---------------------------------------------------------------------- */

    "decl": [
      [ "defDecl", "$$ = $1;" ],
      [ "typeDecl", "$$ = $1;" ],
      [ "valDecl", "$$ = $1;" ]
    ],
    
/* ----------------------------------------------------------------------
   Function declaration
   ---------------------------------------------------------------------- */

    "defDecl": [
      [ "DEF lcIdentifier params = blockExpr", "$$ = new yy.DefDecl($2, $3, [ $5 ], yy.src.loc(null, @1, @5));" ],
      [ "DEF lcIdentifier params = NEWLINE INDENT statements OUTDENT", "$$ = new yy.DefDecl($2, $3, $7, yy.src.loc(null, @1, @8));" ]
    ],
    
    "params": [
      [ "", "$$ = [];" ],
      [ "paramList", "$$ = $1;" ]
    ],
    
    "paramList": [
      [ "param", "$$ = [ $1 ];" ],
      [ "paramList param", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "param": [
      [ "lcIdentifier : ucIdentifier", "$$ = new yy.Param($1, $3, yy.src.loc(null, @1, @3));" ]
    ],
    
/* ----------------------------------------------------------------------
   Value declaration
   ---------------------------------------------------------------------- */

    "valDecl": [
      [ "VAL lcIdentifier = blockExpr", "$$ = new yy.ValDecl($2, $4, yy.src.loc(null, @1, @4));" ]
    ],
    
/* ----------------------------------------------------------------------
   Reference
   ---------------------------------------------------------------------- */

    "reference": [
      [ "lcIdentifier", "$$ = new yy.Reference($1, yy.src.loc(null, @1, @1));" ]
    ],
    
/* ----------------------------------------------------------------------
   Type declaration
   ---------------------------------------------------------------------- */

    "typeDecl": [
      [ "DATA ucIdentifier typeVariables = typeCtorDecls NEWLINE", "$$ = new yy.TypeDecl($2, yy.src.loc(null, @1, @6));" ]
    ],
    
    "typeVariables": [
      [ "", "$$ = [];" ],
      [ "typeVariables lcIdentifier", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "typeCtorDecls": [
      [ "typeCtorDecl", "$$ = [ $1 ];" ],
      [ "typeCtorDecls | typeCtorDecl", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "typeCtorDecl": [
      [ "ucIdentifier typeCtorDeclArgs", "$$ = new yy.TypeCtorDecl($1, $2, yy.src.loc(null, @1, @2));" ]
    ],
    
    "typeCtorDeclArgs": [
      [ "", "$$ = [];" ],
      [ "typeCtorDeclArgs typeCtorDeclArg", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "typeCtorDeclArg": [
      [ "lcIdentifier", "$$ = $1;" ],
      [ "( typeCtorDecl )", "$$ = $2;" ]
    ]
    
  }
});