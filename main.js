(function(){

  //console.log('Juks ødelegge moroa!');

  scene('setup');

  $("#clipBoardBtn").click(function(){ exportSetupCode.select(); document.execCommand("copy"); });
  $("#exportBtn").click(function(){ exportToFile( exportSetupCode.value ); });
  $("#importBtn").click(function(){ importSetup( importSetupCode.value ); });
  $('#exportSetupCode').on( "click", function(){ this.select(); });
  $('#importSetupCode').on( "click", function(){ this.select(); });
  $("#proceedBtn").click(function(){ goToDay('next'); window.scrollTo(0,0); this.blur(); });
  $("#nextDayBtn").click(function(){ goToDay('next'); });
  $("#prevDayBtn").click(function(){ goToDay('previous'); });
  $("#lastDayBtn").click(function(){ goToDay('last'); });
  $("#firstDayBtn").click(function(){ goToDay('first'); });
  $('#imgURLInput').on( "click", function(){ this.select(); });
  $("#addPlayerBtn").click(function(){ addPlayer(); });
  $("#startBtn").click(function(){ startGame(); });
  $("#saveloadScreenBtn").click(function(){ goToSaveLoad(); });
  $("#setupBackBtn").click(function(){ scene('setup','fade'); });
  $("#setupBackBtn2").click(function(){ scene('setup','fade'); });
  $("#clearPlayersBtn").click(function(){ clearPlayers(); });
  $("#startBtn").prop('disabled', true);
  $('#generalSettingsBtn').on('click', function(event) {
        $('#generalSettings').slideToggle('show');
    });

    $("#roster,#setupPart").click(function(){
      if (event.target !== this)
      return;
      $editingPlayerID = null;
      hideCharSettings();
    });

    $('#imgURLInput').change(function(){
      changePlayerValue( $editingPlayerID, 'imgURL', this.value );
      if ( this.value.length < 1) { changePlayerValue( $editingPlayerID, 'imgURL', 'anon.jpg' );  }
    });

    $('#settingsPlayerName').change(function(){
      thePlayer = playersArray.find( ({ id }) => id == $editingPlayerID );

      this.value = escapeHtml(this.value);
      changePlayerValue( $editingPlayerID, 'name', this.value );
      if ( this.value.length < 1) { changePlayerValue( $editingPlayerID, 'name', 'Player ' + thePlayer['id'] );  }
    });


  var playersArray = [];
  var playersIncrement = 0;

  var defaultStat = 4;
  var maxStat = 6;
  var minStat = 1;
  var setupReady = false;

  var defaultStats = [];
  var editableStats = [];
  var editableInfo = [];
  var selectPlayerAction = function(playerObject){};
  var currentPlayerAction = function(playerObject){};
  var turnPassiveEvents = function(playerObject){};
  var dayStartEvents = function(){};
  var dayEndEvents = function(){};
  var initialEvents = function(){};
  var turnsPerDay = 1;

  var setupNickname = "Setup Name";
  var setup = "";
  $( "#setupSelector" ).val("Battle Royale");
  selectSetup( $( "#setupSelector option:selected" ).text() );
  $("#setupSelector").change(function(){ selectSetup( $( "#setupSelector option:selected" ).text() );  });



  var $chosen = null;
  var $editingPlayerID = null;




  document.getElementById('input-file')
  .addEventListener('change', getFile)

  function getFile(event) {
  	const input = event.target
    if ('files' in input && input.files.length > 0) {
  	  placeFileContent(
        document.getElementById('importSetupCode'),
        input.files[0])
    }
  }

  function placeFileContent(target, file) {
  	readFileContent(file).then(content => {
    	target.value = content;
      importSetup( importSetupCode.value );
    }).catch(error => console.log(error));
  }

  function readFileContent(file) {
  	const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = event => resolve(event.target.result)
      reader.onerror = error => reject(error)
      reader.readAsText(file)
    })
  }



  function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      var files = evt.dataTransfer.files; // FileList object.
      var reader = new FileReader();
      reader.onload = function(event) {
           document.getElementById('importSetupCode').value = event.target.result;
           importSetup( importSetupCode.value );
      }
      reader.readAsText(files[0],"UTF-8");

    }

    function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    // Setup the dnd listeners.
    var dropZone = document.getElementById('importSetupCode');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);




  function clearPlayers(){
    playersArray = [];
    playersIncrement = 0;
    $('.playerCard').remove();
    $editingPlayerID = null;
    hideCharSettings();
    setupNickname = "Setup Name";
    readyCheck();

  }


  function placeAfter($block, id) {
      hideCharSettings();
      $block.after($('#charSettings'));
      $('#charSettings').show('blind','fast');

      $('html,body').animate({
        scrollTop: $("#player" + $editingPlayerID).offset().top - ( $("#player" + $editingPlayerID).offset().top / 2)
        }, 'slow');

      updateSelectedHighlight();
  }


  function updateSelectedHighlight(){

    if($editingPlayerID == null){
      $('.playerCard').removeAttr('style');
   } else {
      $('.playerCard').removeAttr('style');
      $('#player' + $editingPlayerID).css("background-color", "#282828");
    }

  }


  function hideCharSettings() {
    $('#charSettings').hide('blind','fast', function(){ updatePlayerCharSettings(); updatePlayerCharSettings(); } );
    updateSelectedHighlight();
  }

  function updatePlayerCharSettings(){

    thePlayer = playersArray.find( ({ id }) => id == $editingPlayerID );
    theIndex = playersArray.findIndex( ({ id }) => id == $editingPlayerID );

    if (typeof thePlayer !== 'undefined' ){

      $('#settingsPlayerName').text( thePlayer["name"] );
      $('#imgURLInput').val( thePlayer["imgURL"] );
      $('#settingsPlayerName').val( thePlayer["name"] );
      $('#settingsPlayerName').one( "click", function(){ this.select(); });
      //$('#charSettings').css("background-image", "url("+thePlayer["imgURL"]+")" );

      $('#infoEditArea').empty();
      $('#statEditArea').empty();
      $('#statEditArea').append('<table id="statTable"><col width="100"><col width="100"></table>');

        $.each(editableInfo, function( index, value ) {
          $('#infoEditArea').append( '<select id="selecto'+index+'" selected="'+value['default']+'"></select>' );

          $.each(value['options'], function( nuindex, nuvalue ) {
            $('#selecto'+index).append( '<option>'+nuvalue+'</option>' );
          });

          if (typeof thePlayer[value['name']] !== 'undefined' ){
            $('#selecto'+index).val(thePlayer[value['name']]);
          }

          $('#selecto'+index).change( function(){  changePlayerValue($editingPlayerID, value['name'], this.value );  } );

        });

        $.each(editableStats, function( index, value ) {
          trimmedValue = value.replace(/\s/g, '');

          if ($('#'+value+'Stat').length > 0) { } else {
            $('#statTable').append( '<tr><td>'+value+': </td><td id="'+trimmedValue+'Stat" class="statNumber">3</td><td><input type="button" id="'+trimmedValue+'Minus" class="statBtn" value="-"><input type="button" class="statBtn" id="'+trimmedValue+'Plus" value="+"></td></tr>' );
          }
          $('#'+trimmedValue+'Minus').click( function(){   changePlayerValue($editingPlayerID, value, (thePlayer[value] - 1) );   } );
          $('#'+trimmedValue+'Plus').click( function(){   changePlayerValue($editingPlayerID, value, (thePlayer[value] + 1) );   } );

          if (typeof thePlayer[value] !== 'undefined') {

              $('#'+trimmedValue+'Stat').text( thePlayer[value] );
               if( thePlayer[value] == 1 ) { $('#'+value+'Stat').text( 'None' ); }
              if( thePlayer[value] == 2 ) { $('#'+value+'Stat').text( 'Bad' ); }
              if( thePlayer[value] == 3 ) { $('#'+value+'Stat').text( 'Average' ); }
              if( thePlayer[value] == 4 ) { $('#'+value+'Stat').text( 'Good' ); }
              if( thePlayer[value] == 5 ) { $('#'+value+'Stat').text( 'Great' ); }
              if( thePlayer[value] == 6 ) { $('#'+value+'Stat').text( 'Outstanding' ); }

              $('#'+trimmedValue+'Stat').addClass( 'color'+ thePlayer[value] );

          } else {

              changePlayerValue($editingPlayerID, value, defaultStat );

          }

        });

    }

  }

  function addPlayer(preCreatedPlayer) {

    var isPreCreated = 0;

    if (typeof preCreatedPlayer == 'undefined' ){

    isPreCreated = 0;
    playersIncrement = Math.max(...playersArray.map(o => o.id), 0);
    var newPlayerId = playersIncrement + 1;
    playersIncrement = newPlayerId;

    var newPlayer = { id: newPlayerId, name: "Player " + newPlayerId, imgURL:"anon.jpg", associations: {}, conditions_objectives: {}, inventory: {}, isNameEdited: false };

  } else {

    isPreCreated = 1;
    playersIncrement = preCreatedPlayer["id"];
    var newPlayerId = preCreatedPlayer["id"];
    var newPlayer = preCreatedPlayer;

  }

    if (isPreCreated == 0 ) { playersArray.push(newPlayer); }

    $('#roster').append('<div class="playerCard" id="player'+newPlayer['id']+'"></div>');
    $('#player' + newPlayer['id'] ).append('<input type="button" class="deletePlayerButton" value="x">');
    $('#player' + newPlayer['id'] ).append('<div class="imgWrapper"><img class="playerImg" src="'+newPlayer['imgURL']+'" /></div>');
    $('#player' + newPlayer['id'] ).append('<input type="text" class="playerCardName" maxlength="25" placeholder="Player '+newPlayer['id']+'">');

    if (isPreCreated == 1 && newPlayer['isNameEdited'] == true ) {
      //$('#player' + newPlayer['id'] + ' .playerCardName' ).val(newPlayer['name']);
      changePlayerValue(newPlayer['id'],'name',newPlayer['name']);

    }


    $('#player' + newPlayer['id'] + ' .playerImg' ).on("error", function () {
        $('#player' + newPlayer['id'] + ' .playerImg' ).attr("src", "anon.jpg");
        changePlayerValue( $editingPlayerID, 'imgURL', 'anon.jpg' );
    });

    $('#player' + newPlayer['id'] ).on("dragover", function(){
      event.preventDefault();
    });

    $('#player' + newPlayer['id'] ).on("drop", function(){
      event.preventDefault();
      var data = event.dataTransfer.getData("text/html");
      var url = $(data).find('img').attr('src');

      changePlayerValue( newPlayer['id'], 'imgURL', url );
    });

    $('#player' + newPlayer['id'] + ' .deletePlayerButton').click(function(){ deletePlayer(newPlayer['id']); });
    $('#player' + newPlayer['id'] + ' .playerCardName').one( "click", function(){ this.select(); });

    $('#player' + newPlayer['id']).css("background-image", newPlayer['imgURL']);

    $('#player' + newPlayer['id'] + ' .playerCardName').on('keypress',function(e) {
        if(e.which == 13) {

            var $quan = $('.playerCardName');
            var ind = $quan.index(this);
            $quan.eq(ind + 1).focus()

            $('html,body').animate({
              scrollTop: $( $quan.eq(ind + 1) ).offset().top - ( $( $quan.eq(ind + 1) ).offset().top / 2)
              }, 'slow');
        }
    });

    $('#player' + newPlayer['id'] ).click(function(){

      if ( $('#player' + newPlayer['id'] + ' .playerCardName').is(":focus") )
      return;

      if ( $editingPlayerID == newPlayer['id'] ) {

        $editingPlayerID = null;
        hideCharSettings();

      } else {

      $chosen = $(this);
      $editingPlayerID = newPlayer['id'];
      //$('#charSettings').css('display','inline-block'); //show
      var top = $(this).offset().top;
      var $blocks = $(this).nextAll('.playerCard'); //for each block after clicked
      if ($blocks.length == 0) {  //place it if its the final in row
        placeAfter($(this));
        return false;
      }
      $blocks.each(function(i, j) {
        if($(this).offset().top != top) {
            placeAfter($(this).prev('.playerCard'));
            return false;
        } else if ((i + 1) == $blocks.length) {
            placeAfter($(this));
            return false;
        }
      });
      }

    });

    $('#player' + newPlayer['id'] + ' .playerCardName').change(function(){
      this.value = escapeHtml(this.value);
      changePlayerValue( newPlayer['id'], 'name', this.value );
      if ( this.value.length < 1) { changePlayerValue( newPlayer['id'], 'name', 'Player ' + newPlayer['id'] );  }
    });

      $.each(editableInfo, function( statIndex, theStat ) {
        if ( typeof newPlayer[theStat['name']] == 'undefined' ) {
            changePlayerValue(newPlayer['id'], theStat['name'], theStat['default'] );
          }
      });

      $.each(editableStats, function( index, value ) {
        if ( typeof newPlayer[value] == 'undefined' ) {
          changePlayerValue(newPlayer['id'], value, defaultStat );
        }
      });

    $editingPlayerID = null;
    hideCharSettings();
    readyCheck();

  }



  function deletePlayer(playerId) {

    thePlayer = playersArray.find( ({ id }) => id == playerId );
    theIndex = playersArray.findIndex( ({ id }) => id == playerId );

    playersArray.splice(theIndex,1);
    $('#player' + thePlayer['id'] ).remove();

    $editingPlayerID = null;
    hideCharSettings();
    readyCheck();

  }


  function changePlayerValue(playerId, valueToChange, newValue){

        thePlayer = playersArray.find( ({ id }) => id == playerId );
        theIndex = playersArray.findIndex( ({ id }) => id == playerId );

        if (newValue > maxStat ){ newValue = maxStat }; if (newValue < minStat ){ newValue = minStat };
        playersArray[theIndex][valueToChange] = newValue;

        if ( valueToChange == "imgURL" ) {
          $('#player' + playerId + ' .playerImg' ).attr("src", newValue);
          $('#player' + playerId).css("background-image", newValue);
        }

        if ( valueToChange == "name" ) {
          $('#player' + playerId + ' .playerCardName' ).val( newValue );
          playersArray[theIndex]['isNameEdited'] = true;

          $('#player' + playerId + ' .playerCardName').removeAttr('style');
          if(newValue.length > 15){ $('#player' + playerId + ' .playerCardName').css("font-stretch", "condensed"); }
          if(newValue.length > 20){ $('#player' + playerId + ' .playerCardName').css("font-size", "10px"); }
        }

        updatePlayerCharSettings();
        readyCheck();

  }


  function escapeHtml(text) {

    text = text.replace(/[^a-z0-9æøåÆØÅ ?&(),.éÉäÄöÖ-]/gi, "");
    text = text.trim();
    text = text.replace(/(.)\1{3,}/g, '$1$1$1');
    text = text.substr(0, 25);
    //text = text.charAt(0).toUpperCase() + text.substring(1);
    return text;

  }

  function readyCheck() {

    $("#roster").css("max-width", 477);
    if ( playersArray.length < 5 ) { $("#roster").css("max-width", 234); }
    if ( playersArray.length == 3 || playersArray.length == 5 || playersArray.length == 6 ) { $("#roster").css("max-width", 355); }
    if ( playersArray.length == 7 || playersArray.length == 8 ) { $("#roster").css("max-width", 477); }
    if ( playersArray.length == 9 ) { $("#roster").css("max-width", 355); }
    if ( playersArray.length == 10 ) { $("#roster").css("max-width", 600); }
    if ( playersArray.length == 11 || playersArray.length == 12 ) { $("#roster").css("max-width", 477); }
    if ( playersArray.length > 12 ) { $("#roster").css("max-width", 600); }
    if ( playersArray.length > 15 ) { $("#roster").css("max-width", 722); }
    if ( playersArray.length == 19 || playersArray.length == 20  ) { $("#roster").css("max-width", 600); }
    if ( playersArray.length > 24 ) { $("#roster").css("max-width", 843); }
    if ( playersArray.length == 29 || playersArray.length == 30  ) { $("#roster").css("max-width", 722); }
    if ( playersArray.length > 35 ) { $("#roster").css("max-width", 1429); }

    if ( playersArray.length > 1 && setupReady == true ) {

      $("#startBtn").prop('disabled', false);

    } else {

      $("#startBtn").prop('disabled', true);

    }

  }

  function scene(scene, fade) {

    /* if( fade == "fade") {
      $(".scene").fadeOut(200);
      $("#"+scene+"Part").fadeIn(200);
    } else { */

      $(".scene").hide();
      $("#"+scene+"Part").show();

      if(scene = "setup"){
          $('#generalSettings').hide();
      }

    //}


  }

  $("#saveSetupBtn").click(function(){ saveSetup(); });
  $("#saveSetupText").on('input',function(){
    this.value = this.value.substr(0, 25);
    this.value = this.value.replace(/[^a-z0-9æøåÆØÅ ?!&()',.éÉäÄöÖ-]/gi, "");
    setupNickname = this.value;
  });


  function saveSetup() {

    if (setupNickname.length > 0) {

      var savedSetups = getSavedSetupsObject();
      if ( savedSetups === null) { savedSetups = {}; }

      var saveName = $("#saveSetupText").val();
      savedSetups[saveName] = JSON.parse(JSON.stringify(playersArray));

      //push object at end with additional setup info
      savedSetups[saveName].push( { savedSetupName: setup } );

      encodedSetups = JSON.stringify( savedSetups );
      localStorage.setItem("savedSetups", encodedSetups );
      goToSaveLoad();

    }

  }

  function deleteSetup(theName) {

    var r = confirm("Delete "+theName+"?");
    if (r == true) {

      var savedSetups = getSavedSetupsObject();
      if ( savedSetups === null) { savedSetups = {}; }

      delete savedSetups[theName];

      encodedSetups = JSON.stringify( savedSetups );
      localStorage.setItem("savedSetups", encodedSetups );
      goToSaveLoad();

    }
  }

  function loadSetup(theName) {

    var r = confirm("Load "+theName+"?");
    if (r == true) {

      var savedSetups = getSavedSetupsObject();
      if ( savedSetups === null) { savedSetups = {}; }

      clearPlayers();

      playersArray = savedSetups[theName];
      selectSetup( playersArray[playersArray.length - 1]['savedSetupName'] );
      //playersArray.splice(-1,1);
      clearNonPlayers();
      setupNickname = theName;

      $.each(playersArray, function( playerIndex, playerObject ) {
        addPlayer(playerObject);
      });

      scene('setup','fade');
      readyCheck();

    }
  }

  function goToSaveLoad() {

    scene('saveLoad','fade');
    $("#savedSetupsList").empty();
    var savedSetups = getSavedSetupsObject();
    if ( savedSetups === null) { savedSetups = {}; }
    console.log(savedSetups);

    if (setupNickname.length < 1) { setupNickname = "Setup Name";}
    $("#saveSetupText").val(setupNickname);

    var indexCounter = 0;
    $.each(savedSetups, function( arrayIndexName, theArray ) {
      indexCounter = indexCounter + 1;
      $('#savedSetupsList').append('<tr id="savedSetup'+indexCounter+'"></tr>');
      $('#savedSetup'+indexCounter).append('<td>'+arrayIndexName+'</td>');
      $('#savedSetup'+indexCounter).append('<td><input type="button" id="delSetup'+indexCounter+'" value="❌"><input type="button" id="loadSetup'+indexCounter+'" value="Load"></td>');
      $("#delSetup"+indexCounter).click(function(){ deleteSetup(arrayIndexName); });
      $("#loadSetup"+indexCounter).click(function(){ loadSetup(arrayIndexName); });
    });


    var arrayCopy = JSON.parse(JSON.stringify(playersArray));
    arrayCopy.push( { savedSetupName: setup } );
    $('#exportSetupCode').val(  btoa(JSON.stringify(arrayCopy)) );
    $('#importSetupCode').val('');

  }


  function getSavedSetupsObject() {

    var rawObject = localStorage.getItem("savedSetups");
    return JSON.parse( rawObject );

  }


  window.addEventListener("beforeunload", function(e) {

    if(playersArray.length > 0){
      var setupToSave = playersArray;

      //push object at end with additional setup info
      setupToSave.push( { savedSetupName: setup } );

      encodedSetupToSave = JSON.stringify( setupToSave );
      localStorage.setItem("exitSave", encodedSetupToSave );
    }

  });

  var rawExitObject = localStorage.getItem("exitSave");
  var exitObject = JSON.parse( rawExitObject ); console.log(exitObject);
  if (typeof exitObject == 'undefined' || exitObject === null ) {} else {

    clearPlayers();

    playersArray = JSON.parse(JSON.stringify(exitObject));
    selectSetup( playersArray[playersArray.length - 1]['savedSetupName'] );
    //playersArray.splice(-1,1);
    clearNonPlayers();

    $.each(playersArray, function( playerIndex, playerObject ) {
      addPlayer(playerObject);
    });

    readyCheck();
    localStorage.removeItem("exitSave");

  }

  function clearNonPlayers() {

    $.each(playersArray, function( playerIndex, playerObject ) {

      if (typeof playerObject !== 'undefined' ){
        if (typeof playerObject['savedSetupName'] !== 'undefined' ){
          playersArray.splice(playerIndex,1);
          playersIncrement = playersIncrement - 1;
        }
      }

    });

  }

  function exportToFile( exportcode ){

    var json_string = exportcode;
    var link = document.createElement('a');
    link.download = setupNickname + ' setup.txt';
    var blob = new Blob([json_string], {type: 'text/plain'});
    link.href = window.URL.createObjectURL(blob);
    link.click();

  }

  function importSetup(setupCode){

    try {
      var newSetup = JSON.parse(atob(setupCode));

      clearPlayers();

      playersArray = newSetup;
      selectSetup( playersArray[playersArray.length - 1]['savedSetupName'] );
      //playersArray.splice(-1,1);
      clearNonPlayers();

      $.each(playersArray, function( playerIndex, playerObject ) {
        addPlayer(playerObject);
      });

      scene('setup','fade');
      readyCheck();

    }
    catch(err) {
      alert('Invalid import code!');
    }

  }

//////////////////////////////////////// SETUP SPECIFICATIONS

  function selectSetup(setupname){

    if (typeof setupname == 'undefined'){ return; }

    $editingPlayerID = null;
    hideCharSettings();

    setup = setupname;
    setupReady = false;

    defaultStats = [];
    editableInfo = [];
    editableStats = [];
    selectPlayerAction = function( playerObject ){};
    turnPassiveEvents = function( playerObject ){};
    dayStartEvents = function(){};
    dayEndEvents = function(){};
    initialEvents = function(){};
    turnsPerDay = 1;

    if ( setup == "Battle Royale") {
      setupReady = true;

      turnsPerDay = 1;

      defaultStats = [
       { name: 'Health',
         max: 100,
         min: 0,
         default: 100,
       },
       { name: 'Energy',
         max: 100,
         min: 0,
         default: 100,
       },
       { name: 'Motivation',
         max: 6,
         min: 1,
         default: 5,
       },
       { name: 'Kills',
         max: 999999999,
         min: 0,
         default: 0,
       },
     ];

       editableInfo = [
        { name: 'Gender',
          options: ["Male", "Female", "Other"],
          default: "Male",
          visible: true,
        },
        { name: 'Age',
          options: ["Child", "Teen", "Young adult", "Adult", "Senior"],
          default: "Adult",
          visible: true,
        },
        /*{ name: 'Hair',
          options: ["Dark hair", "Light hair", "Colored hair", "Graying", "Bald"],
          default: "Dark hair",
          visible: true,
        },*/
        { name: 'Brutality',
          options: ["Pacifist", "Neutral", "Ruthless"],
          default: "Neutral",
          visible: false,
        },
      ];

      editableStats = [ "Fitness", "Intelligence", "Charisma" ];

      selectPlayerAction = function( daPlayerObject ){//put all playeractions in here, changing currentPlayerAction. give em all the playerId parameter
        var namePrint = "<strong id='printedName'>"+ daPlayerObject['name'] + "</strong>";

        /* if ( 1 == 1){ //Do nothing
          currentPlayerAction = function( playerObject ){
            broadcast( namePrint + " did nothing." , [[playerObject]] );
          };}

        if ( daPlayerObject['Charisma'] > 5){ //Do something cool
          currentPlayerAction = function( playerObject ){
            broadcast( namePrint + " did something cool." , [[playerObject]] );
          };}

        if ( daPlayerObject['Intelligence'] == 1){ //Tripped
          currentPlayerAction = function( playerObject ){
            broadcast( namePrint + " tripped on a banana peel." , [[playerObject]] );
          };}  */

      //  if ( currentlySimulatingDay == 0){ //Friendship
        if ( 0 == 0){
          currentPlayerAction = function( playerObject ){
          var friendObject = undefined;
          var scor = 0;
          $.each(playerObject['associations'], function( friendId, assocValue ) {
            var guyObjct = findSimPlayer(friendId);
              if ( assocValue > scor && guyObjct['id'] !== playerObject['id'] && guyObjct['Brutality'] == playerObject['Brutality'] && guyObjct['Age'] == playerObject['Age'] && guyObjct['Gender'] == playerObject['Gender'] ) {
                scor = assocValue;
                friendObject = findSimPlayer(friendId);
              }
            });

          if (typeof friendObject !== 'undefined'){
          broadcast( "<strong class='printedName'>"+ playerObject['name'] + "</strong> and <strong class='printedName'>"+ friendObject['name'] +"</strong> form a close friendship.", [[playerObject],[friendObject]], 'friend', 'closefriends' );
        } else {

          var friendObject = undefined;
          var scor = 0;
         $.each(playerObject['associations'], function( friendId, assocValue ) {
           var guyObjct = findSimPlayer(friendId);
             if ( assocValue > scor && guyObjct['id'] !== playerObject['id']  ) {
               scor = assocValue;
               friendObject = findSimPlayer(friendId);
             }
           });
           if (typeof friendObject !== 'undefined'){
           broadcast( "<strong class='printedName'>"+ playerObject['name'] + "</strong> hangs out with <strong class='printedName'>"+ friendObject['name'] +"</strong>.", [[playerObject],[friendObject]], 'friend', 'hangout' );
         }

        }
      }
    }

          if ( simPlayersArray.length == 1){ //Winner
            currentPlayerAction = function( playerObject ){
              broadcast( namePrint + " is the winner! ("+playerObject['Kills']+" kills)" , [[playerObject]], 'winner' );
              gameEnded = true;

              //console.log( didItHappen( 10, [2,12], 'friend', 'hangout' ) ); //bug om du ikkje definera dag?

              deadPlayers.reverse();
              $.each(deadPlayers, function( playerIndex, playerObject ) {
                if ( playerObject['Kills'] > 0 ){
                  broadcast('<p style="font-size:14px">'+suffix(playerObject['Placement'])+': '+playerObject['name']+' ('+playerObject['Kills']+' kills)</p>');
                } else {
                  broadcast('<p style="font-size:14px">'+suffix(playerObject['Placement'])+': '+playerObject['name']+'</p>');
                }
              });

            };}

      };

      turnPassiveEvents = function( playerObject ){};

      initialEvents = function(){
        $.each(simPlayersArray, function( playerIndex, playerObject ) {
          simPlayersArray[playerIndex]['powerScore'] = (playerObject['Fitness'] + playerObject['Intelligence'] );
        });
      };

      dayStartEvents = function(){

        //calculate relation to other players based on stat/info similarity
        $.each(simPlayersArray, function( playerIndex, playerObject ) {
          simPlayersArray[playerIndex]['associations'] = {};

          $.each(simPlayersArray, function( otrPlyrIndex, otrPlayrObj ) {

            simPlayersArray[playerIndex]['associations'][otrPlayrObj['id']] = 0;

            $.each(editableStats, function( eStatIndex, eStatObj ) {
              if ( otrPlayrObj[eStatObj] == playerObject[eStatObj] ){
                simPlayersArray[playerIndex]['associations'][otrPlayrObj['id']]++;
              }
              if ( (otrPlayrObj[eStatObj]+1) == playerObject[eStatObj] || (otrPlayrObj[eStatObj]-1) == playerObject[eStatObj]  ){
                simPlayersArray[playerIndex]['associations'][otrPlayrObj['id']] += 0.5;
              }
            });

            $.each(editableInfo, function( eInfoIndex, eInfoObj ) {
               if ( otrPlayrObj[eInfoObj['visible']] == true ){
                if ( otrPlayrObj[eInfoObj['name']] == playerObject[eInfoObj['name']] ){
                  simPlayersArray[playerIndex]['associations'][otrPlayrObj['id']]++;
                }
              }
            });

            simPlayersArray[playerIndex]['associations'][otrPlayrObj['id']] /= (editableStats.length + editableInfo.length);
            simPlayersArray[playerIndex]['associations'][otrPlayrObj['id']] += ( playerObject['Charisma'] * 0.3 );
            simPlayersArray[playerIndex]['associations'][otrPlayrObj['id']] -= ( playerObject['Kills'] * 0.05 );
            simPlayersArray[playerIndex]['associations'][playerObject['id']] = 99;
          });
        });

      };


      dayEndEvents = function(){

        var totalLikabilities = {};
        $.each(simPlayersArray, function( playerIndex, playerObject ) {
          var plrTotalLikability = 0;
          $.each(playerObject['associations'], function( assocId, assocValue ) {
            plrTotalLikability += assocValue;
          });
          totalLikabilities[playerObject['id']] = plrTotalLikability;
        });

        var playerIdToEliminate = undefined;
        var countingNumber = 9999;
        var elimArray = [];
        $.each(totalLikabilities, function( valueId, valueValue ) {
          var elPlrObjct = findSimPlayer(valueId);
          if (valueValue <= countingNumber){ countingNumber = valueValue; playerIdToEliminate = valueId; elimArray.push(elPlrObjct);}
        });
        var elimPlrObjct = findSimPlayer(playerIdToEliminate);
        var elimPlrIndex = findSimPlayerIndex(playerIdToEliminate);

        if ( elimArray.length > 1){
          var scor = 9999;
          $.each(elimArray, function( playerIndex, playerObject ) {
            var totalScores = (playerObject['Intelligence'] + playerObject['Fitness'] + playerObject['Charisma']);
              if ( totalScores > scor ) {
                scor = totalScores;
                elimPlrObjct = findSimPlayer(playerObject['id']);
                elimPlrIndex = findSimPlayerIndex(playerObject['id']);
              }
            });
        }

        var worstBrutalityAvailable = 'Pacifist';
        $.each(simPlayersArray, function( playerIndex, playerObject ) {
          if ( playerObject['Brutality'] == 'Neutral' ) { worstBrutalityAvailable = 'Neutral'; }
          });
        $.each(simPlayersArray, function( playerIndex, playerObject ) {
          if ( playerObject['Brutality'] == 'Ruthless' ) { worstBrutalityAvailable = 'Ruthless'; }
          });

        var killerPlrObjct = undefined;
        var killerPlrIndex = undefined;
        var killerPlayerId = undefined;
        var killerArray = [];

        function findKiller(){

          killerArray = [];

          countingNumber = 9999;
          $.each(elimPlrObjct['associations'], function( plrId, likeValue ) {
            var kPlrObjct = findSimPlayer(plrId);
            if ( likeValue <= countingNumber ){
              if ( kPlrObjct['Brutality'] == worstBrutalityAvailable ){
                countingNumber = likeValue; killerPlayerId = plrId; killerArray.push(kPlrObjct);
              }
            }
          });

          killerPlrObjct = findSimPlayer(killerPlayerId);
          killerPlrIndex = findSimPlayerIndex(killerPlayerId);

          if ( killerArray.length > 1){//console.log(killerArray);
            var scor = 0;
            $.each(killerArray, function( playerIndex, playerObject ) {
                if ( playerObject['powerScore'] >= scor && playerObject['id'] !== elimPlrObjct['id']) {
                  scor = playerObject['powerScore'];
                  killerPlrObjct = findSimPlayer(playerObject['id']);
                  killerPlrIndex = findSimPlayerIndex(playerObject['id']);
                }
              });
          }

          if ( killerPlrObjct['id'] == elimPlrObjct['id'] ) {
            if ( worstBrutalityAvailable == 'Ruthless' ) { worstBrutalityAvailable = 'Neutral'; findKiller();}
            else if ( worstBrutalityAvailable == 'Neutral' ) { worstBrutalityAvailable = 'Pacifist'; findKiller();}
          }
        }
        findKiller();

        if( killerPlrObjct['powerScore'] < elimPlrObjct['powerScore'] && killerArray.length > 1){
          var scor = elimPlrObjct['powerScore'];
          $.each(killerArray, function( playerIndex, playerObject ) {
              if ( playerObject['powerScore'] >= scor && playerObject['id'] !== elimPlrObjct['id']) {
                scor = playerObject['powerScore'];
                killerPlrObjct = findSimPlayer(playerObject['id']);
                killerPlrIndex = findSimPlayerIndex(playerObject['id']);
              }
            });
        }

        if( killerPlrObjct['powerScore'] < elimPlrObjct['powerScore'] ){
          var scor = elimPlrObjct['powerScore'];
          $.each(simPlayersArray, function( playerIndex, playerObject ) {
              if ( playerObject['powerScore'] >= scor && playerObject['id'] !== elimPlrObjct['id']) {
                scor = playerObject['powerScore'];
                killerPlrObjct = findSimPlayer(playerObject['id']);
                killerPlrIndex = findSimPlayerIndex(playerObject['id']);
              }
            });
        }

        var success = 'true'; if( killerPlrObjct['powerScore'] < elimPlrObjct['powerScore']){ success = 'false'; }

        if ( simPlayersArray.length > 1 ){

          if( success == 'true' ) {
            simPlayersArray[killerPlrIndex]['Kills']++;
            var killtype = killType(killerPlrObjct,elimPlrObjct);
            broadcast( killtype, [[killerPlrObjct],[elimPlrObjct,'dead']], 'kill' );
            elimPlrObjct['Placement'] = ( playersArray.length - deadPlayers.length); deadPlayers.push(elimPlrObjct);
            simPlayersArray.splice(elimPlrIndex, 1);

          } else {

            if ( simPlayersArray.length == 2 ){
            simPlayersArray[elimPlrIndex]['Kills']++;
            broadcast( "<strong class='printedName'>"+ killerPlrObjct['name'] + "</strong> tried to kill <strong class='printedName'>"+ elimPlrObjct['name'] +"</strong>, but failed.", [[killerPlrObjct,'dead'],[elimPlrObjct]], 'kill', 'reversekill' );
            killerPlrObjct['Placement'] = ( playersArray.length - deadPlayers.length); deadPlayers.push(killerPlrObjct);
            simPlayersArray.splice(killerPlrIndex, 1);

          } else {

            var friendObject = undefined;
            var scor = 0;
            $.each(killerPlrObjct['associations'], function( friendId, assocValue ) {
              var guyObjct = findSimPlayer(friendId);
                if ( assocValue > scor && guyObjct['id'] !== killerPlrObjct['id'] && guyObjct['id'] !== elimPlrObjct['id']) {
                  scor = assocValue;
                  friendObject = findSimPlayer(friendId);
                }
              });
            var friendIndex = findSimPlayerIndex(friendObject['id']);
            simPlayersArray[killerPlrIndex]['Kills']++;
            simPlayersArray[friendIndex]['Kills']++;
            broadcast( "<strong class='printedName'>"+ killerPlrObjct['name'] + "</strong> killed <strong class='printedName'>"+elimPlrObjct['name']+"</strong> with help from <strong class='printedName'>"+ friendObject['name'] +"</strong>.", [[killerPlrObjct],[elimPlrObjct,'dead'],[friendObject]], 'kill', 'helpkill' );
            elimPlrObjct['Placement'] = ( playersArray.length - deadPlayers.length); deadPlayers.push(elimPlrObjct);
            simPlayersArray.splice(elimPlrIndex, 1);
          }


          }

        }

      };


      }

    //refresh everyones editable stats and info
    $.each(playersArray, function( playerIndex, playerValue ) {

      $.each(editableInfo, function( statIndex, theStat ) {

        if (typeof playerValue[theStat['name']] == 'undefined' ){

          changePlayerValue(playerValue['id'], theStat['name'], theStat['default'] );

        } else if ( !theStat['options'].includes( playerValue[theStat['name']] ) ) {
          changePlayerValue(playerValue['id'], theStat['name'], theStat['default'] );
        }

      });

      $.each(editableStats, function( statIndex, statName ) {

        if (typeof playerValue[statName] == 'undefined' ){
          changePlayerValue(playerValue['id'], statName, defaultStat );
        }

      });

    });

    $('#undertittel' ).text( setupname + ' Simulator' );
    $('#setupSelector' ).val( setupname );
    readyCheck();

  }



  // SIMULATION FUNCTIONS START HERE //////////////////////////////////////////

  var simPlayersArray = [];
  var gameLog = [];
  var currentDisplayDay = 0;
  var currentlySimulatingDay = 0;
  var gameEnded = false;
  var deadPlayers = [];

  function startGame() {

    /* var r = confirm("Start simulation?");
    if (r == true) { } else { return; } */

    simPlayersArray = [];
    gameLog = [];
    deadPlayers = [];
    currentDisplayDay = 0;
    currentlySimulatingDay = 0;

    scene('loading');
    $('#simInfo').empty();

    simPlayersArray = JSON.parse(JSON.stringify(playersArray));

    $.each(simPlayersArray, function( playerIndex, playerObject ) {
      //give each player default stats (hp, energy etc)
      $.each(defaultStats, function( statIndex, statObject ) {
        simPlayersArray[playerIndex][statObject['name']] = statObject['default'];
      });
    });

    gameLog[currentlySimulatingDay] = {};
    gameLog[currentlySimulatingDay]['happenings'] = [];
    gameEnded = false;
    initialEvents();

    do {

      if( typeof gameLog[currentlySimulatingDay] == 'undefined'){
        gameLog[currentlySimulatingDay] = {};
        gameLog[currentlySimulatingDay]['happenings'] = [];
      }

      dayStartEvents();

      $.each(simPlayersArray, function( playerIndex, playerObject ) {

        currentPlayerAction = function( playerObject ){};
        selectPlayerAction( playerObject );
        currentPlayerAction( playerObject );

        turnPassiveEvents( playerObject );
      });

      dayEndEvents();
      gameLog[currentlySimulatingDay]['playerArray'] = JSON.parse(JSON.stringify(simPlayersArray));
      currentlySimulatingDay++;
    }
    while (simPlayersArray.length > 0 && gameLog.length < (playersArray.length + 5) && gameEnded == false);

    console.log(gameLog);
    displayDay();
    scene('simulation','fade');
  }

  function broadcast(theMessage,includedPlayersArray,eventClass,eventID){

    gameLog[currentlySimulatingDay]['happenings'].push(
      { message: theMessage, included: includedPlayersArray, eventclass: eventClass, eventid: eventID }
    );

  }

  function displayDay(){

    $("#nextDayBtn").prop('disabled', false);
    $("#prevDayBtn").prop('disabled', false);
    $("#proceedBtn").show();
    if (typeof gameLog[currentDisplayDay -1] == 'undefined' ){ $("#prevDayBtn").prop('disabled', true); }
    if (typeof gameLog[currentDisplayDay +1] == 'undefined' ){ $("#nextDayBtn").prop('disabled', true); $("#proceedBtn").hide(); }

    $('#dayDisplay').text( 'Day ' + (currentDisplayDay + 1) );
    if(currentDisplayDay == (gameLog.length -1)){ $('#dayDisplay').text( 'Results' ); }
    $('#simInfo').empty();
    $.each(gameLog[currentDisplayDay]['happenings'], function( happeningIndex, happeningObject ) {

      $.each(happeningObject['included'], function( includedIndex, includedArray ) {
        $('#simInfo').append('<div class="simImgWrapper"><img class="simPlayerImg" src="'+includedArray[0]['imgURL']+'" /></div>')

        for (let i = 1; i < includedArray.length; ++i) {
            if (includedArray[i] == 'dead') { $( ".simImgWrapper" ).last().addClass( "deadPlr" ); }
        }

      });

      $('#simInfo').append('<p class="broadcastMsg">'+happeningObject['message']+'</p>');
    });
  }

  function goToDay(day){

    if(day == 'previous') { currentDisplayDay--; }
    if(day == 'next') { currentDisplayDay++; }
    if(day == 'last') { currentDisplayDay = gameLog.length - 1; }
    if(day == 'first') { currentDisplayDay = 0; }

    displayDay();
  }





  function didItHappen( day, includedPlayersIDs, eventClass, eventID ){  console.log('called');
    var ithappened = false;
    var filteringArray = JSON.parse(JSON.stringify(gameLog)); //$.extend(true, [], gameLog);

    filteringArray = $.grep(filteringArray, function( dayObjct, dayIndex ) {
    filteringArray[dayIndex]['happenings'] =  $.grep(dayObjct['happenings'], function( happeningObjct, happeningIndex  ) {

        var removeHappening = false;

        if (typeof day !== 'undefined' ){
          if ( dayIndex !== day ){ removeHappening = true; return false;}
        }

        if (typeof includedPlayersIDs !== 'undefined' ){
          var counter = 0;
          $.each(happeningObjct['included'], function( icnlIndex, inclObj ) {

            if ( includedPlayersIDs.indexOf( inclObj[0]['id'] ) > -1 )
            { counter++; }

          });
          if ( counter !== includedPlayersIDs.length ){ removeHappening = true; }
        }

        if (typeof eventClass !== 'undefined' ){
          if ( eventClass !== happeningObjct['eventclass']) { removeHappening = true; }
        }

        if (typeof eventID !== 'undefined' ){
          if ( eventClass !== happeningObjct['eventclass']) { removeHappening = true; }
        }

        if ( removeHappening == true ){ return false; }
        return true;
      });

      if ( filteringArray[dayIndex]['happenings'].length == 0){ return false; }
      return true;
    });

    if ( filteringArray.length > 0){ ithappened = true; }  //problem: fjernakje daga fra riktig objekt nivå?
    return ithappened;
  }





  function findSimPlayer(theID){
    var result = simPlayersArray.filter(obj => {
      return obj.id == theID
    })
    return result[0];
  }

  function findSimPlayerIndex(theID){
    var result = simPlayersArray.findIndex(obj => {
      return obj.id == theID
    })
    return result;
  }

  function pronoun(plrObject,pronoun){
    var result = pronoun;
    if (plrObject["Gender"] == "Male" && pronoun == "they"){ result = "he"; }
    if (plrObject["Gender"] == "Male" && pronoun == "They"){ result = "He"; }
    if (plrObject["Gender"] == "Male" && pronoun == "them"){ result = "him"; }
    if (plrObject["Gender"] == "Male" && pronoun == "Them"){ result = "Him"; }
    if (plrObject["Gender"] == "Male" && pronoun == "their"){ result = "his"; }
    if (plrObject["Gender"] == "Male" && pronoun == "Their"){ result = "His"; }
    if (plrObject["Gender"] == "Male" && pronoun == "were"){ result = "was"; }
    if (plrObject["Gender"] == "Male" && pronoun == "Were"){ result = "Was"; }

    if (plrObject["Gender"] == "Female" && pronoun == "they"){ result = "she"; }
    if (plrObject["Gender"] == "Female" && pronoun == "They"){ result = "She"; }
    if (plrObject["Gender"] == "Female" && pronoun == "them"){ result = "her"; }
    if (plrObject["Gender"] == "Female" && pronoun == "Them"){ result = "Her"; }
    if (plrObject["Gender"] == "Female" && pronoun == "their"){ result = "her"; }
    if (plrObject["Gender"] == "Female" && pronoun == "Their"){ result = "Her"; }
    if (plrObject["Gender"] == "Female" && pronoun == "were"){ result = "was"; }
    if (plrObject["Gender"] == "Female" && pronoun == "Were"){ result = "Was"; }

    if (plrObject["Gender"] == "Other"){ result = result; }

    return result;
  }

  function suffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function killType(killerObj, victimObj){
  var killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> killed <strong class='printedName'>"+ victimObj['name'] +"</strong>.";

  if ( killerObj['powerScore'] == victimObj['powerScore'] && simPlayersArray.length == 2 )
  {  killtype = "After an epic final struggle, <strong class='printedName'>"+ killerObj['name'] + "</strong> defeated <strong class='printedName'>"+ victimObj['name'] +"</strong>.";  return killtype;  }

  if ( killerObj['Kills'] == 1 && victimObj['Kills'] > 4 && killerObj['Brutality'] == 'Pacifist' )
  {  killtype = "Fed up with "+pronoun(victimObj,'their')+" killing spree, <strong class='printedName'>"+ killerObj['name'] + "</strong> put a stop to <strong class='printedName'>"+ victimObj['name'] +"</strong>.";  return killtype;  }

  if ( (killerObj['powerScore'] - victimObj['powerScore']) > 6)
  {  killtype = "<strong class='printedName'>"+ victimObj['name'] + "</strong> had a heart attack when "+pronoun(victimObj,'they')+" saw <strong class='printedName'>"+ killerObj['name'] +"</strong> coming for "+pronoun(victimObj,'them')+".";  return killtype;  }

  if ( (killerObj['powerScore'] - victimObj['powerScore']) > 4 && victimObj['Gender'] == 'Male' && killerObj['Charisma'] == 6 && killerObj['Kills'] == 2)
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> did a backflip and kicked <strong class='printedName'>"+ victimObj['name'] +"</strong> in the nuts.";  return killtype;  }

  if ( (killerObj['powerScore'] - victimObj['powerScore']) > 3 && killerObj['Kills'] > '4')
  {  killtype = "<strong class='printedName'>"+ victimObj['name'] + "</strong> became another victim in <strong class='printedName'>"+ killerObj['name'] +"'s</strong> killing spree.";  return killtype;  }

  if ( (killerObj['powerScore'] - victimObj['powerScore']) > 3 && killerObj['Brutality'] == 'Ruthless')
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> brutally murdered <strong class='printedName'>"+ victimObj['name'] +"</strong> without much effort.";  return killtype;  }

  if ( (killerObj['powerScore'] - victimObj['powerScore']) > 3)
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> easily killed <strong class='printedName'>"+ victimObj['name'] +"</strong>.";  return killtype;  }

  if ( didItHappen( (currentlySimulatingDay - 1), [ killerObj['id'] ], 'kill' ) == true )
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> killed <strong class='printedName'>"+ victimObj['name'] +"</strong>, continuing in similar fashion from yesterday.";  return killtype;  }

  if ( (killerObj['Intelligence'] - victimObj['Intelligence']) > 2 && victimObj['Fitness'] > killerObj['Fitness'] )
  {  killtype = "Being physically inferior, <strong class='printedName'>"+ killerObj['name'] + "</strong> found a clever way to kill <strong class='printedName'>"+ victimObj['name'] +"</strong>.";  return killtype;  }

  if ( killerObj['powerScore'] == victimObj['powerScore'] && killerObj['Fitness'] > victimObj['Fitness'] )
  {  killtype = "<strong class='printedName'>"+ victimObj['name'] + "</strong> could not outmaneuver <strong class='printedName'>"+ killerObj['name'] +"</strong>'s brute power.";  return killtype;  }

  if ( killerObj['powerScore'] == victimObj['powerScore'] && killerObj['Intelligence'] > victimObj['Intelligence'] )
  {  killtype = "It wasn't easy, but <strong class='printedName'>"+ killerObj['name'] + "</strong> found a way to trap and kill <strong class='printedName'>"+ victimObj['name'] +"</strong>.";  return killtype;  }

  if ( victimObj['Kills'] > 5 )
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> put a stop to <strong class='printedName'>"+ victimObj['name'] +"'s</strong> killing spree.";  return killtype;  }

  if (  killerObj['Fitness'] > 3 && victimObj['Fitness'] > 3 && killerObj['Intelligence'] < 4 && victimObj['Intelligence'] < 4  )
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> defeated <strong class='printedName'>"+ victimObj['name'] +"</strong> in deadly close combat.";  return killtype;  }

  if (  killerObj['Brutality'] == 'Ruthless' && victimObj['Charisma'] < 3 && (killerObj['powerScore'] - victimObj['powerScore']) > 1 )
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> "+pronoun(killerObj,'were')+" annoyed with <strong class='printedName'>"+ victimObj['name'] +"</strong>, so "+pronoun(killerObj,'they')+" killed "+pronoun(victimObj,'them')+".";  return killtype;  }

  if (  killerObj['Brutality'] == 'Pacifist')
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> reluctantly killed <strong class='printedName'>"+ victimObj['name'] +"</strong>, but it had to be done.";  return killtype;  }

  if (  killerObj['powerScore'] > 9 && victimObj['powerScore'] > 9 )
  {  killtype = "After a powerful showdown, <strong class='printedName'>"+ killerObj['name'] + "</strong> eventually defeated <strong class='printedName'>"+ victimObj['name'] +"</strong>.";  return killtype;  }

  if (  killerObj['Brutality'] == 'Ruthless' && victimObj['Age'] == 'Child' && killerObj['Age'] !== 'Child' )
  {  killtype = "<strong class='printedName'>"+ killerObj['name'] + "</strong> cold heartedly killed young <strong class='printedName'>"+ victimObj['name'] +"</strong>.";  return killtype;  }

  if (  victimObj['Brutality'] == 'Pacifist' && killerObj['Brutality'] !== 'Pacifist' && killerObj['powerScore'] > victimObj['powerScore'] )
  {  killtype = "<strong class='printedName'>"+ victimObj['name'] + "'s</strong> reluctance to put up a fight against <strong class='printedName'>"+ killerObj['name'] +"</strong> cost "+pronoun(victimObj,'them')+" dearly.";  return killtype;  }

  if ( killerObj['powerScore'] == victimObj['powerScore'] )
  {  killtype = "After a struggle, <strong class='printedName'>"+ killerObj['name'] + "</strong> killed <strong class='printedName'>"+ victimObj['name'] +"</strong>.";  return killtype; }


  return killtype;
}

})();
