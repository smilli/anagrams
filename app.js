var anagramApp = angular.module('anagramApp', []);
anagramApp.controller('anagramCtrl', function ($scope, $http, $timeout) {
  $scope.anagrams = [];
  $scope.phrase = '';
  $scope.loading = false;
  $scope.formStyle = {
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)'
  }
  $http.get('cpd.json').success(function(cpd) {
    var ag = new AnagramGenerator(3, cpd);
    $scope.generateAnagrams = function(phrase) {
      $scope.loading = true;
      console.log('loaded');
      $scope.anagrams = [];
      $timeout(function() {
        $scope.anagrams = ag.generate(phrase, 3, 50, 5);
        if ($scope.anagrams.length == 0) {
          $scope.anagrams = ['Could not find any anagrams!'];
        }
        $scope.formStyle = {
          'padding': '30px 0',
        };
        $scope.phrase = '';
        $scope.loading = false;
      }, 10);
    };
  });
});
