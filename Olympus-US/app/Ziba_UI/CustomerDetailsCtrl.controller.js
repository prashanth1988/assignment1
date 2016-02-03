'use strict';

(function () {
    function CustomerDetailsCtrl($window, $state, $scope, $rootScope, $log, sessionService, GoogleMapApi, geoCodeService, CustomerDetailsfact, Homeowner, DeleteProposal, CustomerNote, managedModal, CreditCheck, proposalModalService, ProposalTitle, homeownerService, usSpinnerService, localStorageService, DocusignStatus) {
        var self = this;
        self.VMtosubmit ='';
        self.checked = false;
        self.classForExpandButton = '';
        self.classForDeleteButton = '';
        self.classForUserNotes = '';
        self.classForProposalDelete = 'false';
        self.hideproposal = 'false';
        self.SunEdCustId = '';
        self.loading = true;      
        self.isDisabled = false;
        self.updateclicked = 0;
        $rootScope.designtofinance = 1;
        $rootScope.yield = 0;
        $rootScope.totalprod = 0;
        $rootScope.systemsize = 0;
        $rootScope.proposalId;
        self.editarrow = false;
	self.PartnerType = localStorageService.get('se-user').profile.PartnerType;
        if(typeof self.PartnerType === 'undefined' || _.isEmpty(self.PartnerType)){
            self.PartnerType = 'IntegratedDealer';
        }
        
        self.spinnerOptions = {
            lines: 8, // The number of lines to draw
            length: 0, // The length of each line
            width: 4, // The line thickness
            radius: 7, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 10, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#333', // #rgb or #rrggbb or array of colors
            speed: 1.5, // Rounds per second
            trail: 0, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9 // The z-index (defaults to 2000000000)
        };
        
        var googleMaps;
        var autocompleteInstance;
        var googleMapsInitialized = GoogleMapApi.then(function (gmaps) {
                googleMaps = gmaps;
                return googleMaps;
            });    
        var retrievedObject = JSON.parse(localStorage.getItem('ls.se-user'));
        if(retrievedObject.profile.PartnerId === '226055')
            $rootScope.mediumtype = 'Sales Engine';
        else
            $rootScope.mediumtype = 'Integrated Dealer';
      	
	var retrievedObject = JSON.parse(localStorage.getItem('ls.se-user'));
        if(retrievedObject.profile.PartnerType === 'SALES ENGINE (Seller)'){
            $rootScope.mediumtype = 'Sales Engine';
        }else
            $rootScope.mediumtype = 'Integrated Dealer';
        
    function init(){        
        var suncustid = JSON.parse(localStorage.getItem('SunEdCustId'));
        cleanupLocalStorage();
        CustomerDetailsfact.get({id: suncustid}).$promise
                .then(function(response){
                    //console.log(response);
                    if(response.message){
                        self.loading = false;
                        showErrorDialog(response.message);
                    }
                    else
                    {
                    self.customerName = response.FirstName + ' ' + response.LastName ;
                    $rootScope.customerFirstName = response.FirstName;
                    $rootScope.customerLastName = response.LastName;
                    $rootScope.customerName = self.customerName;
                    $rootScope.PartnerType = response.PartnerType;
                    self.addressLine1 = response.Street;
                    $scope.prevaddress = response.Street;
                    self.addressLine2 = response.City + ' , ' + response.State + ' , ' + response.Zip ;
                    $rootScope.addr1 = self.addressLine1;
                    $rootScope.addr2 = self.addressLine2;
                    $rootScope.zip = response.Zip;
                    self.setter = response.Setter;
                    self.closer = response.Closer;
                    self.setter = response.Setter;
                    self.proposaldesk = response.ProposalDesk;
                    self.email = response.Email;
                    $rootScope.homeowneremail = response.Email;
                    $rootScope.SalespersonEmail = response.SalespersonEmail;
                    self.phone = response.HomePhone;
                    if(response.CoHFirstName !== null)
                    self.cohomeowner = response.CoHFirstName + ' ' + response.CoHLastName ;
                    if(response.ProposalDetails[0])
                    self.proposals = response.ProposalDetails;  
                    if(response.NotesDetails[0])
                    self.CustomerNotes = response.NotesDetails[0].Notes;
                    $rootScope.SunEdCustId = response.SunEdCustId;
                    self.SunEdCustId = response.SunEdCustId;
                    $rootScope.LatLng = response.LatLng;
                    $rootScope.PartnerId = response.PartnerId;
                    $rootScope.SalesPersonId = response.SalesPersonId;
                    self.agreementstatus = response.ContractStatus;
		    self.PurchaseType = response.PurchaseType;
                    self.FinancingProgram = response.FinancingProgram;
                    if(self.FinancingProgram === 'WGSW'){
                        self.PurchaseType = 'Lease - Monthly(WGSW)';
                    }
                    if(self.FinancingProgram === 'SunEdison Mosaic SCION'){
                        self.PurchaseType = 'Loan Mosaic';
                    }
                    if(self.FinancingProgram === 'SunEdison Mosaic SCION With Signature Series'){
                        self.PurchaseType = 'Loan Mosaic Signature';
                    }
                    if(response.CreditStatus === null)
                        self.creditcheckstatus = 'Not started yet';
                    else if(response.CreditStatus === 'In Process' || response.CreditStatus === 'Initiated')
                        self.creditcheckstatus = 'Initiated';
                    else if(response.CreditStatus === 'Accepted' || response.CreditStatus === 'CC Passed')
                        self.creditcheckstatus = 'Credit Check Passed';
                    else if(response.CreditStatus === 'CC Failed')
                        self.creditcheckstatus = 'Credit Check Failed';
                    
                     self.VMtosubmit = {PartnerId: response.PartnerId,
                            SalesPersonId: response.SalesPersonId,
                            FirstName: response.FirstName,
                            LastName: response.LastName,
                            Street: response.Street,
                            City: response.City,
                            State: response.State,
                            Zip: response.Zip,
                            LatLng: response.LatLng,
                            Email: response.Email,
                            HomePhone: response.phone,
                            PurchaseType: response.PPA
                            //FinancingProgram: response.FinancingProgram
                        };
                        
                        self.draftProposals = [];
                        for (var i = 0; i < response.ProposalDetails.length; i++) {
                            if (response.ProposalDetails[i].Status === 'Draft') {                                
                                self.draftProposals.push(response.ProposalDetails[i]);
                                var index = self.draftProposals.length-1;
                                //var dummyproposalId = (response.ProposalDetails[i].ProposalId).split('_');
                                //$rootScope.ProposalId = response.ProposalDetails[i].ProposalId;
                                //$rootScope.PricingQuoteId = response.ProposalDetails[i].PricingQuoteId;
                                var temp = new Date(response.ProposalDetails[i].LastUpdatedTime);
                                var temp1 = temp.toUTCString();
                                var currentdate = temp1.slice(5,22);
                                self.draftProposals[index].timetodisplay = currentdate;
                                if(response.ProposalDetails[i].Payment  === null)
                                    self.draftProposals[index].Payment = '-';
                                if(response.ProposalDetails[i].SystemSize  === null)
                                    self.draftProposals[index].SystemSize = '-';
                                if(response.ProposalDetails[i].FinanceProgram  === null)
                                    self.draftProposals[index].FinanceProgram = '-';
                                if(response.ProposalDetails[i].AgreementStatus  === null)
                                    self.draftProposals[index].AgreementStatus = '-';
                                self.draftProposals[index].editarrow = false;
                                self.draftProposals[index].edit = true;
                                self.draftProposals[index].titlechange = '';
                            }
                        } 
                        
                        self.completedProposals = [];
                        for (var i = 0; i < response.ProposalDetails.length; i++) {
                            if (response.ProposalDetails[i].Status === "Completed") {                                
                                self.completedProposals.push(response.ProposalDetails[i]);
                                var index = self.completedProposals.length-1;
                                //var dummyproposalId = (response.ProposalDetails[i].ProposalId).split('_');                                
                                //self.completedProposals[index].dummyproposalId = dummyproposalId[1];
                                //$rootScope.ProposalId = response.ProposalDetails[i].ProposalId;
                                //$rootScope.PricingQuoteId = response.ProposalDetails[i].PricingQuoteId;
                                var temp = new Date(response.ProposalDetails[i].LastUpdatedTime);
                                var temp1 = temp.toUTCString();
                                var currentdate = temp1.slice(5,22);
                                self.completedProposals[index].timetodisplay = currentdate;
                                if(response.ProposalDetails[i].Payment  === null)
                                    self.completedProposals[index].Payment = '-';
                                if(response.ProposalDetails[i].SystemSize  === null)
                                    self.completedProposals[index].SystemSize = '-';
                                if(response.ProposalDetails[i].FinanceProgram  === null)
                                    self.completedProposals[index].FinanceProgram = '-';
                                if(response.ProposalDetails[i].AgreementStatus  === null)
                                    self.completedProposals[index].AgreementStatus = '-';
                                self.completedProposals[index].editarrow = false;
                                self.completedProposals[index].edit = true;
                                self.completedProposals[index].titlechange = '';
                            }
                        }
			for(var i=0; i<self.completedProposals.length; i++){
                            if (self.completedProposals[i].ContractDocusignEnvId && self.completedProposals[i].AgreementStatus === "Contract Generated") {
                                DocusignStatus.get({envelope: self.completedProposals[i].ContractDocusignEnvId}).$promise
                                    .then(function (data) {
                                        for(var k=0; k<self.completedProposals.length; k++){
                                            if(self.completedProposals[k].ContractDocusignEnvId === data.ContractDocusignEnvId){
                                                if (data.Status === 'sent') {
                                                    self.completedProposals[k].AgreementStatus = "Contract sent for signature";
                                                } else if (data.Status === 'completed') {
                                                    self.completedProposals[k].AgreementStatus = "Contract signed";
                                                }
                                                break;
                                            }
                                        }
                                    })
                                    .catch(function (e) {
                                        $log.error(e);
                                    });
                            }
                        }
                        $rootScope.FinancingProgram = response.FinancingProgram;
                        $rootScope.homeownerDetails = {latitude:response.LatLng.Lat, 
                           longitude:response.LatLng.Lng, SunEdCustId: response.SunEdCustId, 
                           Zip: response.Zip, FinancingProgram: response.FinancingProgram, 
                           addr1: self.addressLine1, addr2: self.addressLine2, customerName:$rootScope.customerName};       
                        
                        $rootScope.homeownerState = response.State;
                        self.loading = false;
                    }
                    
                    })
                    .catch(function (error) {                        
                        self.loading = false;
                        console.log(error);
                        $state.go('homeowners');
                    });                 
                            
    }
    
    init();
         
    function customertofinance(proposalId, PricingQuoteId){
        
        localStorageService.add('proposalToClone', proposalId);
        localStorageService.add('proposalID', proposalId);
        localStorageService.add('bypassProposalIDGeneration', true);
        $rootScope.PricingQuoteId = PricingQuoteId;
        $rootScope.proposalId = proposalId;
        $rootScope.designtofinance = 0;
        $state.go('financeoption');
        
    }
    
    function updatehomeowner(){
        if(!self.isDisabled)
        {            
        self.VMtosubmit ={};
        if(self.cohomeowner)
        {
            self.coowner = self.cohomeowner.split(/(\s+)/);
            self.VMtosubmit['CoHFirstName'] = self.coowner[0];
            self.VMtosubmit['CoHLastName'] = self.coowner[2];
        }
                self.addr = self.addressLine2.split(',');
                self.VMtosubmit['Email'] = self.email;
                self.VMtosubmit['HomePhone'] = self.phone;
                self.VMtosubmit['Street'] = self.addressLine1;
                self.VMtosubmit['City'] =  self.addr[0];
                self.VMtosubmit['State'] = self.addr[1];
                self.VMtosubmit['Zip'] = self.addr[2];
                self.VMtosubmit['SunEdCustId'] = $rootScope.SunEdCustId;
                self.VMtosubmit['LatLng'] = $rootScope.LatLng;
                self.VMtosubmit['PartnerId'] = $rootScope.PartnerId;
                self.VMtosubmit['SalesPersonId'] = $rootScope.SalesPersonId;
		self.VMtosubmit['PurchaseType'] = self.PurchaseType;
                self.VMtosubmit.ByPassModsolar = 'true';
                populateFinancingProgram(self.VMtosubmit);
                if(self.VMtosubmit.PurchaseType === 'Lease - Monthly(WGSW)'){
                    self.VMtosubmit.PurchaseType = 'Lease - Monthly';
                }
                if(self.VMtosubmit.PurchaseType === 'Loan Mosaic' || self.VMtosubmit.PurchaseType === 'Loan Mosaic Signature'){
                    self.VMtosubmit.PurchaseType = 'Loan';
                }
                if(self.setter)
                    self.VMtosubmit['Setter'] =self.setter;
                else
                    self.VMtosubmit['Setter'] ='';
                if(self.closer)
                    self.VMtosubmit['Closer'] =self.closer;
                else
                    self.VMtosubmit['Closer'] ='';
                if(self.proposaldesk)
                    self.VMtosubmit['ProposalDesk'] =self.proposaldesk;
                else
                    self.VMtosubmit['ProposalDesk'] ='';
                //self.VMtosubmit['NotesDetails'] = self.CustomerNotes;
                $rootScope.homeownerState = self.addr[1];
                
            self.isDisabled = true;  
            Homeowner.update({id: $rootScope.SunEdCustId}, self.VMtosubmit).$promise
                    .then(function (response) {                   
                        
                        //syncModelProperties(vmToSubmit.model, originalVM.model);
                        // this could break if the back end is returning something different that we PUT.
                        //return originalVM;
                        if(response.message){
                             //self.isDisabled = false;
                            showErrorDialog(response.message);
                        }
                        else
                        {
                        if($scope.prevaddress !== self.addressLine1){
                        $rootScope.homeownerDetails = {latitude:$scope.homeownerVM.latitude, 
                           longitude:$scope.homeownerVM.longitude, SunEdCustId: $rootScope.SunEdCustId, 
                           Zip: (self.addr[2]), FinancingProgram: $rootScope.FinancingProgram, 
                           addr1: self.addressLine1, addr2: self.addressLine2, customerName:$rootScope.customerName};
                        }
                        else
                        {
                            $rootScope.homeownerDetails = {latitude:$rootScope.LatLng.Lat, 
                           longitude:$rootScope.LatLng.Lng, SunEdCustId: $rootScope.SunEdCustId, 
                           Zip: (self.addr[2]), FinancingProgram: $rootScope.FinancingProgram, 
                           addr1: self.addressLine1, addr2: self.addressLine2, customerName:$rootScope.customerName};
                        }
                        self.isDisabled = false;
                        showErrorDialog("Lead Update: Lead Information has been succefully updated");
                        console.log('lead details saved');
                        }
                        })
                        .catch (function () {
                            self.isDisabled = false;
                            showErrorDialog("Update lead api failed");
                        });
            
        }
    }

    function populateFinancingProgram(VMtosubmit) {
            switch (VMtosubmit.PurchaseType) {
                case 'Lease - Monthly':
                    self.VMtosubmit.FinancingProgram = 'PPA 1.0';
                    self.FinancingProgram = 'PPA 1.0';
                    break;
                case 'Lease - Monthly(WGSW)':
                    self.VMtosubmit.FinancingProgram = 'WGSW';
                    self.FinancingProgram = 'WGSW';
                    break;
                case 'Loan':
                    self.VMtosubmit.FinancingProgram = 'WJB';
                    self.FinancingProgram = 'WJB';
                    break;
                case 'Cash':
                    self.VMtosubmit.FinancingProgram = '';
                    self.FinancingProgram = '';
                    break;
                case 'Undecided':
                    self.VMtosubmit.FinancingProgram = '';
                    self.FinancingProgram = '';
                    break;
                case 'PPA':
                    self.VMtosubmit.FinancingProgram = 'PPA 1.0';
                    self.FinancingProgram = 'PPA 1.0';
                    break;
                case 'Loan Mosaic':
                    self.VMtosubmit.FinancingProgram = 'SunEdison Mosaic SCION';
                    self.FinancingProgram = 'SunEdison Mosaic SCION';
                    break;
                case 'Loan Mosaic Signature':
                    self.VMtosubmit.FinancingProgram = 'SunEdison Mosaic SCION With Signature Series';
                    self.FinancingProgram = 'SunEdison Mosaic SCION With Signature Series';
                    break;
            }
        }



    function saveCustomerNotes(){
        CustomerNote.save({Notes: self.CustomerNotes, SunEdCustId:$rootScope.SunEdCustId});
    }
    
    function openDesginPage(){
        //$rootScope.PricingQuoteId;
        $rootScope.PricingQuoteId = '';
        $rootScope.proposalId = '';
           $state.go('designpage');
    }
       
    function openCloseDetails(id){  
            for(var i=0; i<self.proposals.length; i++){
                if(self.proposals[i].PricingQuoteId === id){
                    if(!self.proposals[i].open || self.proposals[i].open === ''){
                        self.proposals[i].open = 'open';
                    }else{
                        self.proposals[i].open = '';
                    }
                }
            }
    }
    
    function deleteProposalbox(id){   
            for(var i=0; i<self.proposals.length; i++){
                if(self.proposals[i].PricingQuoteId === id){
                    if(!self.proposals[i].delete || self.proposals[i].delete === ''){
                        self.proposals[i].open = '';
                        self.proposals[i].delete = 'delete';
                    }else{
                        self.proposals[i].delete = '';
                    }
                }
            }
    }
    
    function canceldeleteProposal(id){         
          /*  if(self.classForDeleteButton === 'delete'){            
                self.classForDeleteButton = '';
            }  */
            for(var i=0; i<self.proposals.length; i++){
                if(self.proposals[i].PricingQuoteId === id){
                    if(self.proposals[i].delete === 'delete'){
                        self.proposals[i].delete = '';
                    }
                }
            }
    }
    
    function deleteProposal(id){
        for(var i=0; i<self.proposals.length; i++){
                if(self.proposals[i].PricingQuoteId === id){
                    if(self.proposals[i].delete === 'delete'){
                        self.proposals[i].delete = '';
                        self.proposals[i].hideproposal ='true';
                    }
                }
            }
            DeleteProposal.delete({proposalid: id}).$promise
                    .then(function(){
                        console.log('proposal deleted '+id);                    
                        showErrorDialog("Delete Proposal: Proposal has been successfully deleted");
                    });
    }
   
    function OpenProposalpage(proposalId, proposaltitle, financeprog, envelopeId, pay,ProposalId){
            $rootScope.PricingQuoteId = proposalId;
            $rootScope.proposaltitle = proposaltitle;
            $rootScope.cashfinanceprog = financeprog;
            $rootScope.envelopeId = envelopeId;
            $rootScope.proposalpayment = pay;
            $rootScope.ProposalId = ProposalId;
            $state.go('proposalview');
        }
        
        function tochangetitle(id) {
            for (var i = 0; i < self.proposals.length; i++) {
                if (self.proposals[i].PricingQuoteId === id) {
                    if (!self.proposals[i].titlechange  || self.proposals[i].titlechange === '') {
                        self.proposals[i].editarrow = true;
                        self.proposals[i].edit = false;
                        self.proposals[i].titlechange = 'tochange';                       
                        //document.getElementById("proposaltitle").focus();
                         $scope.isFocused = !$scope.isFocused;
                        
                    }
                    else
                    {
                        var title = self.proposals[i].Title;
                        ProposalTitle.update({proposalId: id}, {"ProposalTitle": title}).$promise
                                .then(function () {
                                    console.log('Proposal title chnaged ' + id);
                                    //showErrorDialog("Proposal title chnaged");
                                });
                        self.proposals[i].titlechange ='';
                        self.proposals[i].edit = true;
                        self.proposals[i].editarrow = false;
                         //$scope.isFocused = !$scope.isFocused;
                    }
                }
            }
        }
        
        
    function enableUserNotes(){         
            if(self.classForUserNotes === ''){            
                self.classForUserNotes = 'to-change';
            }  
    }
    
    
    function prepLatLongModel(latLng) {
            if (!$scope.homeownerVM) {
                $scope.homeownerVM = {
                    latitude: 0,
                    longitude: 0
                };
            }
            if ($scope.homeownerVM.latitude && _.isObject($scope.homeownerVM.latitude)) {
                if (!$scope.homeownerVM.latitude) {
                    $scope.homeownerVM.latitude = 0;
                }
                if (!$scope.homeownerVM.longitude) {
                    $scope.homeownerVM.longitude = 0;
                }
            }

            return latLng;
        }
    
    function initializeAddressAutoComplete() {
            googleMapsInitialized.then(function() {
                autocompleteInstance = new googleMaps.places.Autocomplete((document.getElementById('addressLine1')), { types: ['geocode'] });

                googleMaps.event.addListener(autocompleteInstance, 'place_changed', function() {
                    var place = autocompleteInstance.getPlace();
                    var addressModel = geoCodeService.parsePlaceObject(place);
                    self.addressLine1 = addressModel.Street;
                    self.addressLine2 = addressModel.City + ', ' + addressModel.State + ', ' + addressModel.Zip;
                    //console.log(addressModel);
                    geoCodeService
                        .latitudeAndLongitude(addressModel.Street, addressModel.City, addressModel.State, addressModel.Zip)
                        .then(prepLatLongModel)
                        .then(function (latLng) {
                            $scope.homeownerVM.latitude = latLng.latitude;
                            $scope.homeownerVM.longitude = latLng.longitude;
                        });
                    _.assign($scope.homeownerVM.model, addressModel);
                });
            });
        }
        
        function geolocate() {
            geoCodeService.geolocate()
                .then(function (geolocation) {
                    var bounds = new googleMaps.LatLngBounds(geolocation, geolocation);
                    autocompleteInstance.setBounds(bounds);
                });
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
            if((self.email).indexOf('@') === -1)
                showErrorDialog("Please enter a valid Email Address");
            else if((self.email).indexOf('.') === -1)
                showErrorDialog("Please enter a valid Email Address");
        } 
        
        function stopSpinner(spinnerId) {
            return usSpinnerService.stop(spinnerId);
        }

        function startSpinner(spinnerId) {
            return usSpinnerService.spin(spinnerId);
        }
        
        function startCreditCheck(){
            
            self.creditCheckInProcess = true;
            startSpinner($rootScope.SunEdCustId);
            //$('#resendblock').css('display','none');
            if($rootScope.sendresendflag === 'send'){
                $('#sendblock').css('display','none');
                $('#spinblock').css('display','block');
            }
            else
            {
                $('#resendblock').css('display','none');
                $('#spinblock').css('display','block');  
            }
       
            CreditCheck.save({'SunEdCustId': $rootScope.SunEdCustId, SalesPersonId: localStorageService.get('se-user').profile.NSInternalId}).$promise
                    .then(function (data) {
                        self.creditCheckInProcess = false;
                        stopSpinner($rootScope.SunEdCustId);
                        if(data.CreditCheckStatus === "Initiated")
                            self.creditcheckstatus = 'Initiated';
                        showErrorDialog('Credit Check has been successfully initiated');
                        if($rootScope.sendresendflag === 'send'){
                            $('#sendblock').css('display', 'block');
                            $('#spinblock').css('display', 'none');
                        }
                        else
                        {
                            $('#resendblock').css('display', 'block');
                            $('#spinblock').css('display', 'none');
                        }
                    })
                    .catch(function (error) {
                        showErrorDialog('Credit Check request has been failed to post because '+ error.CreditCheckStatus);
                        self.creditCheckInProcess = false;
                        stopSpinner($rootScope.SunEdCustId);
                        if($rootScope.sendresendflag === 'send'){
                            $('#sendblock').css('display', 'block');
                            $('#spinblock').css('display', 'none');
                        }
                        else
                        {
                            $('#resendblock').css('display', 'block');
                            $('#spinblock').css('display', 'none');
                        }
                    });
        }
        
        function initiateCreditCheck() {
            
            $rootScope.sendresendflag;
            if (self.creditCheckInProcess) {
                $log.warn('Credit check is currently in process.  Cannot activate again.');
                return;
            }
            self.creditCheckInProcess = true;
            startSpinner($rootScope.SunEdCustId);

            if (self.creditcheckstatus === 'In Process' || self.creditcheckstatus === 'Initiated') {
                var modalInstance = managedModal.open({
                    templateUrl: 'app/navbar/resendCreditCheckMsg.html',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal-call-resendCreditCheck-message',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.cancel = function (val) {
                                $modalInstance.dismiss('cancel');
                                if(!val){
                                    stopSpinner($rootScope.SunEdCustId);
                                    self.creditCheckInProcess = false;
                                }
                            };
                            $scope.proceed = function (value) {
                                if(value){
                                    if(self.PartnerType === 'SALES ENGINE (Seller)'){
                                        chooseCreditCheck($rootScope.homeownerVM);
                                    }else{
                                        startCreditCheck();
                                    }
                                }else{
                                    stopSpinner($rootScope.SunEdCustId);
                                    self.creditCheckInProcess = false;
                                }
                                $scope.cancel(true);
                            };
                        }]
                });
            }
            else {
                if(self.PartnerType === 'SALES ENGINE (Seller)'){
                    chooseCreditCheck();
                }else{
                    startCreditCheck();
                }
            }
        }
        
        function chooseCreditCheck(homeownerVM){
            var modalInstance = managedModal.open({
                    templateUrl: 'app/navbar/chooseCreditCheck.html',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal-call-resendCreditCheck-message',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.cancel = function (val) {
                                $modalInstance.dismiss('cancel');
                                if(!val){
                                    stopSpinner($rootScope.SunEdCustId);
                                    self.creditCheckInProcess = false;
                                }
                            };
                            $scope.proceed = function (value) {
                                if(value){
                                    if($('input[name="loanType"]:checked').val() === 'Loan-Mosaic'){
                                        if(self.FinancingProgram !== 'SunEdison Mosaic SCION' && self.FinancingProgram !== 'SunEdison Mosaic SCION With Signature Series'){
                                            confirmLeadUpdate();
                                        }else{
                                            startCreditCheck();
                                            $scope.cancel(true);
                                        }
                                    }else{
                                        if(self.FinancingProgram !== 'PPA 1.0'){
                                            confirmLeadUpdate();
                                        }else{
                                            startCreditCheck();
                                            $scope.cancel(true);
                                        }
                                    }
                                }else{
                                    stopSpinner($rootScope.SunEdCustId);
                                    self.creditCheckInProcess = false;
                                    $scope.cancel(true);
                                }
                            };
                        }]
                });
        }
        
        function confirmLeadUpdate(homeownerVM){
            var modalInstance = managedModal.open({
                    templateUrl: 'app/navbar/confirmUpdateLead.html',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal-call-resendCreditCheck-message',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.homeOwnerName = self.customerName;
                        $scope.currentPurchaseType = self.PurchaseType;
                        $scope.calledFromCustomerDetailsPage = true;
                        $scope.cancel = function (val) {
                            $modalInstance.dismiss('cancel');
                            if(!val){
                                stopSpinner($rootScope.SunEdCustId);
                                self.creditCheckInProcess = false;
                            }
                        };
                        $scope.proceed = function (value) {
                            if(value){
                                $scope.cancel(true);
                            }else{
                                $scope.cancel(true);
                            }
                                    
                        };
                    }]
            });
        }

        function openProposalModal(){
            proposalModalService.openDesignPage($scope.homeownerDetails );
        }
        
        function customerlist(){
            $state.go('homeowners');
            $window.location.reload();
        }
        
        function cloneProposal(pricingQuoteID){
            localStorageService.add('proposalToClone', pricingQuoteID);
        }
        
        function cleanupLocalStorage(){
            localStorageService.remove('proposalToClone');
            localStorageService.remove('proposalID');
            localStorageService.remove('bypassProposalIDGeneration');
            localStorageService.remove('ProposalTool');
        }
    
    self.cleanupLocalStorage = cleanupLocalStorage;
    self.cloneProposal = cloneProposal;
    self.startSpinner = startSpinner;
    self.stopSpinner = stopSpinner;
    self.startCreditCheck = startCreditCheck;
    self.customerlist = customerlist;    
    self.openProposalModal = openProposalModal;   
    self.initiateCreditCheck = initiateCreditCheck;   
    self.validateEmail = validateEmail;
    self.saveCustomerNotes = saveCustomerNotes;
    self.showErrorDialog = showErrorDialog;
    self.tochangetitle = tochangetitle;    
    self.OpenProposalpage = OpenProposalpage;    
    self.customertofinance = customertofinance;
    self.geolocate = geolocate;
    self.initializeAddressAutoComplete = initializeAddressAutoComplete;
    self.updatehomeowner = updatehomeowner; 
    self.deleteProposal = deleteProposal;
    self.enableUserNotes = enableUserNotes;    
    self.canceldeleteProposal = canceldeleteProposal;
    self.deleteProposalbox = deleteProposalbox;
    self.openCloseDetails = openCloseDetails;
    self.openDesginPage = openDesginPage;
    //self.dragdrop = dragdrop;
    
    }

    angular
        .module('dealerportal.customerDetails', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('CustomerDetailsCtrl', ['$window', '$state', '$scope','$rootScope', '$log', 'sessionService', 'uiGmapGoogleMapApi', 'geoCodeService', 'CustomerDetailsfact','Homeowner', 'DeleteProposal', 'CustomerNote', 'managedModal', 'CreditCheck', 'proposalModalService','ProposalTitle','homeownerService', 'usSpinnerService', 'localStorageService', 'DocusignStatus', CustomerDetailsCtrl]);
})();
