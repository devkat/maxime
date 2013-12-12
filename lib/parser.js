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

    "module": [
      [ "statements EOF", "$$ = new yy.Module($1);" + loc(1, 2) + "return $$;" ],
      [ "NEWLINE statements EOF", "$$ = new yy.Module($2);" + loc(1, 3) + "return $$;" ]
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
      [ "atomicExpr", "$$ = $1;" ],
      [ "inlineExpr OPERATOR atomicExpr", "$$ = new yy.BinaryExpr($1, $2, $3);" + loc(1, 3) ]
    ],
    
    "atomicExpr": [
      [ "call", "$$ = $1;" ],
      [ "propertyAccess", "$$ = $1;" ],
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
      [ "qualifiedModuleNames , qualifiedModuleName", "$$ = $1.concat([ $3 ]);" ]
    ],
    
    "qualifiedModuleName": [
      [ "identifier", "$$ = [ $1 ];" ],
      [ "qualifiedModuleName . identifier", "$$ = $1.concat([ $3 ]);" ]
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
      [ "atomicExpr . lcIdentifier", "$$ = new yy.PropertyAccess($1, $3);" + loc(1, 3) ],
      [ "( inlineExpr ) . lcIdentifier", "$$ = new yy.PropertyAccess($2, $4);" + loc(1, 5) ]
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