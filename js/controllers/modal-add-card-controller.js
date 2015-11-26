app.controller('ModalAddCardController', function($scope, $uibModalInstance, $http, $rootScope){
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function() {
        var body = {};
        body.name = $scope.card.name;
        var promise = $http.post(API_ROOT + 'team/' + TEAM_HASH + '/' + SPRINT_ID + '/card', body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    };
});
