app.controller('ModalRenameTaskController', function ($scope, $uibModalInstance, $http, $rootScope) {
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function() {
        var body = {};
        body.name = $scope.task.newName;
        var promise = $http.put(API_ROOT + 'task/' + $scope.task.id, body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    }
});
