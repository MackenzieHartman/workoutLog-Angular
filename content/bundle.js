(function() {
	var app = angular.module('workoutlog', [
		'ui.router',
		'workoutlog.auth.signup'
	]);

	function config($urlRouterProvider) {
		$urlRouterProvider.otherwise('/signin');
	}

	config.$inject = [ '$urlRouterProvider' ];
	app.config(config);
	app.constant('API_BASE', '//localhost:3000/api');
})();



(function(){
	angular
		.module('workoutlog.auth.signup', ['ui,router'])
		.config(signupConfig);
		
		// signUpConfig establishes these items: defines this component as the state of signup and provides the url route templateUrl is the html the component will use
		function signupConfig($stateProvider){
			// $stateProvider is from ui-router and is the method through which url routing is handled.
			$stateProvider
				.state('signup', {
					url: '/signup',
					// templateUrl is the html the component will use
					templateUrl: '/components/auth/signup/html',
					// controller indicates which controller will dictate the behavior of this view 
					controller: SignUpController,
					// controllerAs creates an alias so a developer doesn’t have to type SignUpController.<function orobject>
					controllerAs: 'ctrl',
					// bindToController binds the scope of the view to the scope of this controller and eliminates the need to use $scope.
					bindtoController: this
				});
		};

		sigupConfig.$inject = ['$stateProvider'];
		// SignUpController has $state and UsersService injected into it
		function SignUpController($state, UsersService){
			// var vm = this; is how the binding of the controller to the view is completed
			var vm = this;
			// vm.user = {}; establishes an object to build the username and password inside.
			vm.user = {};
			// vm.message = “Sign up for an account!” is an example of expressions and how vm and this scope work together.
			vm.message = "sign up for an account!"
			vm.submit = function(){
				// ng-model and ng-submit create the vm.user object that UserService.create uses to sign a new user up to our application.
				UsersService.create(vm.user).then(function(response){
					console.log(response);
					// $state.go(‘define’) is how ui-route changes from state (url) to other states.
					$state.go('define');
				});
			};
		}
		// The .then is how the SignUpController handles the resolved promise and then routes the app to the define feature of the WorkoutLog.
		SignUpController.$inject = ['$state', 'UsersService'];
})();


//There are several concepts implemented in this controller and the other controllers throughout this app.  
//First, in other Angular apps built in this course the configuration (config) file is found in a single file.  
//This way keeps the components together.  It is also important to note that the config and controller for each 
//feature will use the .$inject directive from Angular to inject dependencies.




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

(function(){
	angular.module('workoutlog')
		.service('CurrentUser', [ '$window', function($window){
			function CurrentUser(){
				var currUser = $window.localStorage.getItem('currentUser');
				// line of code is checking if there is a currentUser
				if (currUser && currUser !== "undefined"){
					// If the currUser is undefined then set the currentUser
					this.currentUser = JSON.parse($window.localStorage.getItem('currentUser'));
				}
			}
			CurrentUser.prototype.set = function(user){
				this.currentUser = user;
				$window.localStorage.setItem('currentUser', JSON.stringify(user));
			};
			CurrentUser.prototype.get = function(){
				return this.currentUser || {};
			};
			CurrentUser.prototype.clear = function(){
				this.currentUser = undefined;
				$window.localStorage.removeItem('currentUser');
			};
			CurrentUser.prototype.isSignedIn = function(){
				// line of code is checking if there is a currentUser
				// The double !! ensures that isSignedIn flips the boolean correctly
				// An exercise that will help with the !! is to think through what occurs when a user signs in and how the use of a boolean could indicate that in code.
				return !!this.get().id;
			};
			return new CurrentUser();
		}]);
})();


(function(){
	angular.module('workoutlog')
		.service('SessionToken', ['$window', function($window){
			// Declares and defines SessionToken()
			function SessionToken(){
				this.sessionToken = $window.localStorage.getItem('sessionToken');
			}
 			// .prototype to attach the functions of .set / .get and .clear to the prototype chain having  memory enhancements and follow conventional design patterns.
			SessionToken.prototype.set = function(token){
				this.sessionToken = token;
				$window.localStorage.setItem('sessionToken', token);
			};
 			// .prototype to attach the functions of .set / .get and .clear to the prototype chain having memory enhancements and follow conventional design patterns.
			SessionToken.prototype.get = function(){
				return this.sessionToken;
			};
 			// .prototype to attach the functions of .set / .get and .clear to the prototype chain having  memory enhancements and follow conventional design patterns.
			SessionToken.prototype.get = function(){
				this.sessionToken = undefined;
				$window.localStorage.removeItem('sessionToken');
			};
		}]);
})();


// Documentation regarding $window can be found here: https://docs.angularjs.org/api/ng/service/$window

// Documentation regarding localStorage can be found here: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// Remember JavaScript has a window object but it is a global variable. This makes testing and maintenance difficult.  $window is Angular’s window object and helps increase testing and maintenance by controlling the scope.

// Establishing a Current User
// Currentuser.js implements the same design pattern.  In addition, it implements some hard to understand logic. 


// This file will handle the http request to create and / or signin a user.  
// When building out this file, notice how the design pattern of Dependency Injection is implemented.  
// For users.service to perform the necessary functions, it needs $http, API_BASE, SessionToken and CurrentUser.  
// An important concept to remember of software development at this level is Separation of Concerns (SOC).  Dependency Injection (DI) 
// follows this pattern by created separate services to handle specific functionality the application requires.  Then each of these services are combined to build the create and login feature of this app. 
// Remember, ease code maintenance is increased as technical debt is minimized.  SOC and DI accomplish this by having one file that can be altered and then implemented across the application.

(function(){
	angular.module('workoutlog')
		.service('UsersService', [
			'$http', 'API_BASE', 'SessionToken','CurrentUser',
			function($http, API_BASE, SessionToken, CurrentUser){
				function UsersService(){
				}
			}
			UsersService.prototype.create = function(user){
				var userPromise = $http.post(API_BASE + 'user', {
					user: user
				});

				userPromise.then(function(response){
					SessionToken.set(response.data.sesssionToken);
					CurrentUser.set(response.data.user);
				});
				return userPromise;
			};

			UsersService.prototype.login = function(user){
				var loginPromise = $http.post(API_BASE + 'login',{
					user: user
				});

				loginPromise.then(function(repsonse){


					SessionToken.set(repsonse.data.sessionToken);
					CurrentUser.set(repsonse.data.user);
				});
				return loginPromise;
			};
			return new UsersService();
		}]);
})();
//# sourceMappingURL=bundle.js.map
