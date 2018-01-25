'use strict';

var listAllCharacters = 'https://www.anapioficeandfire.com/api/characters';
var pageCounter = 1;
var glitchTracker = false;
// Handles user choice of starting a character search

// Handles users choice of starting a character trait search

// Handles submit button for both types of searches
function submitPressedNames(){
  $('#formSubmitNames').click(function(event){
    event.preventDefault();
    // name to be searched for in a character search
    var enteredCharacterName = $('#characterSearch').val();
    getDataforName(enteredCharacterName);
    $('.results').empty();
  });
}
function submitPressedTraits(){
  $('#formSubmitTraits').click(function(event){
    event.preventDefault(event);
    // Make submit button invisible
    // Makes results hidden for the list of names to select from
  
    $('.namesList').empty();
    checkStatusAndCulture();
  });
}
// Handles reset button presses for both types of searches
function resetPressedNames(){
  $('#formResetNames').click(function(){
    $('#form').trigger('reset');

    $('.results').empty();
    pageCounter = 1;
  });
}
function resetPressedTraits(){
  $('#formResetTraits').click(function(){
    $('#form').trigger('reset');

    $('.results').empty();
    pageCounter = 1;
  });
}

function getDataforName(enteredCharacterName){
  let paramObject = {page: 1, pageSize: 50, name: enteredCharacterName};
  if(enteredCharacterName !== ''){
    $.getJSON(listAllCharacters, paramObject, displayDataForName);
  }
}
function displayDataForName(data){
  if (data.length === 0){
    $('.results').addClass('hidden');
    alert('No results found. Make sure to use both the first and last name.');
  }
  var seasonArray = [];

  $('.results').append(
    '<h3 class="resultsDataHeader">Available Results</h3>' +
      '<h4 class="nameHeader">Name</h4>'+
      '<h4 class="titlesHeader">Titles</h4>'+
      '<h4 class="aliasesHeader">Aliases</h4>'+
      '<h4 class="bornHeader">Born</h4>'+
      '<h4 class="diedHeader">Died</h4>'+
      '<h4 class="cultureHeader">Culture</h4>'+
      '<h4 class="fatherHeader">Father</h4>'+
      '<h4 class="motherHeader">Mother</h4>'+
      '<h4 class="spouseHeader">Spouse</h4>'+
      '<h4 class="tvParent">Seasons</h4>'+
      '<h4 class="tvSeriesHeader"></h4>'+
      '<h4 class="playedByHeader">Actors</h4>');

  $('.nameHeader').append('<div class="inlineDiv">'+ data[0].name + '</div>');
  if(data[0].culture !== ''){
    $('.cultureHeader').append('<div class="inlineDiv">'+ data[0].culture + '</div>');
  }
  else {
    $('.cultureHeader').addClass('hidden');
  }


  data.forEach(function(item){

    item.titles.forEach(function(title){
      if(title !== ''){
        $('.titlesHeader').append('<div class="inlineDiv">' + title + '</div>' );
      }
      else {
        $('.titlesHeader').addClass('hidden');
      }
    });
    item.aliases.forEach(function(aliases){
      if(aliases !== ''){
        $('.aliasesHeader').append('<div class="inlineDiv">' + aliases + '</div>');
      }
      else {
        $('.aliasesHeader').addClass('hidden');
      }
    });
    item.tvSeries.forEach(function(season){
      var numberSeason = season.replace(/\D/g, '');
      seasonArray.push(numberSeason);

      if (Math.max.apply(null, seasonArray) === 0 || item.tvSeries === ''){
        //  $('.tvSeriesHeader').text('')
        $('.tvSeriesHeader, .tvParent').addClass('hidden');

      }
      else if(Math.min.apply(null, seasonArray) ===  Math.max.apply(null, seasonArray)){
        $('.tvSeriesHeader').text(Math.min.apply(null, seasonArray));
      }
      else{
        $('.tvSeriesHeader').text(Math.min.apply(null, seasonArray) + '-' + Math.max.apply(null, seasonArray));}
    });
    item.playedBy.forEach(function(actor){
      if (actor !== ''){
        $('.playedByHeader').append('<div class="inlineDiv">' + actor + '</div>');
      }
      else {
        $('.playedByHeader').addClass('hidden');
      }
    });
    if(item.born !== ''){
      $('.bornHeader').append('<div class="inlineDiv">'+ item.born + '</div>');
    }
    else {
      $('.bornHeader').addClass('hidden');
    }
    if(item.died !== ''){
      $('.diedHeader').append('<div class="inlineDiv">'+ item.died + '</div>');
    }
    else{
      $('.diedHeader').addClass('hidden');
    }


    // The father, mother, and spouse names inside each characters data object do not refer to their string names and instead list where they can be found through their api urls.]

    if(item.father !== ''){
      getFamilyNames(item.father);}
    else {
      $('.fatherHeader').addClass('hidden');
    }
    if(item.mother !== ''){
      getFamilyNames(item.mother);}
    else {
      $('.motherHeader').addClass('hidden');
    }
    if(item.spouse !== ''){
      getSpouseName(item.spouse);}
    else {
      $('.spouseHeader').addClass('hidden');
    }
  });
}
function getFamilyNames(familyUrl){
  $.getJSON(familyUrl, displayMomDadNames);
}
function displayMomDadNames(data){
  if(data.gender === 'Male'){
    $('.fatherHeader').append('<div class="inlineDiv">'+ data.name + '</div>');
  }
  else if(data.gender ==='Female'){
    $('.motherHeader').append('<div class="inlineDiv">'+ data.name + '</div>');
  }
}
function getSpouseName(spouseUrl){
  $.getJSON(spouseUrl, displaySpouseName);
}
function displaySpouseName(data){
  $('.spouseHeader').append('<div class="inlineDiv">'+ data.name + '</div>');
}
// Triggered from submitPressedTraits()
function checkStatusAndCulture(){
  var cultureSelection;
  if($('.cultureSelection').val() !== 'Select'){
    cultureSelection = $('.cultureSelection').val();
  }

  var searchAlive = $('#characterStatusAlive').is(':checked');
  var searchDead = $('#characterStatusDead').is(':checked');


  var statusResult = getSearchedStatus(searchAlive, searchDead);

  getDataForTraits(cultureSelection, statusResult);

}
function getSearchedStatus(searchAlive, searchDead){
  var searchAliveOrDead;

  if (searchAlive === true){
    searchAliveOrDead = true;
  }
  else if(searchDead === true){
    searchAliveOrDead = false;
  }
  return searchAliveOrDead;
}
function getDataForTraits(cultureSelection, statusResult){
  let paramObject = {page: pageCounter, pageSize: 50, culture: cultureSelection, isAlive: statusResult};
  $.getJSON(listAllCharacters, paramObject, displayDataForTraits);
}
// Filters out duplicate names returned by the trait query and adds individual buttons for each returned name. These buttons link to specific information about each character.
function displayDataForTraits(data){
  // Fixes glitched button at start of array
  if (data[0].aliases[0] === 'The Daughter of the Dusk'){
    glitchTracker = true;
  }
  $('.pageNumber').text('Page: ' + pageCounter);
  var testArray = [];
  for(let i=0; i<data.length; i++){

    testArray.push(data[i].name);
  }
  var results = filterArray(testArray);

  results.forEach(function(item){

    $('.namesList').append('<button class="listedName" role="listitem">' + item + '</button>');

  });

  $('.listedName').click(function(){
    var enteredName = $(this).text();
    $('.results').empty();
    $('.results').removeClass('hidden');
    getDataforName(enteredName);
  });
}

// filter function used in displayDataForTraits
function filterArray(testArray){
  var resultArray = [];
  for(let i=0; i<testArray.length; i+=1){
    if(resultArray.indexOf(testArray[i]) < 0){
      resultArray.push(testArray[i]);
    }
  }
  if (glitchTracker === true){
    resultArray.splice(0,1);
  }

  return resultArray;
}
function handleNextPrevious(){
  $('.next').click(function(){
    glitchTracker = false;
    pageCounter++;
    checkStatusAndCulture();
    $('.namesList').empty();
  });
  $('.previous').click(function(){
    if (pageCounter !== 1){
      pageCounter--;
      checkStatusAndCulture();
      $('.namesList').empty();}
    glitchTracker = false;
  });
}
$(document).ready(function() {

  submitPressedNames();
  submitPressedTraits();
  resetPressedNames();
  resetPressedTraits();
  handleNextPrevious();
});
