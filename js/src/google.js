import loadScript from './loadScript.js';
import {
  ERROR_GOOGLE_RESOURCE_DOESNT_EXIST,
  ERROR_GOOGLE_SERVER_ISSUE,
  ERROR_GOOGLE_CLIENT_INIT,
  ERROR_GOOGLE_CLIENT_MISCONFIGURED,
  ERROR_SPREADSHEET_UNAUTHORIZED,
  ERROR_NO_SPREADSHEET,
  ERROR_SPREADSHEET_API_GET,
  ERROR_SPREADSHEET_VALUES_API_GET,
  ERROR_BAD_SPREADSHEET_RANGE,
  makeKnownError
} from "./errors.js";

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
      error = makeKnownError(ERROR_GOOGLE_RESOURCE_DOESNT_EXIST, error);
      reject(error);
    });
  });
}

function load_client() {
  return new Promise(function(resolve, reject) {
    if (!gapi) {
    }

    gapi.load('client:auth2', {
      callback: resolve,
      onerror: function(error) {
        error = makeKnownError(ERROR_GOOGLE_RESOURCE_DOESNT_EXIST, error);
        reject(error);
      }
    });
  });
}

function init_client() {
  return new Promise(function(resolve, reject) {
    if (!gapi) {
    }
    if (!gapi.client) {
    }

    var config = {
      clientId: clientId,
      apiKey: apiKey,
      discoveryDocs: discoveryDocs,
      scope: scopes.join(' ')
    };
    try {
      gapi.client.init(config).then(function() {
        if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
          throw new Error("config: " + JSON.stringify(config, null, 2));
        }
        resolve();
      }).catch(function(error) {
        if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
          error = makeKnownError(ERROR_GOOGLE_CLIENT_MISCONFIGURED, error);
        } else {
          error = makeKnownError(ERROR_GOOGLE_CLIENT_INIT, error);
        }
        reject(error);
      });
    } catch (error) {
      error = makeKnownError(ERROR_GOOGLE_CLIENT_INIT, error);
      reject(error);
    }
  });
}

function initialize(loader) {
  return new Promise(function(resolve, reject) {
    if (loader) {
      loader.desc.textContent = "Loading apis";
    }
    load_script().then(function() {
      if (loader) {
        loader.bar.style.width = 10 + "%";
        loader.desc.textContent = "Initializing";
      }
      load_client().then(function() {
        if (loader) {
          loader.bar.style.width = 20 + "%";
          loader.desc.textContent = "Authenticating";
        }
        init_client().then(function() {
          if (loader) {
            loader.bar.style.width = 30 + "%";
          }
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
    return new Promise(function(resolve, reject) {
      if (!gapi) {
      }
      if (!gapi.client) {
      }
      if (!gapi.client.sheets) {
      }

      var config = {
        spreadsheetId: id
      };
      try {
        gapi.client.sheets.spreadsheets.get(config)
        .then(function(response) {
          resolve(response.result);
        }).catch(function(response) {
          var error_msg = response.result.error.message,
              error = new Error(error_msg + " config: " + JSON.stringify(config, null, 2));

          switch (response.result.error.status) {
          case "NOT_FOUND":
            error = makeKnownError(ERROR_NO_SPREADSHEET, error);
            break;
          default:
            if (response.result.error.code >= 500) {
              error = makeKnownError(ERROR_GOOGLE_SERVER_ISSUE, error);
            } else {
              error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
            }
            break;
          }
          reject(error);
        });
      } catch (error) {
        error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
        reject(error);
      }
    });
  },
  getSpreadsheetValues: function(id, range) {
    return new Promise(function(resolve, reject) {
      if (!gapi) {
      }
      if (!gapi.client) {
      }
      if (!gapi.client.sheets) {
      }

      var config = {
        spreadsheetId: id,
        range: range
      };
      try {
        gapi.client.sheets.spreadsheets.values.get(config)
        .then(function(response) {
          resolve(response.result.values);
        }).catch(function(response) {
          // Handle weird case when range is messed up
          if (response.result == false) {
            var error = new Error("config: " + JSON.stringify(config, null, 2));
            if (response.status == 404) {
              error = makeKnownError(ERROR_BAD_SPREADSHEET_RANGE, error);
            } else {
              error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
            }
            reject(error);
            return;
          }

          // Handle the common case
          var error_msg = response.result.error.message,
              error = new Error(error_msg + " config: " + JSON.stringify(config, null, 2));

          switch (response.result.error.status) {
          case "NOT_FOUND":
            error = makeKnownError(ERROR_NO_SPREADSHEET, error);
            break;
          default:
            if (response.result.error.code >= 500) {
              error = makeKnownError(ERROR_GOOGLE_SERVER_ISSUE, error);
            } else {
              error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
            }
            break;
          }
          reject(error);
        });
      } catch (error) {
        error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
        reject(error);
      }
    });
  }
};

// Whether the client has been initialized or not
var initialized = false;
function get_api(auth_config, loader) {
  return new Promise(function(resolve, reject) {
    if (initialized) {
      return resolve(api);
    }
    initialize(loader).then(function(timing) {
      if (!gapi) {
      }
      if (!gapi.auth2) {
      }
      if (!gapi.auth2.getAuthInstance()) {
      }

      setup_auth(auth_config);
      initialized = true;
      resolve(api);
    }).catch(reject);
  });
}

// Helper functions, no API needed
export { is_spreadsheet_url as isSpreadsheetUrl };
export { spreadsheet_id as parseSpreadsheetUrl };
export { spreadsheet_url as makeSpreadsheetUrl };

// Using the Google Sheets API
export { get_api as getGoogleApi };
