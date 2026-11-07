/**
 * Sample people for the avatar and badge pages: portrait photos from Unsplash (Unsplash License),
 * served from public/people. The names are made up.
 */

export interface SamplePerson {
  name: string;
  /** The path in the site, also what the code panel prints. */
  file: string;
  photo: string;
}

const make = (name: string, file: string): SamplePerson => ({ name, file: `/people/${file}.jpg`, photo: `/people/${file}.jpg` });

export const PEOPLE: SamplePerson[] = [
  make('Emma Larsen', 'emma'),
  make('Daniel Reyes', 'daniel'),
  make('Amara Okafor', 'amara'),
  make('Marcus Lee', 'marcus'),
  make('Sofia Martins', 'sofia'),
  make('Peter Novak', 'peter'),
  make('Mei Tanaka', 'mei'),
  make('Lukas Becker', 'lukas'),
];

/** A wide picture for the card page. */
export const LANDSCAPE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5ff"/><stop offset="1" stop-color="#e0e7ff"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="250" cy="48" r="20" fill="#fde68a"/><path d="M0 150 90 70l60 55 40-30 130 85H0z" fill="#6366f1" opacity=".75"/><path d="M0 180 120 110l80 70z" fill="#4338ca" opacity=".8"/></svg>',
  );
