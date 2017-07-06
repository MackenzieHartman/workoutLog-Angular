(function(){
	angular.module('workoutlog')
		// SessionToken and API_BASE are dependencies for this factory service. API_BASE is established in app.js and sessiontoken.js will be built shortly.
		.factory('AuthInterceptor', ['SessionToken', 'API_BASE',
			function(SessionToken, API_BASE){
				return{
					request: function(config){
						var token = SessionToken.get();
						// if statement above is essentially checking to see if there is a token and a url of API_BASE : Both of these are set in other files.
						if (token && confog.url.indexOf(API_BASE) > -1) {
							//this is where the token that is generated on successful account creations(signup) and logging in (signin) are attached to each ajax request.
							config.headers['Authorization'] = token;
						}
						return config;
					}
				};
			}]);
	angular.module('workoutlog')	
		// This section adds an interceptor that is configured for this app.  $httpProvider has an array thatexecutes each interceptor that the Angular framework runs and also what a developer has custom built for specific applications.
		// Essentially consider the $httpProvider interceptors as methods to filter http requests.
		.config(['$httpProvider', function($httpProvider){
			return $httpProvider.interceptors.push('AuthInterceptor');
		}]);
})();


// Generating Sessions

// The API is generating session tokens by implementing JWT (JSON Web Tokens).  The next file will create a service that takes the generated token and does three tasks.
// Sets the sessiontoken in localstorage (signup / signin)
// Gets the sessiontoken from localstorage (check authentication)
// Clears the sessiontoken from localstore (signout)
