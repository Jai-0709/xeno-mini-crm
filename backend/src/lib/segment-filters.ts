export type FilterRule = {
  field: string;
  operator: string;
  value: string | number;
};

type Customer = {
  totalSpend: number;
  totalOrders: number;
  lastPurchaseDate: Date | null;
  city: string;
  avgOrderValue: number;
  tag: string;
  createdAt: Date;
};

export function applyFilters(customers: Customer[], filters: FilterRule[]): Customer[] {
  return customers.filter((c) =>
    filters.every((f) => matchFilter(c, f))
  );
}

function matchFilter(customer: Customer, rule: FilterRule): boolean {
  const { field, operator, value } = rule;

  let fieldValue: number | string | null = null;

  switch (field) {
    case 'total_spend':
      fieldValue = customer.totalSpend;
      break;
    case 'order_count':
      fieldValue = customer.totalOrders;
      break;
    case 'days_since_purchase':
      if (!customer.lastPurchaseDate) return operator === 'gt' ? true : false;
      fieldValue = Math.floor(
        (Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      break;
    case 'city':
      fieldValue = customer.city.toLowerCase();
      break;
    case 'avg_order_value':
      fieldValue = customer.avgOrderValue;
      break;
    case 'tag':
      fieldValue = customer.tag.toLowerCase();
      break;
    case 'days_since_created':
      fieldValue = Math.floor(
        (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      break;
    default:
      return true;
  }

  const numVal = typeof value === 'string' ? parseFloat(value) : value;
  const strVal = String(value).toLowerCase();

  switch (operator) {
    case 'gt':
      return (fieldValue as number) > numVal;
    case 'lt':
      return (fieldValue as number) < numVal;
    case 'gte':
      return (fieldValue as number) >= numVal;
    case 'lte':
      return (fieldValue as number) <= numVal;
    case 'eq':
      return String(fieldValue).toLowerCase() === strVal;
    case 'neq':
      return String(fieldValue).toLowerCase() !== strVal;
    case 'in':
      return strVal.split(',').map(s => s.trim()).includes(String(fieldValue).toLowerCase());
    case 'between': {
      const [min, max] = strVal.split(',').map(Number);
      return (fieldValue as number) >= min && (fieldValue as number) <= max;
    }
    default:
      return true;
  }
}

export function buildPrismaWhere(filters: FilterRule[]): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = filters.map((f) => {
    const { field, operator, value } = f;
    const numVal = typeof value === 'string' ? parseFloat(value) : value;

    switch (field) {
      case 'total_spend':
        return { totalSpend: mapOp(operator, numVal) };
      case 'order_count':
        return { totalOrders: mapOp(operator, numVal) };
      case 'avg_order_value':
        return { avgOrderValue: mapOp(operator, numVal) };
      case 'city':
        return { city: { equals: String(value), mode: 'insensitive' } };
      case 'tag':
        return { tag: { equals: String(value), mode: 'insensitive' } };
      case 'days_since_purchase': {
        const date = new Date(Date.now() - numVal * 24 * 60 * 60 * 1000);
        return operator === 'gt'
          ? { lastPurchaseDate: { lt: date } }
          : { lastPurchaseDate: { gt: date } };
      }
      default:
        return {};
    }
  });

  return conditions.length > 0 ? { AND: conditions } : {};
}

function mapOp(operator: string, value: number) {
  switch (operator) {
    case 'gt': return { gt: value };
    case 'lt': return { lt: value };
    case 'gte': return { gte: value };
    case 'lte': return { lte: value };
    case 'eq': return { equals: value };
    default: return { gte: value };
  }
}
