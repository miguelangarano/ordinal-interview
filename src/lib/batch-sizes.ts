/**
 * How many movies each list loads per request. Kept outside the "use client"
 * components so Server Components can import them: a value exported from a
 * client module reaches the server as a client reference, not a number.
 */

/** Carousels load 10 at a time; another 10 load as you reach the end. */
export const CAROUSEL_BATCH = 10;

/** Search and category grids open with the top 50, then 50 more per scroll. */
export const RESULTS_BATCH = 50;
