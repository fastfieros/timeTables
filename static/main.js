
function validateTime(t) {

    var patt = /\d?\d.?\d\d/;
    var res  = patt.exec(t);
    if (res != null)
    {
       return res; 
    }
    else 
    {
        $("#result").html("invalid time, \""+t+"\" please use 4-digit 24 time, (i.e. 0800).");
        $("#popup-result").popup("open", {
            "positionTo":"window"});

        return false;
    }
}

function validateDate(d) {

    var patt = /\d\d\/\d\d\/\d\d\d\d/;
    var res  = patt.exec(d);
    if (res)
    {
       return res[0].replace(/\//g,'-'); 
    }
    else 
    {
        $("#result").html("invalid date, \""+d+"\" please use MM/DD/YYYY.");
        $("#popup-result").popup("open", {
            "positionTo":"window"});

        return false;
    }
}

//TABLE Bindings need to re-run after table reload
function tableBindings() {

    $("td.in, td.out").blur(function(e){

        var oldval = $(this).attr('data');
        var entry = $(this).parent().attr('entry');
        var key   = $(this).attr('class'); 

        var newval = validateTime( $(this).html() );

        if ( (!newval) ||
             (newval == "") || 
             (oldval == newval)    )
        {
            $(this).parent().empty().text(oldval);
        }
        else
        {
            var url   = "/edit/"+entry+"/"+key+"/"+newval;

            $("#result").html("...");

            $("#popup-result").popup("open", {
                "positionTo":"window"});

            $.get(url, function(d) {
                $("#result").html(d);
            });
        }

    });

    $("span.delete").click(function(e){

        req = "/delete/" + $(this).attr('entry');

        $("#result").html("...");

        $("#popup-result").popup("option", {
            "theme":"b"});

        $("#popup-result").popup("open", {
            "positionTo":"window"});

        $.get(req, function(d) {
            $("#result").html(d);
        });

        e.preventDefault();
    });
}

$(function() {

    $("#popup-result").popup({
        "afteropen":function(){

            $("#tableWrap").load("/table", function(){
                tableBindings();
            });
        }
     });

    $("#in").click(function(e){

        $("#result").html("...");
        $("#popup-result").popup("option", {
            "theme":"a"});

        $("#popup-result").popup("open", {
            "positionTo":"window"});

        $.get("/in", function(d) {
            $("#result").html(d);
        });
        
        e.preventDefault();
    });

    $("#out").click(function(e){

        $("#result").html("...");
        $("#popup-result").popup("option", {
            "theme":"b"});

        $("#popup-result").popup("open", {
            "positionTo":"window"});

        $.get("/out", function(d) {
            $("#result").html(d);
        });
        
        e.preventDefault();
    });

    $("#custom-submit").click(function(e){

        dayin = validateDate($("#day-in").val());
        if (!dayin) {
            return false;
        }

        var timein = validateTime($("#time-in").val());
        if (!timein) {
            return false;
        }

        var timeout = validateTime($("#time-out").val());
        if (!timeout) {
            return false;
        }

        daytimein = dayin + " " + timein
        daytimeout = dayin + " " + timeout

        req = "/add/" + daytimein + "/" + daytimeout

        $("#result").html(req);

        $("#popup-result").popup("option", {
            "theme":"a"});

        $("#popup-result").popup("open", {
            "positionTo":"window"});

        $.get(req, function(d) {
            $("#result").html(d);
        });

        e.preventDefault();
    });

    tableBindings();

});
