export const WebhookOperators = {
  $ilike: 'Checks for a value containing the input provided (case-insensitive)',
  $eq: 'Checks for a value is the same as the input provided',
  $ne: 'Checks for a value that is not the same as the input provided',
  $gt: 'Checks for a value that is greater than the input provided',
  $gte: 'Checks for a value that is greater than or equal to the input provided',
  $lt: 'Checks for a value that is less than the input provided',
  $lte: 'Checks for a value that is less than or equal to the input provided',
  $regex: 'Checks for a value matching the regex provided',
  $array_contains: 'Checks if an array contains the input provided',
  $array_not_contains: 'Checks if an array does not contain the input provided',
  $null: 'Checks for values which are null',
  $not_null: 'Checks for values which are not null',
};

export const WebhookSupportedOperators = Object.keys(WebhookOperators);

export type WebhookConstraintOperator = keyof typeof WebhookOperators;

export interface WebhookConstraint {
  name: string;
  operator: WebhookConstraintOperator;
  value: string;
}
