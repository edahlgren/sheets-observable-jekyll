function loadScript(url) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement('script');

    script.onload = function() { resolve(); };
    script.onerror = reject;
    script.src = url;
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);
  });
}

export default loadScript;
