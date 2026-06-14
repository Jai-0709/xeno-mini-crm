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

         // --- Desktop-referenced Overlay Fix ---
         
         // 1. Find the exact images the user referenced
         const dashImgs = document.querySelectorAll('img[alt="dashboard"]');
         const bgImgs = document.querySelectorAll('img[alt="bg"]');
         
         let dashImg = null;
         dashImgs.forEach(img => {
             if (img.src && img.src.includes('MYH9gnMeXJpiWdT8CKYhuYdtmF0')) {
                 dashImg = img;
             }
         });
         
         let activeBg = null;
         bgImgs.forEach(img => {
             if (img.offsetParent !== null && img.src && img.src.includes('SbAYTGLHe7icCQdyC9sm7N0hrXY')) {
                 activeBg = img;
             }
         });

         if (dashImg && activeBg) {
             const bgWrapper = activeBg.parentElement;
             
             // 2. Ensure we only do this once
             if (bgWrapper && !bgWrapper.querySelector('.desktop-reference-overlay')) {
                 
                 // Remove any broken logic from older scripts that might still be affecting this container
                 const imgWrapperParent = dashImg.parentElement.parentElement;
                 if (imgWrapperParent) {
                     imgWrapperParent.style.aspectRatio = '';
                     imgWrapperParent.style.height = '';
                     imgWrapperParent.style.minHeight = '';
                 }

                 // 3. Create the overlay container perfectly mirroring the desktop layout
                 const dashOverlayWrapper = document.createElement('div');
                 dashOverlayWrapper.className = 'desktop-reference-overlay';
                 
                 // In desktop layout, the dashboard image sits inside a wrapper that is absolutely 
                 // positioned over the background, with slight inset padding.
                 dashOverlayWrapper.style.position = 'absolute';
                 dashOverlayWrapper.style.top = '5%';
                 dashOverlayWrapper.style.left = '5%';
                 dashOverlayWrapper.style.width = '90%';
                 dashOverlayWrapper.style.height = '90%';
                 dashOverlayWrapper.style.zIndex = '10';
                 dashOverlayWrapper.style.display = 'flex';
                 dashOverlayWrapper.style.alignItems = 'center';
                 dashOverlayWrapper.style.justifyContent = 'center';
                 
                 // 4. Inject the dashboard image
                 const cloneImg = document.createElement('img');
                 cloneImg.src = dashImg.src;
                 cloneImg.style.width = '100%';
                 cloneImg.style.height = '100%';
                 // object-fit: contain ensures it never crops or distorts, just like desktop
                 cloneImg.style.objectFit = 'contain';
                 // Add the nice desktop rounded corners
                 cloneImg.style.borderRadius = '8px'; 
                 
                 dashOverlayWrapper.appendChild(cloneImg);
                 
                 // 5. Place it directly over the wavy background element
                 bgWrapper.appendChild(dashOverlayWrapper);
                 
                 // 6. Hide the original dashboard element that was getting cropped/misaligned
                 if (dashImg.parentElement && dashImg.parentElement.parentElement) {
                     dashImg.parentElement.parentElement.style.display = 'none';
                 }
                 
                 // Safely reduce the hero section gap ONLY to remove the huge gap below the image
                 const section = activeBg.closest('section');
                 if (section) {
                     section.style.minHeight = '0px';
                     section.style.height = 'auto';
                 }
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
