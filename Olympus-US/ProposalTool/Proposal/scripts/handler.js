//"use strict";
//localStorage.setItem("name", "ProposalTool");
var glat = -37.907634;
var glng = 144.994700;
const ghoff = 60, gvoff = 1;
var gzoom = 21;
var oktaID = "";
var idt = "";
var pricingQuoteId;
var pdfURL = "";
var projectedSolarOutput = [];
var currentUsage = [];
var openedItemId = null;
var mapView = null;
var currPanelInfo = { w: 1.65, h: 1 };
var OID;
var SunCustId;
var popupWin;
var checkflag = 0;
var proposalWindow = null;
var currArray = null;
var arrayOfAreas = [];
var projectedSolarOP = 0;
var totalNoOfPannels = 0;
var totalProduction = [];
var shadedProduction = [];
var actualProduction = [];
var estimatedAnnualOutput = [];
var currentSelectedProdTable = 0;
var Zipcode;
var defaultMasterTarriffId = null;
var defaultlseId = null;
var defaultTerritoryId = null;
var delflag = false;
var aurorawin;
var chkflag = 0;
var finprogcall = 0;
var addr1 = '';
var addr2 = '';
var customerFName = '';
var firstarray = 1;
var lastarray = 0;
var tempid = 0;
var idtoset;
var currArrayName;
var lastaddedid = 0;
var currArrayId;
var totalarrays =0;
var payload_2;
var usagebill_flag;
var productionval = [];
var Utilitieslist;
var MasterItemData = [];
var DerateData;
var defaultderate;
var State;
var financepageflag = false;
var monthlyBillJSON = {};
var monthlyUsageJSON = {};
var defaultsystemSizeACW = 0;
var firstapicallflag = false;
var mediumtype;
var isClonedProposal = false;

$(document).ready(function () {
    var params = parseParams();
    if (typeof(worksData) == 'undefined') {
        if (params['lat'] != undefined) glat = params['lat'];
        if (params['lng'] != undefined) glng = params['lng'];
        if (params['zoom'] != undefined) gzoom = params['zoom'];
    }
    else {
        glat = worksData.lat;
        glng = worksData.lng;
        gzoom = worksData.zoom;
    }
    if (params['OID'] !== undefined) oktaID = params['OID'];
    if (params['SunEdCustId'] !== undefined) SunCustId = params['SunEdCustId'];
    if (params['Zipcode'] !== undefined) Zipcode = params['Zipcode'];
    if (params['FinanceProg'] !== undefined) FinanceProg = params['FinanceProg'];
    if (params['addr1'] !== undefined) addr1 = params['addr1'];
    if (params['addr2'] !== undefined) addr2 = params['addr2'];
    if (params['customerName'] !== undefined) customerName = params['customerName'];
    $(document.body).height($(window).height());
    var temp1 = addr1.replace(/%20/g, " ");
    var temp2 = addr2.replace(/%20/g, " ");
    State = (temp2.split(','))[1].trim();
    Zipcode = Zipcode.split("%20").pop();
    var custname = customerName.replace(/%20/g, " ");
    var title = custname.split(' ')[0] + "'s proposal";
    $('#addressLine1').val(temp1);
    $('#addressLine2').val(temp2);
    $('#proposalname').val(title);
    var ow = $("#map-view").outerWidth();
    var dleft = (-20 - ow) + 'px';
    $("#map-view").css('left', dleft);
    $('#roof-type').on('change', roofTypeChange);
    $('#panel-type').on('change', panelTypeChange);
    var retrievedObject = JSON.parse(localStorage.getItem('ls.se-user'));
    if(retrievedObject.profile.PartnerType === 'SALES ENGINE (Seller)')
    	mediumtype = 'Sales Engine';
    else
    	mediumtype = 'Integrated Dealer';    
    
	changeBillType();
    
    var mvconfig = {
        container: 'map-panel',
        lat: glat,
        lng: glng,
        zoom: gzoom,
        mapType: HdSolar.MapType.Google,
        maxArray: 3
    };
    //if (typeof (worksData) != 'undefined') mvconfig.worksData = worksData;

    mapView = new HdSolar.MapView(mvconfig);

    mapView.onPanelShapeAdded(function (id) { 
        if(firstarray === 1){
            document.getElementById("arraytitle").style.display = 'block';
            firstarray = 0;
        }
        var arrayIdtoDisplay = mapView.getPanelShapeInfo().length;
        var arrayNumber = "Array-" + arrayIdtoDisplay ;
        var arrayId = "Array-" + id;
        var tempArrayDetails = $("#arraydetails").clone();         
        tempArrayDetails.attr("id", arrayId);        
        tempArrayDetails.children('.arrayNumber').html(arrayNumber);
        tempArrayDetails.find('#arrayinfo').attr("id",'arrayinfo_'+id);
        tempArrayDetails.find('#azimuth').attr("id",'azimuth_'+id);
        tempArrayDetails.find('#tilt').attr("id",'tilt_'+id);
        tempArrayDetails.find('#yearlyshade').attr("id",'yearlyshade_'+id);
        tempArrayDetails.find('#janshade').attr("id",'janshade_'+id);
        tempArrayDetails.find('#febshade').attr("id",'febshade_'+id);
        tempArrayDetails.find('#marshade').attr("id",'marshade_'+id);
        tempArrayDetails.find('#aprshade').attr("id",'aprshade_'+id);
        tempArrayDetails.find('#mayshade').attr("id",'mayshade_'+id);
        tempArrayDetails.find('#junshade').attr("id",'junshade_'+id);
        tempArrayDetails.find('#julshade').attr("id",'julshade_'+id);
        tempArrayDetails.find('#augshade').attr("id",'augshade_'+id);
        tempArrayDetails.find('#sepshade').attr("id",'sepshade_'+id);
        tempArrayDetails.find('#octshade').attr("id",'octshade_'+id);
        tempArrayDetails.find('#novshade').attr("id",'novshade_'+id);
        tempArrayDetails.find('#decshade').attr("id",'decshade_'+id);
        tempArrayDetails.css("display", "block");       
        $(".array_cls").append(tempArrayDetails);
        if(mapView.getPanelShapeInfo().length === 1)
            parent.document.getElementById('designpage').style.height = 1405+"px";
        else if(mapView.getPanelShapeInfo().length === 2)
            parent.document.getElementById('designpage').style.height = 1450+"px";
        else if(mapView.getPanelShapeInfo().length === 3)
            parent.document.getElementById('designpage').style.height = 1485+"px";
        lastarray++;
    });

    mapView.onPanelShapeDeleted(function (id) {
        $("#Array-" + id).remove() ;        
        
        var abc = $(".array_single");
        for(var i=1; i< abc.length; i++){
            var temp = abc[i].children[0].innerHTML.split("-")[1];            
            if(currArrayName <= temp){
                idtoset = temp-1;
                var name = 'Array-' + idtoset;
                abc[i].children[0].innerHTML = name;
            }
        }              
        lastarray--;
         if(lastarray === 0)
        {
            document.getElementById("arraytitle").style.display = 'none';
            firstarray = 1;            
        }
        else        
            lastaddedid = mapView.getPanelShapeInfo()[0].id;
        
        if(mapView.getPanelShapeInfo().length === 1)
            parent.document.getElementById('designpage').style.height = 1405+"px";
        else if(mapView.getPanelShapeInfo().length === 2)
            parent.document.getElementById('designpage').style.height = 1450+"px";
        else if(mapView.getPanelShapeInfo().length === 3)
            parent.document.getElementById('designpage').style.height = 1485+"px";
        else
            parent.document.getElementById('designpage').style.height = 1240+"px";
    });

    mapView.onPanelShapeSelected(function (id) {
        populateArrayValues(id);
        currArray = parseInt(id);
        currArrayId = parseInt(id);
        currArrayName = document.getElementById("Array-" + id).children[0].innerHTML.split("-")[1];
        savePendingInfo();
        var deg = $('#tilt_'+id).val();
        mapView.setPanelShapePanelSlope(id, deg);
        
        if(mapView.getPanelShapeInfo().length === 1){
            totalarrays = 1;
            lastaddedid = 0;
        }
        else{
            totalarrays = 0;            
        }
        if(lastaddedid === 0 && totalarrays === 1){
            document.getElementById("Array-" + id).children[0].style.color = 'red';   
            document.getElementById("tilt_" + id).readOnly = false;
            document.getElementById("yearlyshade_" + id).readOnly = false;
            document.getElementById("janshade_" + id).readOnly = false;
            document.getElementById("febshade_" + id).readOnly = false;
            document.getElementById("marshade_" + id).readOnly = false;
            document.getElementById("aprshade_" + id).readOnly = false;
            document.getElementById("mayshade_" + id).readOnly = false;
            document.getElementById("junshade_" + id).readOnly = false;
            document.getElementById("julshade_" + id).readOnly = false;
            document.getElementById("augshade_" + id).readOnly = false;
            document.getElementById("sepshade_" + id).readOnly = false;
            document.getElementById("octshade_" + id).readOnly = false;
            document.getElementById("novshade_" + id).readOnly = false;
            document.getElementById("decshade_" + id).readOnly = false;
            document.getElementById("tilt_" + id).focus();
        }
        else{
            document.getElementById("Array-" + lastaddedid).children[0].style.color = 'black';
            document.getElementById("tilt_" + lastaddedid).readOnly = true;
            document.getElementById("yearlyshade_" + lastaddedid).readOnly = true;
            document.getElementById("janshade_" + lastaddedid).readOnly = true;
            document.getElementById("febshade_" + lastaddedid).readOnly = true;
            document.getElementById("marshade_" + lastaddedid).readOnly = true;
            document.getElementById("aprshade_" + lastaddedid).readOnly = true;
            document.getElementById("mayshade_" + lastaddedid).readOnly = true;
            document.getElementById("junshade_" + lastaddedid).readOnly = true;
            document.getElementById("julshade_" + lastaddedid).readOnly = true;
            document.getElementById("augshade_" + lastaddedid).readOnly = true;
            document.getElementById("sepshade_" + lastaddedid).readOnly = true;
            document.getElementById("octshade_" + lastaddedid).readOnly = true;
            document.getElementById("novshade_" + lastaddedid).readOnly = true;
            document.getElementById("decshade_" + lastaddedid).readOnly = true;
            document.getElementById("Array-" + id).children[0].style.color = 'red'; 
            document.getElementById("tilt_" + id).readOnly = false;
            document.getElementById("yearlyshade_" + id).readOnly = false;
            document.getElementById("janshade_" + id).readOnly = false;
            document.getElementById("febshade_" + id).readOnly = false;
            document.getElementById("marshade_" + id).readOnly = false;
            document.getElementById("aprshade_" + id).readOnly = false;
            document.getElementById("mayshade_" + id).readOnly = false;
            document.getElementById("junshade_" + id).readOnly = false;
            document.getElementById("julshade_" + id).readOnly = false;
            document.getElementById("augshade_" + id).readOnly = false;
            document.getElementById("sepshade_" + id).readOnly = false;
            document.getElementById("octshade_" + id).readOnly = false;
            document.getElementById("novshade_" + id).readOnly = false;
            document.getElementById("decshade_" + id).readOnly = false;
            document.getElementById("tilt_" + id).focus();
        }
        lastaddedid = id;
    });
    mapView.onPanelShapeChanged(function (id) {
        resetSolarCalculations();
        var info = mapView.getPanelShapeInfoById(id);             
        if (info != null) {
            $("#azimuth_"+id).text(info.azimuth.toFixed(2));
            $("#no-of-panels").text(info.panelCount);
            $("#area").text((info.panelCount*1.65).toFixed(2));
        }
        getTotalPanelCount();
        financepageflag = true;
    });
    if (typeof (worksData) != 'undefined') {
        mapView.setState(worksData);
    }
   
   $.when(getTariffByZip(), getPanelInverterDerateInfo()).done(function () {
        if (localStorage.getItem('ls.proposalToClone')) {
            getClonedProposal();
        }
    });
        
    $("#btnCloneSave").click(function () {
        var s = mapView.getState()
        var str = JSON.stringify(s)
        var uid = SunCustId //+ "_" + Number(Math.random() * 10000).toPrecision(4)
        var oid = oktaID

        var genurl = '/api/proposal/' + uid + '/clone';
        $.ajax({
            type: 'POST',
            url: genurl,
            headers: { 'x-okta-session-id': oid },
            contentType: "application/json",
            data: str,
            error: function (error) {
                waitImplementer(false)
                alert("Error saving cloned map")
            }
        }).done(function (data) {
            alert("Your map has been cloned.")
        })
    });

    $("#btnCloneLoad").click(function () {
        var uid = SunCustId
        var oid = oktaID

        var genurl = '/api/proposal/'+ uid +'/clone'
        $.ajax({
            type: 'GET',
            url: genurl,
            headers: { 'x-okta-session-id': oid },
            error: function (error) {
                waitImplementer(false)
                alert("Error fetching cloned map")
            }
        }).done(function (data) {
            mapView.setState(data)
        });
    });
    
    if(localStorage.getItem('ls.bypassProposalIDGeneration') !== "true"){
        var custname = custname.split(' ');
        var a = (custname[1].slice(0,3)).toUpperCase();
        var b = processStateName2CodeMapping((temp2).split(',')[1].replace(/ /g, ""));
        var c = Math.floor(Math.random() * 100000000);
        localStorage.setItem('ls.proposalID', (b+"-"+a+"-"+c).toString());
    }else{
        localStorage.removeItem('ls.bypassProposalIDGeneration');
    }
});
function getTariffByZip(){
    var genurl = '/api/genability/tariffs/' + Zipcode;
    $.ajax({
        type: 'GET',
        url: genurl,
        contentType: "application/json",
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            waitImplementer(false);
            logError(JSON.stringify(error));
        }
    }).done(function (data) {
        var lsenames = [];
        var lseidarray = [];
        var utilitytariffnames = [];
        var utilitytariffid = [];
        var firstrun = 0;
        Utilitieslist = data;
        var keys = Object.keys(Utilitieslist);
        for (var i = 0; i < keys.length; i++)
        {            
             if(firstrun === 0)
            {
                lsenames.push(data[keys[i]].lseName);
                lseidarray.push(data[keys[i]].lseId);
                //index = data[keys[i]].lseId;                
                utilitytariffnames.push(data[keys[i]].tariffName + " - (" + data[keys[i]].tariffCode + ")");
                utilitytariffid.push(data[keys[i]].masterTariffId);
                
                firstrun++;
            }
            else
            {
                for(var j=0;j<lseidarray.length; j++)
                {
                    if((lseidarray.indexOf(data[keys[i]].lseId)) === -1)
                    {
                        lsenames.push(data[keys[i]].lseName);
                        lseidarray.push(data[keys[i]].lseId);
                        break;
                    } 
                    if(lseidarray[j] === (data[keys[i]].lseId))
                    {
                        utilitytariffnames.push(data[keys[i]].tariffName + " - (" + data[keys[i]].tariffCode + ")");
                        utilitytariffid.push(data[keys[i]].masterTariffId);
                    } 
                }
            }               
        }
        var option_names = '';
        var option_tariffs = '';
        for (var i = 0; i < lsenames.length; i++) {
            option_names += '<option name="' + lseidarray[i] + '">' + lsenames[i] + '</option>'; 
        }        
        for (var i = 0; i < utilitytariffnames.length; i++) {
            option_tariffs += '<option value="' + utilitytariffid[i] + '">' + utilitytariffnames[i] + '</option>'; 
        }
	if(!localStorage.getItem('ls.proposalToClone') && !isClonedProposal){
            for (var i = 0; i < utilitytariffnames.length; i++) {
                if(data[keys[i]].tariffType === "DEFAULT"){
                    var elem = i;
                    break;
                }
            }
        }
        $('#rate_provider').append(option_names);
        $('#currenttariff').append(option_tariffs);
        $('#aftertariff').append(option_tariffs);
        var tariffelems = document.getElementById('currenttariff');
        var aftertariffelems = document.getElementById('aftertariff');
        if(!localStorage.getItem('ls.proposalToClone') && !isClonedProposal){
            tariffelems.options[elem].selected =true;
            aftertariffelems.options[elem].selected =true;
        }
        defaultMasterTarriffId = $("#currenttariff option:selected").val();
        defaultlseId= $("#rate_provider option:selected").attr('name');
        getterritory();
    }).fail(function(){
        alert('tariffs api failed');
    });
}
function getPanelInverterDerateInfo(){
    $.ajax({
        type: 'GET',
        url: '/api/items',
        contentType: "application/json",
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            waitImplementer(false);
            logError(JSON.stringify(error));
        }
    }).done(function (data) {
        var inverters = [];
        var panels = [];
        var option_inverteres = '';
        var option_panels = '';
        for(var i=0; i< data.Items.length;i++)
        {
            if(data.Items[i].equipment_type === 'Inverter')
            {
                var temp = {};
                temp.label = data.Items[i].label;
                temp.invertertype = data.Items[i].inverter_type;
                temp.inverterid = data.Items[i].inverter_id;
                temp.invertermanufacturer = data.Items[i].manufacturer;
                inverters.push(temp);
            }
            if(data.Items[i].equipment_type === 'Panel')
            {
                panels.push(data.Items[i].label);
            }            
        }
        for (var i = 0; i < inverters.length; i++) {
          option_inverteres += '<option id="' + inverters[i].inverterid + '" name ="' + inverters[i].invertermanufacturer + '" value="' + inverters[i].invertertype +'">' + inverters[i].label + '</option>'; 
          MasterItemData.push(inverters[i].label);
        }
        for (var i = 0; i < panels.length; i++) {
          option_panels += '<option value="' + i + '">' + panels[i] + '</option>'; 
        }
        $('#inverterinput').append(option_inverteres);
        $('#panelmodelinput').append(option_panels);        
        if(mediumtype === 'Sales Engine'){            
            $('#inverterinput').attr("disabled", true); 
            $('#inverterinput').css('background-color', 'darkgray');
        }
        $.ajax({
            type: 'GET',
            url: '/api/derate',
            contentType: "application/json",
            headers: {'x-okta-session-id': oktaID},
            error: function (error) {
                waitImplementer(false);
                logError(JSON.stringify(error));
            }
        }).done(function (response) {
           DerateData = response.Olympus_Derate_Data;
           tempstate = State.replace(" ", '_');
            for (var i = 0; i < DerateData.length; i++) {
                if( DerateData[i].Item_Label === $("#inverterinput option:selected").text())
                {
                    defaultderate = DerateData[i][tempstate];                               
                if(!defaultderate)
                    defaultderate = DerateData[i]['Other'];
                }
            }
        }).fail(function(){
                alert('derate api failed');
        });
    
    }).fail(function(){
                alert('items api failed');
    });
}
function getClonedProposal(){
    var oid = oktaID;
        var genurl = '/api/proposal/' + localStorage.getItem('ls.proposalToClone') + '/clone';
        $.ajax({
            type: 'GET',
            url: genurl,
            headers: { 'x-okta-session-id': oid },
            error: function (error) {
                waitImplementer(false)
                alert("Error fetching cloned map");
                localStorage.removeItem('ls.proposalToClone');
            }
        }).done(function (data) {
            isClonedProposal = true;
            mapView.setState(data);
            defaultMasterTarriffId = data.utilityInfo.mastertariifid ;
            $('#panelmodelinput').val(data.panelmodel);
            $('inverterinput' + data.invertermodel).prop('selected', true);
            if(data.panelShapeInfo){
                console.log(data.panelShapeInfo);
                for(var i=0; i<data.panelShapeInfo.length; i++){
                    $('#tilt_'+(i+1)).val(data.panelShapeInfo[i].slope);    
                    for(var prop in data.panelShapeInfo[i].shading){
                        $('#'+prop+'_'+(i+1)).val(data.panelShapeInfo[i].shading[prop]);
                        if(prop === 'slope'){
                            $('#tilt'+(i+1)).val(data.panelShapeInfo[i].slope);
                        }
                    }
                }
            }
            if(data.utilityInfo){
                if(data.utilityInfo.billType === 'annual'){
                    $("input[name='billtype'][value='annual']").prop("checked",true);
                }else if(data.utilityInfo.billType === 'monthlyAuto'){
                    $("input[name='billtype'][value='monthlyAuto']").prop("checked",true);
                }else{
                    $("input[name='billtype'][value='monthlyManual']").prop("checked",true);
                }
                changeBillType();
                $('#currenttariff').val(data.utilityInfo.currentTariff);
                $('#taxrate').val(data.utilityInfo.taxRate);
                $('#aftertariff').val(data.utilityInfo.afterTariff);
                $('#rate_provider').val(data.utilityInfo.rateProvider);
                $('#kwhusage').val(data.utilityInfo.kwhUsage);
                $('#annualbill').val(data.utilityInfo.annualBill);
                //updateOnYearly();
                if(data.utilityInfo.monthlyBill){
                    for(var i=0; i<data.utilityInfo.monthlyBill.length; i++){
                        monthlyBillJSON[i+1] = data.utilityInfo.monthlyBill[i];
                        $('#billmonth_'+(i+1)).val(data.utilityInfo.monthlyBill[i]);
                    }
                }
                if(data.utilityInfo.monthlyUsage){
                    for(var i=0; i<data.utilityInfo.monthlyUsage.length; i++){
                        monthlyUsageJSON[i+1] = data.utilityInfo.monthlyUsage[i];
                        $('#usagemonth_'+(i+1)).val(data.utilityInfo.monthlyUsage[i]);
                    }
                }
                calcYearlyValuesFromMonthly();
                
            }
            localStorage.removeItem('ls.proposalToClone');
        });
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
function logError(m) {
    var p = 'ERROR: ' + m;
    console.log(p);
}
function inverterchange(){
    tempstate = State.replace(" ", '_');
    for(var i=0; i<DerateData.length;i++){
           if( DerateData[i].Item_Label === $("#inverterinput option:selected").text())
                {
                        defaultderate = DerateData[i][tempstate];                               
                if(!defaultderate)
                    defaultderate = DerateData[i]['Other'];
                }
        }
console.log('Derate value -' +defaultderate);
}
function getterritory(){
    var genPayLoad = {};
    genPayLoad.LseId = defaultlseId;
    genPayLoad.MasterTariffId = defaultMasterTarriffId;
    genPayLoad.ZipCode = Zipcode;
     $.ajax({
        type: 'POST',
        url: '/api/genability/territory',
        contentType: "application/json",
        data: JSON.stringify(genPayLoad),
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            waitImplementer(false);
            logError(JSON.stringify(error));
        }
    }).done(function (data) {
        if(data.Message === 'Territories not found'){
            defaultTerritoryId = '';
        }
        else{
        defaultlseId = data.lseId;
        defaultTerritoryId = (data.territoryId).toString();
    }
    }).fail(function(){
                alert('territory api failed');
        });
}
function utilitychange(){
    
    var temp = parseInt($("#rate_provider option:selected").attr('name'));   
    var keys = Object.keys(Utilitieslist);
    var utilitytariffnames = [];
    var utilitytariffid = [];
    
    for(var i=0; i<keys.length; i++){
        if(Utilitieslist[keys[i]].lseId === temp){         
            utilitytariffnames.push(Utilitieslist[keys[i]].tariffName + " - (" + Utilitieslist[keys[i]].tariffCode + ")");
            utilitytariffid.push(Utilitieslist[keys[i]].masterTariffId);
        }            
    }
    
    document.getElementById('currenttariff').options.length = 0;
    document.getElementById('aftertariff').options.length = 0;

    var option_tariffs = '';
    for (var i = 0; i < utilitytariffnames.length; i++) {
        option_tariffs += '<option value="' + utilitytariffid[i] + '">' + utilitytariffnames[i] + '</option>';
    }
    
    $('#currenttariff').append(option_tariffs);
    $('#aftertariff').append(option_tariffs);
    
    for (var i = 0; i < utilitytariffnames.length; i++) {
        if(Utilitieslist[keys[i]].tariffType === "DEFAULT") {
            var tariffelems = document.getElementById('currenttariff');
            tariffelems.options[i].selected = true;
            var aftertariffelems = document.getElementById('aftertariff');
            aftertariffelems.options[i].selected = true;
            break;
        }
    }

    defaultMasterTarriffId = $("#currenttariff option:selected").val();
    defaultlseId = $("#rate_provider option:selected").attr('name');
    getterritory();
    
}  

