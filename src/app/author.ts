/**
 * Who built the app.
 *
 * Its own module so the UI footer and the PDF report read the same strings:
 * the report cannot import them from the UI, and the UI must not import from
 * the report, which lazy-loads jsPDF and would drag it into the main bundle.
 */

export const AUTHOR_NAME = 'Ipda Muhammad Alkeizar Ayanda, S.Tr.K.';
export const AUTHOR_INSTAGRAM = 'https://www.instagram.com/alkeizara';
export const AUTHOR_LINKEDIN = 'https://www.linkedin.com/in/alkeizar';
