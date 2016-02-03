'use strict';

(function () {
    function FinanceOptionsCtrl($timeout, $state, $scope, $rootScope, $log, sessionService, FinanceDetails, DesignSave, FinanceCalc, DesignDetails, DeleteProposal, managedModal, Payment, LoanPayment, localStorageService, Incentives, FinanceCalcV1) {
        var self = this;
        self.utility = false;
        self.analysis = false;
        self.openutility = '';
        self.openanalysis = '';
        self.cancel = '';
        //self.proposaltitle = $rootScope.customerFirstName + "'s proposal";        
        self.loading = true;
        self.spinnersaving = false;
        self.savingdone = false;  
        self.saveDisabled = false;
        var cashflagSE = true;
        var cashssflagSE = true;
        var mosaicflag = true;
        var mosaicssflag = true;
        var leaseflag = true;
        var ppaflag =true;
        var retrievedObject; 
        var leaseescalatorrate;
        var ppaescalatorrate;
        var mosaicterm;
        var mosaicssterm;
        var cashcalcflag = false;
        $scope.cash_totalproduction = 0;
        $scope.cashss_totalproduction = 0;
        $scope.lease_totalproduction = 0;
        $scope.ppa_totalproduction = 0;
        $scope.ppa_totalproduction = 0;
        $rootScope.cashfinanceprog ='';
        var LeasePayments = [];
        var MosaicPayments = [];
        var MosaicssPayments = [];
        var PPAPayments = [];
        var financeinfo = [];
        var CashPaymentsSE = [];
        var CashssPaymentsSE = [];
        var clonedProposal = null;
        self.showincentive = false;
        var firstincentivecall = true;
        $scope.kwhtowattflag = false;
        $scope.watttokwhflag = false;
        self.buildbutton = true;
        $scope.cashsavingsflag = true;
        $scope.cashsssavingsflag = true;
        $scope.mosaicsavingsflag = true;
        $scope.mosaicsssavingsflag = true;
        $scope.leasesavingsflag = true;
        $scope.ppasavingsflag = true;
        $scope.UpfrontRebateAssumptionsMax = 0;
        $scope.UpfrontRebateAssumptions = 0;
        var escalatorKwhWattflag = 0;
        
        if($rootScope.mediumtype === 'Sales Engine'){
            self.dealertypeview = true;
            $rootScope.dealer = 'SE';
        }
        else{
            self.dealertypeview = false;
            $rootScope.dealer = 'ID';
        }
        
        function init(){                        
                    
            $scope.custom = true;
            self.SE_checked= 11;
            self.ID_checked= 1; 
            $rootScope.envelopeId = "";
            $rootScope.proposaltitle = self.proposaltitle;
            if($rootScope.designtofinance === 1){                
                retrievedObject = localStorageService.get('ProposalTool');//JSON.parse(localStorage.getItem('ProposalTool'));
                self.proposaltitle = retrievedObject.proposaltitle; 
                designtofinance();               
            }
            else
                customertofinance();      
        }
                
        init();
        
        function designtofinance(){           
                        
            self.panelarrays = [];            
            for(var i=0; i<retrievedObject.Array.length; i++){
                self.panelarrays.push(retrievedObject.Array[i]);
                var annualshade = 0;
                for(var j=0; j<12;j++)
                    annualshade = +annualshade + +retrievedObject.Array[i].Shading[j];
                annualshade = annualshade/12;
                self.panelarrays[i].AnnualShading = (annualshade).toFixed(0);                
            }
            self.customername = (retrievedObject.customername).replace(/%20/g, " ");
            self.presolarconsumption = numberWithCommas(retrievedObject.annualusage);
            self.avgcostofelectricity = parseFloat(retrievedObject.avgcostofelectricity);
            self.presolarmonthly = numberWithCommas((retrievedObject.presolarutility));
            self.postsolarmonthly = numberWithCommas((retrievedObject.postsolarutility));
            self.billsavings = numberWithCommas((retrievedObject.presolarutility - retrievedObject.postsolarutility));
            self.utilityprovider = retrievedObject.utilityprovider;
            if(retrievedObject.taxrate)
                self.taxrate = parseInt(retrievedObject.taxrate);
            else
                self.taxrate = 0;
            self.totalprod = numberWithCommas((retrievedObject.year1production));
            self.systemsize = parseFloat(retrievedObject.systemsize).toFixed(2);
            self.yield = numberWithCommas((retrievedObject.systemyield));
            self.annualoffset = numberWithCommas((retrievedObject.offset));            
            self.proposaltitle = retrievedObject.proposaltitle;
            $rootScope.numberofarray = parseInt(retrievedObject.Array.length);
            $rootScope.arraydetails = self.panelarrays;
            $rootScope.presolarconsumption = removeCommaFromNumbers(retrievedObject.annualusage);
            $rootScope.presolarbill = retrievedObject.presolarutility;
            $rootScope.postsolarbill = retrievedObject.postsolarutility;
            $rootScope.totalprod = parseInt(retrievedObject.year1production);
            $rootScope.systemsize = parseFloat(retrievedObject.systemsize).toFixed(2);
            $rootScope.yield = parseInt(retrievedObject.systemyield).toFixed(2);
            $rootScope.utilityLseid = retrievedObject.utilityLseid;
            $rootScope.taxrate = retrievedObject.utilitytaxrate;
            
            financedetailscall();
             //self.loading = false;
         }
         
        function customertofinance() {

            DesignDetails.get({proposalId: $rootScope.PricingQuoteId}).$promise
                    .then(function (response) {
                        console.log('get success on design');
                        //var dummyArraytoAdd = {};
                        //dummyArraytoAdd.Array = response.Array;
                        
                        var ProposalTool = {
                        'proposaltitle': response.Title,
                        'customername': (response.CustomerDetails.customername).replace(/%20/g, " "),
                        'address': response.CustomerDetails.address,
                        'annualusage': response.Quote.annualusage,
                        'presolarutility': response.Quote.CurrentUtilityCost,
                        'postsolarutility': response.Quote.PostSolarUtilityCost,
                        'systemsize': response.Quote.systemsize,
                        'year1production': response.Quote.Year1Production,
                        'offset': response.DesignDetails.offset,
                        'systemyield': response.Quote.systemyield,
                        'utilityprovider': response.Quote.utilityprovider,
                        'utilityLseid': response.Quote.UtilityIndex,
                        'currenttariff':response.DesignDetails.currenttariff,
                        'aftertariff': response.DesignDetails.aftertariff,
                        'avg$kwh': response.DesignDetails.averagecost,
                        'utilitytaxrate': response.DesignDetails.UtilityTaxRate,
                        'solarpanel': response.System.ModuleId,
                        'invertername':response.System.InverterManufacturer,
                        'invertermanufacturer': response.System.InverterManufacturer,
                        'invertertype': response.System.invertertype,
                        'invertermodel':response.Array[0].InverterModel,
                        'panelmodel' : response.Array[0].ModuleType,
                        'InverterQuantity' : response.System.InverterQuantity,
                        'MasterTariffId': response.DesignDetails.MasterTariffId,
                        'Array' : response.Array,
                        'Base64Image' : response.DesignDetails.Base64Image,
                        'MonthlyUsage': response.Quote.MonthlyUsage,
                        'MonthlyBill': response.Quote.MonthlyBill,
                        'PanelCount': response.DesignDetails.PanelCount,
                        'InverterDerate' : response.Quote.Derate,
                        'State' : response.CustomerDetails.State,
                        'ZipCode' : response.CustomerDetails.ZipCode,
                        'systemSizeACW' : response.DesignDetails.systemSizeACW
                    };
                    
                    //localStorage.setItem('ls.ProposalTool', JSON.stringify(ProposalTool));
                    localStorageService.add('ProposalTool',     ProposalTool);
                    retrievedObject = localStorageService.get('ProposalTool');//JSON.parse(localStorage.getItem('ls.ProposalTool'));
                        self.panelarrays = [];
                        for (var i = 0; i < response.Array.length; i++) {
                            self.panelarrays.push(response.Array[i]);
                        }                        
                        self.customername = retrievedObject.customername;
                        self.presolarconsumption = numberWithCommas(response.Quote.YearlyUsage);
                        self.avgcostofelectricity = (response.Quote.presolarutility / response.Quote.YearlyUsage).toFixed(2);
                        self.presolarmonthly = numberWithCommas((response.Quote.CurrentUtilityCost).toFixed(2));
                        self.postsolarmonthly = numberWithCommas((response.Quote.PostSolarUtilityCost).toFixed(2));
                        self.billsavings = numberWithCommas(response.Quote.CurrentUtilityCost - response.Quote.PostSolarUtilityCost);
                        self.utilityprovider = response.Quote.utilityprovider;
                        if (retrievedObject.taxrate)
                            self.taxrate = parseInt(retrievedObject.taxrate);
                        else
                            self.taxrate = 0;
                        self.totalprod = numberWithCommas(response.Quote.Year1Production);
                        self.systemsize = response.Quote.systemsize;                        
                        self.yield = numberWithCommas(response.Quote.systemyield);
                        self.annualoffset = (response.DesignDetails.offset);
                        self.proposaltitle = response.Title;
                        $rootScope.numberofarray = self.panelarrays.length;
                        $rootScope.arraydetails = self.panelarrays; 
                        $rootScope.presolarconsumption = removeCommaFromNumbers(response.Quote.YearlyUsage);
                        $rootScope.presolarbill = response.Quote.CurrentUtilityCost;
                        $rootScope.postsolarbill = response.Quote.PostSolarUtilityCost;
                        $rootScope.totalprod = response.Quote.Year1Production;
                        $rootScope.systemsize = response.Quote.systemsize;
                        $rootScope.yield = response.Quote.systemyield;
                        $rootScope.utilityLseid = response.Quote.UtilityIndex;
                        $rootScope.taxrate = response.Quote.TaxRate;

                        financedetailscall();
                    })
                    .catch(function (error) {
                        self.loading = false;
                        showErrorDialog('Design api get call failed '+ error);
                    });
        }
            
        
        $scope.togglePrice = function() {
            $scope.custom === false ? true: false;

        };
        
        function financedetailscall(){
            
            FinanceDetails.get({id: $rootScope.SunEdCustId , partnerid :$rootScope.PartnerId}).$promise
                        .then(function(response){                          
                            financeinfo = response; 
                    
                            self.cash_escalator = [];
                            self.cashss_escalator = [];                            
                            self.mosaic_escalator = [];
                            self.lease_escalator = []; 
                            self.ppa_escalator = []; 
                            self.ppa_Array = [];
                            self.lease_Array = [];
                            self.mosaic_Array = [];
                            self.mosaicss_Array = [];
                            self.solarown_Array = [];
                            self.ppapaymentCallMade = false;
                            
                            //saurabh
                            /*$('.cash_column').css('display', 'block');
                            $('.cashss_column').css('display', 'block');
                            $('.lease_column').css('display', 'block');
                            $('.ppa_column').css('display', 'block');
                            $('.mosaic_column').css('display', 'block');
                            $('.mosaicss_column').css('display', 'block');*/
                            
                          for(var i=0; i<response.results.length; i++){                             
                             
                             if(response.results[i].eligible_state === $rootScope.homeownerState && response.results[i].purchase_type === 'Cash' && response.results[i].finance_program_type === '' && 
                                parseInt(response.results[i].utility_LSE_Id) === parseInt($rootScope.utilityLseid)) {
                                    $scope.cashsavingsflag = false;
                                        cashsavings(i);
                             }  
                             if(response.results[i].eligible_state === $rootScope.homeownerState && response.results[i].purchase_type === 'Cash' && response.results[i].finance_program_type === 'Cash-SAI' && 
                                parseInt(response.results[i].utility_LSE_Id) === parseInt($rootScope.utilityLseid)) {
                                    $scope.cashsavingsflag = false;
                                        CashSavingsSE(i);
                             }  
                             
                             if(response.results[i].eligible_state === $rootScope.homeownerState && response.results[i].purchase_type === 'Cash' && response.results[i].finance_program_type === 'CSS' &&
                                parseInt(response.results[i].utility_LSE_Id) === parseInt($rootScope.utilityLseid) ) {
                                    $scope.cashsssavingsflag = false;
                                        cashWithsignature(i);
                             }
                             
                             if(response.results[i].eligible_state === $rootScope.homeownerState && response.results[i].purchase_type === 'Cash' && response.results[i].finance_program_type === 'CSS-SAI' &&
                                parseInt(response.results[i].utility_LSE_Id) === parseInt($rootScope.utilityLseid) ) {
                                    $scope.cashsssavingsflag = false;
                                        CashssSavingsSE(i);
                             }
                             
                             if(response.results[i].eligible_state === $rootScope.homeownerState && response.results[i].purchase_type === 'Loan' && response.results[i].finance_program_type === 'SunEdison Mosaic SCION' &&
                                parseInt(response.results[i].utility_LSE_Id) === parseInt($rootScope.utilityLseid) && parseInt(response.results[i].yield_min) < parseInt($rootScope.yield) && parseInt(response.results[i].yield_max) > parseInt($rootScope.yield) && (self.dealertypeview)) {                                
                                    $scope.mosaicsavingsflag = false;
                                    MosaicSavings(i);                                
                             }   
                             
                             if(response.results[i].eligible_state === $rootScope.homeownerState && response.results[i].purchase_type === 'Loan' && response.results[i].finance_program_type === 'SunEdison Mosaic SCION With Signature Series' &&
                                parseInt(response.results[i].utility_LSE_Id) === parseInt($rootScope.utilityLseid) && parseInt(response.results[i].yield_min) < parseInt($rootScope.yield) && parseInt(response.results[i].yield_max) > parseInt($rootScope.yield) && (self.dealertypeview)) {                                
                                    $scope.mosaicsssavingsflag = false;
                                    MosaicSSSavings(i);
                             } 
                             
                             if(response.results[i].eligible_state === $rootScope.homeownerState && response.results[i].purchase_type === 'Lease - Monthly' && response.results[i].finance_program_type === 'PPA 1.0' &&
                                parseInt(response.results[i].utility_LSE_Id) === parseInt($rootScope.utilityLseid) && parseInt(response.results[i].yield_min) < parseInt($rootScope.yield) && parseInt(response.results[i].yield_max) > parseInt($rootScope.yield)) {
                                    $scope.leasesavingsflag = false;
                                    LeaseSavings(i);                               
                             }
                             
                             if(response.results[i].eligible_state === $rootScope.homeownerState && response.results[i].purchase_type === 'PPA' && response.results[i].finance_program_type === 'PPA 1.0' &&
                                parseInt(response.results[i].utility_LSE_Id) === parseInt($rootScope.utilityLseid) && parseFloat(response.results[i].yield_min) < parseFloat($rootScope.yield) && parseFloat(response.results[i].yield_max) > parseFloat($rootScope.yield)) {
                                    $scope.ppasavingsflag = false;
                                    PPASavings(i);
                            }
                            if(response.results[i].message === 'No HomeOwner Found in Region')
                                showErrorDialog('The partnerID associated with your login is not allowed to see any finance programs');
				self.buildbutton = false;
                    }  
                                            
                    console.log('finance call');
                    self.loading = false; 
                })
                .catch(function (error) {                        
                    self.loading = false;
                    showErrorDialog('NetSuite FinanceProgram api failed to load data');
                    $state.go('customerdetails');
                });
            }
        function incentivecall(){
            if(self.dealertypeview){  
                        if($('#SE_cash_column').css('display') !== 'none') 
                            financeprogchange(11);
                        else if($('#SE_cashss_column').css('display') !== 'none') 
                            financeprogchange(12);
                        else if($('#SE_mosaic_column').css('display') !== 'none') 
                            financeprogchange(13);
                        else if($('#SE_mosaicss_column').css('display') !== 'none') 
                            financeprogchange(14);
                        else if($('#SE_lease_column').css('display') !== 'none') 
                            financeprogchange(15);
                        else if($('#SE_ppa_column').css('display') !== 'none') 
                            financeprogchange(16);
                    }
                    else
                    {
                        if($('#ID_cash_column').css('display') !== 'none') 
                            financeprogchange(1);
                        else if($('#ID_cashss_column').css('display') !== 'none') 
                            financeprogchange(2);
                        if($('#ID_lease_column').css('display') !== 'none') 
                            financeprogchange(4);
                        else if($('#ID_ppa_column').css('display') !== 'none') 
                            financeprogchange(5);
                    }
        }
        function cashsavings(i){
            
            $('.cash_column').css('display', 'block');
            $('.cash_column').css('border-right', '1px solid #cccccc');
            if(cashcalcflag){
                //$scope.SE_cash_$watt = parseFloat(self.SE_cash_$watt);
                $scope.ID_cash_$watt = parseFloat(self.ID_cash_$watt);
            }
            else{
                //$scope.SE_cash_$watt = parseFloat(financeinfo.results[i].SE_$_Watt);
                //self.SE_cash_$watt = parseFloat(financeinfo.results[i].SE_$_Watt);
                $scope.ID_cash_$watt = parseFloat(financeinfo.results[i].ID_$_Watt);
                self.ID_cash_$watt = parseFloat(financeinfo.results[i].ID_$_Watt);
            }

            var annualsaving = 0;
            var tempsaving = 0;
            var wattvalue = 0;
            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
            var tempprod = prod1;
            prod1 = (prod1 * 0.95).toFixed(0);            
            var prod2 = tempprod;
            var production = 0;
            var finalpresolar = parseFloat($rootScope.presolarbill).toFixed(2);
            var finalpostsolar = parseFloat($rootScope.postsolarbill).toFixed(2);
            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
            var year1saving = parseFloat(presolarannual - postsolarannual).toFixed(2);  
            
            for (var j = 1; j < 20; j++)
            {
                var temp_prod = (tempprod * 0.007).toFixed(0);
                tempprod = parseFloat(+tempprod - +temp_prod).toFixed(0);
                prod2 = (prod2 * 0.95).toFixed(0);;
                production = parseInt(+production + +prod2).toFixed(0);
                prod2 = tempprod;
                var temp_pre = (presolarannual * 0.034).toFixed(2);
                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                finalpresolar = (+finalpresolar + +presolarannual);
                var temp_post = (postsolarannual * 0.034).toFixed(2);
                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                finalpostsolar = (+finalpostsolar + +postsolarannual);
                var tempsaving = parseFloat(+presolarannual - +postsolarannual).toFixed(2);
                annualsaving = parseInt(+annualsaving + +tempsaving).toFixed(2);

            }            
            annualsaving = parseInt(+year1saving + +annualsaving).toFixed(0);
            
            var systemcost = (270 * retrievedObject.PanelCount * $scope.ID_cash_$watt).toFixed(0);                
            var totalcost = (+finalpostsolar + +systemcost).toFixed(0);  
            var finalsavings = (+finalpresolar - +totalcost).toFixed(0);  
            $scope.cash_totalproduction = (+production + +prod1).toFixed(2);
            if(!cashcalcflag){
                //self.SE_cash_$kwh = parseFloat(($scope.SE_cash_$watt * ($rootScope.systemsize * 1000)) / $scope.cash_totalproduction).toFixed(2);
                self.ID_cash_$kwh = parseFloat(($scope.ID_cash_$watt * ($rootScope.systemsize * 1000)) / $scope.cash_totalproduction).toFixed(2);
            }
            //self.SE_cash_cashprice = numberWithCommas(systemcost);
            //self.SE_cash_savings = numberWithCommas(finalsavings);
            self.ID_cash_cashprice = numberWithCommas(systemcost);
            self.ID_cash_savings = numberWithCommas(finalsavings);
            
            $scope.cashsavingsflag = true;
            if($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                self.buildbutton = false;
            }
            if(cashcalcflag){
                self.buildbutton = false;
                cashcalcflag = false;
            }
        }
        
        function cashWithsignature(i){
            $('.cashss_column').css('display', 'block');
            $('.cahsss_column').css('border-right', '1px solid #cccccc');
            if(cashcalcflag){
                //$scope.SE_cashss_$watt = parseFloat(self.SE_cashss_$watt);
                $scope.ID_cashss_$watt = parseFloat(self.ID_cashss_$watt);
            }
            else{
                //$scope.SE_cashss_$watt = parseFloat(financeinfo.results[i].SE_$_Watt);
                //self.SE_cashss_$watt = parseFloat(financeinfo.results[i].SE_$_Watt);
                $scope.ID_cashss_$watt = parseFloat(financeinfo.results[i].ID_$_Watt);
                self.ID_cashss_$watt = parseFloat(financeinfo.results[i].ID_$_Watt);
            }
           var annualsaving = 0;
            var tempsaving = 0;
            var wattvalue = 0;
            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
            var tempprod = prod1;
            prod1 = (prod1 * 0.95);            
            var prod2 = tempprod;
            var production = 0;
            var finalpresolar = parseFloat($rootScope.presolarbill).toFixed(2);
            var finalpostsolar = parseFloat($rootScope.postsolarbill).toFixed(2);
            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
            var year1saving = parseFloat(presolarannual - postsolarannual).toFixed(2);                         
                                
            for (var j = 1; j < 20; j++)
            {
                var temp_prod = (tempprod * 0.007).toFixed(0);
                tempprod = parseFloat(+tempprod - +temp_prod).toFixed(0);
                //tempprod = prod2;
                prod2 = (prod2 * 0.95);
                production = parseInt(+production + +prod2).toFixed(0);
                prod2 = tempprod;
                var temp_pre = (presolarannual * 0.034).toFixed(2);
                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                finalpresolar = (+finalpresolar + +presolarannual);
                var temp_post = (postsolarannual * 0.034).toFixed(2);
                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                finalpostsolar = (+finalpostsolar + +postsolarannual);
                var tempsaving = parseFloat(+presolarannual - +postsolarannual).toFixed(2);
                annualsaving = parseInt(+annualsaving + +tempsaving).toFixed(2);
            }            
            annualsaving = parseInt(+year1saving + +annualsaving).toFixed(0);
            var systemcost = (270 * retrievedObject.PanelCount * $scope.ID_cashss_$watt).toFixed(0);                
            var totalcost = (+finalpostsolar + +systemcost).toFixed(0);  
            var finalsavings = (+finalpresolar - +totalcost).toFixed(0); 
            $scope.cashss_totalproduction = (+production+ +prod1).toFixed(0);
            console.log('Cashss total production -- '+ $scope.cashss_totalproduction);
            if(!cashcalcflag){
                //self.SE_cashss_$kwh = parseFloat(($scope.SE_cashss_$watt * ($rootScope.systemsize * 1000)) / $scope.cashss_totalproduction).toFixed(2);
                self.ID_cashss_$kwh = parseFloat(($scope.ID_cashss_$watt * ($rootScope.systemsize * 1000)) / $scope.cashss_totalproduction).toFixed(2);
            }
            //self.SE_cashss_cashprice = numberWithCommas(systemcost);
            //self.SE_cashss_savings = numberWithCommas(finalsavings);
            self.ID_cashss_cashprice = numberWithCommas(systemcost);
            self.ID_cashss_savings = numberWithCommas(finalsavings);
            $scope.cashsssavingsflag = true;
            if($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                self.buildbutton = false;
            }
            if(cashcalcflag){
                self.buildbutton = false;
                cashcalcflag = false;
            }
        }
        
        function CashSavingsSE(i){
            $('.cash_column').css('display', 'block');
            $('.cash_column').css('border-right', '1px solid #cccccc');
                 
            if (cashflagSE)
            {
                var Payload_cash =
                        {
                            'Quote': {
                                'LoanStartDate': '10/3/2015',
                                'PricePerWatt': financeinfo.results[i].SE_$_Watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': 20,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': "No",
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };
                        
                LoanPayment.save(Payload_cash).$promise
                        .then(function (data) {
                            var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length-5; k++)
                            {
                                var temp = ((data.LoanPayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            CashPaymentsSE = dummyarray;      

                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +CashPaymentsSE[0]).toFixed(2);
                            
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.007).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +CashPaymentsSE[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.cash_totalproduction = (+production + +prod1).toFixed(2);                            
                                self.SE_cash_$watt = parseFloat(financeinfo.results[i].SE_$_Watt);
                                self.SE_cash_$kwh = parseFloat(($rootScope.systemsize * 1000) * self.SE_cash_$watt / ($scope.cash_totalproduction )).toFixed(2);
                            
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" Cash SE FinalSaving - " + finalsaving);
                            self.SE_cash_savings = numberWithCommas(finalsaving);
                            self.SE_cash_cashprice = (270 * retrievedObject.PanelCount * self.SE_cash_$watt).toFixed(0);  
                            $scope.cashsavingsflag = true;
                            if($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                                self.buildbutton = false;
                            }
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for cash SE');
                            self.buildbutton = false;
                        });
                    cashflagSE = false;
            }
        }
        function CashssSavingsSE(i){
            $('.cashss_column').css('display', 'block');
            $('.cashss_column').css('border-right', '1px solid #cccccc');
            if (cashssflagSE)
            {
                var Payload_cashss =
                        {
                            'Quote': {
                                'LoanStartDate': '10/3/2015',
                                'PricePerWatt': financeinfo.results[i].SE_$_Watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': 20,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': "Yes",
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };
                        
                LoanPayment.save(Payload_cashss).$promise
                        .then(function (data) {
                            var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length-5; k++)
                            {
                                var temp = ((data.LoanPayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            CashssPaymentsSE = dummyarray;      
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +CashssPaymentsSE[0]).toFixed(2);
                            
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.007).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +CashssPaymentsSE[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.cashss_totalproduction = (+production + +prod1).toFixed(2);                            
                            self.SE_cashss_$watt = parseFloat(financeinfo.results[i].SE_$_Watt);
                            self.SE_cashss_$kwh = parseFloat(($rootScope.systemsize * 1000) * self.SE_cashss_$watt / ($scope.cashss_totalproduction )).toFixed(2);
                            
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" CashSS SE FinalSaving - " + finalsaving);
                            self.SE_cashss_savings = numberWithCommas(finalsaving);
                            self.SE_cashss_cashprice = (270 * retrievedObject.PanelCount * self.SE_cashss_$watt).toFixed(0);  
                            $scope.cashsssavingsflag = true;
                            if($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                                self.buildbutton = false;
                            }
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for cash SE');
                            self.buildbutton = false;
                        });
                    cashssflagSE = false;
            }
        }
        function MosaicSavings(i){
            
            $('.mosaic_column').css('display', 'block');
            $('.mosaic_column').css('border-right', '1px solid #cccccc');

            if (financeinfo.results[i].loan_term) {
                var temp = {};
                temp.loanterm = (parseInt(financeinfo.results[i].loan_term));
                mosaicterm = temp.loanterm;
                temp.$watt = (parseFloat(financeinfo.results[i].SE_$_Watt));
                temp.financeprogram = 'Mosaic';
                self.mosaic_Array.push(temp);
            }
            
            if (mosaicflag)
            {
                var Payload_mosaic =
                        {
                            'Quote': {
                                'LoanStartDate': '10/3/2015',
                                'PricePerWatt': self.mosaic_Array[0].$watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': self.mosaic_Array[0].loanterm,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': "No",
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };
                        
                self.mosaicpaymentCallMade = true;
                LoanPayment.save(Payload_mosaic).$promise
                        .then(function (data) {
                             var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length-5; k++)
                            {
                                var temp = ((data.LoanPayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            MosaicPayments = dummyarray;      

                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +MosaicPayments[0]).toFixed(2);
                            console.log(0 + " mosaic Presolar - " + presolarannual);
                            console.log(0 + " mosaic Postsolar - " + postsolarannual);
                            console.log(0 + " mosaic Saving - " + year1saving);
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.007).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +MosaicPayments[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.mosaic_totalproduction = (+production + +prod1).toFixed(2);                            
                            if(self.dealertypeview){
                                self.SE_mosaic_$watt = parseFloat(financeinfo.results[i].SE_$_Watt);
                                self.SE_mosaic_$kwh = parseFloat(($rootScope.systemsize * 1000) * self.SE_mosaic_$watt / ($scope.mosaic_totalproduction )).toFixed(2);
                            }
                            else{
                                self.ID_mosaic_$watt = parseFloat(financeinfo.results[i].ID_$_Watt);
                                self.ID_mosaic_$kwh = parseFloat(($rootScope.systemsize * 1000) * self.ID_mosaic_$watt / ($scope.mosaic_totalproduction )).toFixed(2);
                            }
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" Mosaic FinalSaving - " + finalsaving);
                            self.SE_mosaic_savings = numberWithCommas(finalsaving);
                            self.ID_mosaic_savings = numberWithCommas(finalsaving);
                            $scope.mosaicsavingsflag = true;
                            if ($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                                self.buildbutton = false;
                            }
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for mosaic');
                            self.buildbutton = false;
                        });
                    mosaicflag = false;
            }
        }
        
        function MosaicSSSavings(i){             
            
            $('.mosaicss_column').css('display', 'block');
            $('.mosaicss_column').css('border-right', '1px solid #cccccc');
            if (financeinfo.results[i].loan_term) {
                var temp = {};
                temp.loanterm = (parseFloat(financeinfo.results[i].loan_term));
                mosaicssterm = temp.loanterm;
                temp.$watt = (parseFloat(financeinfo.results[i].SE_$_Watt));
                temp.financeprogram = 'MosaicSS';
                self.mosaicss_Array.push(temp);
            }
            
            if (mosaicssflag)
            {
                var Payload_mosaicss =
                        {
                            'Quote': {
                                'LoanStartDate': '10/3/2015',
                                'PricePerWatt': self.mosaicss_Array[0].$watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': self.mosaicss_Array[0].loanterm,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': "Yes",
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };
                        
                self.mosaicsspaymentCallMade = true;
                LoanPayment.save(Payload_mosaicss).$promise
                        .then(function (data) {
                            var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length-5; k++)
                            {
                                var temp = ((data.LoanPayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            MosaicssPayments = dummyarray;      
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +MosaicssPayments[0]).toFixed(2);
                            
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.007).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +MosaicssPayments[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.mosaicss_totalproduction = (+production + +prod1).toFixed(2);                            
                            if(self.dealertypeview){
                                self.SE_mosaicss_$watt = parseFloat(financeinfo.results[i].SE_$_Watt);
                                self.SE_mosaicss_$kwh = parseFloat(($rootScope.systemsize * 1000) * self.SE_mosaicss_$watt / ($scope.mosaicss_totalproduction )).toFixed(2);
                            }
                            else{
                                self.ID_mosaicss_$watt = parseFloat(financeinfo.results[i].ID_$_Watt);
                                self.ID_mosaicss_$kwh = parseFloat(($rootScope.systemsize * 1000) * self.ID_mosaicss_$watt / ($scope.mosaicss_totalproduction )).toFixed(2);
                            }
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" Mosaicss FinalSaving - " + finalsaving);
                            self.SE_mosaicss_savings = numberWithCommas(finalsaving);
                            self.ID_mosaicss_savings = numberWithCommas(finalsaving);
                            $scope.mosaicsssavingsflag = true;
                            if($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                                self.buildbutton = false;
                            }
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for mosaic Signature Series');
                            self.buildbutton = false;
                        });
                                               
                    mosaicssflag = false;
            }
            
        }
        
        function LeaseSavings(i){
            self.loading = true;
            $('.lease_column').css('display', 'block');
            $('.lease_column').css('border-right', '1px solid #cccccc');
            
            if (financeinfo.results[i].escalator) {
                var temp = {};
                temp.escalator = (parseFloat(financeinfo.results[i].escalator));

                if (self.dealertypeview)
                    temp.$kwh = (parseFloat(financeinfo.results[i].SE_$_KWH));
                else
                    temp.$kwh = (parseFloat(financeinfo.results[i].ID_$_KWH));
                temp.financeprogram = 'Lease';
                self.lease_Array.push(temp);
                //$scope.leaseescalator = self.lease_Array[0].escalator;
            }  
                                
            if (leaseflag)
            {
                var Payload_Lease =
                        {
                            'Quote': {
                                'PPARate': self.lease_Array[0].$kwh,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': $rootScope.PartnerType,
                                'Year1Production': retrievedObject.year1production,
                                'CustomerPrepayment': "0",
                                'UpfrontRebateAssumptions': "0",
                                'UpfrontRebateAssumptionsMax': "0",
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,
                                'PeriodicRentEscalation': (financeinfo.results[i].escalator / 100).toFixed(4),
                                'SubstantialCompletionDate': "11/10/2015",
                                'CurrentUtilityCost': retrievedObject.presolarutility,
                                'PostSolarUtilityCost': retrievedObject.postsolarutility,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode,
                                'LastYear': 20
                            }
                        };
                        
                self.leasepaymentCallMade = true;
                Payment.save(Payload_Lease).$promise
                        .then(function (data) {
                             var dummyarray = [];
                            for (var k = 0; k < data.LeasePayments.length; k++)
                            {
                                temp = ((data.LeasePayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            LeasePayments = dummyarray;      

                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +LeasePayments[0]).toFixed(2);
                            //var year1saving = parseInt(saving - LeasePayments[0]).toFixed(2);
                            leaseescalatorrate = parseFloat(self.lease_Array[0].escalator / 100).toFixed(4);
                            //globalescalator_lease = leaseescalatorrate ;
                            console.log(0 + " Lease Presolar - " + presolarannual);
                            console.log(0 + " Lease Postsolar - " + postsolarannual);
                            console.log(0 + " Lease Saving - " + year1saving);
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.007).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +LeasePayments[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                                
                                /*console.log(j + " Lease Presolar - " + presolarannual);
                                console.log(j + " Lease Postsolar - " + postsolarannual);
                                console.log(j + " Lease Saving - " + annualsaving);*/
                            }
                            $scope.lease_totalproduction = (+production + +prod1).toFixed(2);                            
                            if(self.dealertypeview){
                                self.SE_lease_$kwh = parseFloat(financeinfo.results[i].SE_$_KWH);
                                self.SE_lease_$watt = parseFloat($scope.lease_totalproduction * self.SE_lease_$kwh / ($rootScope.systemsize * 1000)).toFixed(2);                                
                            }
                            else{
                                self.ID_lease_$kwh = parseFloat(financeinfo.results[i].ID_$_KWH);
                                self.ID_lease_$watt = parseFloat($scope.lease_totalproduction * self.ID_lease_$kwh / ($rootScope.systemsize * 1000)).toFixed(2);
                                
                            }
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" Lease FinalSaving - " + finalsaving);
                            self.SE_lease_savings = numberWithCommas(finalsaving);
                            self.ID_lease_savings = numberWithCommas(finalsaving);
                            $scope.leasesavingsflag = true;
                            if($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                                self.buildbutton = false;  
                                incentivecall();
                            }
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for lease');
                            self.buildbutton = false;  
                        });
                                               
                    leaseflag = false;
            }
                              
        }
        
        function PPASavings(i){
            
            self.loading = true;
            $('.ppa_column').css('display', 'block');
            $('.ppa_column').css('border-right', '1px solid #cccccc');
            if (financeinfo.results[i].escalator) {
                var temp = {};
                temp.escalator = (parseFloat(financeinfo.results[i].escalator));

                if (self.dealertypeview)
                    temp.$kwh = (parseFloat(financeinfo.results[i].SE_$_KWH));
                else
                    temp.$kwh = (parseFloat(financeinfo.results[i].ID_$_KWH));
                temp.financeprogram = 'PPA';
                self.ppa_Array.push(temp);
                //$scope.ppaescalator = self.ppa_Array[0].escalator;
            }   
            
            if (ppaflag)
            {
                var Payload_PPA =
                        {
                            'Quote': {
                                'PPARate': self.ppa_Array[0].$kwh,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': $rootScope.PartnerType,
                                'Year1Production': retrievedObject.year1production,
                                'CustomerPrepayment': "0",
                                'UpfrontRebateAssumptions': "0",
                                'UpfrontRebateAssumptionsMax': "0",
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,
                                'PeriodicRentEscalation': (financeinfo.results[i].escalator / 100).toFixed(4),
                                'SubstantialCompletionDate': "11/10/2015",
                                'CurrentUtilityCost': retrievedObject.presolarutility,
                                'PostSolarUtilityCost': retrievedObject.postsolarutility,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode,
                                'LastYear': 20
                            }
                        };

                self.ppapaymentCallMade = true;
                Payment.save(Payload_PPA).$promise
                        .then(function (data) {
                            var dummyarray = [];
                                for (var k = 0; k < data.PPAPayments.length; k++)
                                {
                                    temp = ((data.PPAPayments[k] * 12).toFixed(2)).toString();
                                    dummyarray.push(temp);
                                }                                
                            PPAPayments = dummyarray;
                            var annualsaving = 0;
                            var totalsaving = 0;
                            //var tempsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseInt(+presolarannual - +postsolarannual - +PPAPayments[0]).toFixed(2);
                            ppaescalatorrate = parseFloat(self.ppa_Array[0].escalator / 100).toFixed(4);
                            //globalescalator_ppa = ppaescalatorrate ;
                            console.log(j + " PPA Presolar - " + presolarannual);
                            console.log(j + " PPA Postsolar - " + postsolarannual);
                            console.log(j + " PPA Saving - " + year1saving);
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.007).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseInt(+presolarannual - +postsolarannual - +PPAPayments[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.ppa_totalproduction = (+production + +prod1).toFixed(2);
                            
                            if (self.dealertypeview){
                                self.SE_ppa_$kwh = parseFloat(financeinfo.results[i].SE_$_KWH);
                                self.SE_ppa_$watt = parseFloat($scope.ppa_totalproduction * self.SE_ppa_$kwh / ($rootScope.systemsize * 1000)).toFixed(2);                                                                
                            }
                            else{
                                self.ID_ppa_$kwh = parseFloat(financeinfo.results[i].ID_$_KWH);
                                self.ID_ppa_$watt = parseFloat($scope.ppa_totalproduction * self.ID_ppa_$kwh / (self.systemsize * 1000)).toFixed(2);                                
                             }
                            //totalpayment = +totalpayment + +payment1;
                            //totalsaving = +year1saving + +totalsaving;
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                             console.log(j + " PPA finalsaving - " + finalsaving);
                            self.SE_ppa_savings = numberWithCommas(finalsaving);
                            self.ID_ppa_savings = numberWithCommas(finalsaving);
                            
                            $scope.ppasavingsflag = true;
                            if($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                                self.buildbutton = false;
                                incentivecall();
                            }
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for PPA');
                            self.buildbutton = false;
                        });
                ppaflag = false;
            }
            
        }
        
function processStateName2CodeMapping(stateName) {

       var stateMap = {
             "Alabama" : "AL", 
             "Alaska" : "AK",
             "Arizona" : "AZ",
             "Arkansas"  : "AR",
             "California" : "CA",       
             "Colorado" : "CO",
             "Connecticut" : "CT",
             "Delaware" : "DE",
             "District Of Columbia" : "DC",
             "Florida" : "FL",
             "Georgia" : "GA",
             "Hawaii" : "HI",
             "Idaho" : "ID",
             "Illinois" : "IL",
             "Indiana" : "IN",
             "Iowa" : "IA",
             "Kansas" : "KS",
             "Kentucky" : "KY",
             "Louisiana" : "LA",
             "Maine" : "ME",
             "Maryland" : "MD",
             "Massachusetts" : "MA",
             "Michigan" : "MI",
             "Minnesota" : "MN",
             "Mississippi" : "MS",
             "Missouri" : "MO",
             "Montana" : "MT",
             "Nebraska" : "NE",
             "Nevada" : "NV",
             "New Hampshire" : "NH",
             "New Jersey" : "NJ",
             "New Mexico" : "NM",
             "New York" : "NY",
             "North Carolina" : "NC",
             "North Dakota" : "ND",
             "Ohio" : "OH",
             "Oklahoma" : "OK",
             "Oregon" : "OR",
             "Pennsylvania" : "PA",
             "Puerto Rico" : "PR",
             "Rhode Island" : "RI",
             "South Carolina" : "SC",
             "South Dakota" : "SD",
             "Tennessee" : "TN",
             "Texas" : "TX",
             "Utah" : "UT",
             "Vermont" : "VT",
             "Virginia" : "VA",
             "Washington" : "WA",
             "West Virginia" : "WV",
             "Wisconsin" : "WI",
             "Wyoming" : "WY"
         };

       
            if (stateName !== '') {
                if (stateName.length > 2) {
                    stateName = stateMap[stateName];
                }
            }
       return stateName;
}

function redirectToDesignPage(){
    localStorageService.add('proposalToClone', localStorageService.get('proposalID'));
}
       
function designsaving(){
        self.waitimplementer = true;
            localStorageService.remove('proposalToClone');
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/Design.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var designdetails = eval("(" + payLoad + ")");   
                
                if(self.dealertypeview)
                {   
                    switch (self.SE_checked) {
                        case 16:
                        {
                            $scope.purchasetype =  "PPA";
                            $scope.financeprog =  "PPA 1.0";
                            $scope.PriceperWatt = self.SE_ppa_$watt;
                            $scope.ASP = self.SE_ppa_$kwh;
                            $scope.savings = self.SE_ppa_savings;
                            break;
                        }    
                        case 15:
                        {
                            $scope.purchasetype =  "Lease - Monthly";
                            $scope.financeprog =  "PPA 1.0";
                            $scope.PriceperWatt = self.SE_lease_$watt;
                            $scope.ASP = self.SE_lease_$kwh;
                            $scope.savings = self.SE_lease_savings;
                            break;
                        }
                        case 14:
                        {
                            $scope.purchasetype =  "Loan";
                            $scope.financeprog =  "SunEdison Mosaic SCION With Signature Series";
                            $scope.PriceperWatt = self.SE_mosaicss_$watt;
                            $scope.ASP = self.SE_mosaicss_$kwh;
                            $scope.savings = self.SE_mosaicss_savings;
                            break;
                        }
                        case 13:
                        {
                            $scope.purchasetype =  "Loan";
                            $scope.financeprog =  "SunEdison Mosaic SCION";
                            $scope.PriceperWatt = self.SE_mosaic_$watt;
                            $scope.ASP = self.SE_mosaic_$kwh;
                            $scope.savings = self.SE_mosaic_savings;
                            break;
                        }
                        case 12:
                        {
                            $scope.purchasetype =  "Cash";
                            $scope.financeprog =  "CSS-SAI";
                            $scope.PriceperWatt = self.SE_cashss_$watt;
                            $scope.ASP = self.SE_cashss_$kwh;
                            $scope.savings = self.SE_cashss_savings;
                            break;
                        }
                        case 11:
                        {
                            $scope.purchasetype =  "Cash";
                            $scope.financeprog =  "Cash-SAI";
                            $scope.PriceperWatt = self.SE_cash_$watt;
                            $scope.ASP = self.SE_cash_$kwh;
                            $scope.savings = self.SE_cash_savings;
                            break;
                        }
                    }
                }
                else
                {
                    switch (self.ID_checked) {
                        case 5:
                        {
                            $scope.purchasetype =  "PPA";
                            $scope.financeprog =  "PPA 1.0";
                            $scope.PriceperWatt = self.ID_ppa_$watt;
                            $scope.ASP = self.ID_ppa_$kwh;
                            $scope.savings = self.ID_ppa_savings;
                            break;
                        }    
                        case 4:
                        {
                            $scope.purchasetype =  "Lease - Monthly";
                            $scope.financeprog =  "PPA 1.0";
                            $scope.PriceperWatt = self.ID_lease_$watt;
                            $scope.ASP = self.ID_lease_$kwh;
                            $scope.savings = self.ID_lease_savings;
                            break;
                        }
                        case 2:
                        {
                            $scope.purchasetype =  "Cash";
                            $scope.financeprog =  "CSS";
                            $scope.PriceperWatt = self.ID_cashss_$watt;
                            $scope.ASP = self.ID_cashss_$kwh;
                            $scope.savings = self.ID_cashss_savings;
                            break;
                        }
                        case 1:
                        {
                            $scope.purchasetype =  "Cash";
                            $scope.financeprog =  "Cash";
                            $scope.PriceperWatt = self.ID_cash_$watt;
                            $scope.ASP = self.ID_cash_$kwh;
                            $scope.savings = self.ID_cash_savings;
                            break;
                        }
                    }
                }
                
                designdetails.SunEdCustId = $rootScope.SunEdCustId; 
                designdetails.Title = self.proposaltitle;
                
                if($rootScope.PricingQuoteId){
                    designdetails.Quote.ProposalID = $rootScope.ProposalId;
                }
                designdetails.Quote.ProposalID = localStorageService.get('proposalID');
                designdetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption) ;               
                designdetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                designdetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                //designdetails.Quote.ProposalID =k;           
                designdetails.Quote.Year1Production = $rootScope.totalprod;
                designdetails.Quote.purchasetype = $scope.purchasetype;
                designdetails.Quote.financeprogram = $scope.financeprog;
                designdetails.Quote.ASP = $scope.ASP;
                designdetails.Quote.PricePerWatt = $scope.PriceperWatt;                
                designdetails.Quote.proposalstatus = 'Draft';
                var currentdate = new Date();                
                designdetails.Quote.lastupdatedtime = currentdate.toDateString();
                designdetails.Quote.agreementstatus = 'Not Initiated';
                designdetails.Quote.SE_ppa_$kwh = self.SE_ppa_$kwh;        
                designdetails.Quote.annualusage = retrievedObject.annualusage;
                designdetails.Quote.presolarutility = retrievedObject.presolarutility;
                designdetails.Quote.postsolarutility = retrievedObject.postsolarutility;
                designdetails.Quote.systemsize = retrievedObject.systemsize;
                designdetails.Quote.Year1Production = retrievedObject.year1production;
                designdetails.Quote.systemyield = retrievedObject.systemyield;
                designdetails.Quote.utilityprovider = self.utilityprovider;                
                designdetails.Quote.UtilityIndex = retrievedObject.utilityLseid;
                designdetails.Quote.MonthlyUsage = retrievedObject.MonthlyUsage;
                designdetails.Quote.MonthlyBill = retrievedObject.MonthlyBill;
                designdetails.Quote.Derate = retrievedObject.InverterDerate;
                designdetails.Quote.YearsSavings = $scope.savings;                
                designdetails.Quote.TaxRate = $rootScope.taxrate;
                
                designdetails.DesignDetails.billsavings = self.billsavings;        
                designdetails.DesignDetails.offset = retrievedObject.offset;
                designdetails.DesignDetails.averagecost = parseFloat(retrievedObject.avgcostofelectricity);
                designdetails.DesignDetails.Base64Image = retrievedObject.Base64Image;
                designdetails.DesignDetails.PanelCount = retrievedObject.PanelCount;
                designdetails.DesignDetails.currenttariff = retrievedObject.currenttariff;
                designdetails.DesignDetails.aftertariff = retrievedObject.aftertariff;
                designdetails.DesignDetails.systemSizeACW =  retrievedObject.systemSizeACW;
                designdetails.DesignDetails.MasterTariffId =  retrievedObject.MasterTariffId;
                designdetails.CustomerDetails.customername = retrievedObject.customername;
                designdetails.CustomerDetails.address = retrievedObject.address;
                designdetails.CustomerDetails.State = retrievedObject.State;
                designdetails.CustomerDetails.ZipCode = retrievedObject.ZipCode;
                designdetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                designdetails.System.invertertype = retrievedObject.invertertype;
                designdetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                designdetails.System.ModuleId = retrievedObject.solarpanel;
                designdetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if(j>0)
                        designdetails.Array.push({});
                    designdetails.Array[j].ArrayNumber = $rootScope.arraydetails[j].ArrayNumber;
                    designdetails.Array[j].Azimuth = $rootScope.arraydetails[j].Azimuth;
                    designdetails.Array[j].ModuleQuantity = $rootScope.arraydetails[j].ModuleQuantity;
                    designdetails.Array[j].SystemSize = (($rootScope.arraydetails[j].ModuleQuantity * 270)/1000).toFixed(2);
                    designdetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt);
                    designdetails.Array[j].AnnualShading = $rootScope.arraydetails[j].AnnualShading;
                    designdetails.Array[j].MountType = $rootScope.arraydetails[j].MountType;
                    designdetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    designdetails.Array[j].InverterType = $rootScope.arraydetails[j].invertertype;
                    designdetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    designdetails.Array[j].InverterQuantity = $rootScope.arraydetails[j].InverterQuantity;
                    var Shading = [];
                    for(var i=0; i<12;i++){
                        Shading.push($rootScope.arraydetails[j].AnnualShading);
                    }
                    designdetails.Array[j].Shading = Shading;
                }
                self.saveDisabled = true;
                DesignSave.save(designdetails).$promise
                        .then(function (response) {
                            if (response.Message === "Design created successfully") {
                                $rootScope.PricingQuoteId = response.PricingQuoteId;
                                $rootScope.ProposalId = response.ProposalId;
                            }
                            console.log("Design saved");
                            showErrorDialog("Draft proposal saved");
                            self.waitimplementer = false;
                            self.saveDisabled = false;
                        })
                        .catch(function (error) {
                            self.waitimplementer = false;
                            showErrorDialog('Design saving api failed');
                            self.buildbutton = false;
                        });
            });            
}

function builddocument(){
        //$rootScope.proposaltitle = self.proposaltitle;
	localStorageService.remove('proposalToClone');
        $scope.set$kwh = 0;
        $scope.escalator = 0;
        $scope.term = 0;
        
        if (self.dealertypeview){
            if (self.SE_checked === 16){
                $scope.set$kwh = self.SE_ppa_$kwh;
                $scope.escalator = ppaescalatorrate;
                $scope.purchasetype =  "PPA";
                $scope.financeprog =  "PPA 1.0";
                $scope.YearsSavings = self.SE_ppa_savings;
                if(removeCommaFromNumbers(self.SE_ppa_savings) > 0)
                    assemblePPAjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
            else if (self.SE_checked === 15){
                $scope.set$kwh = self.SE_lease_$kwh;
                $scope.escalator = leaseescalatorrate;
                $scope.purchasetype =  "Lease - Monthly";
                $scope.financeprog =  "PPA 1.0";
                $scope.YearsSavings = self.SE_lease_savings;
                if(removeCommaFromNumbers(self.SE_lease_savings) > 0)
                    assemblePPAjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
             else if (self.SE_checked === 14) {
                $scope.set$kwh = self.SE_mosaicss_$kwh;
                $scope.term = mosaicssterm;
                $scope.purchasetype =  "Loan";
                $scope.financeprog =  "SunEdison Mosaic SCION With Signature Series";
                $scope.YearsSavings = self.SE_mosaicss_savings;
                if(removeCommaFromNumbers(self.SE_mosaicss_savings) > 0)
                    assembleMosaicjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
            else if (self.SE_checked === 13) {
                $scope.set$kwh = self.SE_mosaic_$kwh;
                $scope.term = mosaicterm;
                $scope.purchasetype =  "Loan";
                $scope.financeprog =  "SunEdison Mosaic SCION";
                $scope.YearsSavings = self.SE_mosaic_savings;
                if(removeCommaFromNumbers(self.SE_mosaic_savings) > 0)
                    assembleMosaicjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
            else if (self.SE_checked === 12) {
                $scope.set$watt = self.SE_cashss_$watt;
                $scope.set$kwh = self.SE_cashss_$kwh;
                $scope.term = 20;
                $scope.purchasetype =  "Cash";
                $scope.financeprog =  "CSS-SAI";
                $scope.YearsSavings = self.SE_cashss_savings;
                if(removeCommaFromNumbers(self.SE_cashss_savings) > 0)
                    assembleMosaicjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
            else if (self.SE_checked === 11) {
                $scope.set$watt = self.SE_cash_$watt;
                $scope.set$kwh = self.SE_cash_$kwh;
                $scope.term = 20;
                $scope.purchasetype =  "Cash";
                $scope.financeprog =  "Cash-SAI";
                $scope.YearsSavings = self.SE_cash_savings;
                if(removeCommaFromNumbers(self.SE_cash_savings) > 0)
                    assembleMosaicjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
        }
        else
        {            
            if (self.ID_checked=== 5){
                $scope.set$kwh = self.ID_ppa_$kwh;
                $scope.escalator = ppaescalatorrate;
                $scope.purchasetype =  "PPA";
                $scope.financeprog =  "PPA 1.0";
                $scope.YearsSavings = self.ID_ppa_savings;
                if(removeCommaFromNumbers(self.ID_ppa_savings) > 0)
                    assemblePPAjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
            else if (self.ID_checked === 4){
                $scope.set$kwh = self.ID_lease_$kwh;
                $scope.escalator = leaseescalatorrate;
                $scope.purchasetype =  "Lease - Monthly";
                $scope.financeprog =  "PPA 1.0";
                $scope.YearsSavings = self.ID_lease_savings;
                if(removeCommaFromNumbers(self.ID_lease_savings) > 0)
                    assemblePPAjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
            /*else if (self.ID_checked=== 3) {
                $scope.set$kwh = self.ID_mosaic_$kwh;
                $scope.term = mosaicterm;
                $scope.purchasetype =  "Loan";
                $scope.financeprog =  "SunEdison Mosaic SCION";
                if(self.ID_mosaic_savings > 0)
                    assembleMosaicjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
             else if (self.ID_checked=== 6) {
                $scope.set$kwh = self.ID_mosaicss_$kwh;
                $scope.term = mosaicssterm;
                $scope.purchasetype =  "Loan";
                $scope.financeprog =  "SunEdison Mosaic SCION With Signature Series";
                if(self.ID_mosaicss_savings > 0)
                    assembleMosaicjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }*/
            else if (self.ID_checked === 2) {
                $scope.set$watt = self.ID_cashss_$watt;
                $scope.set$kwh = self.ID_cashss_$kwh;
                $scope.purchasetype =  "Cash";
                $scope.financeprog =  "CSS";
                $scope.YearsSavings = self.ID_cashss_savings;
                if(removeCommaFromNumbers(self.ID_cashss_savings) > 0)
                    assembleCashjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
            else if (self.ID_checked === 1) {
                $scope.set$watt = self.ID_cash_$watt;
                $scope.set$kwh = self.ID_cash_$kwh;
                $scope.purchasetype =  "Cash";
                $scope.financeprog =  "Cash";
                $scope.YearsSavings = self.ID_cash_savings;
                if(removeCommaFromNumbers(self.ID_cash_savings) > 0)
                    assembleCashjson();
                else
                     showErrorDialog("Savings are negative. Its not recommended to proceed for Solar in this case. Please change the $/kwh");
            }
        }
}

function assemblePPAjson(){
    
    $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");                
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();       
                if($rootScope.PricingQuoteId){                    
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                if($rootScope.ProposalId){
                   financedetails.Quote.ProposalID = $rootScope.ProposalId; 
                }else{
                    financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                    $rootScope.ProposalId = financedetails.Quote.ProposalID;
                }
                financedetails.Quote.YearsSavings = $scope.YearsSavings;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption) ;    
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString(); 
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString(); 
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();                
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if($scope.UpfrontRebateAssumptionsMax !== 0)
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                else
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                if($scope.UpfrontRebateAssumptions !== 0)
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                else
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                if($scope.kwhtowattflag)
                    financedetails.Quote.PPARate = ($scope.kwhtoconvert).toString();
                else if($scope.watttokwhflag)
                    financedetails.Quote.ASPW = ($scope.watttoconvert).toString();
                else
                    financedetails.Quote.PPARate = ($scope.set$kwh).toString();
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);   
                financedetails.Quote.PeriodicRentEscalation = $scope.escalator;                
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;
                
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if(j>0)
                        financedetails.Array.push({});
                    var arraynumber = j+ 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270)/1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for(var i=0; i<12;i++){
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }                    
                    financedetails.Array[j].Shading = Shading;
                }
                if($scope.kwhtowattflag)
                    financeProgramKwhToWattConversion(financedetails);
                else if($scope.watttokwhflag)
                    financeProgramWattToKwhConversion(financedetails);
                else
                    financecalculation(financedetails);
            });    
}

function assembleMosaicjson(){
    if($scope.purchasetype ===  "Cash")
        $rootScope.cashfinanceprog ='Cash';
    
    $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/Loanfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                var financedetails = eval("(" + payLoad + ")");                
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString(); 
                financedetails.Quote.YearsSavings = $scope.YearsSavings;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.Proposaltitle = (self.proposaltitle).toString();
                financedetails.Quote.RegistrationNumber = self.registrationnumber;
                financedetails.Quote.PricePerWatt = ($scope.set$kwh).toString();
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString();
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString();
                financedetails.Quote.MosaicTenor = ($scope.term).toString();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();                
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.LoanStartDate = getSystemDate();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();            
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption) ;      
                financedetails.Quote.MasterTariffId = (retrievedObject.MasterTariffId).toString();
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = retrievedObject.inverterId;
                financedetails.System.InverterModel = retrievedObject.inverterId;
                
                var custname = ($rootScope.customerName.replace(/%20/g, " ")).split(" ");
                if($rootScope.ProposalId){
                   financedetails.Quote.ProposalID = $rootScope.ProposalId; 
                }else{
                    financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                    $rootScope.ProposalId = financedetails.Quote.ProposalID;
                }
                
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if(j>0)
                        financedetails.Array.push({});
                    var arraynumber = j+ 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270)/1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;                    
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    var Shading = [];
                    for(var i=0; i<12;i++){
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                
                financecalculation(financedetails);
            });    
            
}

function assembleCashjson(){
    
    $rootScope.cashfinanceprog ='Cash';
    
    $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/Cashfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");                
                financedetails.SunEdCustId = $rootScope.SunEdCustId;  
                if($rootScope.PricingQuoteId){
                   financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                if($rootScope.ProposalId){
                   financedetails.Quote.ProposalID = $rootScope.ProposalId; 
                }
                else{
                    financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                    $rootScope.ProposalId = financedetails.Quote.ProposalID;
                }              
                financedetails.Quote.YearsSavings = $scope.YearsSavings;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption) ; 
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString(); 
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString(); 
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.ASP = ($scope.set$kwh).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                //financedetails.Quote.ProposalID = $rootScope.proposalId;                           
                financedetails.Quote.PricePerWatt = ($scope.set$watt).toString();
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod); 
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;                
                financedetails.Quote.PreSolarTariff  = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                //financedetails.ProposalTool = retrievedObject;
                financedetails.System.InverterId = retrievedObject.inverterId;
                financedetails.System.InverterModel = retrievedObject.inverterId;
                
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if(j>0)
                        financedetails.Array.push({});
                    var arraynumber = j+ 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270)/1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    var Shading = [];
                    for(var i=0; i<12;i++){
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                
                financecalculation(financedetails);
            });    
            
}
    function financeProgramKwhToWattConversion(financedetails){
        FinanceCalc.save(financedetails).$promise
                                    .then(function (response) {
                                        $scope.kwhtowattflag = false;
                                        if($scope.purchasetype ===  "PPA")
                                            self.ID_ppa_$watt = response['DealerASP/W'] ;
                                        else
                                            self.ID_lease_$watt = response['DealerASP/W'] ;
                                        self.buildbutton = false;
                                    })
                                    .catch(function () {
                                        console.log('finprog conversion failed');
                                        self.buildbutton = false;
                                        showErrorDialog('Finprog conversion failed');
                                    });
    }
    
        function financeProgramWattToKwhConversion(financedetails) {
            var FinDetails = {};
            FinanceCalcV1.save(financedetails).$promise
                    .then(function (response) {
                        if ($scope.purchasetype === "PPA"){
                            self.ID_ppa_$kwh = response.PPARate;                    
                            FinDetails.financeprogram = 'PPA';
                            FinDetails.$kwh = self.ID_ppa_$kwh;
                            FinDetails.escalator = parseFloat((ppaescalatorrate * 100).toFixed(1));
                        }
                        else{
                            self.ID_lease_$kwh = response.PPARate;                            
                            FinDetails.financeprogram = 'Lease';
                            FinDetails.$kwh = self.ID_lease_$kwh;
                            FinDetails.escalator = parseFloat((leaseescalatorrate*100).toFixed(1));
                        }
                        FinDetails.bypassconversion = 'true';
                        paymentApiCall(FinDetails);
                    })
                    .catch(function () {
                        console.log('finprog conversion failed');
                        self.buildbutton = false;
                        showErrorDialog('Finprog conversion failed');
                    });
        }
        function financecalculation(financedetails) {

            self.loading = true;
            if ($rootScope.designtofinance === 0) {
                DeleteProposal.delete({proposalid: $rootScope.PricingQuoteId}).$promise
                        .then(function () {
                            FinanceCalc.save(financedetails).$promise
                                    .then(function (response) {
                                        console.log("Finprog call");
                                        $rootScope.PricingQuoteId = response.PricingQuoteId;
                                        //$rootScope.ProposalId = response.PricingQuoteId;
                                        $state.go('proposaloverview');
                                    })
                                    .catch(function () {
                                        console.log('finprog failed');
                                        showErrorDialog('Finprog api failed');
                                        $state.go('financeoption');
                                    });
                        })
                        .catch(function () {
                                        console.log('propsal delete failed');
                                        showErrorDialog('Delete proposal api failed');
                                        $state.go('financeoption');
                                        self.loading = false;
                                    });
            }
            else {
                FinanceCalc.save(financedetails).$promise
                        .then(function (response) {
                            console.log("Finprog call");
                            $rootScope.PricingQuoteId = response.PricingQuoteId;
                            $state.go('proposaloverview');
                        })
                        .catch(function (error) {
                            console.log('finprog failed');
                            showErrorDialog('Finprog api failed');
                            $state.go('financeoption');
                            self.loading = false;
                        });
            }

        }
        
        function showutilitycategory() {
            if (self.openutility === 'open'){
                self.openutility = '';
                self.utility = false;
            }
            else{
                self.openutility = 'open';
                self.utility = true;
            }
        }
        
        function showanalysiscategory(){
            if (self.openanalysis === 'open'){
                self.openanalysis = '';
                self.analysis = false;
            }
            else{
                self.openanalysis = 'open';
                self.analysis = true;
            }
        }
        
        function showhidecancelbox(){
            if(self.cancel === ''){
                self.cancel = 'save-cancel';
            }
            else{
                self.cancel = '';
            }
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
        function escalatorchange(FinanceArray) {

            var currentvalues = [];
            var escalatorrate = 0;
            var $kwh = 0;
            var PaymentArray = [];

            if (FinanceArray.financeprogram === 'PPA'){
                currentvalues = self.ppa_Array;
                PaymentArray = PPAPayments;
                }
            else if (FinanceArray.financeprogram === 'Lease'){
                currentvalues = self.lease_Array;
                PaymentArray = LeasePayments;
            }

            for (var i = 0; i < currentvalues.length; i++)
            {
                if (FinanceArray.escalator === currentvalues[i].escalator)
                {
                    ppaescalatorrate = parseFloat(currentvalues[i].escalator / 100).toFixed(4);
                    if (FinanceArray.financeprogram === 'PPA') {
                        if (self.dealertypeview) {
                            self.SE_ppa_$kwh = currentvalues[i].$kwh;
                            self.SE_ppa_$watt = parseFloat($scope.ppa_totalproduction * self.SE_ppa_$kwh / (self.systemsize * 1000)).toFixed(2);
                            //$kwh = parseFloat(self.SE_ppa_$kwh);
                        }
                        else
                        {
                            if(escalatorKwhWattflag === 1){
                                    $scope.watttoconvert = self.ID_ppa_$watt;
                                    $scope.watttokwhflag = true;
                                    escalatorKwhWattflag = 0;
                                }
                                else if(escalatorKwhWattflag === 2){
                                    $scope.kwhtoconvert = self.ID_ppa_$kwh;
                                    $scope.kwhtowattflag = true;
                                    escalatorKwhWattflag = 0;
                                }
                                else{
                                    $scope.kwhtowattflag = true;
                                    $scope.kwhtoconvert = self.ID_ppa_$kwh;
                                }
                            if(FinanceArray.bypassconversion){
                                //self.ID_ppa_$kwh = currentvalues[i].$kwh;
                                $scope.escalator = ppaescalatorrate;
                                $scope.purchasetype = "PPA";
                                $scope.financeprog = "PPA 1.0";
                                assemblePPAjson();
                                FinanceArray.bypassconversion = false;
                            }
                        }
                    }
                    else if (FinanceArray.financeprogram === 'Lease') {
                        leaseescalatorrate = parseFloat(currentvalues[i].escalator / 100).toFixed(4);                         
                        if (self.dealertypeview) {
                            self.SE_lease_$kwh = currentvalues[i].$kwh;
                            self.SE_lease_$watt = parseFloat($scope.lease_totalproduction * self.SE_lease_$kwh / ($rootScope.systemsize * 1000)).toFixed(2);
                            //$kwh = parseFloat(self.SE_lease_$kwh);
                        }
                        else
                        {
                            if(escalatorKwhWattflag === 1){
                                    $scope.watttoconvert = self.ID_lease_$watt;
                                    $scope.watttokwhflag = true;
                                    escalatorKwhWattflag = 0;
                                }
                                else if(escalatorKwhWattflag === 2){                                    
                                    $scope.kwhtoconvert = self.ID_lease_$kwh;
                                    $scope.kwhtowattflag = true;
                                    escalatorKwhWattflag = 0;
                                }
                                else{
                                    $scope.kwhtowattflag = true;
                                    $scope.kwhtoconvert = self.ID_lease_$kwh;
                                }
                            if(FinanceArray.bypassconversion){
                                //self.ID_lease_$kwh = currentvalues[i].$kwh;
                                $scope.escalator = leaseescalatorrate;
                                $scope.purchasetype = "Lease - Monthly";
                                $scope.financeprog = "PPA 1.0";
                                assemblePPAjson();
                                FinanceArray.bypassconversion = false;
                            }
                        }
                    }
                    savingscalculation(FinanceArray, PaymentArray);
                }                
            }
        }
        function savingscalculation(FinanceArray, PaymentArray) {
            var production = parseFloat($rootScope.totalprod).toFixed(0);
            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
            var year1saving = parseFloat(+presolarannual - +postsolarannual - +PaymentArray[0]).toFixed(2);
            var prod2 = production;
            var annualsaving = 0;
            var totalsaving = 0;
            for (var j = 1; j < 20; j++)
            {
                var temp_prod = prod2 * 0.007;
                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                var temp_pre = presolarannual * 0.034;
                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                var temp_post = postsolarannual * 0.034;
                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);

                annualsaving = parseFloat(+presolarannual - +postsolarannual - +PaymentArray[j]).toFixed(2);
                totalsaving = (+totalsaving + +annualsaving);
            }
            var finalsaving = (+totalsaving + +year1saving).toFixed(0);
            console.log(FinanceArray.financeprogram + " finalsaving - " + finalsaving);
            if (FinanceArray.financeprogram === 'PPA') {
                self.SE_ppa_savings = numberWithCommas(finalsaving);
                self.ID_ppa_savings = numberWithCommas(finalsaving);
            } else if (FinanceArray.financeprogram === 'Lease') {
                self.SE_lease_savings = numberWithCommas(finalsaving);
                self.ID_lease_savings = numberWithCommas(finalsaving);
            }
            self.buildbutton = false;

        }
        function paymentApiCall(FinDetails){
            self.buildbutton = true;
            var Payload_PPA =
                        {
                            'Quote': {
                                'PPARate': FinDetails.$kwh,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': $rootScope.PartnerType,
                                'Year1Production': retrievedObject.year1production,
                                'CustomerPrepayment': "0",
                                'UpfrontRebateAssumptions': "0",
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,
                                'PeriodicRentEscalation': (FinDetails.escalator / 100).toFixed(4),
                                'SubstantialCompletionDate': "11/10/2015",
                                'CurrentUtilityCost': retrievedObject.presolarutility,
                                'PostSolarUtilityCost': retrievedObject.postsolarutility,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode,
                                'LastYear': 20
                            }
                        };

                self.ppapaymentCallMade = true;
                Payment.save(Payload_PPA).$promise
                        .then(function (data) {
                            var temp =0;
                            var dummyarray = [];
                             if(FinDetails.financeprogram === 'PPA'){
                                 for (var k = 0; k < data.PPAPayments.length; k++)
                                    {
                                        temp = (data.PPAPayments[k] * 12).toString();
                                        dummyarray.push(temp);
                                    }
                                    PPAPayments = [];
                                    PPAPayments = dummyarray;
                             }
                             else{
                                 for (var k = 0; k < data.LeasePayments.length; k++)
                                    {
                                        temp = (data.LeasePayments[k] * 12).toString();
                                        dummyarray.push(temp);
                                    }
                                    LeasePayments = [];
                                    LeasePayments = dummyarray;
                             }
                             if ($scope.watttokwhflag) {
                                savingscalculation(FinDetails, dummyarray);
                                $scope.watttokwhflag = false;
                             } else if ($scope.kwhtowattflag) {
                                savingscalculation(FinDetails, dummyarray);
                                $scope.kwhtowattflag = false;
                            } else
                                escalatorchange(FinDetails);
                        });
        }
        
        function paymentApiCallMosaic(FinDetails){
            self.buildbutton = true;            
            if(FinDetails.financeprogram === 'Mosaic'){
                var SSmarker = "No";
                var $watt = self.SE_mosaic_$watt;
                mosaicterm = FinDetails.loanterm;
            }
            else{
                var SSmarker = "Yes";
                var $watt = self.SE_mosaicss_$watt;
                mosaicssterm = FinDetails.loanterm;
            }
            
            var Payload_Mosaic =
                        {
                            'Quote': {
                                'LoanStartDate': '10/3/2015',
                                'PricePerWatt': $watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': FinDetails.loanterm,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': SSmarker,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };

                self.ppapaymentCallMade = true;
                LoanPayment.save(Payload_Mosaic).$promise
                        .then(function (data) {
                            var temp =0;
                            var dummyarray = [];
                              for (var k = 0; k < data.LoanPayments.length-5; k++)
                                    {
                                        temp = (data.LoanPayments[k] * 12).toString();
                                        dummyarray.push(temp);
                                    }
                        
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +dummyarray[0]).toFixed(2);
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.007).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);

                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +dummyarray[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);

                            }
                            $scope.mosaicss_totalproduction = (+production + +prod1).toFixed(2);   
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            if(FinDetails.financeprogram === 'Mosaic'){
                                self.SE_mosaic_savings = numberWithCommas(finalsaving);
                            }
                            else{
                                self.SE_mosaicss_savings = numberWithCommas(finalsaving);
                            }
                            console.log(" Mosaic FinalSaving - " + finalsaving);
                            self.buildbutton = false;
                        });
        }
        
        function watttokwhconversion() {
        self.buildbutton = true;
        var FinDetails = {};
            switch (self.ID_checked) {
                case 5:
                {
                    if(!isNaN(self.ID_ppa_$watt) && (self.ID_ppa_$watt > 0)){
                        //self.ID_ppa_$kwh = ((self.ID_ppa_$watt * ($rootScope.systemsize * 1000)) / $scope.ppa_totalproduction).toFixed(2);
                        $scope.watttokwhflag = true;
                        $scope.watttoconvert = self.ID_ppa_$watt;
                        $scope.escalator = ppaescalatorrate;
                        $scope.purchasetype =  "PPA";
                        $scope.financeprog =  "PPA 1.0";
                        escalatorKwhWattflag = 1;
                        assemblePPAjson();
                        
                    }
                    break;
                }
                case 4:
                {
                    if(!isNaN(self.ID_lease_$watt) && (self.ID_lease_$watt > 0)){
                        //self.ID_lease_$kwh = ((self.ID_lease_$watt * ($rootScope.systemsize * 1000)) / $scope.lease_totalproduction).toFixed(2);
                        $scope.watttokwhflag = true;
                        $scope.watttoconvert = self.ID_lease_$watt;
                        $scope.escalator = leaseescalatorrate;
                        $scope.purchasetype =  "Lease - Monthly";
                        $scope.financeprog =  "PPA 1.0";
                         escalatorKwhWattflag = 1;
                        assemblePPAjson();
                        
                    }
                    break;
                }
                case 2:
                {
                    if(!isNaN(self.ID_cashss_$watt) && (self.ID_cashss_$watt > 0)){
                        self.ID_cashss_$kwh = ((self.ID_cashss_$watt * ($rootScope.systemsize * 1000)) / $scope.cashss_totalproduction).toFixed(2);
                        cashcalcflag = true;
                        cashWithsignature();
                    }
                    break;
                }
                case 1:
                {
                    if(!isNaN(self.ID_cash_$watt) && (self.ID_cash_$watt > 0)){
                        self.ID_cash_$kwh = ((self.ID_cash_$watt * ($rootScope.systemsize * 1000)) / $scope.cash_totalproduction).toFixed(2);
                        cashcalcflag = true;
                        cashsavings();
                    }
                    break;
                }
            }
        }
        
        function kwhtowattconversion(){
        self.buildbutton = true;    
            var FinDetails = {};
            switch (self.ID_checked) {
                case 5:
                {
                    if (!isNaN(self.ID_ppa_$kwh) && (self.ID_ppa_$kwh > 0)) {
                        $scope.kwhtowattflag = true;
                        $scope.kwhtoconvert = self.ID_ppa_$kwh;
                        $scope.escalator = ppaescalatorrate;
                        $scope.purchasetype =  "PPA";
                        $scope.financeprog =  "PPA 1.0";
                        escalatorKwhWattflag = 2; 
                        assemblePPAjson();
                        //self.ID_ppa_$watt = ((self.ID_ppa_$kwh * $scope.ppa_totalproduction) / ($rootScope.systemsize * 1000)).toFixed(2);
                        FinDetails.financeprogram = 'PPA';
                        FinDetails.$kwh = self.ID_ppa_$kwh;
                        FinDetails.escalator = parseFloat((ppaescalatorrate * 100).toFixed(1));
                        FinDetails.bypassconversion = 'true';
                        paymentApiCall(FinDetails);
                    }
                    break;
                }
                case 4:
                {
                    if (!isNaN(self.ID_lease_$kwh) && (self.ID_lease_$kwh > 0)) {
                        //self.ID_lease_$watt = ((self.ID_lease_$kwh * $scope.lease_totalproduction) / ($rootScope.systemsize * 1000)).toFixed(2);
                        $scope.kwhtowattflag = true;
                        $scope.kwhtoconvert = self.ID_lease_$kwh;
                        $scope.escalator = leaseescalatorrate;
                        $scope.purchasetype =  "Lease - Monthly";
                        $scope.financeprog =  "PPA 1.0";
                        escalatorKwhWattflag = 2; 
                        assemblePPAjson();
                        FinDetails.financeprogram = 'Lease';
                        FinDetails.$kwh = self.ID_lease_$kwh;
                        FinDetails.escalator = parseFloat((leaseescalatorrate * 100).toFixed(1));
                        FinDetails.bypassconversion = 'true';
                        paymentApiCall(FinDetails);
                    }
                    break;
                }
                case 2:
                {
                    if (!isNaN(self.ID_cashss_$kwh) && (self.ID_cashss_$kwh > 0)) {
                        self.ID_cashss_$watt = ((self.ID_cashss_$kwh * $scope.cashss_totalproduction) / ($rootScope.systemsize * 1000)).toFixed(2);
                        cashcalcflag = true;
                        cashWithsignature();
                    }
                    break;
                }
                case 1:
                {
                    if (!isNaN(self.ID_cash_$kwh) && (self.ID_cash_$kwh > 0)) {
                        self.ID_cash_$watt = ((self.ID_cash_$kwh * $scope.cash_totalproduction) / ($rootScope.systemsize * 1000)).toFixed(2);
                        cashcalcflag = true;
                        cashsavings();
                    }
                    break;
                }
            }
        }
        
        function financeprogchange(column) {
            
            self.buildbutton = true;
        if (self.dealertypeview)
            var optionchecked = self.SE_checked;
        else
            var optionchecked = self.ID_checked;
	if(firstincentivecall)
            optionchecked = column-1;
        
        if(column !==  optionchecked){
            if (self.dealertypeview) {
                switch (column) {
                    case 16:
                    {
                        $scope.kwh = self.SE_ppa_$watt;
                        $scope.purchasetype = "PPA";
                        self.SE_checked = 16;
                        getIncentiveData(); 
                        break;
                    }
                    case 15:
                    {
                        $scope.kwh = self.SE_lease_$watt;
                        $scope.purchasetype = "Lease - Monthly";
                        self.SE_checked = 15;
                        getIncentiveData(); 
                        break;
                    }
                    case 14:
                    {
                        $scope.kwh = self.SE_mosaic_$watt;
                        self.SE_checked = 14;
                        self.showincentive = false;
                        self.buildbutton = false;
                        break;
                    }
                    case 13:
                    {
                        $scope.kwh = self.SE_mosaicss_$watt;
                        self.SE_checked = 13;
                        self.showincentive = false;
                        self.buildbutton = false;
                        break;
                    }
                    case 12:
                    {
                        $scope.kwh = self.SE_cashss_$watt;
                        self.SE_checked = 12;
                        self.showincentive = false;
                        self.buildbutton = false;
                        break;
                    }
                    case 11:
                    {
                        $scope.kwh = self.SE_cash_$watt;
                        self.SE_checked = 11;
                        self.showincentive = false;
                        self.buildbutton = false;
                        break;
                    }
                }
            }
            else
            {
                switch (column) {
                    case 5:
                    {
                        $scope.kwh = self.ID_ppa_$watt;
                        $scope.purchasetype = "PPA";
                        self.ID_checked = 5;
                        getIncentiveData(); 
                        break;
                    }
                    case 4:
                    {
                        $scope.kwh = self.ID_lease_$watt;
                        $scope.purchasetype = "Lease - Monthly";
                        self.ID_checked = 4;                        
                        getIncentiveData(); 
                        break;
                    }
                    case 2:
                    {
                        self.ID_checked = 2;
                        self.showincentive = false;
                        self.buildbutton = false;
                        break;
                    }
                    case 1:
                    {
                        self.ID_checked = 1;
                        self.showincentive = false;
                        self.buildbutton = false;
                        break;
                    }
                }
            }
            
            }
        }
        function getIncentiveData(){
            var systemcost = 270 * ($scope.kwh) * (retrievedObject.PanelCount);            
            var Payload = {
                                'systemCost': (systemcost).toString(),
                                'systemSizeAcW': (retrievedObject.systemSizeACW).toString(),
                                'systemSizeDcW': (retrievedObject.systemsize * 1000).toString(),
                                'zipCode': (retrievedObject.ZipCode).toString(),
                                'purchaseType': ($scope.purchasetype).toString(),
                                'consumption': (retrievedObject.annualusage).toString(),
                                'production': (retrievedObject.year1production).toString(),
                                'isConEdCustomer': 'false'
                        };
            if($rootScope.utilityLseid === '2252')
                Payload.isConEdCustomer = 'true';
            
            Incentives.save(Payload).$promise
                    .then(function (data) {
                            for (var k = 0; k < data.incentives.length; k++)
                            {
                                self.showincentive = true;
                                if (data.incentives[0].incentiveType === 'utility') {
                                    self.incentivetitle = 'Utility Rebate';
                                } else if (data.incentives[0].incentiveType === 'state') {
                                    self.incentivetitle = 'State Rebate';
                                }
                                if (data.incentives[0].quantityKey)
                                    self.incentivevalue = data.incentives[0].incentiveValue + ' (' + data.incentives[0].rate + '/watt)';
                                else if (!data.incentives[0].quantityKey) {
                                    self.incentivevalue = data.incentives[0].incentiveValue;
                                    $scope.UpfrontRebateAssumptionsMax = data.incentives[0].rate;
                                } else if (data.incentives[0].quantityKey === 'systemSizeDcW' || data.incentives[0].quantityKey === 'systemSizeAcW')
                                    $scope.UpfrontRebateAssumptions === data.incentives[0].rate;
                            }
                    
                        self.buildbutton = false;
                       
                    })
                    .catch(function () {
                        console.log('incentive call failed');
                        self.buildbutton = false;
                    });
		firstincentivecall = false;
        }
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        function removeCommaFromNumbers(x) {
            return x.toString().replace(',', "");
        }
        function getSystemDate() {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            if (dd < 10) 
                dd = '0' + dd;
            if (mm < 10) 
                mm = '0' + mm;
            return (mm + '/' + dd + '/' + yyyy);
        }
        
        self.savingscalculation = savingscalculation;
        self.getSystemDate = getSystemDate;
        self.removeCommaFromNumbers = removeCommaFromNumbers;
        self.numberWithCommas = numberWithCommas;
	self.redirectToDesignPage = redirectToDesignPage;
        self.financeprogchange = financeprogchange;
        self.MosaicSavings = MosaicSavings;
        self.MosaicSSSavings = MosaicSSSavings;
        self.paymentApiCallMosaic = paymentApiCallMosaic;
        self.paymentApiCall = paymentApiCall;
        self.kwhtowattconversion = kwhtowattconversion;
        self.watttokwhconversion = watttokwhconversion;
        self.showErrorDialog = showErrorDialog;
        self.builddocument = builddocument;
        self.assemblePPAjson = assemblePPAjson;
        self.escalatorchange = escalatorchange;
        self.customertofinance = customertofinance;
        self.designtofinance = designtofinance;        
        self.financecalculation = financecalculation;
        self.designsaving = designsaving;
        self.showhidecancelbox = showhidecancelbox;        
        self.showanalysiscategory = showanalysiscategory;
        self.showutilitycategory = showutilitycategory;
        }

    angular
        .module('dealerportal.financeoption', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('FinanceOptionsCtrl', ['$timeout', '$state', '$scope','$rootScope', '$log', 'sessionService', 'FinanceDetails', 'DesignSave', 'FinanceCalc', 'DesignDetails', 'DeleteProposal', 'managedModal','Payment', 'LoanPayment', 'localStorageService','Incentives', 'FinanceCalcV1', FinanceOptionsCtrl]);
})();
