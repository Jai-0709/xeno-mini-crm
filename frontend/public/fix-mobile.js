const fs = require('fs');
const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

// The CSS to inject
const mobileFixCss = `
<style>
  /* Remove Framer Hamburger menu entirely on homepage */
  .framer-mtfh2r { display: none !important; }
  
  /* Fix dashboard images stretching or getting cut off on mobile */
  @media (max-width: 768px) {
    img {
      object-fit: contain !important;
      max-width: 100% !important;
      height: auto !important;
    }
    /* Specifically target the hero image container if Framer uses nested divs */
    [data-framer-background-image-wrapper="true"] {
      background-size: contain !important;
      background-position: center top !important;
    }
  }
</style>
</head>`;

if (!html.includes('.framer-mtfh2r { display: none !important; }')) {
  html = html.replace('</head>', mobileFixCss);
  fs.writeFileSync(file, html);
  console.log('Successfully injected mobile CSS fixes into index.html');
} else {
  console.log('Mobile CSS already injected.');
}