function onTariffChange()
{
    //document.getElementById("update").disabled = true;
    defaultMasterTarriffId = $("#currenttariff option:selected").val();
    var aftertariffelems = document.getElementById('aftertariff');
    
     for(var i=0; i<$('#aftertariff > option').length; i++)
     {
         if(aftertariffelems.options[i].value === defaultMasterTarriffId){
            var elem = i;
            aftertariffelems.options[elem].selected =true;
            break;
         }
     }
        
    var PayLoad = {};
    PayLoad.LseId = $("#rate_provider option:selected").attr('name');
    PayLoad.MasterTariffId = $("#currenttariff option:selected").val();
    PayLoad.ZipCode = Zipcode;
     $.ajax({
        type: 'POST',
        url: '/api/genability/territory',
        contentType: "application/json",
        data: JSON.stringify(PayLoad),
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            //waitImplementer(false);
            logError(JSON.stringify(error));
        }
    }).done(function (data) {
        defaultlseId = data.lseId;
        defaultTerritoryId = data.territoryId;
        
        consumptioncall();
    }).fail(function(){
                alert('territory api failed');
        });
}

function getTotalPanelCount() {
    totalNoOfPannels = 0;
    var wholeinfo = mapView.getPanelShapeInfo();    
    for (var i = 0; i < wholeinfo.length; i++) {
        totalNoOfPannels = totalNoOfPannels + wholeinfo[i].panelCount;
    }

    if (mediumtype === 'Sales Engine' && totalNoOfPannels > 0 && !localStorage.getItem('ls.proposalToClone')) {
        for (var i = 0; i < DerateData.length; i++) {
            if (DerateData[i].Panel_Range !== '-') {
                var panelrange = (DerateData[i].Panel_Range).split('-');
                if (panelrange[0] <= totalNoOfPannels &&  panelrange[1] >= totalNoOfPannels){
                    for(var j =0; j< MasterItemData.length; j++){
                        if(DerateData[i].Item_Label === MasterItemData[j]){                            
                            document.getElementById('inverterinput').options[j].selected = true;
			    tempstate = State.replace(" ", '_');
                            defaultderate = DerateData[i][tempstate];
				 if(!defaultderate)
                                defaultderate = DerateData[i]['Other'];
			}
                    }
                }
            }
        }
    }
}

function selectArrayInfoUI(arrayid) {
    if (currArray == null) {
        showInnerCategory(true, arrayid);
    } else if (arrayid == currArray) {
        showInnerCategory(false, arrayid);
    } else {
        showInnerCategory(false);
        showInnerCategory(true, arrayid);
    }
}

function showInnerCategory(bshow, arrayid) {
    $('.array_single').removeClass("selected");
    if (bshow) {
        currArray = arrayid;
        populateArrayValues(currArray);
        $("#inner_category").removeClass("collapsed");
        $("#inner_category").addClass("expanded");
        $("#inner_category").slideDown(400);
        $('#array-' + arrayid).addClass("selected");
        if(!delflag){
	savePendingInfo();
        }
        delflag = false;
    } else {
        $("#inner_category").removeClass("expanded");
        $("#inner_category").addClass("collapsed");
        $("#inner_category").slideUp();
        if(!delflag){
        savePendingInfo();
        }
        delflag = false;
        currArray = null;        
    }
}

function populateArrayValues(currArray) {
    if (currArray === null) {
        var tempArray = document.getElementsByClassName('array_single');
        for (var i = 0; i < tempArray.length; i++) {
            if (tempArray[i].attributes[2] != undefined && tempArray[i].attributes[2].value.indexOf('font-weight: bold') > -1)
                currArray = tempArray[i].id.split("-")[1];
        }
    }
    var info = mapView.getPanelShapeInfoById(currArray);
    $("#azimuth_"+currArray).text(info.azimuth.toFixed(2));
    $("#yearlyshade_"+currArray).val(info.shading.yearlyshade);
    $("#janshade_"+currArray).val(info.shading.janshade);
    $("#febshade_"+currArray).val(info.shading.febshade);
    $("#marshade_"+currArray).val(info.shading.marshade);
    $("#aprshade_"+currArray).val(info.shading.aprshade);
    $("#mayshade_"+currArray).val(info.shading.mayshade);
    $("#junshade_"+currArray).val(info.shading.junshade);
    $("#julshade_"+currArray).val(info.shading.julshade);
    $("#augshade_"+currArray).val(info.shading.augshade);
    $("#sepshade_"+currArray).val(info.shading.sepshade);
    $("#octshade_"+currArray).val(info.shading.octshade);
    $("#novshade_"+currArray).val(info.shading.novshade);
    $("#decshade_"+currArray).val(info.shading.decshade);
    
    $("#tilt_"+currArray).val(info.slope);
}

