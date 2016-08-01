var index = 0;

$(function() {
    $("#setup, #punchline, #voting, #votes-container").hide();

    $("#getJoke").click(
        function() {
            $("#setup, #punchline, #voting, #votes-container").show();

            $.get("/jokes",function(data){
                $("#setup").html(data.setup);
                $("#punchline").html(data.punchline);

                index = data._id;

                if (data.votes === undefined) {
                    $("#votes").html(0);
                } else {
                    $("#votes").html(data.votes);
                }

                changeVoteColor(data.votes);

            },"json")
        }
    );

    $("#upvote").on("click", function() {
        // $.post("/upvote");
        $.ajax({
            url: '/upvote',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: index }),

            success: function(data, status, xhr) {
                $("#votes").html(data.votes);

                changeVoteColor(data.votes);
            }
        });
    });

    $("#downvote").on("click", function() {
        // $.post("/downvote");
        $.ajax({
            url: '/downvote',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: index }),

            success: function(data, status, xhr) {
                $("#votes").html(data.votes);

                changeVoteColor(data.votes);
            }
        });
    });

    // should have it's own file for the database page
    $("#createJoke").submit(function(event) {
        event.preventDefault();

        var setup = $('#createJokeSetup').val();
        var punchline = $('#createJokePunchline').val();

        // https://www.airpair.com/js/jquery-ajax-post-tutorial
        $.ajax({
            url: '/createJoke',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(
                {
                    "setup": setup,
                    "punchline": punchline,
                    "votes": 0
                }
            ),
            success: function(data, status, xhr) {
                $('#createJokeSetup').val("");
                $('#createJokePunchline').val("");
                $('#createJokeSuccess').text("Joke created successfully. {setup: " + setup + ", punchline: " + punchline + "}");
                refreshJokes();
            }
        });
    });

    $("#refreshJokes").on('click', refreshJokes());

    $("#deleteJoke").on('click', function() {
       $.ajax({
           url: 'deletejoke',
           type: 'POST',
           contentType: 'application/json',
           data: JSON.stringify(
               {
                    id: $('#allJokes').val()
               }
           ),
            success: function(data, status, xhr) {
                console.log($('#allJokes').val());
                refreshJokes();
            }
       })
    });

    function changeVoteColor(numVotes) {
        if (numVotes < 0) {
            $("#votes").css('color', 'red');
        } else if (numVotes > 0) {
            $("#votes").css('color', 'lightgreen');
        } else {
            $("#votes").css('color', 'white');
        }
    }

    function refreshJokes() {
        $.get("/alljokes", function(data) {
            console.log(data);
            var optionsHTML = "";
            $('#allJokes').empty();
            data.forEach(function(element, index, array) {
                console.log(element, index, array);
                // http://stackoverflow.com/questions/1801499/how-to-change-options-of-select-with-jquery
                $('#allJokes').append($("<option></option>").attr("value",element._id).text(element.setup));
            });
        });
    }
});
