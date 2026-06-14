const fs = require('fs');

const cssToInject = `
<script id="mobile-js">
  document.addEventListener("DOMContentLoaded", () => {
    const fixLayout = () => {
      if (window.innerWidth <= 768) {
         // Fix the hamburger menu links safely
         document.querySelectorAll("a").forEach(a => {
           const text = (a.textContent || "").trim();
           // Hide only exactly these bad items in the menu
           const badTexts = ["Pages", "Utility Pages", "404", "Blog", "Career", "Integration", "FAQs", "Blog Single", "Career Single", "Integration Single", "Company", "Contact", "Pricing", "Sign Up"];
           
           // If the link text includes ANY of the bad texts, hide it. 
           // But be careful not to hide "Home" or "Features" or "Get Started" or "Learn More"
           const isBad = badTexts.some(bad => text.includes(bad));
           if (isBad) {
             a.style.display = "none";
             if (a.parentElement && a.parentElement.tagName === "DIV" && a.parentElement.children.length === 1) {
                a.parentElement.style.display = "none";
             }
           }
         });
         
         // Also check raw text nodes for the headers in the menu
         document.querySelectorAll("p, span, h1, h2, h3, h4, h5, h6, div").forEach(el => {
           if (el.children.length === 0) {
             const text = (el.textContent || "").trim();
             const badTexts = ["Pages", "Utility Pages", "404", "Blog", "Career", "Integration", "FAQs", "Blog Single", "Career Single", "Integration Single"];
             const isBad = badTexts.some(bad => text === bad);
             if (isBad) {
                 el.style.display = "none";
                 if (el.parentElement && el.parentElement.tagName === "DIV" && el.parentElement.children.length === 1) {
                     el.parentElement.style.display = "none";
                 }
             }
           }
         });

         // Fix the dashboard gap dynamically
         const dashImg = document.querySelector('img[alt="dashboard"]');
         if (dashImg) {
           // Find the highest section wrapper
           let container = dashImg.parentElement;
           let heroSection = null;
           for(let i=0; i<6; i++) {
             if (container && container.tagName === 'SECTION') {
               heroSection = container;
             }
             if (container) container = container.parentElement;
           }
           
           // If we found the hero section, we remove its fixed minHeight and let it scale by aspect-ratio
           if (heroSection) {
             heroSection.style.minHeight = "0";
             heroSection.style.height = "auto";
           }
           
           // The image wrapper itself should dictate the height using aspect ratio
           const imgWrapperParent = dashImg.parentElement.parentElement;
           if (imgWrapperParent) {
              // 1663x946 is the image size
              imgWrapperParent.style.aspectRatio = "1663 / 946";
              imgWrapperParent.style.height = "auto";
              imgWrapperParent.style.minHeight = "0";
              imgWrapperParent.style.position = "relative"; 
           }
         }
         
         // Remove previous broken CSS if it still lingers
         document.querySelectorAll('style').forEach(s => {
            if (s.textContent.includes('data-framer-background-image-wrapper') && s.textContent.includes('position: relative !important')) {
                s.disabled = true;
                s.remove();
            }
         });
      }
    };

    const observer = new MutationObserver(() => {
      fixLayout();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also run on resize and load
    window.addEventListener('resize', fixLayout);
    fixLayout();
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