function savePendingInfo() {
    var shading = {};
    shading.yearlyshade = $("#yearlyshade_"+currArray).val();
    shading.janshade = $("#janshade_"+currArray).val();
    shading.febshade = $("#febshade_"+currArray).val();
    shading.marshade = $("#marshade_"+currArray).val();
    shading.aprshade = $("#aprshade_"+currArray).val();
    shading.mayshade = $("#mayshade_"+currArray).val();
    shading.junshade = $("#junshade_"+currArray).val();
    shading.julshade = $("#julshade_"+currArray).val();
    shading.augshade = $("#augshade_"+currArray).val();
    shading.sepshade = $("#sepshade_"+currArray).val();
    shading.octshade = $("#octshade_"+currArray).val();
    shading.novshade = $("#novshade_"+currArray).val();
    shading.decshade = $("#decshade_"+currArray).val();
    if (currArray === null) {
        var tempArray = document.getElementsByClassName('array_single');
        for (var i = 0; i < tempArray.length; i++) {
            if (tempArray[i].attributes[2] != undefined && tempArray[i].attributes[2].value.indexOf('font-weight: bold'))
                currArray = tempArray[i].id.split("-")[1];
        }
    }
    mapView.setPanelShapeShading(currArray, shading);
    var deg = $("#tilt_"+currArray).val();
    mapView.setPanelShapePanelSlope(currArray, deg, false);
}

function calculatemonthly(){
    var temp  = parseInt($('#yearlyshade_'+currArrayId).val());
    if(!isNaN(temp) && temp <= 100){
        $('#janshade_'+currArrayId).val(temp);
        $('#febshade_'+currArrayId).val(temp);
        $('#marshade_'+currArrayId).val(temp);
        $('#aprshade_'+currArrayId).val(temp);
        $('#mayshade_'+currArrayId).val(temp);
        $('#junshade_'+currArrayId).val(temp);
        $('#julshade_'+currArrayId).val(temp);
        $('#augshade_'+currArrayId).val(temp);
        $('#sepshade_'+currArrayId).val(temp);
        $('#octshade_'+currArrayId).val(temp);
        $('#novshade_'+currArrayId).val(temp);
        $('#decshade_'+currArrayId).val(temp);
        savePendingInfo();
    }
}

function roofTypeChange() {
    var v = $('#roof-type').val();
    if (v === 'flat' || v === 'ground') {
        $('#input-slope').val(0);
        $('#input-slope').prop('disabled', true);
        $('#slopeinput').val(0); 
        updateSlope();
    }
    else if (v == 'slope') {
        $('#input-slope').val(26);
        $('#input-slope').prop('disabled', false);
	$('#slopeinput').val(26); 
        updateSlope();
    }
}

function panelTypeChange() {
    var v = $('#panel-type').val();
    switch(v)
    {
        case 'panel1': {
            mapView.setCurrPanelInfo({ width: 1.65, height: 1 });
            break;
        }
        case 'panel2': {
            mapView.setCurrPanelInfo({ width: 1, height: 1 });
            break;
        }
    }
}

function parseParams() {
    var pp = [];
    var url = window.location.href;
    var pos = url.indexOf('?');
    if (pos > 0) {
        var kvs = url.slice(pos + 1).split('&');
        for (var i = 0; i < kvs.length; i++) {
            var kv = kvs[i].split('=');
            pp.push(kv[0]);
            pp[kv[0]] = kv[1];
        }
    }
    return pp;
}

function validateInput(){
    var errorMsg = "";             
           
    if (totalNoOfPannels === 0){
        errorMsg = errorMsg + "Please place panels in appropriate place. \n";
        //return false;
    }
    if(totalNoOfPannels < 4 || totalNoOfPannels >80){
        errorMsg = errorMsg + "System size too low/high to proceed, please adjust the panels. \n";
    }
    if($('#monthly_bill').val() == 0){
        errorMsg = errorMsg + "Average monthly value cannot be blank. \n";
    }
    if(isNaN($('#monthly_bill').val())){
        errorMsg = errorMsg + "Average monthly bill must be numeric value.\n";
    }
    if($('#yearly_kwh').val() == 0){
        errorMsg = errorMsg + "Yearly Usage value cannot be blank. \n";
    }
    if(isNaN($('#yearly_kwh').val())){
        errorMsg = errorMsg + "Yearly Usage must be numeric value.\n";
    }
    if(($('#month_1').val() == 0) || ($('#month_2').val() == 0) || ($('#month_3').val() == 0) || ($('#month_4').val() == 0) ||
       ($('#month_5').val() == 0) || ($('#month_6').val() == 0) || ($('#month_7').val() == 0) || ($('#month_8').val() == 0) ||
       ($('#month_9').val() == 0) || ($('#month_10').val() == 0) || ($('#month_11').val() == 0) || ($('#month_12').val() == 0)){
        errorMsg = errorMsg + "Monthly Usage values cannot be blank. \n";
    }
    if(isNaN($('#month_1').val()) || isNaN($('#month_2').val()) || isNaN($('#month_3').val()) || isNaN($('#month_4').val()) ||
       isNaN($('#month_5').val()) || isNaN($('#month_6').val()) || isNaN($('#month_7').val()) || isNaN($('#month_8').val()) ||
       isNaN($('#month_9').val()) || isNaN($('#month_10').val()) || isNaN($('#month_11').val()) || isNaN($('#month_12').val())){
        errorMsg = errorMsg + "Monthly Usage values must be numeric. \n";
    }
    if($('#rate_provider').val() === "nonselected")
    {
        errorMsg = errorMsg +"Please select utility provider. \n";
    }
    if(isNaN($('#yearlyshade').val()) || isNaN($('#janshade').val()) || isNaN($('#febshade').val()) || isNaN($('#marshade').val()) ||
       isNaN($('#aprshade').val()) || isNaN($('#mayshade').val()) || isNaN($('#junshade').val()) || isNaN($('#julshade').val()) ||
       isNaN($('#augshade').val()) || isNaN($('#sepshade').val()) || isNaN($('#octshade').val()) || isNaN($('#novshade').val()) || 
       isNaN($('#decshade').val())){
        errorMsg = errorMsg + "Shading values must be numeric. \n";
    }
    if(($('#yearlyshade').val()<0 || $('#yearlyshade').val()>100) || ($('#janshade').val()<0 || $('#janshade').val()>100) || 
        ($('#febshade').val()<0 || $('#febshade').val()>100) || ($('#marshade').val()<0 || $('#marshade').val()>100) ||
       ($('#aprshade').val()<0 || $('#aprshade').val()>100) || ($('#mayshade').val()<0 || $('#mayshade').val()>100) || 
       ($('#junshade').val()<0 || $('#junshade').val()>100) || ($('#julshade').val()<0 || $('#julshade').val()>100) ||
       ($('#augshade').val()<0 || $('#augshade').val()>100) || ($('#sepshade').val()<0 || $('#sepshade').val()>100) || 
       ($('#octshade').val()<0 || $('#octshade').val()>100) || ($('#novshade').val()<0 || $('#novshade').val()>100) || 
       ($('#decshade').val()<0 || $('#decshade').val()>100)){
        errorMsg = errorMsg + "Shading values must be in range of 0 to 100. \n";
    }
    if($('#manufacturer').val() === "nonselected")
    {
        errorMsg = errorMsg + "Please select inverter manufacturer. \n";
    }
    if($("#invertermodel :selected").text() == "---Please select--- " || $("#invertermodel :selected").text() == " ")
    {
        errorMsg = errorMsg + "Please select inverter model. \n";
    }
    if($('#inverter_quant').val() === 0 || $('#inverter_quant').val() === ''){
        errorMsg = errorMsg + "Inverter quantity cannot be blank. \n";
    }
    if(isNaN($('#inverter_quant').val())){
        errorMsg = errorMsg + "Inverter quantity must be numeric value. \n";
    }
    if($('#installationsprice').val() === 0 || $('#installationsprice').val() === ''){
        errorMsg = errorMsg + "Installation price cannot be blank. \n";
    }
    if(isNaN($('#installationsprice').val())){
        errorMsg = errorMsg + "Installation price must be numeric value. \n";
    }
    if($('#installationsprice').val()>10 || $('#installationsprice').val()<0){
        errorMsg = errorMsg + "Installation price cannot be greater than 10 or less than 0. \n";
    }
    if(isNaN($('#additionalprice').val())){
        errorMsg = errorMsg + "Additional amount must be numeric value. \n";
    }
    if(isNaN($('#discount').val())){
        errorMsg = errorMsg + "Discount must be numeric value. \n";
    }
    if(isNaN($('#taxcredit').val())){
        errorMsg = errorMsg + "Federal Tax Credit must be numeric value. \n";
    }
    if(isNaN($('#rebate').val())){
        errorMsg = errorMsg + "Rebate must be numeric value. \n";
    }
    if(errorMsg !== ""){
        alert(errorMsg);
        return false;
    }
    if(errorMsg === "")
    {
        makePricingCall();
        return false;
    }
}

function makeProductionCall(){
    populateArrayOfAreas();
    savePendingInfo();
    
    var flag = validateProdCall();
    
    if(flag){
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'scripts/prodJSON.json'
    }).done(function (data) {
        var payLoad = JSON.stringify(data);
        var jsonobj = eval("(" + payLoad + ")");
        for(var i=0; i< mapView.getPanelShapeInfo().length; i++)
        {
            if(i!==0)
                jsonobj.Array.push({});
            var id = mapView.getPanelShapeInfo()[i].id;
            
            var deg = $('#tilt_'+id).val();
            mapView.setPanelShapePanelSlope(id, deg);
            
            jsonobj.Array[i].ArrayNumber = (i+1).toString();
            jsonobj.Array[i].panelAzimuth = (mapView.getPanelShapeInfoById(id).azimuth).toFixed(2); 
            jsonobj.Array[i].SystemSize = (mapView.getPanelShapeInfoById(id).panelCount *270)/1000; 
            if(mapView.getPanelShapeInfoById(id).slope)
                jsonobj.Array[i].panelTilt = (mapView.getPanelShapeInfoById(id).slope).toString(); 
            else
                jsonobj.Array[i].panelTilt = (0).toString();
            
            jsonobj.Array[i].InverterType = ($("#inverterinput :selected").val()).toString();            
            jsonobj.Array[i].Shading = [];                
            jsonobj.Array[i].Shading[0] = (mapView.getPanelShapeInfoById(id).shading.janshade).toString();
            jsonobj.Array[i].Shading[1] = (mapView.getPanelShapeInfoById(id).shading.febshade).toString();
            jsonobj.Array[i].Shading[2] = (mapView.getPanelShapeInfoById(id).shading.marshade).toString();
            jsonobj.Array[i].Shading[3] = (mapView.getPanelShapeInfoById(id).shading.aprshade).toString();
            jsonobj.Array[i].Shading[4] = (mapView.getPanelShapeInfoById(id).shading.mayshade).toString();
            jsonobj.Array[i].Shading[5] = (mapView.getPanelShapeInfoById(id).shading.junshade).toString();
            jsonobj.Array[i].Shading[6] = (mapView.getPanelShapeInfoById(id).shading.julshade).toString();
            jsonobj.Array[i].Shading[7] = (mapView.getPanelShapeInfoById(id).shading.augshade).toString();
            jsonobj.Array[i].Shading[8] = (mapView.getPanelShapeInfoById(id).shading.sepshade).toString();
            jsonobj.Array[i].Shading[9] = (mapView.getPanelShapeInfoById(id).shading.octshade).toString();
            jsonobj.Array[i].Shading[10] = (mapView.getPanelShapeInfoById(id).shading.novshade).toString();
            jsonobj.Array[i].Shading[11] = (mapView.getPanelShapeInfoById(id).shading.decshade).toString();
            jsonobj.Array[i].ItemLabel = ($("#inverterinput :selected").text()).toString(); 
            jsonobj.Derate = defaultderate;
            jsonobj.Lat = parseFloat(glat);
            jsonobj.Lng = parseFloat(glng);
            jsonobj.State = State.replace(" ", '_');;
        }
        
        $.ajax({
            type: 'POST',
            //url: '/api/pvwatts_v1',
            url: '/api/production',
            contentType: "application/json",
            data: JSON.stringify(jsonobj),
            headers: {'x-okta-session-id': oktaID},
            error: function (error) {
                waitImplementer(false);
                logError(JSON.stringify(error));
            }
        }).done(function (data) {
            
            var temp = 0;
            for(var i=0; i< mapView.getPanelShapeInfo().length; i++)
            {
                temp = temp + (data.productionvalues[i].annual);         
                productionval[i] = (data.productionvalues[i].shaded_monthly_production); 
                
                for(var j=0; j<productionval[i].length;j++)
                    productionval[i][j] = (productionval[i][j]).toString();
                defaultsystemSizeACW = +defaultsystemSizeACW + +data.productionvalues[i].systemSizeACW;
            }
            $('#productionspinner').css('display','none');
            $('#offsetspinner').css('display','none');
            $('#yieldspinner').css('display','none');
            
            var anual = $('#kwhusage').val();
            var span = document.getElementById("year1prod");
            if(span.firstChild !== null)
                span.removeChild(span.firstChild);
            span.appendChild(document.createTextNode(numberWithCommas(temp.toFixed(0))));
            
            var temp2 = ((temp/anual)*100).toFixed(2);
            var span2 = document.getElementById("offset");
            if(span2.firstChild !== null)
                span2.removeChild(span2.firstChild);
            span2.appendChild(document.createTextNode(temp2));
            
            var temp3 = numberWithCommas((temp/document.getElementById("systemsize").innerHTML).toFixed(2));
            var span2 = document.getElementById("yield");
            if(span2.firstChild !== null)
                span2.removeChild(span2.firstChild);
            span2.appendChild(document.createTextNode(temp3)); 
            
            postSolarCalculation();
        }).fail(function(){
                alert('production api failed');
        });
    });
}else{
        alert("Please complete your pannel design");
    }
}

