import ts from 'typescript';

export const {
  PlusToken,
  CommaToken,
  EqualsToken,
  PlusPlusToken,
  MinusMinusToken,
  BarEqualsToken,
  PlusEqualsToken,
  MinusEqualsToken,
  SlashEqualsToken,
  CaretEqualsToken,
  BarBarEqualsToken,
  PercentEqualsToken,
  AsteriskEqualsToken,
  AmpersandEqualsToken,
  AsteriskAsteriskEqualsToken,
  LessThanLessThanEqualsToken,
  QuestionQuestionEqualsToken,
  AmpersandAmpersandEqualsToken,
  GreaterThanGreaterThanEqualsToken,
  GreaterThanGreaterThanGreaterThanEqualsToken,
} = ts.SyntaxKind;

export const isUnaryAssignToken = kind => {
  switch (kind) {
    case PlusPlusToken:
    case MinusMinusToken:
      return true;
  }
  return false;
};

export const isLogicalAssignToken = kind => {
  switch (kind) {
    case BarBarEqualsToken:
    case QuestionQuestionEqualsToken:
    case AmpersandAmpersandEqualsToken:
      return true;
  }
  return false;
};

export const isAssignToken = kind => {
  switch (kind) {
    case EqualsToken:
    case BarEqualsToken:
    case PlusEqualsToken:
    case MinusEqualsToken:
    case SlashEqualsToken:
    case CaretEqualsToken:
    case BarBarEqualsToken:
    case PercentEqualsToken:
    case AsteriskEqualsToken:
    case AmpersandEqualsToken:
    case AsteriskAsteriskEqualsToken:
    case LessThanLessThanEqualsToken:
    case QuestionQuestionEqualsToken:
    case AmpersandAmpersandEqualsToken:
    case GreaterThanGreaterThanEqualsToken:
    case GreaterThanGreaterThanGreaterThanEqualsToken:
      return true;
  }
  return isLogicalAssignToken(kind);
};
