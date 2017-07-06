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
