import React from 'react';
import { formatCurrency } from '../../lib/formatters.js';

export default function CurrencyCell({ value, currency = 'USD' }) {
  return (
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 block text-right">
      {formatCurrency(value, currency)}
    </span>
  );
}
