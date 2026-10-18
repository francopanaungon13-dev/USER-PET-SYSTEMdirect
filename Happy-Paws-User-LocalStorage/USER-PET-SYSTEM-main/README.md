Happy Paws localStorage version

This version uses JSON in browser localStorage only; Firebase/Firestore is not used. The User and Admin pages must be served from the same browser origin (same scheme, hostname, and port) to share records. GitHub Pages repositories under the same username typically share the same origin hostname. Open both pages in the same browser on the same laptop. This is a school/demo setup, not secure for production; passwords and records stored in localStorage are visible to the browser user.
