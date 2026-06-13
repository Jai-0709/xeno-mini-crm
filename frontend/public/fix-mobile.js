const fs = require('fs');
const path = require('path');

const cssToInject = `
<style id="mobile-fixes">
  /* Show only Home and Features in mobile nav */
  .framer-13tu6ag > div:not(:has(a[href="/app/dashboard"])):not(:has(a[href="features.html"])) { 
    display: none !important; 
  }
  
  /* Fix dashboard images and remove gap */
  @media (max-width: 768px) {
    img {
      object-fit: contain !important;
      max-width: 100% !important;
      height: auto !important;
    }
    [data-framer-background-image-wrapper="true"] {
      background-size: contain !important;
      background-position: center top !important;
    }
    
    /* Target the hero image container which causes the gap */
    /* Framer uses inline heights, so we force them to auto */
    .framer-1qy1sfj, .framer-1h3s16t, .framer-169uuwn {
      height: auto !important;
      min-height: unset !important;
      padding-bottom: 40px !important;
    }
    
    /* Also target direct parents of the hero image */
    .framer-1u6eaj6 {
       height: auto !important; 
       position: relative !important;
    }
  }
</style>
</head>
`;

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');
  
  // Remove old injected style if exists
  html = html.replace(/<style> \.framer-mtfh2r \{ display: none !important; \}.*?<\/style>/s, '');
  html = html.replace(/<style id="mobile-fixes">.*?<\/style>/s, '');
  
  // Clean up any stray </head> injected twice
  html = html.replace(/<\/head>\s*<\/head>/g, '</head>');

  if (html.includes('</head>')) {
    html = html.replace('</head>', cssToInject);
    fs.writeFileSync(file, html);
    console.log('Fixed:', file);
  }
});
