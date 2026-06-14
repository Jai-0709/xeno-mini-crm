const fs = require('fs');

const cssToInject = `
<style id="mobile-fixes">
  @media (max-width: 768px) {
    /* Make the dashboard image dictate the height of its container instead of collapsing */
    [data-framer-background-image-wrapper="true"]:not(:has(img[alt="logo"])) {
      position: relative !important;
      display: flex !important;
      align-items: flex-start !important;
    }
    
    img:not([alt="logo"]) {
      position: relative !important;
      object-fit: contain !important;
      height: auto !important;
      max-width: 100% !important;
    }
    
    /* Ensure the direct parent of the wrapper also doesn't force a huge height */
    div:has(> [data-framer-background-image-wrapper="true"]):not(:has(img[alt="logo"])) {
      height: auto !important;
      min-height: 0 !important;
    }
  }
</style>
<script id="mobile-js">
  document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
      if (window.innerWidth <= 768) {
         // Fix the hamburger menu links
         document.querySelectorAll("a").forEach(a => {
           const text = (a.textContent || "").trim();
           const allowed = ["Home", "Features", "Get Started", "Learn More", "Start Reaching Your Shoppers Smarter"];
           if (text.length > 0 && !allowed.includes(text)) {
             a.style.display = "none";
             if (a.parentElement && a.parentElement.tagName === "DIV" && a.parentElement.children.length === 1) {
                a.parentElement.style.display = "none";
             }
           }
         });
         
         // Fix the text headings in the hamburger menu
         document.querySelectorAll("p, span, h1, h2, h3, h4, h5, h6, div").forEach(el => {
           // Only target direct text nodes to avoid hiding entire trees
           if (el.children.length === 0) {
             const text = (el.textContent || "").trim();
             const hideList = ["Pages", "Utility Pages", "404", "Blog", "Career", "Integration", "FAQs", "Blog Single", "Career Single", "Integration Single"];
             if (hideList.includes(text)) {
                 el.style.display = "none";
                 if (el.parentElement && el.parentElement.tagName === "DIV" && el.parentElement.children.length === 1) {
                     el.parentElement.style.display = "none";
                 }
             }
           }
         });

         // Fix the dashboard gap by ensuring all ancestors up to the section have height: auto
         document.querySelectorAll('[data-framer-background-image-wrapper="true"]').forEach(w => {
           if (w.querySelector('img[alt="logo"]')) return;
           let el = w.parentElement;
           for(let i=0; i<4; i++) {
             if (el) {
               el.style.height = "auto";
               el.style.minHeight = "0";
               el = el.parentElement;
             }
           }
         });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
</script>
</head>
`;

const files = ['index.html', 'about.html', 'features.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<style id="mobile-fixes">[\s\S]*?<\/style>/g, '');
  content = content.replace(/<script id="mobile-js">[\s\S]*?<\/script>/g, '');
  content = content.replace('</head>', cssToInject);
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
