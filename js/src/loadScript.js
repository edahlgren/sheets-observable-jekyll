function loadScript(url) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement('script');

    script.onload = function() {
      resolve();
    };
    script.onerror = function(e) {
      var error = new Error("The script " + e.target.src + " didn't load correctly.");
      reject(error);
    };
    script.src = url;
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);
  });
}

export default loadScript;
