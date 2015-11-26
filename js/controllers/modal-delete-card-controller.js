app.controller('ModalDeleteCardController', function ($scope, $uibModalInstance, $http, $rootScope) {
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.deleteCard = function() {
        var promise = $http.delete(API_ROOT + 'card/' + $scope.card.id);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    }
});
