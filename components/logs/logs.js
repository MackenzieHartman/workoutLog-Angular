(function(){
	angular.module('workoutlog.logs',[
		'ui.routConfig'
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
	funtion LogsController($state, DefineService, LogsService){
		var vm= this;
		vm.saved = false;
		vm.log = {};
		vm.userDefinitions = DefineService.getUserDefinitions();
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
