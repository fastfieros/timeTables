
$(function() {

    $("#in").click(function(e){

        $("#result").html("...");
        $("#popup-result").popup("option", {
            "theme":"a",
            "afterclose":function(){
                //TODO just rebuild table
                location.reload();
            }
         });

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
            "theme":"b",
            "afterclose":function(){
                //TODO just rebuild table
                location.reload();
            }
         });

        $("#popup-result").popup("open", {
            "positionTo":"window"});

        $.get("/out", function(d) {
            $("#result").html(d);
        });
        
        e.preventDefault();
    });

    $("#custom-submit").click(function(e){

        dayin = $("#day-in")[0].value
        timein = dayin + " " + $("#time-in")[0].value
        timeout = dayin + " " + $("#time-out")[0].value
        req = "/add/" + timein + "/" + timeout

        $("#result").html(req);

        $("#popup-result").popup("option", {
            "theme":"a",
            "afterclose":function(){
                //TODO just rebuild table
                location.reload();
            }
         });

        $("#popup-result").popup("open", {
            "positionTo":"window"});

        $.get(req, function(d) {
            $("#result").html(d);
        });

        e.preventDefault();
    });

    $("span.delete").click(function(e){

        req = "/delete/" + $(this).attr('entry');

        $("#result").html("...");

        $("#popup-result").popup("option", {
            "theme":"b",
            "afterclose":function(){
                //TODO just rebuild table
                location.reload();
            }
         });

        $("#popup-result").popup("open", {
            "positionTo":"window"});

        $.get(req, function(d) {
            $("#result").html(d);
        });

        e.preventDefault();
        e.preventDefault();
    });

    $("td").blur(function(e){
        var patt = /\d\d\:\d\d/;
        var newval = patt.exec($(this).html());

        if (!newval) {
                alert("Format Error, use \"hour:minute\", 24 hour time");
                $(this).html($(this).attr('data'));
                return;
        }
        else {
                $(this).html(newval);
        }

        if ($(this).attr("data") != newval) {
            var entry = $(this).parent().attr('entry');
            var key   = $(this).attr('class'); 
            var url   = "/edit/"+entry+"/"+key+"/"+newval;

            console.log(url);

            $.get(url, function(d) {
                alert(d);
                location.reload();
            });
        }
    });

});