function validateProdCall(){
    populateArrayOfAreas();
    var flag = true;
    if( $('#annualbill').val() === 0 || $('#monthly_bill').val() === 0){
        flag = false;
    }
    return flag;
}

function changeBillType(){
    if ($("input:radio[name='billtype']:checked").val() === 'annual') {
        $('input[id^="billmonth_"]').prop("disabled", true);
        $('input[id^="usagemonth_"]').prop("disabled", true);
        $('input[id^="billmonth_"]').css("background-color", "white");
        $('input[id^="usagemonth_"]').css("background-color", "white");
        $("#annualbill").prop("disabled", false);
        $("#annualbill").css("background-color", "#f2f2f2");
        $("#kwhusage").prop("disabled", false);
        $("#kwhusage").css("background-color", "#f2f2f2");
        $("#annualbill").focus();
        $(":radio[value=annual]").prop("disabled", true);
        $(":radio[value=monthlyAuto]").prop("disabled", false);
        $(":radio[value=monthlyManual]").prop("disabled", false);
    }else{
        $('input[id^="billmonth_"]').prop("disabled", false);
        $('input[id^="usagemonth_"]').prop("disabled", false);
        $('input[id^="billmonth_"]').css("background-color", "#f2f2f2");
        $('input[id^="usagemonth_"]').css("background-color", "#f2f2f2");
        $("#annualbill").prop("disabled", true);
        $("#annualbill").css("background-color", "white");
        $("#kwhusage").prop("disabled", true);
        $("#kwhusage").css("background-color", "white");
        $("#billmonth_1").focus();
        if ($("input:radio[name='billtype']:checked").val() === 'monthlyAuto') {
            $(":radio[value=monthlyAuto]").prop("disabled", true);
            $(":radio[value=annual]").prop("disabled", false);
            $(":radio[value=monthlyManual]").prop("disabled", false);
        }else if ($("input:radio[name='billtype']:checked").val() === 'monthlyManual') {
            $(":radio[value=monthlyManual]").prop("disabled", true);
            $(":radio[value=annual]").prop("disabled", false);
            $(":radio[value=monthlyAuto]").prop("disabled", false);
        }
    }
    resetBillAndUsageValues();
    resetSolarCalculations();
}

function disableRadioButtons(flag){
    if(flag){
        $(":radio").prop("disabled", true);
    }else{
        if ($("input:radio[name='billtype']:checked").val() === 'monthlyAuto') {
            $(":radio[value=annual]").prop("disabled", false);
            $(":radio[value=monthlyManual]").prop("disabled", false);
        }else if ($("input:radio[name='billtype']:checked").val() === 'monthlyManual') {
            $(":radio[value=annual]").prop("disabled", false);
            $(":radio[value=monthlyAuto]").prop("disabled", false);
        }else if ($("input:radio[name='billtype']:checked").val() === 'annual') {
            $(":radio[value=monthlyManual]").prop("disabled", false);
            $(":radio[value=monthlyAuto]").prop("disabled", false);
        }
    }
}

function resetBillAndUsageValues(){
    $('input[id^="billmonth_"]').val('0');
    $('input[id^="usagemonth_"]').val('0');
    $("#annualbill").val('0');
    $("#kwhusage").val('0');
    if(document.getElementById("annualusage").firstChild !== null){
        document.getElementById("annualusage").removeChild(document.getElementById("annualusage").firstChild);
    }
    if(document.getElementById("avgkwh").firstChild !== null){
        document.getElementById("avgkwh").removeChild(document.getElementById("avgkwh").firstChild);
    }
    if(document.getElementById("presolarutility").firstChild !== null){
        document.getElementById("presolarutility").removeChild(document.getElementById("presolarutility").firstChild);
    }
    resetSolarCalculations();
}

function resetSolarCalculations(){
    if(document.getElementById("postsolarutility").firstChild !== null){
        document.getElementById("postsolarutility").removeChild(document.getElementById("postsolarutility").firstChild);
    }
    if(document.getElementById("billsavings").firstChild !== null){
        document.getElementById("billsavings").removeChild(document.getElementById("billsavings").firstChild);
    }
    if(document.getElementById("systemsize").firstChild !== null){
        document.getElementById("systemsize").removeChild(document.getElementById("systemsize").firstChild);
    }
    if(document.getElementById("year1prod").firstChild !== null){
        document.getElementById("year1prod").removeChild(document.getElementById("year1prod").firstChild);
    }
    if(document.getElementById("offset").firstChild !== null){
        document.getElementById("offset").removeChild(document.getElementById("offset").firstChild);
    }
    if(document.getElementById("yield").firstChild !== null){
        document.getElementById("yield").removeChild(document.getElementById("yield").firstChild);
    }
    $("#NextButton").css({cursor: "not-allowed"});
    $("#NextButton").prop("disabled",true);
}

function applyTaxRateToBillAmount(){
    var taxRate = $('#taxrate').val();
    var monthlyBillArray = $('monthlyBill');
    for(var i=0; i<monthlyBillArray.length; i++){
        var monthlyBillAmount = monthlyBillArray[i].val();
        if(monthlyBillAmount > 0){
            monthlyBillAmount = monthlyBillAmount;
        }
    }
}

function consumptioncall(callingElement) {
    if (!isNaN($('#annualbill').val()) && $('#annualbill').val() > 0) {
        disableRadioButtons(true);
        var annualbill = parseInt($('#annualbill').val());
        var taxRate;
        if ($('#taxrate').val())
            taxRate = ($('#taxrate').val() / 100);
        else
            taxRate = 0;
        
        if (document.getElementById("annualusage").firstChild !== null) {
            if(!callingElement || callingElement.id !== 'taxrate'){
                document.getElementById("annualusage").removeChild(document.getElementById("annualusage").firstChild);
            }
            document.getElementById("avgkwh").removeChild(document.getElementById("avgkwh").firstChild);
        }
        $('#averagespinner').css('display', 'block');
        if(!callingElement || callingElement.id !== 'taxrate'){
            $('#annualspinner').css('display', 'block');
        }
        createGenebilityAccount().done(function () {
            getGenebilityValuesFromYearlyBillAndUsage().done(function (data) {
                $('#averagespinner').css('display', 'none');
                $('#annualspinner').css('display', 'none');
                var monthtoset = 0;
                var month_usage = 0;
                var month_bill = 0;
                var totalAnualBill = 0;
                for (var i = 0; i < data.results[0].seriesData.length; i++)
                {
                    if (data.results[0].seriesData[i].seriesId === 1) {
                        month_usage = data.results[0].seriesData[i].qty;
                        month_bill = data.results[0].seriesData[i].cost;
                        monthtoset = parseInt(data.results[0].seriesData[i].fromDateTime.split('-')[1]);
                        $('#usagemonth_' + monthtoset).val((month_usage).toFixed(0));
                        $('#billmonth_' + monthtoset).val((month_bill + (month_bill * taxRate)).toFixed(0));
                        totalAnualBill = totalAnualBill + (month_bill + (month_bill * taxRate));
                    }
                }
                if(!callingElement || callingElement.id !== 'taxrate'){
                    var anualUsageSpan = document.getElementById("annualusage");
                    if (anualUsageSpan.firstChild !== null)
                        anualUsageSpan.removeChild(anualUsageSpan.firstChild);
                    anualUsageSpan.appendChild(document.createTextNode(numberWithCommas((data.results[0].summary.preTotalKWh).toFixed(0))));
                    $('#kwhusage').val((data.results[0].summary.preTotalKWh).toFixed(0));
                }
                var avgkwhSpan = document.getElementById("avgkwh");
                if (avgkwhSpan.firstChild !== null)
                    avgkwhSpan.removeChild(span.firstChild);
                avgkwhSpan.appendChild(document.createTextNode(((data.results[0].summary.preTotalCost) / (data.results[0].summary.preTotalKWh)).toFixed(2)));
                $('#annualbill').val(totalAnualBill.toFixed(0));
                var preSolarUtilitySpan = document.getElementById("presolarutility");
                if (preSolarUtilitySpan.firstChild !== null)
                    preSolarUtilitySpan.removeChild(preSolarUtilitySpan.firstChild);
                preSolarUtilitySpan.appendChild(document.createTextNode(numberWithCommas(totalAnualBill.toFixed(0))));
                disableRadioButtons(false);
            }).fail(function () {
                alert('yearlyconsumption api failed');
            });
        }).fail(function () {
            alert('account api failed');
        });
    }
}

function getGenebilityValuesFromYearlyBillAndUsage() {
    var taxRate;
    if ($('#taxrate').val())
        taxRate = ($('#taxrate').val() / 100);
    else
        taxRate = 0;
    var annualbill = parseInt($('#annualbill').val());
    var payLoad = {};
    payLoad.YearlyBill = annualbill;
    payLoad.YearlyUsage = (annualbill / 0.2);
    payLoad.homeownerId = SunCustId;
    payLoad.MasterTariffId = ($("#currenttariff option:selected").val()).toString();
    payLoad.TerritoryId = defaultTerritoryId;
    payLoad.UtilityTaxRate = taxRate;
    payLoad.ZipCode = Zipcode;
    var consumptionurl = '/api/genability/' + SunCustId + '/yearlyconsumption';
    return $.ajax({
        type: 'POST',
        url: consumptionurl,
        contentType: "application/json",
        data: JSON.stringify(payLoad),
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            waitImplementer(false);
            logError(JSON.stringify(error));
        }
    });
}

function monthlyconsumptioncall(mon) {
    if(!isNaN($('#billmonth_'+mon).val())){
        monthlyBillJSON[mon] = $('#billmonth_'+mon).val();
    }
    if(($("input:radio[name='billtype']:checked").val() === 'monthlyAuto' && monthlyBillJSON.keys().length > 0)
            || (($("input:radio[name='billtype']:checked").val() === 'monthlyManual' && monthlyBillJSON.keys().length === 12))){
    
        var preSolarUtilitySpan = document.getElementById("presolarutility");
        if (preSolarUtilitySpan.firstChild !== null){
            preSolarUtilitySpan.removeChild(preSolarUtilitySpan.firstChild);
        }
        var payload_1 = {};
        payload_1.Street = addr1.replace(/%20/g, " ");
        payload_1.City = addr2.replace(/%20/g, " ").split(',')[0];
        payload_1.State = addr2.replace(/%20/g, " ").split(',')[1];
        payload_1.Zip = addr2.replace(/%20/g, " ").split(',')[2];
        payload_1.LseId = defaultlseId;
        payload_1.MasterTariffId = defaultMasterTarriffId;
        var tempurl_1 = '/api/genability/' + SunCustId + '/account';
        $.ajax({
            type: 'POST',
            url: tempurl_1,
            contentType: "application/json",
            data: JSON.stringify(payload_1),
            headers: {'x-okta-session-id': oktaID},
            error: function (error) {
                logError(JSON.stringify(error));
            }
        }).done(function () {

            var temp2;
            if ($('#taxrate').val())
                temp2 = ($('#taxrate').val() / 100);
            else
                temp2 = 0;
            if (document.getElementById("annualusage").firstChild !== null) {
                document.getElementById("annualusage").removeChild(document.getElementById("annualusage").firstChild);
                document.getElementById("avgkwh").removeChild(document.getElementById("avgkwh").firstChild);
            }
            $('#averagespinner').css('display', 'block');
            $('#annualspinner').css('display', 'block');
            var payLoad = {};
            var postSolarUtilityAmt = +$('#billmonth_1').val() + +$('#billmonth_2').val() + +$('#billmonth_3').val() + +$('#billmonth_4').val()
                                            + +$('#billmonth_5').val() + +$('#billmonth_6').val() + +$('#billmonth_7').val() + +$('#billmonth_8').val()
                                            + +$('#billmonth_9').val() + +$('#billmonth_10').val() + +$('#billmonth_11').val() + +$('#billmonth_12').val();
            payLoad.YearlyBill = postSolarUtilityAmt;
            payLoad.YearlyUsage = (postSolarUtilityAmt / 0.2);
            payLoad.homeownerId = SunCustId;
            payLoad.MasterTariffId = ($("#currenttariff option:selected").val()).toString();
            payLoad.TerritoryId = defaultTerritoryId;
            payLoad.UtilityTaxRate = temp2;
            payLoad.ZipCode = Zipcode;
            var consumptionurl = '/api/genability/' + SunCustId + '/yearlyconsumption';
            $.ajax({
                type: 'POST',
                url: consumptionurl,
                contentType: "application/json",
                data: JSON.stringify(payLoad),
                headers: {'x-okta-session-id': oktaID},
                error: function (error) {
                    waitImplementer(false);
                    logError(JSON.stringify(error));
                }
            }).done(function (data) {
                $('#averagespinner').css('display', 'none');
                $('#annualspinner').css('display', 'none');

                var monthtoset = 0;
                for (var i = 0; i < data.results[0].seriesData.length; i++)
                {
                    if (data.results[0].seriesData[i].seriesId === 1) {
                        var month_usage = data.results[0].seriesData[i].qty;
                        month_usage = data.results[0].seriesData[i].qty;
                        monthtoset = parseInt(data.results[0].seriesData[i].fromDateTime.split('-')[1]);
                        $('#usagemonth_' + monthtoset).val((month_usage).toFixed(0));
                    }
                }
                $('#kwhusage').val((data.results[0].summary.preTotalKWh).toFixed(0));
                $('#annualbill').val((data.results[0].summary.preTotalCost).toFixed(0));

                var span = document.getElementById("annualusage");
                if (span.firstChild !== null)
                    span.removeChild(span.firstChild);
                span.appendChild(document.createTextNode((data.results[0].summary.preTotalKWh).toFixed(0)));
                var span = document.getElementById("avgkwh");
                if (span.firstChild !== null)
                    span.removeChild(span.firstChild);
                span.appendChild(document.createTextNode(((data.results[0].summary.preTotalCost) / (data.results[0].summary.preTotalKWh)).toFixed(2)));
                preSolarUtilitySpan.appendChild(document.createTextNode((postSolarUtilityAmt).toFixed(0)));

            }).fail(function () {
                alert('yearlyconsumption api failed');
            });
        });
    }
}

