(function(b) {

	"use strict";

	/************************* Private ********************/

	/* Auth */
	function validateRequiredRealm(params, reject){
		validateParameter('realm', 'The BridgeIt realm is required', params, reject);
	}

	function validateAndReturnRequiredAccessToken(params, reject){
		var token = params.accessToken || b.services.auth.getAccessToken();
		if( token ){
			return token;
		}
		else{
			reject(Error('A BridgeIt access token is required'));
		}
	}

	function validateAndReturnRequiredRealm(params, reject){
		var realm = params.realm || b.services.auth.getLastKnownRealm();
		if( realm ){
			sessionStorage.setItem(btoa(realmKey), btoa(realm));
			return realm;
		}
		else{
			reject(Error('The BridgeIt realm is required'));
		}
	}

	function validateAndReturnRequiredAccount(params, reject){
		var account = params.account || b.services.auth.getLastKnownAccount();
		if( account ){
			sessionStorage.setItem(btoa(accountKey), btoa(account));
			return account;
		}
		else{
			reject(Error('The BridgeIt account is required'));
		}
	}

	/* Locate */
	function validateRequiredRegion(params, reject){
		validateParameter('region', 'The region parameter is required', params, reject);
	}

	function validateRequiredMonitor(params, reject){
		validateParameter('monitor', 'The monitor parameter is required', params, reject);
	}

	function validateRequiredPOI(params, reject){
		validateParameter('poi', 'The poi parameter is required', params, reject);
	}

	/* Storage */
	function validateRequiredBlob(params, reject){
		validateParameter('blob', 'The blob parameter is required', params, reject);
	}

	function validateRequiredFile(params, reject){
		validateParameter('file', 'The file parameter is required', params, reject);
	}

	/* Code */
	function validateRequiredFlow(params, reject){
		validateParameter('flow', 'The flow parameter is required', params, reject);
	}

	/* Misc */
	function validateRequiredId(params, reject){
		validateParameter('id', 'The id is required', params, reject);
	}

	function validateParameter(name, msg, params, reject){
		if( !params[name] ){
			reject(Error(msg));
			return;
		}
	}

	if (!b['services']) {
		b.services = {};
	}

	var services = b.services;

	//internal keys
	var tokenKey = 'bridgeitToken';
	var tokenExpiresKey = 'bridgeitTokenExpires';
	var tokenSetKey = 'bridgeitTokenSet';
	var connectSettingsKey = 'bridgeitConnectSettingsKey';
	var lastActiveTimestampKey = 'bridgeitLastActiveTimestamp';
	var accountKey = 'bridgeitAccount';
	var realmKey = 'bridgeitRealm';
	var usernameKey = 'bridgeitUsername';
	var passwordKey = 'bridgeitPassword';
	var reloginCallbackKey = 'bridgeitReloginCallback';

	b.$ = {

		serializePostData: function(data){
			//TODO
		},

		get: function(url){
			return new Promise(
				function(resolve, reject) {
					var request = new XMLHttpRequest();
					request.open('GET', url, true);
					request.onreadystatechange = function() {
						if (this.readyState === 4) {
							if (this.status >= 200 && this.status < 400) {
						  		resolve(this.responseText);
							} else {
						  		reject(Error(this.status));
							}
						}
					};
					request.send();
					request = null;
				}
			);
		},

		getJSON: function(url){
			return new Promise(
				function(resolve, reject) {
					var request = new XMLHttpRequest();
					request.open('GET', url, true);
					request.onreadystatechange = function() {
						if (this.readyState === 4) {
							if (this.status >= 200 && this.status < 400) {
						  		resolve(JSON.parse(this.responseText));
							} else {
						  		reject(Error(this.status));
							}
						}
					};
					request.send();
					request = null;
				}
			);
		},

		getBlob: function(url){
			return new Promise(
				function(resolve, reject){
					var request = new XMLHttpRequest();
					request.onreadystatechange = function(){
						if (this.readyState === 4 && this.status === 200){
							resolve(new Uint8Array(this.response));
						}
						else{
							reject(Error(this.status));
						}
					};
					request.open('GET', url);
					request.responseType = 'arraybuffer';
					request.send();
					request = null;
				}
			);
		},

		post: function(url, data, isFormData, contentType){
			return new Promise(
				function(resolve, reject) {
					console.log('sending post to ' + url);
					contentType = contentType || "application/json";
					var request = new XMLHttpRequest();
					request.open('POST', url, true);
					request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
					if( !isFormData ){
						request.setRequestHeader("Content-type", contentType);
					}
   					//request.setRequestHeader("Connection", "close");
					request.onreadystatechange = function() {
						if (this.readyState === 4) {
							if (this.status >= 200 && this.status < 400) {
								var json = null;
								try{
									json = JSON.parse(this.responseText);
									resolve(json);
								}
								catch(e){
									reject(e);
								}
							} else {
						  		reject(Error(this.status));
							}
						}
					};
					request.send(JSON.stringify(data));
					request = null;
				}
			);
		},

		delete: function(url){
			return new Promise(
				function(resolve, reject) {
					console.log('sending delete to ' + url);
					var request = new XMLHttpRequest();
					//request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
					request.open('DELETE', url, true);
					//request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					//request.setRequestHeader("Content-type", "application/json");
   					//request.setRequestHeader("Connection", "close");
					request.onreadystatechange = function() {
						if (this.readyState === 4) {
							if (this.status >= 200 && this.status < 400) {
								resolve();
							} else {
						  		reject(Error(this.status));
							}
						}
					};
					request.send();
					request = null;
				}
			);
		},

		updateLastActiveTimestamp: function(){
			sessionStorage.setItem(btoa(lastActiveTimestampKey), new Date().getTime());
		},
		getLastActiveTimestamp: function(){
			sessionStorage.getItem(btoa(lastActiveTimestampKey));
		}
	};

	services.configureHosts = function(url){
		var isLocal = url == 'localhost' || '127.0.0.1';
		if( !url ){
			services.baseURL = 'dev.bridgeit.io';
		}
		else{
			services.baseURL = url;
		}
		var baseURL = services.baseURL;
		services.authURL = baseURL + (isLocal ? ':55010' : '') + '/auth';
		services.authAdminURL = baseURL + (isLocal ? ':55010' : '') + '/authadmin';
		services.locateURL = baseURL + (isLocal ? ':55020' : '') + '/locate';
		services.documentsURL = baseURL + (isLocal ? ':55080' : '') + '/docs';
		services.storageURL = baseURL + (isLocal ? ':55030' : '') + '/storage';
		services.metricsURL = baseURL + (isLocal ? ':55040' : '') + '/metrics';
	};

	services.checkHost = function(params){
		//TODO use last configured host if available
		if( params.host ){
			services.configureHosts(params.host);
		}
	};



	services.admin = {
		
		/**
		 * Get the BridgeIt Service definitions.
		 *
		 * @alias getServiceDefinitions
		 * @param {Object} params params
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns Promise with a json object of the service definitions
		 *
		 */
		getServiceDefinitions: function(params){
			return new Promise(
				function(resolve, reject) {
					if( !params ){
						params = {};
					}
					
					//defaults
					services.checkHost(params);

					//validate
					var token = validateAndReturnRequiredAccessToken(params, reject);
					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.authAdminURL + '/system/services/?access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(json){
								resolve(json);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);
		},

		getRealmUsers: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					
					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + b.services.authAdminURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/users/?access_token=' + services.auth.getAccessToken();

					b.$.getJSON(url)
						.then(
							function(json){
								resolve(json);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);
		},

		getRealmUser: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);
					
					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + b.services.authAdminURL + '/' + encodeURI(account) + '/realms/' + 
						encodeURI(realm) + '/users/' + params.id + '?access_token=' + services.auth.getAccessToken();

					b.$.getJSON(url)
						.then(
							function(json){
								resolve(json);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);
		},

		getAccountRealms: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					
					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + b.services.authURL + '/' + encodeURI(account) + '/realms/';

					b.$.getJSON(url)
						.then(
							function(json){
								resolve(json);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);
		},

		getAccountRealm: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);
					
					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + b.services.authURL + '/' + encodeURI(account) + '/realms/' + params.id;

					b.$.getJSON(url)
						.then(
							function(json){
								resolve(json);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);
		},
	}

	/* AUTH SERVICE */
	services.auth = {

		/**
		 * Login into bridgeit services. 
		 *
		 * This function will login into the BridgeIt auth service and return a user token and expiry timestamp upon 
		 * successful authentication. This function does not need to be called if bridgeit.connect has already been
		 * called, as that function will automatically extend the user session, unless the timeout has passed. 
		 *
		 * The function returns a Promise that, when successful, returns an object with the following structure:
		 *    {
		 *       "access_token": "d9f7463d-d100-42b6-aecd-ae21e38e5d02",
		 *       "expires_in": 1420574793844
		 *    }
		 * 
		 * Which contains the access token and the time, in milliseconds that the session will expire in.
		 *
		 * @alias login
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.username User name (required)
		 * @param {String} params.password User password (required)
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns Promise with the following argument:
		 *      {
		 *          access_token: 'xxx',
		 *          expires_in: 99999
		 *      }
		 *
		 */
		login: function(params) {
			return new Promise(
				function(resolve, reject) {
					b.services.checkHost(params);

					if( !params.realm ){
						params.realm = 'admin';
					}
					
					//validation
					if( !params.account ){
						reject(Error('BridgeIt account required for login'));
						return;
					}
					if( !params.password ){
						reject(Error('password required for login'));
						return;
					}
					if( !params.username ){
						reject(Error('username required for login'));
						return;
					}
					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + b.services.authURL + '/' + encodeURI(params.account) + '/realms/' + encodeURI(params.realm) + '/token/';

					var loggedInAt = new Date().getTime();
					b.$.post(url, {strategy: 'query', username: params.username, password: params.password})
						.then(
							function(authResponse){
								sessionStorage.setItem(btoa(tokenKey), authResponse.access_token);
								sessionStorage.setItem(btoa(tokenExpiresKey), authResponse.expires_in);
								sessionStorage.setItem(btoa(tokenSetKey), loggedInAt);
								sessionStorage.setItem(btoa(accountKey), btoa(params.account));
								sessionStorage.setItem(btoa(realmKey), btoa(params.realm));

								resolve(authResponse);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Connect to bridgeit services. 
		 *
		 * This function will connect to the BridgeIt services, and maintain the connection for the specified 
		 * timeout period (default 20 minutes). By default, the BridgeIt push service is also activated, so the client
		 * may send and receive push notifications after connecting.
		 *
		 * After connecting to BridgeIt Services, any BridgeIt service API may be used without needing to re-authenticate.
		 * After successfully connection an authentication will be stored in session storage and available through 
		 * sessionStorage.bridgeitToken. This authentication information will automatically be used by other BridgeIt API
		 * calls, so the token does not be included in subsequent calls, but is available if desired.
		 *
		 * A simple example of connecting to the BridgeIt Services and then making a service call is the following:
		 *
		 * bridgeit.connect({
		 *           account: 'my_account', 
		 *           realm: 'realmA', 
		 *           user: 'user', 
		 *           password: 'secret'})
		 *   .then( function(){
		 *      console.log("successfully connnected to BridgeIt Services");
		 *      //now we can fetch some docs
		 *      return bridgeit.docService.get('documents');
		 *   })
		 *   .then( function(docs){
		 *      for( var d in docs ){ ... };
		 *   })
		 *   .catch( function(error){
		 *      console.log("error connecting to BridgeIt Services: " + error);
		 *   });
		 *
		 * @alias connect
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name
		 * @param {String} params.realm BridgeIt Services realm
		 * @param {String} params.username User name
		 * @param {String} params.password User password
		 * @param {String} params.host The BridgeIt Services host url, defaults to api.bridgeit.io
		 * @param {Boolean} params.usePushService Open and connect to the BridgeIt push service, default true
		 * @param {Boolean} params.connectionTimeout The timeout duration, in minutes, that the BridgeIt login will last during inactivity. Default 20 minutes.
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @param {Boolean} params.storeCredentials (default true) Whether to store encrypted credentials in session storage. If set to false, bridgeit will not attempt to relogin before the session expires.
		 * @param {Function} params.onSessionTimeout Function callback to be called on session expiry
		 * @returns Promise with service definitions
		 *
		 */
		connect: function(params){
			return new Promise(
				function(resolve, reject) {
					
					//defaults
					b.services.checkHost(params);
					if( !'storeCredentials' in params){
						params.storeCredentials = true;
					}

					//store connect settings
					var settings = {
						host: services.baseURL,
						userPushService: params.usePushService,
						connectionTimeout: params.connectionTimeout || 20,
						ssl: params.ssl,
						storeCredentials: params.storeCredentials,
						onSessionTimeout: params.onSessionTimeout
					};
					sessionStorage.setItem(btoa(connectSettingsKey), btoa(JSON.stringify(settings)));	

					services.auth.login(params)
						.then(function(authResponse){

							function reloginBeforeTimeout(){
								//first check if connectionTimeout has expired
								var now = new Date().getTime();
								if( now - b.$.getLastActiveTimestamp() < params.connectionTimeout * 60 * 1000 ){
									//we have not exceeded the connection timeout
									var loginParams = services.auth.getConnectSettings();
									loginParams.account = sessionStorage.getItem(btoa(accountKey));
									loginParams.realm = sessionStorage.getItem(btoa(realmKey));
									loginParams.username = sessionStorage.getItem(btoa(usernameKey));
									loginParams.password = sessionStorage.getItem(btoa(passwordKey));

									services.auth.login(loginParams)
										.then(function(authResponse){
											setTimeout(reloginBeforeTimeout, authResponse.expires_in - 200);
										})
										.catch(function(error){
											throw new Error('error relogging in: ' + error);
										});

								}
							}

							console.log('connect received auth response: ' + JSON.stringify(authResponse));

							b.$.updateLastActiveTimestamp();

							
							//store creds
							if( params.storeCredentials ){
								
								sessionStorage.setItem(btoa(accountKey), btoa(params.account));
								sessionStorage.setItem(btoa(realmKey), btoa(params.realm));
								sessionStorage.setItem(btoa(usernameKey), btoa(params.username));
								sessionStorage.setItem(btoa(passwordKey), btoa(params.password));

								
								//set a timeout for 200 ms before expires to attempt to relogin
								var cbId = setTimeout(reloginBeforeTimeout, authResponse.expires_in - 200);
								sessionStorage.setItem(btoa(reloginCallbackKey), cbId);
								
							}
							resolve(authResponse);
						})
						.catch(function(error){
							reject(error);
						});
					
					
				}
			);

		},

		/**
		 * Disconnect from BridgeIt Services.
		 *
		 * This function will logout from BridgeIt Services and remove all session information from the client.
		 *
		 * TODO
		 *
		 * @alias disconnect
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.username User name (required)
		 * @param {String} params.password User password (required)
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns Promise with the following argument:
		 *      {
		 *          access_token: 'xxx',
		 *          expires_in: 99999
		 *      }
		 *
		 */
		disconnect: function(){
			sessionStorage.removeItem(btoa(tokenKey));
			sessionStorage.removeItem(btoa(tokenExpiresKey));
			sessionStorage.removeItem(btoa(connectSettingsKey));
			sessionStorage.removeItem(btoa(tokenSetKey));
			sessionStorage.removeItem(btoa(accountKey));
			sessionStorage.removeItem(btoa(realmKey));
			sessionStorage.removeItem(btoa(usernameKey));
			sessionStorage.removeItem(btoa(passwordKey));
			var cbId = sessionStorage.getItem(btoa(reloginCallbackKey));
			if( cbId ){
				clearTimeout(cbId);
			}
			sessionStorage.removeItem(btoa(reloginCallbackKey));
		},

		getAccessToken: function(){
			return sessionStorage.getItem(btoa(tokenKey));
		},

		getExpiresIn: function(){
			var expiresInStr = sessionStorage.getItem(btoa(tokenExpiresKey));
			if( expiresInStr ){
				return parseInt(expiresInStr);
			}
		},

		getTokenSetAtTime: function(){
			var tokenSetAtStr = sessionStorage.getItem(btoa(tokenSetKey));
			if( tokenSetAtStr ){
				return parseInt(tokenSetAtStr);
			}
		},

		getTimeRemainingBeforeExpiry: function(){
			var expiresIn = services.auth.getExpiresIn();
			var token = services.auth.getExpiresIn();
			if( expiresIn && token ){
				var now = new Date().getTime();
				return (services.auth.getTokenSetAtTime() + expiresIn) - now;
			}
		},

		getConnectSettings: function(){
			var settingsStr = sessionStorage.getItem(btoa(connectSettingsKey));
			if( settingsStr ){
				return JSON.parse(atob(settingsStr));
			}
		},

		isLoggedIn: function(){
			var token = sessionStorage.getItem(btoa(tokenKey)),
				tokenExpiresInStr = sessionStorage.getItem(btoa(tokenExpiresKey)),
				tokenExpiresIn = tokenExpiresInStr ? parseInt(tokenExpiresInStr) : null,
				tokenSetAtStr = sessionStorage.getItem(btoa(tokenSetKey)),
				tokenSetAt = tokenSetAtStr ? parseInt(tokenSetAtStr) : null,
				result = token && tokenExpiresIn && tokenSetAt && (new Date().getTime() < (tokenExpiresIn + tokenSetAt) );
			console.log('isLoggedIn: ' + token + ' tokenExpiresIn=' + tokenExpiresIn + ' tokenSetAt=' + tokenSetAt)
			return result;
		},

		getLastKnownAccount: function(){
			var accountCipher = sessionStorage.getItem(btoa(accountKey));
			if( accountCipher ){
				return atob(accountCipher);
			}
		},

		getLastKnownRealm: function(){
			var realmCipher = sessionStorage.getItem(btoa(realmKey));
			if( realmCipher ){
				return atob(realmCipher);
			}
		}
	};

	/* DOC SERVICE */
	services.documents = {

		/**
		 * Create a new document
		 *
		 * @alias createDocument
		 * @param {Object} params params
		 * @param {String} params.id The document id. If not provided, the service will return a new id
		 * @param {Object} params.document The document to be created
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {String} The resource URI
		 */
		createDocument: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.documentsURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/documents/' + (params.id ? params.id : '') + 
						'?access_token=' + token;

					b.$.post(url, params.document)
						.then(
							function(response){
								resolve(response.uri);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);			
		},

		/**
		 * Update a document
		 *
		 * @alias createDocument
		 * @param {Object} params params
		 * @param {String} params.id The document id. 
		 * @param {Object} params.document The document to be created
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {String} The resource URI
		 */
		updateDocument: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.documentsURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/documents/' + params.id + 
						'?access_token=' + token;

					b.$.post(url, params.document)
						.then(
							function(response){
								resolve(response.uri);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);			
		},

		/**
		 * Fetch a document
		 *
		 * @alias getDocument
		 * @param {Object} params params
		 * @param {String} params.id The document id. If not provided, the service will return a new id
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The document
		 */
		 getDocument: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.documentsURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/documents/' + params.id + 
						'?access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(doc){
								//the document service always returns a list, so 
								//check if we have a list of one, and if so, return the single item
								if( doc.length && doc.length === 1 ){
									resolve(doc[0]);
								}
								else{
									resolve(doc);
								}	
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);			
		},

		/**
		 * Fetch a document
		 *
		 * @alias getDocument
		 * @param {Object} params params
		 * @param {String} params.query A mongo query for the documents
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		 findDocuments: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.documentsURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/documents/?' + 
						(params.query ? 'query=' + encodeURIComponent(JSON.stringify(params.query)) : '') + 
						'&access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(doc){
								resolve(doc);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);			
		},

		/**
		 * Delete a new document
		 *
		 * @alias deleteDocument
		 * @param {Object} params params
		 * @param {String} params.id The document id. If not provided, the service will return a new id
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 */
		deleteDocument: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.documentsURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/documents/' + params.id + 
						'?access_token=' + token;

					b.$.delete(url)
						.then(
							function(response){
								resolve();
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
			
				}
			);
		}

	};

	/* LOCATE SERVICE */
	services.location = {

		/**
		 * Create a new region
		 *
		 * @alias createRegion
		 * @param {Object} params params
		 * @param {String} params.id The region id. If not provided, the service will return a new id
		 * @param {Object} params.region The region geoJSON document that describes the region to be created
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {String} The resource URI
		 */
		 createRegion: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredRegion(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/regions/' + (params.id ? params.id : '') + 
						'?access_token=' + token;

					b.$.post(url, params.region)
						.then(
							function(response){
								resolve(response.uri);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Delete a new region
		 *
		 * @alias deleteRegion
		 * @param {Object} params params
		 * @param {String} params.id The region id. 
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 */
		 deleteRegion: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/regions/' + params.id + 
						'?access_token=' + token;

					b.$.delete(url)
						.then(
							function(response){
								resolve();
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Fetches all saved regions for the realm
		 *
		 * @alias getAllRegions
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		 getAllRegions: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/regions/' +  
						'?access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Searches for regions in a realm based on a query
		 *
		 * @alias findRegions
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @param {Object} params.query The query
		 * @returns {Object} The results
		 */
		 findRegions: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/regions/?' + 
						(params.query ? 'query=' + encodeURIComponent(JSON.stringify(params.query)) : '') +
						'&access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Searches for monitors in a realm based on a query
		 *
		 * @alias findMonitors
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		 findMonitors: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/monitors/?' + 
						(params.query ? 'query=' + encodeURIComponent(JSON.stringify(params.query)) : '') +
						'&access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Create a new location monitor
		 *
		 * @alias createMonitor
		 * @param {Object} params params
		 * @param {String} params.id The monitor id. If not provided, the service will return a new id
		 * @param {Object} params.monitor The monitor document that describes the monitor to be created
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {String} The resource URI
		 */
		 createMonitor: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredMonitor(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/monitors/' + (params.id ? params.id : '') + 
						'?access_token=' + token;

					b.$.post(url, params.monitor)
						.then(
							function(response){
								resolve(response.uri);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Delete a new monitor
		 *
		 * @alias deleteMonitor
		 * @param {Object} params params
		 * @param {String} params.id The region id. 
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 */
		 deleteMonitor: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/monitors/' + params.id + 
						'?access_token=' + token;

					b.$.delete(url)
						.then(
							function(response){
								resolve();
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Fetches all saved monitors for the realm
		 *
		 * @alias getAllMonitors
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		 getAllMonitors: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/monitors/' +  
						'?access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Create a new location point of interest
		 *
		 * @alias createPOI
		 * @param {Object} params params
		 * @param {String} params.id The POI id. If not provided, the service will return a new id
		 * @param {Object} params.poi The POI document that describes the POI to be created
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {String} The resource URI
		 */
		 createPOI: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredPOI(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/poi/' + (params.id ? params.id : '') + 
						'?access_token=' + token;

					b.$.post(url, params.poi)
						.then(
							function(response){
								resolve(response.uri);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Searches for POIs in a realm based on a query
		 *
		 * @alias findPOIs
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @params {Object} params.query The mongo db query
		 * @returns {Object} The results
		 */
		 findPOIs: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/poi/?' + 
						(params.query ? 'query=' + encodeURIComponent(JSON.stringify(params.query)) : '') +
						'&access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Delete a new POI
		 *
		 * @alias deletePOI
		 * @param {Object} params params
		 * @param {String} params.id The POI id. 
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 */
		 deletePOI: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/poi/' + params.id + 
						'?access_token=' + token;

					b.$.delete(url)
						.then(
							function(response){
								resolve();
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Fetches all saved POIs for the realm
		 *
		 * @alias getAllPOIs
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		 getAllPOIs: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.locateURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/poi/' +  
						'?access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

	};

	/* METRICS SERVICE */
	services.metrics = {

		/**
		 * Searches for Metrics in a realm based on a query
		 *
		 * @alias findMetrics
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {Object} params.expression The expression for the metrics query TODO document expression format
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		findMetrics: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.metricsURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/stats/?' + 
						(params.expression ? 'expression=' + encodeURIComponent(JSON.stringify(params.expression)) : '') +
						'&access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},


	};

	/* CONTEXT SERVICE */
	services.context = {

	};

	/* CODE SERVICE */
	services.code = {

		/**
		 * Executes a code flow
		 *
		 * @alias executeFlow
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @param {String} params.httpMethod (default 'post') 'get' or 'post'
		 * @param {String} params.flow The code flow name
		 * @param {Object} params.data The data to send with the flow
		 */
		executeFlow: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);
					var httpMethod = params.httpMethod || 'post';
					httpMethod = httpMethod.toLowerCase();

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredFlow(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.storageURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/meta?scope=all&access_token=' + token;

					if( 'get' === httpMethod ){
						//TODO encode params.data into URL?
						b.$.get(url)
							.then(
								function(response){
									resolve();
								}
							)
							.catch(
								function(error){
									reject(error);
								}
							);
					}
					else if( 'post' === httpMethod ){
						b.$.post(url, params.data)
							.then(
								function(response){
									resolve();
								}
							)
							.catch(
								function(error){
									reject(error);
								}
							);
					}
					
				}
			);
		}
	}

	/* STORAGE SERVICE */
	services.storage = {

		/**
		 * Retrieve the storage meta info for the realm
		 *
		 * @alias getMetaInfo
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		getMetaInfo: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.storageURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/meta?scope=all&access_token=' + token;

					b.$.getJSON(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Stores a blob
		 *
		 * @alias uploadBlob
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.id The blob id. If not provided, the service will return a new id
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Object} params.blob The Blob to store
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		uploadBlob: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredBlob(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.storageURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/blobs/' +
						(params.id ? params.id : '') +
						'?access_token=' + token;
					var formData = new FormData();
					formData.append('file', params.blob);

					b.$.post(url, formData, true)
						.then(
							function(response){
								resolve(response.uri);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Stores a file 
		 *
		 * @alias uploadBlob
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.id The blob id. If not provided, the service will return a new id
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Object} params.file The Blob to store
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The results
		 */
		uploadFile: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredFile(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.storageURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/blobs/' +
						(params.id ? params.id : '') +
						'?access_token=' + token;
					var formData = new FormData();
					formData.append('file', params.blob);

					b.$.post(url, formData, true)
						.then(
							function(response){
								resolve(response.uri);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Retrieves a blob file from the storage service
		 *
		 * @alias getBlob
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.id The blob id. 
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 * @returns {Object} The blob arraybuffer
		 */
		getBlob: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.storageURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/blobs/' + params.id + '?access_token=' + token;

					b.$.getBlob(url)
						.then(
							function(response){
								resolve(response);
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		},

		/**
		 * Deletes a blob file from the storage service
		 *
		 * @alias deleteBlob
		 * @param {Object} params params
		 * @param {String} params.account BridgeIt Services account name (required)
		 * @param {String} params.realm BridgeIt Services realm (required only for non-admin logins)
		 * @param {String} params.id The blob id. 
		 * @param {String} params.accessToken The BridgeIt authentication token. If not provided, the stored token from bridgeit.services.auth.connect() will be used
		 * @param {String} params.host The BridgeIt Services host url. If not supplied, the last used BridgeIT host, or the default will be used. (optional)
		 * @param {Boolean} params.ssl (default false) Whether to use SSL for network traffic.
		 */
		deleteBlob: function(params){
			return new Promise(
				function(resolve, reject) {
					//defaults
					services.checkHost(params);

					//validate
					var account = validateAndReturnRequiredAccount(params, reject);
					var realm = validateAndReturnRequiredRealm(params, reject);
					var token = validateAndReturnRequiredAccessToken(params, reject);
					validateRequiredId(params, reject);

					var protocol = params.ssl ? 'https://' : 'http://';
					var url = protocol + services.storageURL + '/' + encodeURI(account) + 
						'/realms/' + encodeURI(realm) + '/blobs/' + params.id + '?access_token=' + token;

					b.$.delete(url)
						.then(
							function(response){
								resolve();
							}
						)
						.catch(
							function(error){
								reject(error);
							}
						);
				}
			);
		}
	};

	/* Initialization */
	services.configureHosts();
	
})(bridgeit);