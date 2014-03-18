//TABLE Bindings need to re-run after table reload
function tableBindings() {

    $("td.in, td.out").dblclick(function(e){

        var oldval = $(this).attr('data');
        var entry = $(this).parent().attr('entry');
        var key   = $(this).attr('class'); 

        $(this).empty().append(
        $("<input>")
            .val(oldval)
            .attr("type","time")
            .addClass("editTime")
            .blur(function(e){

                var newval = $(this)[0].value;

                if (newval == "" || oldval == newval) {
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

            })
            .focus()
        )
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

        dayin = $("#day-in")[0].value
        timein = dayin + " " + $("#time-in")[0].value
        timeout = dayin + " " + $("#time-out")[0].value
        req = "/add/" + timein + "/" + timeout

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
