export const printElement = (element, options = {}) => {
  const { maxWidth = '800px', padding = '2cm' } = options;

  const printContent = element.innerHTML;

  // Create an iframe
  const iframe = document.createElement('iframe');

  // Hide the iframe completely
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  // Append to body to get it to load
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;

  // Write content directly with required styling wrappers
  iframeDoc.write(`
    <html dir="rtl" lang="he">
      <head>
        <title>הדפסה</title>
      </head>
      <body style="font-family: 'Heebo', sans-serif; max-width: ${maxWidth}; margin: 0 auto; padding: ${padding}; color: black; background: white;">
        ${printContent}
      </body>
    </html>
  `);

  // Copy all existing stylesheets and style blocks so the print retains Tailwind classes
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
  styles.forEach((style) => {
    iframeDoc.head.appendChild(style.cloneNode(true));
  });

  iframeDoc.close();

  // Need a small delay to ensure styles apply
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Cleanup after print dialog closes/finishes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 500);
    }, 250);
  };
};
