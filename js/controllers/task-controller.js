app.controller('taskController', function($scope, $http, $rootScope, $uibModal){
    $scope.markAsDone = function() {
        var promise;
        if ($scope.task.is_done) {
            promise = $http.delete(API_ROOT + 'task/' + $scope.task.id + '/done');
        } else {
            promise = $http.put(API_ROOT + 'task/' + $scope.task.id + '/done');
        }
        promise.then(function(){
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    };
    $scope.deleteTask = function () {
        var promise = $http.delete(API_ROOT + 'task/' + $scope.task.id);
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
        promise.then(function(){
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    };
    $scope.renameTask = function () {
        var modal = $uibModal.open({
            templateUrl: 'js/templates/modal-rename-task.html',
            controller: 'ModalRenameTaskController',
            scope: $scope
        });
    }
});
