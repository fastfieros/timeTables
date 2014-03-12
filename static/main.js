
$(function() {

    $("#in").click(function(e){

        $.get("/in", function(d) {
            alert(d);
            location.reload();
        });
        
        e.preventDefault();
    });

    $("#out").click(function(e){

        $.get("/out", function(d) {
            alert(d);
            location.reload();
        });
        
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
