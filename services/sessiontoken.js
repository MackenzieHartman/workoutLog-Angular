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

