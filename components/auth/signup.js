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