function updateOnYearly() {
    
        if ((!isNaN($('#kwhusage').val()) && $('#kwhusage').val() > 0) ||
                (!isNaN($('#usagemonth_1').val()) && $('#usagemonth_1').val() > 0 && !isNaN($('#usagemonth_2').val()) && $('#usagemonth_2').val() > 0 &&
                        !isNaN($('#usagemonth_3').val()) && $('#usagemonth_3').val() > 0 && !isNaN($('#usagemonth_4').val()) && $('#usagemonth_4').val() > 0 &&
                        !isNaN($('#usagemonth_5').val()) && $('#usagemonth_5').val() > 0 && !isNaN($('#usagemonth_6').val()) && $('#usagemonth_6').val() > 0 &&
                        !isNaN($('#usagemonth_7').val()) && $('#usagemonth_7').val() > 0 && !isNaN($('#usagemonth_8').val()) && $('#usagemonth_8').val() > 0 &&
                        !isNaN($('#usagemonth_9').val()) && $('#usagemonth_9').val() > 0 && !isNaN($('#usagemonth_10').val()) && $('#usagemonth_10').val() > 0 &&
                        !isNaN($('#usagemonth_11').val()) && $('#usagemonth_11').val() > 0 && !isNaN($('#usagemonth_12').val()) && $('#usagemonth_12').val() > 0)) {
            if(document.getElementById("presolarutility").firstChild !== null){
                document.getElementById("annualusage").removeChild(document.getElementById("annualusage").firstChild);
                document.getElementById("presolarutility").removeChild(document.getElementById("presolarutility").firstChild);
                document.getElementById("avgkwh").removeChild(document.getElementById("avgkwh").firstChild);
                }
            $('#averagespinner').css('display','block');
            $('#annualspinner').css('display','block');
            $('#presolarspinner').css('display','block');
            
	    if(!defaultMasterTarriffId || !defaultlseId){
                defaultMasterTarriffId = $("#currenttariff option:selected").val();
                defaultlseId = $("#rate_provider option:selected").attr('name');
            }
            var payload_1 = {};
            payload_1.Street = addr1.replace(/%20/g, " ");
            payload_1.City = addr2.replace(/%20/g, " ").split(',')[0];
            payload_1.State = addr2.replace(/%20/g, " ").split(',')[1];
            payload_1.Zip = addr2.replace(/%20/g, " ").split(',')[2];
            payload_1.LseId = defaultlseId;
            payload_1.MasterTariffId = defaultMasterTarriffId;
            var tempurl_1 = '/api/genability/' + SunCustId + '/account';
            $.ajax({
            type: 'POST',
                    url: tempurl_1,
                    contentType: "application/json",
                    data: JSON.stringify(payload_1),
                    headers: {'x-okta-session-id': oktaID},
                    error: function (error) {
                        //waitImplementer(false);
                        logError(JSON.stringify(error));
                    }
            }).done(function () { 
                
            if($('#kwhusage').val())
                var temp = parseInt($('#kwhusage').val());
            var payLoad = {};
            var yearlytotal = 0;
            if (temp) {
                payLoad.YearlyUsage = (temp).toString();
            }
            else
            {
                for (var k = 1; k < 13; k++)
                {
                    yearlytotal = +yearlytotal + +$('#usagemonth_' + k).val();                    
                    $('#annualspinner').css('display','none');
                     var span = document.getElementById("annualusage");
                    if(span.firstChild !== null)
                        span.removeChild(span.firstChild);
                    span.appendChild(document.createTextNode((yearlytotal).toFixed(0)));
                }
                payLoad.YearlyUsage = (yearlytotal).toString();
            }
            payLoad.MasterTariffId = $("#currenttariff option:selected").val();
            var billurl = '/api/genability/'+SunCustId+'/yearlybill';
            $.ajax({
                type: 'POST',
                url: billurl,
                contentType: "application/json",
                data: JSON.stringify(payLoad),
                headers: {'x-okta-session-id': oktaID},
                error: function (error) {
                    waitImplementer(false);
                    logError(JSON.stringify(error));
                }
            }).done(function (data) {
                $('#averagespinner').css('display','none');
                $('#presolarspinner').css('display','none');
                $('#annualspinner').css('display','none');
                
                if (temp !== 0) {
                    var monthly = 0;
                    var month_usage = 0;
                    var allmonthusage =0;
                    
                    for (var i = 0; i < data.results[0].seriesData.length; i++)
                    {
                        if(data.results[0].seriesData[i].seriesId === 1){
                            monthly = data.results[0].seriesData[i].cost;
                            month_usage = data.results[0].seriesData[i].qty;
                            monthtoset = parseInt(data.results[0].seriesData[i].fromDateTime.split('-')[1]);

                            $('#usagemonth_' + monthtoset).val((month_usage).toFixed(0));
                            $('#billmonth_' + monthtoset).val((monthly).toFixed(0));
                            allmonthusage = allmonthusage + month_usage;
                        }
                    }
                    $('#annualbill').val(((data.results[0].summary.preTotalCost).toFixed(0))); 
                }
                else
                {
                    var monthly = 0;
                    for (var i = 0; i < data.results[0].seriesData.length; i++)
                    {
                        if(data.results[0].seriesData[i].seriesId === 1){
                            monthly = data.results[0].seriesData[i].cost;
                            monthtoset = parseInt(data.results[0].seriesData[i].fromDateTime.split('-')[1]);

                            $('#billmonth_' + monthtoset).val((monthly).toFixed(0));
                        }
                    }
                    $('#kwhusage').val(((data.results[0].summary.preTotalKWh).toFixed(0)));
                    $('#annualbill').val(((data.results[0].summary.preTotalCost).toFixed(0))); 

                }
                var span = document.getElementById("annualusage");
                if(span.firstChild !== null)
                    span.removeChild(span.firstChild);
                span.appendChild(document.createTextNode(numberWithCommas((data.results[0].summary.preTotalKWh).toFixed(0))));
                
                var span = document.getElementById("presolarutility");
                if(span.firstChild !== null)
                    span.removeChild(span.firstChild);
                span.appendChild(document.createTextNode(numberWithCommas((data.results[0].summary.preTotalCost).toFixed(0))));                
                var span = document.getElementById("avgkwh");
                    if(span.firstChild !== null)
                        span.removeChild(span.firstChild);
                    span.appendChild(document.createTextNode(((data.results[0].summary.preTotalCost)/(data.results[0].summary.preTotalKWh)).toFixed(2)));
                //document.getElementById("update").disabled = false;
            }).fail(function(){
                alert('yearlybill api failed');
            });
        });
        }
        else
        {
            //alert("Please enter positive numeric values");
        }
    
}

function closepopup()
{
    var url = parent.location.href;
    var temp = url.slice('#').split('#');
    window.top.location.href = temp[0] + '#/customerdetails';

}
    
function apicall() {

  if((document.getElementById('annualusage').innerHTML) !== '' && (document.getElementById('presolarutility').innerHTML) !== '' && mapView.getPanelShapeInfo().length !== 0)
  {   
    getTotalPanelCount();    
    var span = document.getElementById("systemsize");
    if(span.firstChild !== null)
        span.removeChild(span.firstChild);
    span.appendChild(document.createTextNode(((totalNoOfPannels * 270)/1000).toFixed(2)));
    if(document.getElementById("postsolarutility").firstChild !== null){
                document.getElementById("postsolarutility").removeChild(document.getElementById("postsolarutility").firstChild);
                document.getElementById("year1prod").removeChild(document.getElementById("year1prod").firstChild);
                document.getElementById("offset").removeChild(document.getElementById("offset").firstChild);
                document.getElementById("yield").removeChild(document.getElementById("yield").firstChild);
                document.getElementById("billsavings").removeChild(document.getElementById("billsavings").firstChild);
                }
    $('#productionspinner').css('display','block');
    $('#offsetspinner').css('display','block');
    $('#yieldspinner').css('display','block');
    $('#postsolarspinner').css('display','block');
    $('#savingsspinner').css('display','block');
    makeProductionCall(); 
  }
  else
  {      
    alert("Design System: Please complete your  system design");
  }
}

function postSolarCalculation(){
    createGenebilityAccount().done(function(){
        createSystemProfile().done(function () {
            getMonthlyUsageFromYearly().done(function () {
                getPostSolarSavings().done(function (data) {                    
                    $('#postsolarspinner').css('display','none');
                    $('#savingsspinner').css('display','none');
                    var span = document.getElementById("postsolarutility");
                    if(span.firstChild !== null)
                        span.removeChild(span.firstChild);
                    span.appendChild(document.createTextNode(numberWithCommas((data.results[0].series[1].cost).toFixed(0))));
                    var span2 = document.getElementById("billsavings");
                    if(span2.firstChild !== null)
                        span2.removeChild(span2.firstChild);
                    console.log(document.getElementById('presolarutility').innerHTML);
                    console.log(document.getElementById('postsolarutility').innerHTML);
                    span2.appendChild(document.createTextNode(numberWithCommas((removeCommaFromNumbers(document.getElementById('presolarutility').innerHTML)) - +removeCommaFromNumbers(document.getElementById('postsolarutility').innerHTML))));
                    //storeDesignData();
                    defaultsystemSizeACW = 0;
                    if (financepageflag && firstapicallflag) {
                        var url = parent.location.href;
                        var temp = url.slice('#').split('#');
                        window.top.location.href = temp[0] + '#/financeoption';
                    }
                    financepageflag = false;
                    deleteGenebilityAccount().done(function () {
                        console.log('Account deleted');
                        $("#NextButton").css({cursor: "pointer"});
                        $("#NextButton").css({opacity: "1"});
                        $("#NextButton").prop("disabled",false);
                    }).fail(function () {
                        alert('genability delete api failed');
                    });                   
                }).fail(function () {
                        alert('genability savings api failed');
                   });
            }).fail(function () {
                    alert('genability usage api failed');
                });               
        }).fail(function () {
                alert('genability systemprofile api failed');
           });
    }).fail(function () {
            alert('genability account api failed');
        });  
}

function createSystemProfile() {
    var payload = {"Array" : []};
    for (var i = 0; i < mapView.getPanelShapeInfo().length; i++)
    {
        payload.Array.push({});
        var id = mapView.getPanelShapeInfo()[i].id;
        var deg = $('#tilt_' + id).val();
        mapView.setPanelShapePanelSlope(id, deg);
        payload.Array[i].ArrayNumber = (i + 1).toString();
        payload.Array[i].Azimuth = (mapView.getPanelShapeInfoById(id).azimuth).toFixed(2);
        payload.Array[i].InverterId = $("#inverterinput option:selected").attr('id');
        payload.Array[i].InverterModel = $('#inverterinput option:selected').attr('name');
        payload.Array[i].InverterType = $('#inverterinput option:selected').val();
        payload.Array[i].ModuleQuantity = mapView.getPanelShapeInfoById(id).panelCount;
        payload.Array[i].ModuleType = $('#panelmodelinput option:selected').text();
        payload.Array[i].Orientation = mapView.getPanelShapeInfoById(id).orientation;
        payload.Array[i].SystemSize = (mapView.getPanelShapeInfoById(id).panelCount * 270) / 1000;
        if (mapView.getPanelShapeInfoById(id).slope)
            payload.Array[i].Tilt = (mapView.getPanelShapeInfoById(id).slope).toString();
        else
            payload.Array[i].Tilt = (0).toString();

        if (payload.Array[i].ModuleQuantity >= 1 && payload.Array[i].ModuleQuantity <= 36)            
            payload.Array[i].InverterQuantity = 1;
        else
            payload.Array[i].InverterQuantity = Math.ceil(payload.Array[i].ModuleQuantity/36);
        
        payload.Array[i].Shading = [];
        payload.Array[i].Shading[0] = (mapView.getPanelShapeInfoById(id).shading.janshade).toString();
        payload.Array[i].Shading[1] = (mapView.getPanelShapeInfoById(id).shading.febshade).toString();
        payload.Array[i].Shading[2] = (mapView.getPanelShapeInfoById(id).shading.marshade).toString();
        payload.Array[i].Shading[3] = (mapView.getPanelShapeInfoById(id).shading.aprshade).toString();
        payload.Array[i].Shading[4] = (mapView.getPanelShapeInfoById(id).shading.mayshade).toString();
        payload.Array[i].Shading[5] = (mapView.getPanelShapeInfoById(id).shading.junshade).toString();
        payload.Array[i].Shading[6] = (mapView.getPanelShapeInfoById(id).shading.julshade).toString();
        payload.Array[i].Shading[7] = (mapView.getPanelShapeInfoById(id).shading.augshade).toString();
        payload.Array[i].Shading[8] = (mapView.getPanelShapeInfoById(id).shading.sepshade).toString();
        payload.Array[i].Shading[9] = (mapView.getPanelShapeInfoById(id).shading.octshade).toString();
        payload.Array[i].Shading[10] = (mapView.getPanelShapeInfoById(id).shading.novshade).toString();
        payload.Array[i].Shading[11] = (mapView.getPanelShapeInfoById(id).shading.decshade).toString();
        payload.Array[i].MonthlyProduction = productionval[i];
    }
    //storeDesignData(payload.Array);
    var url = '/api/genability/' + SunCustId + '/systemProfile';
    return $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify(payload),
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            //waitImplementer(false);
            logError(JSON.stringify(error));
        }
    });
}

function getMonthlyUsageFromYearly() {
    var payload = {
        "YearlyUsage": $('#kwhusage').val()
    };
    var url = '/api/genability/' + SunCustId + '/usage';
    return $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify(payload),
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            logError(JSON.stringify(error));
        }
    });
}

function deleteGenebilityAccount() {
    var tempurl_5 = '/api/genability/' + SunCustId + '/usage';
    return $.ajax({
        type: 'DELETE',
        url: tempurl_5,
        contentType: "application/json",
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            logError(JSON.stringify(error));
        }
    });
}

function getPostSolarSavings() {
    var payload = {
        "MasterTariffId": defaultMasterTarriffId,
        "YearlyUsage": $('#kwhusage').val(),
        "NumArrays": parseInt(mapView.getPanelShapeInfo().length)
    };
    var url = '/api/genability/' + SunCustId + '/savings';
    return $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify(payload),
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            logError(JSON.stringify(error));
        }
    });
}

