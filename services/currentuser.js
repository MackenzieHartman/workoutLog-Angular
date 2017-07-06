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