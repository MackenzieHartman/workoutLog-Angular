(function() {
	var app = angular.module('workoutlog', [
		'ui.router',
		'workoutlog.define',
		'workoutlog.logs',
		'workoutlog.history',
		'workoutlog.auth.signup',
		'workoutlog.auth.signin'
	])

	.factory('socket', function(socketFactory){
		var myIoSocket = io.connect('http://localhost:3000');

		var socket = socketFactory({
			ioSocket: myIoSocket
		});
		return socket;
	});

	function config($urlRouterProvider) {
		$urlRouterProvider.otherwise('/signin');
	}

	config.$inject = [ '$urlRouterProvider' ];
	app.config(config);

	var API_BASE = location.hostname === "localhost" ? "//localhost:3000/api/" : "//workoutlog-server-meh.herokuapp.com/api/";
	//app.constant('API_BASE', '//localhost:3000/api/');
	app.constant('API_BASE', API_BASE);
})();
(function(){
	angular
		.module('workoutlog.auth.signin', ['ui.router'])
		.config(signinConfig);

		function signinConfig($stateProvider){
			$stateProvider
				.state('signin', {
					url: '/signin',
					templateUrl: '/components/auth/signin.html',
					controller: SignInController,
					controllerAs: 'ctrl',
					bindToController: this
				});
		}

		signinConfig.$inject = [ '$stateProvider'];
		// UsersService will be used throughout the application to gather or create data regarding a user.
		function SignInController($state, UsersService){
			var vm = this;
			// Allows the controller to create a new user based upon the inputs from the signin.html.
			vm.user = {};
			vm.login = function(){
				UsersService.login(vm.user).then(function(response){
					console.log(response);
					$state.go('define');
				});
			};
		}

		SignInController.$inject = ['$state', "UsersService"];
})();

