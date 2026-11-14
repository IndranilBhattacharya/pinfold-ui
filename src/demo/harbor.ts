/**
 * Harbor: the one product every demo on the site is a piece of, a freight and order operations tool.
 * All data is made up and deterministic (a seeded generator, no Math.random), so a page looks the same
 * on every visit and the same order is the same order on every page.
 */

/** A small seeded generator (mulberry32): the same seed, the same sequence. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const PRODUCT = 'Harbor';

export type Role = 'Operations lead' | 'Dispatcher' | 'Customs specialist' | 'Account manager' | 'Warehouse lead' | 'Finance' | 'Engineer' | 'Designer';
export interface Person {
  id: string;
  name: string;
  role: Role;
  team: 'Operations' | 'Customs' | 'Accounts' | 'Warehouse' | 'Finance' | 'Product';
  email: string;
  city: string;
  joined: string;
}

const NAMES = [
  'Maya Chen', 'Leo Park', 'Ines Duarte', 'Sam Okafor', 'Aiko Mori', 'Noah Fischer', 'Priya Nair', 'Tom Hale',
  'Lena Kraus', 'Omar Haddad', 'Sara Lindqvist', 'Jon Price', 'Amara Osei', 'Felix Wagner', 'Hana Sato', 'Diego Ramos',
  'Elif Kaya', 'Marcus Reid', 'Zoe Laurent', 'Ravi Menon', 'Clara Novak', 'Kwame Mensah', 'Julia Costa', 'Ben Ashford',
] as const;
const ROLES: Array<[Role, Person['team']]> = [
  ['Operations lead', 'Operations'], ['Dispatcher', 'Operations'], ['Customs specialist', 'Customs'], ['Account manager', 'Accounts'],
  ['Warehouse lead', 'Warehouse'], ['Finance', 'Finance'], ['Engineer', 'Product'], ['Designer', 'Product'],
];
const CITIES = ['Rotterdam', 'Chicago', 'Singapore', 'Hamburg', 'Los Angeles', 'Shanghai', 'Antwerp', 'Dubai'];

export const PEOPLE: Person[] = NAMES.map((name, i) => {
  const [role, team] = ROLES[(i * 3) % ROLES.length];
  return {
    id: `p${i + 1}`,
    name,
    role,
    team,
    email: `${name.split(' ')[0].toLowerCase()}@harbor.example`,
    city: CITIES[(i * 5) % CITIES.length],
    joined: `20${String(18 + (i % 8)).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}-${String(((i * 7) % 27) + 1).padStart(2, '0')}`,
  };
});
/** The signed-in user on every demo. */
export const ME = PEOPLE[0];

export interface Customer {
  id: string;
  name: string;
  city: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
}
export const CUSTOMERS: Customer[] = [
  ['Kestrel Outfitters', 'Denver'], ['Brightwater Foods', 'Rotterdam'], ['Northline Tools', 'Toronto'], ['Alder & Finch', 'London'],
  ['Saltmarsh Coffee', 'Lisbon'], ['Copperleaf Studio', 'Austin'], ['Meridian Bikes', 'Utrecht'], ['Lowland Ceramics', 'Ghent'],
  ['Pinecrest Pharmacy', 'Portland'], ['Tidewater Books', 'Halifax'], ['Juniper Home', 'Melbourne'], ['Redwood Supply', 'Oakland'],
].map(([name, city], i) => ({ id: `c${i + 1}`, name, city, plan: (['Starter', 'Growth', 'Enterprise'] as const)[i % 3] }));