function storeDesignData(dataToStore) {
    var proposalToolInfo = {};
    if (Array.isArray(dataToStore)) {
        proposalToolInfo.Array = dataToStore;
        localStorage.setItem('ls.ProposalTool', JSON.stringify(proposalToolInfo));
    } else {
        proposalToolInfo = JSON.parse(localStorage.getItem('ls.ProposalTool'));
        if (!proposalToolInfo) {
            proposalToolInfo = {};
        }
        var Usage = [];
        var Billamount = [];

        proposalToolInfo.Array = [];
        for (var i = 0; i < mapView.getPanelShapeInfo().length; i++)
        {
            proposalToolInfo.Array.push({});
            var id = mapView.getPanelShapeInfo()[i].id;
            var deg = $('#tilt_' + id).val();
            mapView.setPanelShapePanelSlope(id, deg);
            proposalToolInfo.Array[i].ArrayNumber = (i + 1).toString();
            proposalToolInfo.Array[i].Azimuth = (mapView.getPanelShapeInfoById(id).azimuth).toFixed(2);
            proposalToolInfo.Array[i].InverterId = $("#inverterinput option:selected").attr('id');
            proposalToolInfo.Array[i].InverterModel = $('#inverterinput option:selected').attr('name');
            proposalToolInfo.Array[i].InverterType = $('#inverterinput option:selected').val();
            proposalToolInfo.Array[i].ModuleQuantity = mapView.getPanelShapeInfoById(id).panelCount;
            proposalToolInfo.Array[i].ModuleType = $('#panelmodelinput option:selected').text();
            proposalToolInfo.Array[i].Orientation = mapView.getPanelShapeInfoById(id).orientation;
            proposalToolInfo.Array[i].SystemSize = (mapView.getPanelShapeInfoById(id).panelCount * 270) / 1000;
            if (mapView.getPanelShapeInfoById(id).slope)
                proposalToolInfo.Array[i].Tilt = (mapView.getPanelShapeInfoById(id).slope).toString();
            else
                proposalToolInfo.Array[i].Tilt = (0).toString();

            if (proposalToolInfo.Array[i].ModuleQuantity >= 1 && proposalToolInfo.Array[i].ModuleQuantity <= 36)
                proposalToolInfo.Array[i].InverterQuantity = 1;
            else
                proposalToolInfo.Array[i].InverterQuantity = Math.ceil(proposalToolInfo.Array[i].ModuleQuantity / 36);

            proposalToolInfo.Array[i].Shading = [];
            proposalToolInfo.Array[i].Shading[0] = (mapView.getPanelShapeInfoById(id).shading.janshade).toString();
            proposalToolInfo.Array[i].Shading[1] = (mapView.getPanelShapeInfoById(id).shading.febshade).toString();
            proposalToolInfo.Array[i].Shading[2] = (mapView.getPanelShapeInfoById(id).shading.marshade).toString();
            proposalToolInfo.Array[i].Shading[3] = (mapView.getPanelShapeInfoById(id).shading.aprshade).toString();
            proposalToolInfo.Array[i].Shading[4] = (mapView.getPanelShapeInfoById(id).shading.mayshade).toString();
            proposalToolInfo.Array[i].Shading[5] = (mapView.getPanelShapeInfoById(id).shading.junshade).toString();
            proposalToolInfo.Array[i].Shading[6] = (mapView.getPanelShapeInfoById(id).shading.julshade).toString();
            proposalToolInfo.Array[i].Shading[7] = (mapView.getPanelShapeInfoById(id).shading.augshade).toString();
            proposalToolInfo.Array[i].Shading[8] = (mapView.getPanelShapeInfoById(id).shading.sepshade).toString();
            proposalToolInfo.Array[i].Shading[9] = (mapView.getPanelShapeInfoById(id).shading.octshade).toString();
            proposalToolInfo.Array[i].Shading[10] = (mapView.getPanelShapeInfoById(id).shading.novshade).toString();
            proposalToolInfo.Array[i].Shading[11] = (mapView.getPanelShapeInfoById(id).shading.decshade).toString();
            proposalToolInfo.Array[i].MonthlyProduction = productionval[i];
        }

        for (var i = 1; i < 13; i++) {
            Usage.push($('#usagemonth_' + i).val());
            Billamount.push($('#billmonth_' + i).val());
        }
        proposalToolInfo.proposaltitle = $('#proposalname').val();
        proposalToolInfo.customername = customerName;
        proposalToolInfo.address = $('#addressLine1').val() + $('#addressLine2').val();
        proposalToolInfo.annualusage = removeCommaFromNumbers(document.getElementById('annualusage').innerHTML);
        proposalToolInfo.presolarutility = removeCommaFromNumbers(document.getElementById('presolarutility').innerHTML);
        proposalToolInfo.postsolarutility = removeCommaFromNumbers(document.getElementById('postsolarutility').innerHTML);
        proposalToolInfo.systemsize = document.getElementById('systemsize').innerHTML;
        proposalToolInfo.year1production = removeCommaFromNumbers(document.getElementById('year1prod').innerHTML);
        proposalToolInfo.offset = document.getElementById('offset').innerHTML;
        proposalToolInfo.systemyield = removeCommaFromNumbers(document.getElementById('yield').innerHTML);
        proposalToolInfo.utilityprovider = $("#rate_provider option:selected").text();
        proposalToolInfo.utilityLseid = $("#rate_provider option:selected").attr('name');
        proposalToolInfo.currenttariff = $("#currenttariff option:selected").text();
        proposalToolInfo.aftertariff = $("#aftertariff option:selected").text();
        proposalToolInfo.MasterTariffId = defaultMasterTarriffId;
        proposalToolInfo.avgcostofelectricity = document.getElementById('avgkwh').innerHTML;
        proposalToolInfo.utilitytaxrate = $('#taxrate').val();
        proposalToolInfo.solarpanel = $("#panelmodelinput option:selected").text();        
        proposalToolInfo.invertername = $("#inverterinput option:selected").text();
        proposalToolInfo.invertertype = $("#inverterinput option:selected").val();
        proposalToolInfo.invertermanufacturer = $("#inverterinput option:selected").attr('name');
        proposalToolInfo.inverterId = $("#inverterinput option:selected").attr('id');
        proposalToolInfo.taxrate = $('#taxrate').val();
        proposalToolInfo.Base64Image = mapView.exportMap().split(",")[1];
        proposalToolInfo.MonthlyUsage = Usage;
        proposalToolInfo.MonthlyBill = Billamount;
        proposalToolInfo.PanelCount = totalNoOfPannels;
        proposalToolInfo.InverterDerate = defaultderate;
        proposalToolInfo.State = State;
        proposalToolInfo.ZipCode = Zipcode;
        proposalToolInfo.systemSizeACW = defaultsystemSizeACW;        
        if (totalNoOfPannels >= 1 && totalNoOfPannels <= 36)            
            proposalToolInfo.InverterQuantity = 1;
        else
            proposalToolInfo.InverterQuantity = Math.ceil(totalNoOfPannels/36);
        localStorage.setItem('ls.ProposalTool', JSON.stringify(proposalToolInfo));
    }
}