// signin component uses $state and UsersService as dependencies.
(function(){
	angular
		.module('workoutlog.auth.signup', ['ui.router'])
		.config(signupConfig);
		
		// signUpConfig establishes these items: defines this component as the state of signup and provides the url route templateUrl is the html the component will use
		function signupConfig($stateProvider){
			// $stateProvider is from ui-router and is the method through which url routing is handled.
			$stateProvider
				.state('signup', {
					url: '/signup',
					// templateUrl is the html the component will use
					templateUrl: '/components/auth/signup.html',
					// controller indicates which controller will dictate the behavior of this view 
					controller: SignUpController,
					// controllerAs creates an alias so a developer doesn’t have to type SignUpController.<function orobject>
					controllerAs: 'ctrl',
					// bindToController binds the scope of the view to the scope of this controller and eliminates the need to use $scope.
					bindtoController: this
				});
		};

		signupConfig.$inject = ['$stateProvider'];
		// SignUpController has $state and UsersService injected into it
		function SignUpController($state, UsersService){
			// var vm = this; is how the binding of the controller to the view is completed
			var vm = this;
			// vm.user = {}; establishes an object to build the username and password inside.
			vm.user = {};
			// vm.message = “Sign up for an account!” is an example of expressions and how vm and this scope work together.
			vm.message = "Sign up for an account!";
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
	.directive('userlinks',
		function(){
			UserLinksController.$inject = ['$state', 'CurrentUser', 'SessionToken'];
			function UserLinksController($state, CurrentUser, SessionToken){
				var vm = this;
				vm.user = function(){
					return CurrentUser.get();
				};	

				vm.signedIn = function(){
					return !!(vm.user().id);
				};

				vm.logout = function(){
					CurrentUser.clear();
					SessionToken.clear();
					$state.go('signin');
				};
			}

			return{
				scope: {},
				controller: UserLinksController,
				controllerAs: 'ctrl',
				bindToController: true,
				templateUrl: '/components/auth/userlinks.html'
			};
		});
})();

		

(function(){
	angular.module('workoutlog.history',[
		'ui.router'
	])
	.config(historyConfig);
	historyConfig.$inject = ['$stateProvider'];
	function historyConfig($stateProvider){

		$stateProvider
			.state('history', {
				url: '/history',
				templateUrl: '/components/history/history.html',
				controller: HistoryController,
				controllerAs: 'ctrl',
				bindToController: this,
				resolve: {
					getUserLogs: [
						'LogsService',
						function(LogsService){
							return LogsService.fetch();
						}
					]
				}
			});
	}
	
	HistoryController.$inject = ['$state', 'LogsService'];
	function HistoryController($state, LogsService){
		var vm= this;
		vm.history = LogsService.getLogs();

		vm.delete = function(item){
			LogsService.deleteLogs(item);
		};

		vm.updateLog = (function(item){
			$state.go('logs/update', {'id' : item.id});
			});
	}
})();


// Notice how LogsService is injected and then implemented in this controller.  The history
// component is used to present the collection of logs.  Look inside vm.updateLog, $state.go has the
// route as the first argument but the second argument is an object with an id property.  This is how logs.js ‘knows” which log to get so it can be updated.

(function(){
	angular.module('workoutlog.define', [
		'ui.router'
	])
	.config(defineConfig);

	function defineConfig($stateProvider){

		$stateProvider
			.state('define', {
				url: '/define',
				templateUrl: '/components/define/define.html',
				controller: DefineController,
				controllerAs: 'ctrl',
				bindToController: this,
				resolve: [
					'CurrentUser', '$q', '$state',
					function(CurrentUser, $q, $state){
						var deferred = $q.defer();
						if (CurrentUser.isSignedIn()){
							deferred.resolve();
						} else {
							deferred.reject();
							$state.go('signin');
						}
						return deferred.promise;
					}
				]	
			});
	}
	
	defineConfig.$inject = [ '$stateProvider'];

	function DefineController($state, DefineService){
		var vm = this;
		vm.message = "Define a workout category here";
		vm.saved = false;
		vm.definition = {};
		vm.save = function(){
			DefineService.save(vm.definition)
				.then(function(){
					vm.saved = true;
					$state.go('logs')
				});
		};
	}
	DefineController.$inject = [ '$state', 'DefineService'];
})();

//  Resolve is built into Angular as a function that
// executes code prior to going to that route.  In this instance, the resolve is running functions to
// ensure that a user is actually logged in.  To do this, $q is injected (Angular’s way to build custom
// promises), $state is injected and CurrentUser.

(function(){
	angular.module('workoutlog.logs',[
		'ui.router'
	])
	.config(logsConfig);

	logsConfig.$inject = ['$stateProvider'];
	function logsConfig($stateProvider){

		$stateProvider
			.state('logs', {
				url: '/logs',
				templateUrl: '/components/logs/logs.html',
				controller: LogsController,
				controllerAs: 'ctrl',
				bindToController: this,
				resolve: {
					getUserDefinitions: [
						'DefineService',
						function(DefineService){
							return DefineService.fetch();
						}
					]
				}
			})
			.state('logs/update',{
				url: '/logs/:id',
				templateUrl: '/components/logs/log-update.html',
				controller: LogsController,
				controllerAs: 'ctrl',
				bindToController: this,
				resolve: {
					getSingleLog: function($stateParams, LogsService){
						return LogsService.fetchOne($stateParams.id);
					},
					getUserDefinitions: function(DefineService){
						return DefineService.fetch();
					}
				}
			});
	}

	LogsController.$inject = ['$state', 'DefineService', 'LogsService' ];
	function LogsController($state, DefineService, LogsService){
		var vm= this;
		vm.saved = false;
		vm.log = {};
		vm.userDefinitions = DefineService.getDefinitions();
		vm.updateLog = LogsService.getLog();
		vm.save = function(){
			LogsService.save(vm.log)
				.then(function(){
					vm.saved = true;
					$state.go('history');
				});
		};

		// Create an update funtion here
		vm.updateSingleLog = function(){
			var logtoUpdate = {
				id: vm.updateLog.id,
				desc: vm.updateLog.description,
				result: vm.updateLog.result,
				def: vm.updateLog.def
			}
			LogsService.updateLog(logtoUpdate)
				.then(function(){
					$state.go('history');
				});
		};
	}
})();

// New concepts in this file:
// $stateParams.id allows the application to pass the url and use that as a way to identify an individual 
// workout.  Notice in the .state(‘logs/update’) the ‘/:id’.  This is the variable that is passed to
// $stateParams.id.

// Notice on the .state(‘logs/update’) that there are two functions that occur on the resolve.  This
// allows the route to have access to the data of the log being edited.  Also note, that the resolve is
// getting all user definitions of a workout

(function(){
	angular.module('workoutlog')
		// SessionToken and API_BASE are dependencies for this factory service. API_BASE is established in app.js and sessiontoken.js will be built shortly.
		.factory('AuthInterceptor', ['SessionToken', 'API_BASE',
			function(SessionToken, API_BASE){
				return{
					request: function(config){
						// console.log(SessionToken);
						var token = SessionToken.get();
						// if statement above is essentially checking to see if there is a token and a url of API_BASE : Both of these are set in other files.
						if (token && config.url.indexOf(API_BASE) > -1) {
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
		.service('DefineService', DefineService);

		DefineService.$inject = [ '$http','API_BASE'];
		function DefineService($http, API_BASE){
			var defineService = this;
			defineService.userDefinitions = [];

			defineService.save = function(definition){
				return $http.post(API_BASE + 'definition',{
					definition: definition

				}).then(function(response){
					defineService.userDefinitions.unshift(response.data);
				});		
			};

			defineService.fetch = function(definition){
				return $http.get(API_BASE + 'definition')
					.then(function(response){
						defineService.userDefinitions = response.data;
				});
			};

			defineService.getDefinitions = function(){
				return defineService.userDefinitions;
			};
		}
})();
(function(){
	angular.module('workoutlog')
		.service('LogsService', LogsService);

		LogsService.$inject = ['$http' ,'API_BASE'];
		function LogsService($http, API_BASE, DefineService){
			var logsService = this;
			logsService.workouts = [];
			logsService.individualLog = {};
			// Saves the log
			logsService.save = function(log){
				return $http.post(API_BASE + 'log',{
					log: log
				})
				.then(
				function(response) {
					logsService.workouts.push(response);
				});
			};

			logsService.fetch = function(log){
				return $http.get(API_BASE + 'log')
					.then
					(function(response){
						logsService.workouts = response.data;
					});
			};

			logsService.getLogs = function(){
				return logsService.workouts;
			};


			logsService.deleteLogs = function(log){
				var logIndex = logsService.workouts.indexOf(log);
				logsService.workouts.splice(logIndex, 1);
				var deleteData = {log: log};
				return $http({
					method: 'DELETE',
					url: API_BASE + "log",
					data: JSON.stringify(deleteData),
					headers: {"Content-Type": "application/json"}
				});
			};

			logsService.fetchOne = function(log){
				// console.log(log);
				return $http.get(API_BASE + 'log/' + log)
					.then(function(response){
						logsService.individualLog = response.data;
					});
			};

			logsService.getLog = function(){
				return logsService.individualLog;
			};

			logsService.updateLog = function(logToUpdate){
				return $http.put(API_BASE + 'log', {log: logToUpdate});
			}
		}
})();

// There are several concepts to unpack in this file.  However, once understood, this is a conventional
// way to construct services.  At the top of the file, there is an empty array and an empty object. 
// Both of these are used to expose data to the rest of the application.  getLogs and getLog return
// these data types so they can be used in multiple controllers.  This service implements all HTTP
// verbs to implement a full CRUD application.

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
				console.log("Setting session token: ", token);
				$window.localStorage.setItem('sessionToken', token);
			};
 			// .prototype to attach the functions of .set / .get and .clear to the prototype chain having memory enhancements and follow conventional design patterns.
			SessionToken.prototype.get = function(){
				return this.sessionToken;
			};
 			// .prototype to attach the functions of .set / .get and .clear to the prototype chain having  memory enhancements and follow conventional design patterns.
			SessionToken.prototype.clear = function(){
				this.sessionToken = undefined;
				$window.localStorage.removeItem('sessionToken');
			};
			return new SessionToken();
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

			UsersService.prototype.create = function(user){
				var userPromise = $http.post(API_BASE + 'user', {
					user: user
				});

				userPromise.then(function(response){
					SessionToken.set(response.data.sessionToken);
					CurrentUser.set(response.data.user);
				});
				return userPromise;
			};

			UsersService.prototype.login = function(user){
				var loginPromise = $http.post(API_BASE + 'login',{
					user: user
				});

				loginPromise.then(function(response){

					SessionToken.set(response.data.sessionToken);
					CurrentUser.set(response.data.user);
				});
				return loginPromise;
			};
			return new UsersService();
		}]);
})();


//# sourceMappingURL=bundle.js.map
