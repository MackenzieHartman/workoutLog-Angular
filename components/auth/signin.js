(function(){
	angular
		.module('workoutlog.auth.signin', ['ui.router'])
		.config(signinConfig);

		funtion. signinConfig($stateProvider){
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