export const PORTS = ['Rotterdam', 'Hamburg', 'Antwerp', 'Shanghai', 'Singapore', 'Los Angeles', 'Chicago', 'Dubai', 'Santos', 'Busan'] as const;
export const LANES = [
  'Rotterdam → Chicago', 'Shanghai → Los Angeles', 'Singapore → Hamburg', 'Antwerp → Santos', 'Busan → Rotterdam',
  'Dubai → Antwerp', 'Hamburg → Chicago', 'Los Angeles → Singapore',
] as const;
export const CARRIERS = ['Blue Anchor Line', 'Northstar Freight', 'Coastal Air Cargo', 'Meridian Rail', 'Polar Sea Lines'] as const;
export const STATUSES = ['booked', 'in transit', 'at customs', 'delivered', 'delayed'] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_TONE: Record<Status, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> = {
  booked: 'neutral',
  'in transit': 'info',
  'at customs': 'warning',
  delivered: 'success',
  delayed: 'danger',
};

export interface Order {
  id: string;
  customer: Customer;
  lane: (typeof LANES)[number];
  carrier: (typeof CARRIERS)[number];
  status: Status;
  /** Kilograms. */
  weight: number;
  /** US dollars. */
  value: number;
  /** ISO dates. */
  placed: string;
  eta: string;
  owner: Person;
}

const day = (start: string, plus: number) => new Date(Date.parse(start) + plus * 864e5).toISOString().slice(0, 10);

/** Order number `index` (0-based) of any size of data set: the same index gives the same order. */
export function orderAt(index: number): Order {
  const r = seeded(index * 7919 + 13);
  const placedOffset = Math.floor(r() * 300);
  const placed = day('2026-01-02', placedOffset);
  return {
    id: `HB-${(4100 + index).toString()}`,
    customer: CUSTOMERS[Math.floor(r() * CUSTOMERS.length)],
    lane: LANES[Math.floor(r() * LANES.length)],
    carrier: CARRIERS[Math.floor(r() * CARRIERS.length)],
    status: STATUSES[Math.floor(r() * STATUSES.length)],
    weight: Math.round(200 + r() * 18000),
    value: Math.round((800 + r() * 48000) * 100) / 100,
    placed,
    eta: day(placed, 8 + Math.floor(r() * 30)),
    owner: PEOPLE[Math.floor(r() * PEOPLE.length)],
  };
}

/** The 240 orders the demos share. */
export const ORDERS: Order[] = Array.from({ length: 240 }, (_, i) => orderAt(i));

/** `count` rows on demand (a million, a billion): nothing is stored, a row is made from its index. */
export function harborRows(count: number) {
  return { count, at: (index: number) => orderAt(index) };
}

export const NOTIFICATIONS = [
  { id: 'n1', text: 'HB-4107 cleared customs in Rotterdam', at: '9 min ago' },
  { id: 'n2', text: 'Brightwater Foods booked 3 containers', at: '1 h ago' },
  { id: 'n3', text: 'HB-4112 is delayed: port congestion in Busan', at: '3 h ago' },
  { id: 'n4', text: 'Invoice INV-2207 paid by Meridian Bikes', at: 'Yesterday' },
];

export const ACTIVITY = [
  'Amara Osei cleared HB-4107 at customs',
  'Leo Park booked HB-4231 for Brightwater Foods',
  'Hana Sato flagged HB-4112 as delayed',
  'Felix Wagner sent invoice INV-2214',
];

/** The pages of the Harbor app the demos route between. */
export const PAGES_OF_APP: Record<string, { title: string; lead: string }> = {
  '/shipments': { title: 'Shipments', lead: '42 on the water, 7 at customs, 3 delayed.' },
  '/shipments/active': { title: 'Active shipments', lead: 'Everything between pickup and delivery.' },
  '/shipments/delayed': { title: 'Delayed', lead: 'Three shipments need a new ETA for their customer.' },
  '/orders': { title: 'Orders', lead: '240 orders this year, $5.6M booked.' },
  '/customers': { title: 'Customers', lead: '12 accounts, 4 on the Enterprise plan.' },
  '/invoices': { title: 'Invoices', lead: '8 open, 2 overdue.' },
  '/reports': { title: 'Reports', lead: 'On-time delivery 94% this quarter.' },
  '/settings': { title: 'Settings', lead: 'Your workspace, team and notifications.' },
  '/billing': { title: 'Billing', lead: 'Growth plan, renews on 1 December.' },
};