function checkinput(){
    
    var msg = '';
        
    if($('#taxrate').val()){
        if(isNaN($('#taxrate').val()))
            msg = msg +  "Invalid Utility tax Rate: Please enter a number. \n";
        else if(($('#taxrate').val() < 0) || ($('#taxrate').val() > 20))
           msg = msg +  "Invalid Utility tax Rate: Please enter a number between 0 and 20. \n";
    }
    if($('#annualbill').val()){
        if(isNaN($('#annualbill').val()))
            msg = msg +  "Invalid Annual bill: Please enter a number. \n";
    }
    if($('#kwhusage').val()){
        if(isNaN($('#kwhusage').val()))
            msg = msg +  "Invalid Annual usage: Please enter a number. \n";
    }
    for( var j=1; j<13; j++){
        if ($('#billmonth_'+j).val()) {
            if (isNaN($('#billmonth_'+j).val()))
                msg = msg +  "Invalid Monthly bill: Please enter a number. \n";
        }
        if ($('#usagemonth_'+j).val()) {
            if (isNaN($('#usagemonth_'+j).val()))
                msg = msg + "Invalid Monthly usage: Please enter a number. \n";
        }
    }
    
    for(var i=1; i<=mapView.getPanelShapeInfo().length; i++){
        
        var id = mapView.getPanelShapeInfo()[i-1].id;
        if($('#tilt_'+id).val()){
            if(isNaN($('#tilt_'+id).val()))
                msg = msg +  "Invalid Array "+i+" Tilt: Please enter a number. \n"; 
            else if(($('#tilt_'+id).val() > 90) || ($('#tilt_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" Tilt: Please enter a number between 0 and 90. \n"; 
        }       
        if($('#yearlyshade_'+id).val()){
            if(isNaN($('#yearlyshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" Annual Shading: Please enter a number. \n"; 
            else if(($('#yearlyshade_'+id).val() > 100) || ($('#yearlyshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" Annual Shading: Plese enter a number between 0 and 100. \n"; 
            
        }
        if($('#janshade_'+id).val()){
            if(isNaN($('#janshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" Janauray Shading: Please enter a number. \n"; 
            else if(($('#janshade_'+id).val() > 100) || ($('#janshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" Janauray Shading: Plese enter a number between 0 and 100. \n"; 
            
        }        
         if($('#febshade_'+id).val()){
            if(isNaN($('#febshade_'+id).val()))
                 msg = msg +  "Invalid Array "+i+" February Shading: Please enter a number. \n"; 
            else if(($('#febshade_'+id).val() > 100) || ($('#febshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" February Shading: Please enter a number between 0 and 100. \n"; 
            
        }
        if($('#marshade_'+id).val()){
            if(isNaN($('#marshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" March Shading: Please enter a number. \n"; 
            else if(($('#marshade_'+id).val() > 100) || ($('#marshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" March Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#aprshade_'+id).val()){
            if(isNaN($('#aprshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" April Shading: Please enter a number. \n";
            else if(($('#aprshade_'+id).val() > 100) || ($('#aprshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" April Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#mayshade_'+id).val()){
            if(isNaN($('#mayshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" May Shading: Please enter a number. \n";
            else if(($('#mayshade_'+id).val() > 100) || ($('#mayshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" May Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#junshade_'+id).val()){
            if(isNaN($('#junshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" June Shading: Please enter a number. \n";
            else if(($('#junshade_'+id).val() > 100) || ($('#junshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" June Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#julshade_'+id).val()){
            if(isNaN($('#julshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" July Shading: Please enter a number. \n";
            else if(($('#julshade_'+id).val() > 100) || ($('#julshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" July Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#augshade_'+id).val()){
            if(isNaN($('#augshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" August Shading: Please enter a number. \n";
            else if(($('#augshade_'+id).val() > 100) || ($('#augshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" August Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#sepshade_'+id).val()){
            if(isNaN($('#sepshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" September Shading: Please enter a number. \n";
            else if(($('#sepshade_'+id).val() > 100) || ($('#sepshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" September Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#octshade_'+id).val()){
            if(isNaN($('#octshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" October Shading: Please enter a number. \n";
            else if(($('#octshade_'+id).val() > 100) || ($('#octshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" October Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#novshade_'+id).val()){
            if(isNaN($('#novshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" November Shading: Please enter a number. \n";
            else if(($('#novshade_'+id).val() > 100) || ($('#novshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" November Shading: Please enter a number between 0 and 100. \n";
            
        }
        if($('#decshade_'+id).val()){
            if(isNaN($('#decshade_'+id).val()))
                msg = msg +  "Invalid Array "+i+" December Shading: Please enter a number. \n";
            else if(($('#decshade_'+id).val() > 100) || ($('#decshade_'+id).val() < 0))
                msg = msg +  "Invalid Array "+i+" December Shading: Please enter a number between 0 and 100. \n";
            
        }
    }
    
    if(msg !== '')
        alert(msg);
        
}

function financepage() {
    
    if((document.getElementById('presolarutility').innerHTML === ''))
        alert("Pre-solar utility is null. Please calculate the pre solar");
    else if((document.getElementById('postsolarutility').innerHTML === ''))
         alert("Post-solar utility is null. Please complete the system design");
     else{
         localStorage.setItem('ls.proposalToClone', localStorage.getItem('ls.proposalID'));
         cloneProposal().done(function (data) {
        //alert("Your map has been cloned.")
            if(financepageflag){
	      firstapicallflag = true;
              apicall();
		}
            else{
	       storeDesignData();
               var url = parent.location.href;
               var temp = url.slice('#').split('#');
               window.top.location.href = temp[0] + '#/financeoption';
            }
        });
     }         
}

function cloneProposal(){
    var s = mapView.getState();
    if(mapView.getPanelShapeInfo() && mapView.getPanelShapeInfo().length > 0){
        s.panelShapeInfo = mapView.getPanelShapeInfo();
    }
    s.utilityInfo = {};
    s.utilityInfo.billType = $("input:radio[name='billtype']:checked").val();
    s.utilityInfo.currentTariff = $('#currenttariff').val();
    s.utilityInfo.taxRate = $('#taxrate').val();
    s.utilityInfo.afterTariff = $('#aftertariff').val();
    s.utilityInfo.rateProvider = $('#rate_provider').val();
    s.utilityInfo.kwhUsage = $('#kwhusage').val();
    s.utilityInfo.mastertariifid = defaultMasterTarriffId;
    s.panelmodel = $('#panelmodelinput').val();
    s.invertermodel = $("#inverterinput option:selected").attr('id');
    s.utilityInfo.annualBill = $('#annualbill').val();
    s.utilityInfo.monthlyBill = [];
    s.utilityInfo.monthlyUsage = [];
    $('input[name="monthlyBill"]').each(function() {
        s.utilityInfo.monthlyBill.push($(this).val());
    });
    $('input[name="monthlyUsage"]').each(function() {
        s.utilityInfo.monthlyUsage.push($(this).val());
    });
    var str = JSON.stringify(s);
    var uid = SunCustId; //+ "_" + Number(Math.random() * 10000).toPrecision(4)
    var oid = oktaID;
    var proposalID = localStorage.getItem('ls.proposalID');
    var genurl = '/api/proposal/' + proposalID + '/clone';
    return  $.ajax({
                type: 'POST',
                url: genurl,
                headers: { 'x-okta-session-id': oid },
                contentType: "application/json",
                data: str,
                error: function (error) {
                waitImplementer(false);
                alert("Error saving cloned map");
                }
            });
}
function analizeAccount(mon, invokedBy) {

    var payload = {"MasterTariffId": defaultMasterTarriffId};
    var url = '/api/genability/' + SunCustId + '/ib';

    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify(payload),
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            logError(JSON.stringify(error));
        }
    }).done(function (data) {
        $('#averagespinner').css('display', 'none');
        $('#annualspinner').css('display', 'none');
        $('#presolarspinner').css('display', 'none');
        var totalusage = 0;
        var totalcost = 0;

        for (var j = 0; j < 12; j++) {
            if (data.results[0].seriesData[j].seriesId === 1)
            {
                var monthtoset = parseInt(data.results[0].seriesData[j].fromDateTime.split('-')[1]);
                totalusage = totalusage + data.results[0].seriesData[j].qty;
                totalcost = totalcost + data.results[0].seriesData[j].cost;
                if (invokedBy === 'monthlyUsage') {
                    //if (mon !== monthtoset)
                    $('#usagemonth_' + monthtoset).val((data.results[0].seriesData[j].qty).toFixed(0));
                    $('#billmonth_' + monthtoset).val((data.results[0].seriesData[j].cost).toFixed(0));
                }
                else
                {
                    //if (mon !== monthtoset)
                    $('#billmonth_' + monthtoset).val((data.results[0].seriesData[j].cost).toFixed(0));
                    $('#usagemonth_' + monthtoset).val((data.results[0].seriesData[j].qty).toFixed(0));
                }

            }
        }
        $('#kwhusage').val(totalusage.toFixed(0));
        $('#annualbill').val(totalcost.toFixed(0));

        var span = document.getElementById("annualusage");
        if (span.firstChild !== null)
            span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(totalusage.toFixed(0)));

        var span = document.getElementById("presolarutility");
        if (span.firstChild !== null)
            span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(totalcost.toFixed(0)));

        var span = document.getElementById("avgkwh");
        if (span.firstChild !== null)
            span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(((totalcost) / (totalusage)).toFixed(2)));

	$('input[id^="billmonth_"]').prop("disabled", false);
        $('input[id^="usagemonth_"]').prop("disabled", false);

    }).fail(function () {
        alert('genability ib api failed');
    });

}
 
function autoCalcFromMonthlyBill(mon) {
    disableRadioButtons(true);
    if($("input:radio[name='billtype']:checked").val() === 'monthlyAuto'){
        if (document.getElementById("presolarutility").firstChild !== null) {
            document.getElementById("annualusage").removeChild(document.getElementById("annualusage").firstChild);
            document.getElementById("presolarutility").removeChild(document.getElementById("presolarutility").firstChild);
            document.getElementById("avgkwh").removeChild(document.getElementById("avgkwh").firstChild);
        }
        $('#averagespinner').css('display', 'block');
        $('#annualspinner').css('display', 'block');
        $('#presolarspinner').css('display', 'block');
	$('input[id^="billmonth_"]').prop("disabled", true);
        $('input[id^="usagemonth_"]').prop("disabled", true);
        createGenebilityAccount().done(function (response) {
            getApproxMonthlyUsageFromBill(mon, response.results[0].providerAccountId).done(function (response) {
                createGebilityUsageProfile(response.results[0].summary.kWh, mon).done(function () {
                    analizeAccount(mon, 'monthlyBill');
                    disableRadioButtons(false);
                })
                .fail(function () {
                    alert('genability monthlyusage api failed');
                });
            }).fail(function () {
                alert('genability monthlybill api failed');
            });
        }).fail(function () {
            alert('genability account api failed');
        });
    }else{
        monthlyBillJSON[mon] = $('#billmonth_'+mon).val();
        createGenebilityAccount().done(function (response) {
                getApproxMonthlyUsageFromBill(mon, response.results[0].providerAccountId).done(function(response){
                    $('#usagemonth_'+mon).val(Math.round(response.results[0].summary.kWh));
                    monthlyUsageJSON[mon] = response.results[0].summary.kWh;
                    calcYearlyValuesFromMonthly();
                    disableRadioButtons(false);
                })
                .fail(function () {
                    alert('genability monthlyusage api failed');
                });
            }).fail(function () {
                alert('genability account api failed');
            });
    }
}

function calcYearlyValuesFromMonthly() {
    if (Object.keys(monthlyUsageJSON).length === 12) {
        var annualUsage = 0;
        var annualBill = 0;
        for (var i = 1; i <= 12; i++) {
            annualUsage = annualUsage + parseInt(monthlyUsageJSON[i]);
            annualBill = annualBill + parseInt(monthlyBillJSON[i]);
        }
        var span = document.getElementById("avgkwh");
        if (span.firstChild !== null)
            span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(((annualBill) / (annualUsage)).toFixed(2)));
        $('#kwhusage').val(annualUsage);
        $('#annualbill').val(annualBill);
        annualUsage = numberWithCommas(annualUsage);
        annualBill = numberWithCommas(annualBill);
        var spanAnnualUsage = document.getElementById("annualusage");
        if (spanAnnualUsage.firstChild !== null)
            spanAnnualUsage.removeChild(spanAnnualUsage.firstChild);
        spanAnnualUsage.appendChild(document.createTextNode(annualUsage));
        var spanPreSolarUtility = document.getElementById("presolarutility");
        if (spanPreSolarUtility.firstChild !== null)
            spanPreSolarUtility.removeChild(spanPreSolarUtility.firstChild);
        spanPreSolarUtility.appendChild(document.createTextNode(annualBill));
    }
}

function autoCalcFromMonthlyUsage(mon) {
    disableRadioButtons(true);
    if($("input:radio[name='billtype']:checked").val() === 'monthlyAuto'){
        if (document.getElementById("presolarutility").firstChild !== null) {
            document.getElementById("presolarutility").removeChild(document.getElementById("presolarutility").firstChild);
        }
        if (document.getElementById("annualusage").firstChild !== null) {
            document.getElementById("annualusage").removeChild(document.getElementById("annualusage").firstChild);
        }
        if (document.getElementById("avgkwh").firstChild !== null) {
            document.getElementById("avgkwh").removeChild(document.getElementById("avgkwh").firstChild);
        }
        $('#averagespinner').css('display', 'block');
        $('#annualspinner').css('display', 'block');
        $('#presolarspinner').css('display', 'block');
        monthlyUsageJSON[mon] = $('#usagemonth_'+mon).val();
        createGenebilityAccount().done(function (response) {
            createGebilityUsageProfile($('#usagemonth_'+mon).val(), mon).done(function () {
                analizeAccount(mon, 'monthlyUsage');
                disableRadioButtons(false);
            })
            .fail(function () {
                alert('genability monthlyusage api failed');
            });
        }).fail(function () {
            alert('genability account api failed');
        });
    }else{
        monthlyUsageJSON[mon] = $('#usagemonth_'+mon).val();
        createGenebilityAccount().done(function (response) {
                getMonthlyBillFromUsage(mon, response.results[0].providerAccountId).done(function(response){
                    $('#billmonth_'+mon).val(Math.round(response.results[0].totalCost));
                    monthlyBillJSON[mon] = response.results[0].totalCost;
                    calcYearlyValuesFromMonthly();
                    disableRadioButtons(false);
                })
                .fail(function () {
                    alert('genability monthlyusage api failed');
                });
            }).fail(function () {
                alert('genability account api failed');
            });
    }
}

function createGenebilityAccount(){
    var payload = {};
    payload.Street = addr1.replace(/%20/g, " ");
    var addr2Array = addr2.replace(/%20/g, " ").split(',');
    payload.City = addr2Array[0];
    payload.State = addr2Array[1];
    payload.Zip = addr2Array[2];
    payload.LseId = defaultlseId;
    payload.MasterTariffId = defaultMasterTarriffId;
    payload.UtilityTaxRate = parseInt($('#taxrate').val())/100;
    var url = '/api/genability/' + SunCustId + '/account';
    return $.ajax({
            type: 'POST',
            url: url,
            contentType: "application/json",
            data: JSON.stringify(payload),
            headers: {'x-okta-session-id': oktaID},
            error: function (error) {
                logError(JSON.stringify(error));
            }
        });
}

function createGebilityUsageProfile(kwh, month){
    var MonthlyUsage = [];
    var temp = {};
    temp.Month = (month).toString();
    temp.Usage = (kwh).toString();
    MonthlyUsage.push(temp);
    var payload = {'MonthlyUsage': MonthlyUsage};
    var url = '/api/genability/' + SunCustId + '/monthlyusage';

    return $.ajax({
            type: 'POST',
            url: url,
            contentType: "application/json",
            data: JSON.stringify(payload),
            headers: {'x-okta-session-id': oktaID},
            error: function (error) {
                logError(JSON.stringify(error));
            }
        });
}

function getApproxMonthlyUsageFromBill(month, providerAccountId){
    var payload = {};
    payload.MonthlyBill = $('#billmonth_' + month).val();
    payload.Month = (month).toString();
    if ($('#taxrate').val())
        payload.UtilityTaxRate = ($('#taxrate').val()).toString();
    else
        payload.UtilityTaxRate = '0';
    payload.ZipCode = Zipcode;
    payload.TerritoryId = defaultTerritoryId;
    payload.MasterTariffId = defaultMasterTarriffId;
    payload.ProviderAccountId = providerAccountId;
    return $.ajax({
            type: 'POST',
            url: '/api/monthlybill',
            contentType: "application/json",
            data: JSON.stringify(payload),
            headers: {'x-okta-session-id': oktaID},
            error: function (error) {
                logError(JSON.stringify(error));
            }
        });
}

function getMonthlyBillFromUsage(month, providerAccountId){
    var payload = {};
    payload.Month = (month).toString();
    payload.Consumption = $('#usagemonth_' + month).val();
    if ($('#taxrate').val())
        payload.UtilityTaxRate = ($('#taxrate').val()).toString();
    else
        payload.UtilityTaxRate = '0';
    payload.ZipCode = Zipcode;
    payload.TerritoryId = (defaultTerritoryId).toString();
    payload.MasterTariffId = defaultMasterTarriffId;
    payload.ProviderAccountId = providerAccountId;
    var url = '/api/genability/' + SunCustId + '/month/usage/bill';

    return $.ajax({
                type: 'POST',
                url: url,
                contentType: "application/json",
                data: JSON.stringify(payload),
                headers: {'x-okta-session-id': oktaID},
                error: function (error) {
                    logError(JSON.stringify(error));
                }
        });
}

function getMonthlyValuesFromYearlyUsage() {
    var payLoad = {};
    payLoad.YearlyUsage = $('#kwhusage').val();
    payLoad.MasterTariffId = $("#currenttariff option:selected").val();
    var url = '/api/genability/' + SunCustId + '/yearlybill';
    return $.ajax({
            type: 'POST',
            url: url,
            contentType: "application/json",
            data: JSON.stringify(payLoad),
            headers: {'x-okta-session-id': oktaID},
            error: function (error) {
                waitImplementer(false);
                logError(JSON.stringify(error));
            }
        });
}

function customerpage(){
    var url = parent.location.href;
    var temp = url.slice('#').split('#');
    window.top.location.href = temp[0] + '#/customerdetails';
}
function populateArrayOfAreas(){
    arrayOfAreas = [];
    var tempJSON = getPanelShapeInfo();    
    for (elem in tempJSON) {
       arrayOfAreas.push(tempJSON[elem]);
    }
}
function getPanelShapeInfo() {
    return mapView.getPanelShapeInfo();
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function removeCommaFromNumbers(x) {
    return x.toString().replace(',', "");
}
function updateSlope() {
    var deg = Number($('#tilt_'+currArrayId).val());
    mapView.setPanelShapePanelSlope(currArray, deg);
}
/*function initHTab() {
    $('.htabitem-panel').hide();
    var htab = $('#htab')[0];
    var rect = htab.getBoundingClientRect();
    $('#htab').children('.htabitem-panel').css({
        left: ghoff,
        top: gvoff,
        width: rect.width - (ghoff + 2 * gvoff),
        height: rect.height - 3 * gvoff
    });
    if (openedItemId != null) {
        $('#' + openedItemId).show();
    }
}

function htabitemClicked(itemId, htabitem) {
    var rect = $('#htab')[0].getBoundingClientRect();
    $('.htabitem').css('background-color', '#eff2f4');
    var lastItems = null;
    if (openedItemId != null) {
        lastItems = $('#' + openedItemId);
        $('#' + openedItemId).fadeOut(400, 'swing');
    }
    if (openedItemId == itemId) {
        openedItemId = null;
        $('.htabitem').css('background-color', 'white');
    }
    else {
        var htab = $('#htab')[0];
        var rect = htab.getBoundingClientRect();
        var nw = rect.width - (ghoff + 2 * gvoff);
        $(htabitem).css('background-color', 'white');
        $('#' + itemId).outerWidth(nw);
        $('#' + itemId).fadeIn(400, 'swing');
        openedItemId = itemId;
    }
}

function btnShareClicked() {
    var idt = mapView.exportMap();
    window.open(idt);
}
function updatePanelInfo(pc) {
    var npc = mapView.getPanelCount();
}
function exportGraph() {
    var img = new Image();
    var cn = document.createElement('canvas');
    var ctx = cn.getContext('2d');
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        var ndt = cn.toDataURL();
        window.open(ndt);
    }
    var dd = document.getElementById('graph');
    var ss = dd.getElementsByTagName('svg')[0];
    var xs = new XMLSerializer();
    var x = xs.serializeToString(ss);
    img.src = "data:image/svg+xml;base64," + btoa(x);
}
function productionValuesClicked(id) {
    mapView.setPanelShapeSelected(id);
    getProductionValues(id);
}
function getProductionValues(id){ 
    currentSelectedProdTable = id;
    var tempArray = document.getElementsByClassName("prod_single");
    var elementToShow = 0;
    for (var i=0; i<tempArray.length; i++){
        var tempElementID = $('.prod_single').eq(i)[0].id;
        if(tempElementID !== 'null' && tempElementID !== undefined && tempElementID !== '' && tempElementID.split('-')[1] == id)
            elementToShow = i-1;            
    }

    if(shadedProduction.length !== 0){
        document.getElementById("production_table").style.display = 'block';    
        $(".actual_prod").html($('#dcWatts').text());
        var tempShadedArrayDisplay = $(".shaded_prod");
        var info = getPanelShapeInfo();
        for(var j=0 ; j<tempShadedArrayDisplay.length; j++){
            $('.actual_prod').eq(j).html(actualProduction[elementToShow][j]);
            $('.shaded_prod').eq(j).html(shadedProduction[elementToShow][j]);
        }
    }else{
        alert("Production values are being calculated. Please wait for a minute and try again");
    }
    
    $(".prod_single").removeClass("selected");
    $('#prod-' + id).addClass("selected");

}

function testPopup() {
    //pdfURL = "data:application/pdf;base64," + data;
    popupWin = window.open('', 'popupWin', 'height=830,width=750');
    popupWin.document.writeln('<html><head><title>test</title></head><body><div><iframe id="pdfIframe"></iframe></div><input type="button" value="Generate Contract"/></body></html>');
    popupWin.document.close();
    popupWin.document.getElementById("pdfIframe").src = "http://google.com";
}

function waitImplementer(flag, msgsForLease) {
    if (flag) {
        document.getElementById("blackout").style.display = 'block';
        for (var i = 1; i <= msgsForLease.length; i++) {
            (function (index) {
                setTimeout(function () {
                    document.getElementById("dispMsg").innerHTML = msgsForLease[index - 1];
                }, i * 7000);
            })(i);
        }
    }
        //document.getElementById("blackout").style.display = 'none';
        //document.getElementById("dispMsg").innerHTML = "Processing ...";
}
function updateInstPrice() {
    var temp = $("#installationsprice").val();
    var span = document.getElementById("instPricePerWattRight");
    span.removeChild(span.firstChild);
    span.appendChild(document.createTextNode(temp));
    totalamnt();
}

function onProposalClicked() {
    var map_view = document.getElementById("map-view");
    var ll = 0 - map_view.clientWidth;
    var dl = 0;

    $("#map-view").animate({
        left: '2px',
        opacity: 1
    }, 1100, 'swing', function () {
        $(window).resize();
    });
}
function onMapCloseClicked() {
    var ow = $("#map-view").outerWidth();
    var dleft = (-20 - ow) + 'px';

    $("#map-view").animate({
        left: dleft,
        opacity: 0.1
    });
}

function clearPanelShapes() {
    mapView.clearPanels();
};

function updaterange(slopeval){
    if(!isNaN($('#slopeinput').val())){
        $('#slopeinput').val(slopeval);
        var slider = document.getElementById('input-slope');
        slider.value=parseInt(slopeval);
        updateSlope();
    }
}

function list(array_list)
{
    $("#invertermodel").html(""); 
    $(array_list).each(function (i) { 
        $("#invertermodel").append("<option value=\""+array_list[i].value+"\">"+array_list[i]+"</option>");
    });
}

function updateOnYearlyNew(month) {
    
        if ((!isNaN($('#kwhusage').val()) && $('#kwhusage').val() > 0) ||
                (!isNaN($('#usagemonth_1').val()) && $('#usagemonth_1').val() > 0 && !isNaN($('#usagemonth_2').val()) && $('#usagemonth_2').val() > 0 &&
                        !isNaN($('#usagemonth_3').val()) && $('#usagemonth_3').val() > 0 && !isNaN($('#usagemonth_4').val()) && $('#usagemonth_4').val() > 0 &&
                        !isNaN($('#usagemonth_5').val()) && $('#usagemonth_5').val() > 0 && !isNaN($('#usagemonth_6').val()) && $('#usagemonth_6').val() > 0 &&
                        !isNaN($('#usagemonth_7').val()) && $('#usagemonth_7').val() > 0 && !isNaN($('#usagemonth_8').val()) && $('#usagemonth_8').val() > 0 &&
                        !isNaN($('#usagemonth_9').val()) && $('#usagemonth_9').val() > 0 && !isNaN($('#usagemonth_10').val()) && $('#usagemonth_10').val() > 0 &&
                        !isNaN($('#usagemonth_11').val()) && $('#usagemonth_11').val() > 0 && !isNaN($('#usagemonth_12').val()) && $('#usagemonth_12').val() > 0)) {
            if(document.getElementById("presolarutility").firstChild !== null){
                document.getElementById("annualusage").removeChild(document.getElementById("annualusage").firstChild);
                document.getElementById("presolarutility").removeChild(document.getElementById("presolarutility").firstChild);
                document.getElementById("avgkwh").removeChild(document.getElementById("avgkwh").firstChild);
                }
            $('#averagespinner').css('display','block');
            $('#annualspinner').css('display','block');
            $('#presolarspinner').css('display','block');
            
            var payload_1 = {};
            payload_1.Street = addr1.replace(/%20/g, " ");
            payload_1.City = addr2.replace(/%20/g, " ").split(',')[0];
            payload_1.State = addr2.replace(/%20/g, " ").split(',')[1];
            payload_1.Zip = addr2.replace(/%20/g, " ").split(',')[2];
            payload_1.LseId = defaultlseId;
            payload_1.MasterTariffId = defaultMasterTarriffId;
            var tempurl_1 = '/api/genability/' + SunCustId + '/account';
            $.ajax({
            type: 'POST',
                    url: tempurl_1,
                    contentType: "application/json",
                    data: JSON.stringify(payload_1),
                    headers: {'x-okta-session-id': oktaID},
                    error: function (error) {
                        //waitImplementer(false);
                        logError(JSON.stringify(error));
                    }
            }).done(function () { 
                
            if($('#kwhusage').val())
                var temp = parseInt($('#kwhusage').val());
            var payLoad = {};
            var yearlytotal = 0;
            if ((typeof month === 'undefined' || month === '' || month === null) && temp) {
                payLoad.YearlyUsage = (temp).toString();
                $('#annualspinner').css('display','none');
                var span = document.getElementById("annualusage");
                if(span.firstChild !== null)
                    span.removeChild(span.firstChild);
                span.appendChild(document.createTextNode((temp).toFixed(0)));
            }
            else
            {
                for (var k = 1; k < 13; k++)
                {
                    yearlytotal = +yearlytotal + +$('#usagemonth_' + k).val();                    
                    $('#annualspinner').css('display','none');
                     var span = document.getElementById("annualusage");
                    if(span.firstChild !== null)
                        span.removeChild(span.firstChild);
                    span.appendChild(document.createTextNode((yearlytotal).toFixed(0)));
                }
                payLoad.YearlyUsage = (yearlytotal).toString();
            }
            $('#kwhusage').val('yearlytotal');
            payLoad.MasterTariffId = $("#currenttariff option:selected").val();
            var billurl = '/api/genability/'+SunCustId+'/yearlybill';
            $.ajax({
                type: 'POST',
                url: billurl,
                contentType: "application/json",
                data: JSON.stringify(payLoad),
                headers: {'x-okta-session-id': oktaID},
                error: function (error) {
                    waitImplementer(false);
                    logError(JSON.stringify(error));
                }
            }).done(function (data) {
                $('#averagespinner').css('display','none');
                $('#presolarspinner').css('display','none');
                
                if ((typeof month === 'undefined' || month === '' || month === null) && temp !== 0) {
                    var monthly = 0;
                    var month_usage = 0;
                    var allmonthusage =0;
                    for (var i = 0; i < data.results[0].seriesData.length; i++)
                    {
                        if(data.results[0].seriesData[i].seriesId === 1){
                            monthly = data.results[0].seriesData[i].cost;
                            month_usage = data.results[0].seriesData[i].qty;
                            monthtoset = parseInt(data.results[0].seriesData[i].fromDateTime.split('-')[1]);

                            $('#usagemonth_' + monthtoset).val((month_usage).toFixed(0));
                            $('#billmonth_' + monthtoset).val((monthly).toFixed(0));
                            allmonthusage = allmonthusage + month_usage;
                        }
                    }       
                    $('#annualbill').val((data.results[0].summary.preTotalCost).toFixed(0)); 
                }
                else
                {
                    var monthly = 0;
                    for (var i = 0; i < data.results[0].seriesData.length; i++)
                    {
                        if(data.results[0].seriesData[i].seriesId === 1){
                            monthly = data.results[0].seriesData[i].cost;
                            monthtoset = parseInt(data.results[0].seriesData[i].fromDateTime.split('-')[1]);
                            $('#billmonth_' + monthtoset).val((monthly).toFixed(0));
                        }
                    }
                    $('#kwhusage').val((data.results[0].summary.preTotalKWh).toFixed(0));
                    $('#annualbill').val((data.results[0].summary.preTotalCost).toFixed(0)); 

                }
                var span = document.getElementById("presolarutility");
                if(span.firstChild !== null)
                    span.removeChild(span.firstChild);
                span.appendChild(document.createTextNode((data.results[0].summary.preTotalCost).toFixed(0)));                
                var span = document.getElementById("avgkwh");
                    if(span.firstChild !== null)
                        span.removeChild(span.firstChild);
                    span.appendChild(document.createTextNode(((data.results[0].summary.preTotalCost)/(data.results[0].summary.preTotalKWh)).toFixed(2)));
            }).fail(function(){
                alert('yearlybill api failed');
            });
        });
        }
        else
        {
            //alert("Please enter positive numeric values");
        }
    
}

function automonthlyusagecalc(mon) {
    
    usagebill_flag = 'usage';
    
    if ((!isNaN($('#usagemonth_1').val()) && $('#usagemonth_1').val() > 0) || (!isNaN($('#usagemonth_2').val()) && $('#usagemonth_2').val() > 0) ||
            (!isNaN($('#usagemonth_3').val()) && $('#usagemonth_3').val() > 0) || (!isNaN($('#usagemonth_4').val()) && $('#usagemonth_4').val() > 0) ||
            (!isNaN($('#usagemonth_5').val()) && $('#usagemonth_5').val() > 0) || (!isNaN($('#usagemonth_6').val()) && $('#usagemonth_6').val() > 0) ||
            (!isNaN($('#usagemonth_7').val()) && $('#usagemonth_7').val() > 0) || (!isNaN($('#usagemonth_8').val()) && $('#usagemonth_8').val() > 0) ||
            (!isNaN($('#usagemonth_9').val()) && $('#usagemonth_9').val() > 0) || (!isNaN($('#usagemonth_10').val()) && $('#usagemonth_10').val() > 0) ||
            (!isNaN($('#usagemonth_11').val()) && $('#usagemonth_11').val() > 0) || (!isNaN($('#usagemonth_12').val()) && $('#usagemonth_12').val() > 0)) {
    
        if (document.getElementById("presolarutility").firstChild !== null) {
            document.getElementById("annualusage").removeChild(document.getElementById("annualusage").firstChild);
            document.getElementById("presolarutility").removeChild(document.getElementById("presolarutility").firstChild);
            document.getElementById("avgkwh").removeChild(document.getElementById("avgkwh").firstChild);
        }
        $('#averagespinner').css('display', 'block');
        $('#annualspinner').css('display', 'block');
        $('#presolarspinner').css('display', 'block');
            
    var payload_1 = {};
    payload_1.Street = addr1.replace(/%20/g, " ");
    payload_1.City = addr2.replace(/%20/g, " ").split(',')[0];
    payload_1.State = addr2.replace(/%20/g, " ").split(',')[1];
    payload_1.Zip = addr2.replace(/%20/g, " ").split(',')[2];
    payload_1.LseId = defaultlseId;
    payload_1.MasterTariffId = defaultMasterTarriffId;

    var tempurl_1 = '/api/genability/' + SunCustId + '/account';
    $.ajax({
        type: 'POST',
        url: tempurl_1,
        contentType: "application/json",
        data: JSON.stringify(payload_1),
        headers: {'x-okta-session-id': oktaID},
        error: function (error) {
            //waitImplementer(false);
            logError(JSON.stringify(error));
        }
    }).done(function () {
        
        var MonthlyUsage=[];    
        for (var i = 1; i < 13; i++) {
            if (!isNaN($('#usagemonth_' + i).val()) && $('#usagemonth_' + i).val() > 0)
            {
                var temp = {};
                temp.Month =(i).toString();
                temp.Usage = $('#usagemonth_' + i).val();
                MonthlyUsage.push(temp);
            }
        }
        var payload_2 = {'MonthlyUsage': MonthlyUsage};
        var tempurl_2 = '/api/genability/' + SunCustId + '/monthlyusage';
        
        $.ajax({
                type: 'POST',
                url: tempurl_2,
                contentType: "application/json",
                data: JSON.stringify(payload_2),
                headers: {'x-okta-session-id': oktaID},
                error: function (error) {
                    //waitImplementer(false);
                    logError(JSON.stringify(error));
                }
            }).done(function () {               
               savingsapicall(mon); 
            }).fail(function () {
                alert('genability monthlyusage api failed');
           }); 
    }).fail(function () {
            alert('genability account api failed');
    });
} 
}

function monthlyusagecalc(mon){
    
    if ($("input:radio[name='billtype']:checked").val() === 'auto') 
        automonthlyusagecalc(mon);
    else    
        updateOnYearlyNew(mon);
    
}

function monthlybillcalc(mon){
    if ($("input:radio[name='billtype']:checked").val() === 'monthlyAuto') 
        automonthlybillcalc(mon);
    else    
        monthlyconsumptioncall();
}

function designsavedemo(){
    var payload = { "test": "344", "aa":67, "id":111};
    var testurl = '/api/proposal/'+12345+'/clone';
    $.ajax({
                type: 'POST',
                url: testurl,
                contentType: "application/json",
                data: JSON.stringify(payload),
                headers: {'x-okta-session-id': oktaID},
                error: function (error) {
                    //waitImplementer(false);
                    logError(JSON.stringify(error));
                }
            }).done(function () {
               
                 console.log('design saved');
               
        }); 
}
function designgetdemo(){
    //var payload = { "test": "344", "aa":67, "id":111};
    var testurl = '/api/proposal/'+12345+'/clone';
    $.ajax({
                type: 'GET',
                url: testurl,
                contentType: "application/json",
                data: JSON.stringify(payload),
                headers: {'x-okta-session-id': oktaID},
                error: function (error) {
                    //waitImplementer(false);
                    logError(JSON.stringify(error));
                }
            }).done(function (data) {
               
                 console.log(data);
               
        }); 
}*/

