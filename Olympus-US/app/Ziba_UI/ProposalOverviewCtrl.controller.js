'use strict';

(function () {
    function ProposalOverviewCtrl($timeout, $state, $scope, $rootScope, $log, sessionService, Proposal, Contract, managedModal, ProposalEmail, EmailDocusign, CashContract, DocusignStatus, DocusignUpdate, localStorageService, ProposalSign) {
        var self = this;
        self.proposaldisplay = 'active';
        self.contractdisplay = '';
        self.proposalsection = 'true';
        self.contractsection = '';
        self.email ='hidden';
        self.loading = true;
        self.addemailid = false;
        self.contractDisabled = false;
        self.homeowneremail = $rootScope.homeowneremail;
        self.salespersonemail = $rootScope.SalespersonEmail;
        self.proposaltitle = $rootScope.proposaltitle;
        var proposaldisplay = false;
        var contractdisplay = false;
        self.proposalsign = false;
        
        var retrievedObject = JSON.parse(localStorage.getItem('ls.ProposalTool'));
        
        function init(){
            
            var proposalobjct = {PricingQuoteId: '89898', ProposalID: '1234', Base64Image:'sample', Base64Graph: 'sample'};
            proposalobjct.PricingQuoteId = $rootScope.PricingQuoteId;
            proposalobjct.ProposalID = localStorageService.get('proposalID');
            proposalobjct.Base64Image = retrievedObject.Base64Image;
            proposalobjct.Base64Graph = "RU5ErkJggg==";
            
            //$timeout(function () {                
            
            Proposal.save(proposalobjct).$promise
                    .then(function(data){
                        proposaldisplay = true;
                        $scope.ProposalData = data.ProposalData;
                        var proposalURL = "data:application/pdf;base64," + data.ProposalData;
                        window.parent.document.getElementById("proposalpdf").src = proposalURL;
                        console.log('proposal --- passed ')  ;
                        if(contractdisplay)
                                    self.loading = false;
                    })
                    .catch(function () {                        
                        Proposal.save(proposalobjct).$promise
                            .then(function(data){
                                proposaldisplay = true;
                                $scope.ProposalData = data.ProposalData;
                                var proposalURL = "data:application/pdf;base64," + data.ProposalData;
                                window.parent.document.getElementById("proposalpdf").src = proposalURL;
                                console.log('proposal --- passed ')  ;
                                if(contractdisplay)
                                    self.loading = false;
                            })
                            .catch(function (error) {                        
                                self.loading = false;
                                alert("error in propopsal api");
                                console.log(error);
                            });
                    });
            
            var contractobjct = {PricingQuoteId: '89898', SunEdCustId:'9999'};
            contractobjct.PricingQuoteId = $rootScope.PricingQuoteId;
            contractobjct.SunEdCustId = $rootScope.SunEdCustId;
            
            if($rootScope.cashfinanceprog === 'Cash' && $rootScope.dealer === 'ID')
            {
                self.contractDisabled = true;
                $('#contractblock').css('display','none');
                contractdisplay = true;
                self.proposalsign = true;
            }
            else if($rootScope.cashfinanceprog === 'Cash' && $rootScope.dealer === 'SE')
            {
                CashContract.save(contractobjct).$promise
                    .then(function(response){
                        contractdisplay = true;
                        $scope.ContractData = response.Contract;
                        var contractURL = "data:application/pdf;base64," + response.Contract;
                        window.parent.document.getElementById("contractpdf").src = contractURL;
                        console.log('contract passed');
                        if(proposaldisplay)
                                    self.loading = false;
                    })
                    .catch(function () {                        
                        CashContract.save(contractobjct).$promise
                            .then(function(response){
                                contractdisplay = true;
                                $scope.ContractData = response.Contract;
                                var contractURL = "data:application/pdf;base64," + response.Contract;
                                window.parent.document.getElementById("contractpdf").src = contractURL;
                                console.log('contract passed');
                                if(proposaldisplay)
                                    self.loading = false;
                            })
                            .catch(function (error) {                        
                                self.loading = false;
                                alert("error in contract api");
                                console.log(error);
                            });
                    });
            }
            else
            {
                Contract.save(contractobjct).$promise
                        .then(function (response) {
                             contractdisplay = true;
                            $scope.ContractData = response.Contract;
                            var contractURL = "data:application/pdf;base64," + response.Contract;
                            window.parent.document.getElementById("contractpdf").src = contractURL;
                            console.log('contract passed');
                            if(proposaldisplay)
                                    self.loading = false;
                        })
                        .catch(function () {                            
                            Contract.save(contractobjct).$promise
                                    .then(function (response) {
                                         contractdisplay = true;
                                        $scope.ContractData = response.Contract;
                                        var contractURL = "data:application/pdf;base64," + response.Contract;
                                        window.parent.document.getElementById("contractpdf").src = contractURL;
                                        console.log('contract passed');
                                        if(proposaldisplay)
                                            self.loading = false;
                                    })
                                    .catch(function (error) {
                                        self.loading = false;
                                        alert("error in contract api");
                                        console.log(error);
                                    });
                        });
            }
            
            //}, 3000);
            
        }
        
        $timeout(function () { 
            init();
        }, 3000);
        
        function showcontract(){            
            self.proposaldisplay = '';
            self.contractdisplay = 'active'; 
            self.proposalsection = '';
            self.contractsection = 'true';
        }
        function showproposal(){            
            self.proposaldisplay = 'active';
            self.contractdisplay = '';  
            self.proposalsection = 'true';
            self.contractsection = '';
        }
        function showemailbox(){
            if(self.email === 'hidden')
                self.email = '';
            else
                self.email = 'hidden';
        }
        function showemail(){
            if(self.addemailid === false)
                self.addemailid = true;
            else
                self.addemailid = false;
        }
        function showErrorDialog(message) {
            $log.info('Opening error modal');
            var modalInstance = managedModal.open({
                templateUrl: 'app/main/errorModal.html',
                //size: 'lg',
                backdrop: 'static',
                controller: ['$scope', function ($scope) {
                    $scope.message = message;
                    $scope.dismiss = function () {
                        modalInstance.dismiss();
                    };
                }],
            windowClass: 'alert-modal'
            });

            modalInstance.result.then(function () {
                $log.info('Error modal dismissed');
            });
        }
        
        function validateEmail(){
            if((self.email).indexOf('@') === -1){
                showErrorDialog("Please enter a valid Email Address");
                self.email = '';
            }
            else if((self.email).indexOf('.') === -1){
                showErrorDialog("Please enter a valid Email Address");
                self.email = '';
            }
        }        
    
        function EmailProposal(){
            self.waitimplementer = true;
            var emailpayload = {};
            emailpayload.Email = $rootScope.homeowneremail;
            emailpayload.PricingQuoteId = $rootScope.PricingQuoteId + '_proposal.pdf';
            emailpayload.proposalDocBase64 = retrievedObject.Base64Image;
            
            ProposalEmail.save(emailpayload).$promise
                    .then(function () {
                        self.waitimplementer = false;
                        showErrorDialog("Email proposal: The proposal was sent to "+ $rootScope.homeowneremail);
                    })
                    .catch(function (error) {
                        self.waitimplementer = false;
                        showErrorDialog("error in proposal email");
                        console.log(error);
                    });
            
        }
        function EmailContract(){ 
            
            if((document.getElementById("checkbox2").checked) && self.email && (document.getElementById("checkbox3").checked) && (document.getElementById("checkbox1").checked)){
                SendContractMail(self.email);
                SendContracttoHO();
            }
            else if ((document.getElementById("checkbox1").checked) && (document.getElementById("checkbox2").checked))
                SendContracttoHO();           
            else if ((document.getElementById("checkbox1").checked) && self.email && (document.getElementById("checkbox3").checked)){
                SendContractMail(self.email);
                SendContracttoHO();
            }
            else if((document.getElementById("checkbox2").checked) && self.email && (document.getElementById("checkbox3").checked)){  
                SendContractMail(self.email);
                SendContracttoHO();
            }
            else if(self.email && document.getElementById("checkbox3").checked)
                SendContractMail(self.email);
            else if(document.getElementById("checkbox2").checked)   
                SendContracttoHO();
            else if ((document.getElementById("checkbox1").checked))
                SendContracttoHO();
           
        }
        function SendContracttoHO(){
            self.waitimplementer = true;
            EmailDocusign.save({PricingQuoteId: $rootScope.PricingQuoteId}).$promise
                        .then(function (data) {
                            self.waitimplementer = false;
                            console.log('sent for docusigning');
                            showErrorDialog('Email sent to homeowner');
                            $rootScope.envelopeId = data.envelopeId;
                        })
                        .catch(function (error) {
                            self.waitimplementer = false;
                            showErrorDialog("error in docusign");
                            console.log(error);
                        });
        }
        
        function SendContractMail(allemails){
            self.waitimplementer = true;
            var emailpayload = {};
            emailpayload.Email = allemails;
            emailpayload.PricingQuoteId = $rootScope.PricingQuoteId +'_contract.pdf';
            
            ProposalEmail.save(emailpayload).$promise
                    .then(function () {
                        self.waitimplementer = false;
                        showemailbox();
                        showErrorDialog("Contract email successfully sent to "+ allemails);
                    })
                    .catch(function (error) {
                        self.waitimplementer = false;
                        showErrorDialog("error in contract email");
                        console.log(error);
                    });             
        }
        
        function SignContract(){
           self.waitimplementer = true;
           if($rootScope.envelopeId){
                DocusignStatus.get({envelope: $rootScope.envelopeId}).$promise
                        .then(function (data){ 
                        if(data.Status === 'completed'){
                            self.waitimplementer = false;
                            showErrorDialog("Contract has already been signed"); 
                        }
                        else                
                            DocusignOpenInLink();                            
                        });                
            }
            else
                DocusignOpenInLink();
        }
        function SignProposal() {
            self.waitimplementer = true;
            if ($rootScope.envelopeId) {
                DocusignStatus.get({envelope: $rootScope.envelopeId}).$promise
                        .then(function (data) {
                            if (data.Status === 'completed') {
                                self.waitimplementer = false;
                                showErrorDialog("Proposal has already been signed");
                            } else
                                DocusignOpenInLinkProposal();
                        });
            } else
                DocusignOpenInLinkProposal();
        }
        function DocusignOpenInLinkProposal(){
            self.waitimplementer = true;
            ProposalSign.save({PricingQuoteId: $rootScope.PricingQuoteId, SunEdCustId: $rootScope.SunEdCustId, ProposalId :localStorageService.get('proposalID')}).$promise
                    .then(function (data){
                        self.waitimplementer = false;
                            console.log('Opening for docusign');
                            var docusignurl = data.url;
                            var win = window.open(docusignurl, '_blank');
                            win.focus();
                            $rootScope.envelopeId = data.envelopeId;
                    });
        }
        
        function DocusignOpenInLink(){
            self.waitimplementer = true;
            EmailDocusign.save({PricingQuoteId: $rootScope.PricingQuoteId, EmbeddedSigning : "true", ProposalId :localStorageService.get('proposalID')}).$promise
                    .then(function (data) {
                        self.waitimplementer = false;
                            console.log('Opening for docusign');
                            var docusignurl = data.url;
                            var win = window.open(docusignurl, '_blank');
                            win.focus();
                            $rootScope.envelopeId = data.envelopeId;
                            DocusignUpdate.save({pricing: $rootScope.PricingQuoteId, EnvId: data.envelopeId}).$promise
                                    .then(function (response) {

                                    });
                    })
                    .catch(function (error) {
                        self.waitimplementer = false;
                        showErrorDialog("Error in opening docusign");
                        console.log(error);
                    });
        }
                
        function downloadProposal() {

            var byteCharacters = atob($scope.ProposalData);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {type: "application/pdf"});
            saveAs(blob, "Proposal.pdf");
               
        }
        function downloadContract() {

            var byteCharacters = atob($scope.ContractData);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {type: "application/pdf"});
            saveAs(blob, "Contract.pdf");
        
        }
        
        self.SignProposal = SignProposal;
        self.downloadProposal = downloadProposal;
        self.downloadContract = downloadContract;
        self.SignContract = SignContract;
        self.EmailContract = EmailContract;
        self.EmailProposal = EmailProposal;
        self.validateEmail = validateEmail;        
        self.showErrorDialog = showErrorDialog;        
        self.showemail = showemail;
        self.showemailbox = showemailbox;
        self.showproposal = showproposal;
        self.showcontract = showcontract;

        }

    angular
        .module('dealerportal.proposaloverview', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('ProposalOverviewCtrl', ['$timeout', '$state', '$scope','$rootScope', '$log', 'sessionService', 'Proposal', 'Contract', 'managedModal','ProposalEmail','EmailDocusign', 'CashContract', 'DocusignStatus', 'DocusignUpdate', 'localStorageService', 'ProposalSign', ProposalOverviewCtrl]);
})();