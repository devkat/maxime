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
      [ "blockExpr", "$$ = [ $1 ];" ],
      [ "NEWLINE INDENT statements OUTDENT", "$$ = $3;" ]
    ],
    
    "blockExpr": [
      [ "caseExpr NEWLINE", "$$ = $1;" ],
      [ "call NEWLINE", "$$ = $1;" ],
      [ "atomicExpr NEWLINE", "$$ = $1;" ]
    ],
    
    "inlineExpr": [
      [ "call", "$$ = $1;" ],
      [ "atomicExpr", "$$ = $1;" ]
    ],
    
    "atomicExpr": [
      [ "ref", "$$ = $1;" ],
      [ "literal", "$$ = $1;" ],
      [ "nativeExpr", "$$ = $1;" ]
    ],
    
    "eof": [
      [ "EOF", "" ],
      [ "newline EOF", "" ]
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
      [ "methodCall", "$$ = $1;" ],
      [ "ctorCall", "$$ = $1;" ]
    ],

    "functionCall": [
      [ "lcIdentifier ( args )", "$$ = new yy.FunctionCall($1, $3);" + loc(1, 4) ]
    ],
    
    "methodCall": [
      [ "lcIdentifier . lcIdentifier ( args )", "$$ = new yy.MethodCall($1, $3, $5);" + loc(1, 6) ]
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
      [ "argList , arg", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "arg": [
      [ "inlineExpr", "$$ = $1;" ]
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
      [ "ucIdentifier ( ctorPatternArgs )", "$$ = new yy.Pattern($1, $2);" + loc(1, 2) ]
    ],
    
    "ctorPatternArgs": [
      [ "", "$$ = [];" ],
      [ "ctorPatternArgs ctorPatternArg", "$$ = $1.concat([ $2 ]);" ]
    ],
    
    "ctorPatternArg": [
      [ "( ctorPattern )", "$$ = $2;" + loc(1, 3) ],
      [ "atomicPattern", "$$ = $1;" + loc(1) ]
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
      [ "CLASS ucIdentifier typeParams ( params ) extendsClause classBody NEWLINE", "$$ = new yy.ClassDecl($2, $3, $5, $7, $8);" + loc(1, 9) ]
    ],
    
    "typeParams": [
      [ "", "$$ = [];" ],
      [ "[ typeParamList ]", "$$ = $2;" ]
    ],
    
    "typeParamList": [
      [ "lcIdentifier", "$$ = [ $1 ];" ],
      [ "typeParamList , lcIdentifier", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "extendsClause": [
      [ "", "$$ = [];" ],
      [ "EXTENDS classList", "$$ = $1;" ]
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
   
    "classBody": [
      [ "", "$$ = [];" ],
      [ "{ NEWLINE INDENT funcDeclList OUTDENT }", "$$ = $4;" ]
    ],
    
    "funcDeclList": [
      [ "funcDecl", "$$ = [];" ],
      [ "funcDeclList funcDecl", "$$ = $1.concat([ $2 ]);" ]
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
      [ "DEF lcIdentifier ( params ) = expr", "$$ = new yy.FunctionDecl($2, $4, $7);" + loc(1, 7) ]
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
      [ "lcIdentifier", "$$ = new yy.Param($1);" + loc(1) ],
      [ "lcIdentifier : typeRef", "$$ = new yy.Param($1, $3);" + loc(1, 3) ]
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
/*
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
      [ "lcIdentifier", "$$ = new yy.TypeParamRef($1);" + loc(1) ],
      [ "wildcard", "$$ = new yy.WildcardTypeRef($1);" + loc(1) ]
    ],
    
    "classRef": [
      [ "ucIdentifier classRefTypeArgs", "$$ = new yy.TypeRef($1, $2);" + loc(1, 2) ]
    ],
    
    "classRefTypeArgs": [
      [ "", "$$ = [];" ],
      [ "[ typeRefList ]", "$$ = $2;" ]
    ],
    
    "funcTypeRef": [
      [ "atomicTypeRef DOUBLE_RIGHT_ARROW funcResultTypeRef", "$$ = new yy.FunctionTypeRef([ $1 ], $3);" + loc(1, 3) ],
      [ "( funcParamTypeRefList ) DOUBLE_RIGHT_ARROW funcResultTypeRef", "$$ = new yy.FunctionTypeRef($2, $5);" + loc(1, 5) ]
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