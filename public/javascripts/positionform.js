$(document).ready(function() {
  function evaluateForm() {
    if ($('#conditionalSupportCheck').is(':checked'))
    {
      $('#conditionalSupportSection').collapse('show')
      if ($('#disagreeWhatCheck').is(':checked'))
      {
        $('#disagreeWhatReasonSection').collapse('show');
      }
      if ($('#disagreeHowCheck').is(':checked'))
      {
        $('#disagreeHowReasonSection').collapse('show');
      }
      if ($('#disagreeWhyCheck').is(':checked'))
      {
        $('#disagreeWhyReasonSection').collapse('show');
      }
    } else {
      $('#conditionalSupportSection').collapse('hide')
    }
    if ($('#blockCheck').is(':checked'))
    {
      $('#blockReasonSection').collapse('show')
    } else {
      $('#blockReasonSection').collapse('hide')
    }
  }
 $('input').click(function () {
   evaluateForm();
 })
 $('form#positionform').submit(function (event, handler) {
   if ($('#conditionalSupportCheck').is(':checked'))
   {
     if (!(
       $('#disagreeWhatCheck').is(':checked') ||
       $('#disagreeHowCheck').is(':checked') ||
       $('#disagreeWhyCheck').is(':checked')
     )) {
       alert("If you're going to disagree, pick something to disagree about!")
       event.preventDefault();
     }
   }
   if ($('#blockCheck').is(':checked'))
   {
     var contents = $('#blockReason').val()
     console.log(contents)
     if (contents == "")
     {
       alert("If you are blocking something, please give a reason why!")
       event.preventDefault();
     }
   }
 })
 evaluateForm();
})
