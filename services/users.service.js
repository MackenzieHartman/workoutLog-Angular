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