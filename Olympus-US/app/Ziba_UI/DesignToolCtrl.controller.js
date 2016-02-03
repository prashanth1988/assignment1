'use strict';

(function () {
    function DesignToolCtrl($timeout, $sce, $state, $scope, $rootScope, $window, sessionService, DesignPage, FinanceDetails, localStorageService) {
        
        $scope.loading = true;
                
        function init(){
            
            $rootScope.utilityLseid = $("#utilityinput :selected").val();                                
            $rootScope.designtofinance = 1;
            $rootScope.PricingQuoteId = '';
            
            var url = $window.location.href;
            var temp = url.slice('/').split('/');
            var mainurl = temp[2];
            if(mainurl === "localhost")
                mainurl = "localhost/Olympus-US";
            
            $scope.proposalURL = $sce.trustAsResourceUrl('http://'+mainurl+'/ProposalTool/Proposal/NewDesign.html?lat=' + $rootScope.homeownerDetails.latitude + '&lng=' + $rootScope.homeownerDetails.longitude + '&OID=' + localStorageService.get('se-sessionToken') + '&SunEdCustId=' + $rootScope.homeownerDetails.SunEdCustId + '&Zipcode=' + $rootScope.homeownerDetails.Zip +  '&addr1=' + $rootScope.homeownerDetails.addr1 + '&addr2=' + $rootScope.homeownerDetails.addr2 + '&customerName=' + $rootScope.homeownerDetails.customerName);
                      
             $timeout(function () {
                $scope.loading = false;
            }, 4000);      
             
        }
        
        init();
        
        }

    angular
        .module('dealerportal.designtool', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('DesignToolCtrl', ['$timeout', '$sce', '$state', '$scope','$rootScope', '$window', 'sessionService', 'DesignPage', 'FinanceDetails','localStorageService', DesignToolCtrl]);
})();