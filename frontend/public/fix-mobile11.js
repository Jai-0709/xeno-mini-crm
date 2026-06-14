const fs = require('fs');

const cssToInject = `
<script id="mobile-js">
  document.addEventListener("DOMContentLoaded", () => {
    const fixLayout = () => {
      if (window.innerWidth <= 768) {
         // Fix the hamburger menu links safely
         document.querySelectorAll("a").forEach(a => {
           const text = (a.textContent || "").trim();
           const badTexts = ["Pages", "Utility Pages", "404", "Blog", "Career", "Integration", "FAQs", "Blog Single", "Career Single", "Integration Single", "Company", "Contact", "Pricing", "Sign Up"];
           
           const isBad = badTexts.some(bad => text.includes(bad));
           if (isBad) {
             a.style.display = "none";
             if (a.parentElement && a.parentElement.tagName === "DIV" && a.parentElement.children.length === 1) {
                a.parentElement.style.display = "none";
             }
           }
         });
         
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

         // Place the Dashboard Image perfectly OVER the Wavy Background, like Desktop!
         const dashImgs = document.querySelectorAll('img[alt="dashboard"]');
         const bgImgs = document.querySelectorAll('img[alt="bg"]');
         
         // Find the original dashboard image to grab its src
         let dashImg = null;
         dashImgs.forEach(img => {
             if (img.src && img.src.includes('MYH9gnMeXJpiWdT8CKYhuYdtmF0')) {
                 dashImg = img;
             }
         });
         
         // Find the active wavy background visible on mobile
         let activeBg = null;
         bgImgs.forEach(img => {
             if (img.offsetParent !== null && img.src && img.src.includes('SbAYTGLHe7icCQdyC9sm7N0hrXY')) {
                 activeBg = img;
             }
         });

         if (dashImg && activeBg) {
             const bgWrapper = activeBg.parentElement;
             
             // Check if we haven't already injected the dashboard
             if (bgWrapper && !bgWrapper.querySelector('.perfect-dash-overlay')) {
                 // Create a perfectly positioned container that sits over the wavy background
                 const dashCloneWrapper = document.createElement('div');
                 dashCloneWrapper.className = 'perfect-dash-overlay';
                 dashCloneWrapper.style.position = 'absolute';
                 dashCloneWrapper.style.top = '6%';
                 dashCloneWrapper.style.left = '4%';
                 dashCloneWrapper.style.width = '92%';
                 dashCloneWrapper.style.height = '88%';
                 dashCloneWrapper.style.zIndex = '20';
                 dashCloneWrapper.style.display = 'flex';
                 dashCloneWrapper.style.alignItems = 'center';
                 dashCloneWrapper.style.justifyContent = 'center';
                 
                 const cloneImg = document.createElement('img');
                 cloneImg.src = dashImg.src;
                 cloneImg.style.width = '100%';
                 cloneImg.style.height = '100%';
                 cloneImg.style.objectFit = 'contain';
                 cloneImg.style.borderRadius = '8px'; // Add slight curve matching desktop
                 cloneImg.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)'; // Add nice desktop shadow
                 
                 dashCloneWrapper.appendChild(cloneImg);
                 
                 // Append the dashboard exactly inside the wavy background's container
                 bgWrapper.appendChild(dashCloneWrapper);
                 
                 // Hide any other misaligned dashboard images in this section so they don't cause duplicate gaps
                 const section = activeBg.closest('section') || activeBg.closest('.framer-1h3s16t');
                 if (section) {
                     section.querySelectorAll('img[alt="dashboard"]').forEach(img => {
                         if (!img.closest('.perfect-dash-overlay')) {
                             img.style.display = 'none';
                             if (img.parentElement) img.parentElement.style.display = 'none';
                         }
                     });
                 }
                 
                 // Note: We DO NOT modify section heights, flex gaps, or wrappers! 
                 // This ensures we do not break any other layout elements.
             }
         }
         
      }
    };

    const observer = new MutationObserver(() => {
      fixLayout();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also run on resize and load
    window.addEventListener('resize', fixLayout);
    fixLayout();
    setTimeout(fixLayout, 500);
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
