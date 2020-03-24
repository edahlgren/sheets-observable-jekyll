import loadScript from './loadScript.js';
import errors from './errors.js';

// Google constants
const clientId = '610692011464-m1oi9ddi7u31h92e09lg5s970luvak9a.apps.googleusercontent.com',
      apiKey = 'AIzaSyDCdKkMRyLWNjtTaUBYRcJFLqLEWEGDgg8',
      discoveryDocs = [
        "https://sheets.googleapis.com/$discovery/rest?version=v4"
      ],
      scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly"
      ];

function load_script() {
  return new Promise(function(resolve, reject) {
    loadScript(
      "https://apis.google.com/js/api.js"
    ).then(resolve).catch(function(error) {
      console.log("[error: load script]", error);
      reject(errors.SCRIPT_DOWNLOAD_ERROR);
    });
  });
}

function load_client() {
  return new Promise(function(resolve, reject) {
    gapi.load('client:auth2', {
      callback: resolve,
      onerror: function(error) {
        console.log("[error: load auth2 client]", error);
        reject(errors.GOOGLE_CLIENT_LOAD_ERROR);
      }
    });
  });
}

function init_client() {
  return new Promise(function(resolve, reject) {
    gapi.client.init({
      clientId: clientId,
      apiKey: apiKey,
      discoveryDocs: discoveryDocs,
      scope: scopes.join(' ')
    }).then(resolve).catch(function(error) {
      console.log("[error: init client]", error);
      reject(errors.GOOGLE_CLIENT_INIT_ERROR);
    });
  });
}

function initialize() {
  return new Promise(function(resolve, reject) {
    load_script().then(function() {
      load_client().then(function() {
        init_client().then(function() {
          resolve();
        }).catch(reject);
      }).catch(reject);
    }).catch(reject);
  });
}

function setup_auth(config) {
  var clicked = null;
  var update = function(isSignedIn) {
    if (clicked && clicked.afterAuth) {
      clicked.afterAuth();
    }
    clicked = null;
  };

  if (config.signin) {
    config.signin.forEach(function(button) {
      button.element.addEventListener('click', function() {
        if (button.beforeAuth) {
          button.beforeAuth();
        }
        clicked = button;
        gapi.auth2.getAuthInstance().signIn();
      });
    });
  }

  if (config.signout) {
    config.signout.forEach(function(button) {
      button.element.addEventListener('click', function() {
        if (button.beforeAuth) {
          button.beforeAuth();
        }
        clicked = button;
        gapi.auth2.getAuthInstance().signOut();
      });
    });
  }

  gapi.auth2.getAuthInstance().isSignedIn.listen(update);
  update(gapi.auth2.getAuthInstance().isSignedIn.get());
}

const url_header = 'https://docs.google.com/spreadsheets/d/';

let re1 = /https\:\/\/docs\.google\.com\/spreadsheets\/d\/[\w\d]+\/.*/,
    re2 = /https\:\/\/docs\.google\.com\/spreadsheets\/d\/[\w\d]+/;

function is_spreadsheet_url(url) {
  return (re1.test(url) || re2.test(url));
}

function spreadsheet_id(url) {
  var start = url_header.length,
      end = url.indexOf('/', start);

  if (end < 0)
    return url.substring(start);

  return url.substring(start, end);
}

function spreadsheet_url(id) {
  return url_header + id;
}

var api = {
  isSignedIn: function() {
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  },
  getSpreadsheetMetadata: function(id) {
    return gapi.client.sheets.spreadsheets.get({
      spreadsheetId: id
    });
  },
  getSpreadsheetValues: function(id, range) {
    return gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: range
    });
  }
};

// Whether the client has been initialized or not
var initialized = false;
function get_api(auth_config) {
  return new Promise(function(resolve, reject) {
    if (initialized) {
      resolve(api);
    }
    initialize().then(function() {
      setup_auth(auth_config);
      initialized = true;
      resolve(api);
    }).catch(reject);
  });
}

function get_data(auth, id, sheet) {
  return new Promise(function(resolve, reject) {
    get_api(auth).then(function(api) {
      api.getSpreadsheetValues(id, sheet).then(function(response) {
        resolve(response.result.values);
      }).catch(reject);
    }).catch(reject);
  });
}

function access_spreadsheet(auth, id) {
  return new Promise(function(resolve, reject) {
    get_api(auth).then(function(api) {
      api.getSpreadsheetMetadata(id).then(function(response) {
        resolve(response.result);
      }).catch(reject);
    }).catch(reject);
  });
}

// Helper functions, no API needed
export { is_spreadsheet_url as isSpreadsheetUrl };
export { spreadsheet_id as parseSpreadsheetUrl };
export { spreadsheet_url as makeSpreadsheetUrl };

// Using the Google Sheets API
export { get_api as getGoogleApi };
export { get_data as getData };
export { access_spreadsheet as accessSpreadsheet };
