var index = 0;

$(function() {
    $("#setup, #punchline, #voting, #votes-container").hide();
    refreshJokes();

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
        $.ajax({
            url: '/upvote',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ id: index }),

            success: function(data, status, xhr) {
                $("#votes").html(data.votes);

                changeVoteColor(data.votes);
            }
        });
    });

    $("#downvote").on("click", function() {
        $.ajax({
            url: '/downvote',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ id: index }),

            success: function(data, status, xhr) {
                $("#votes").html(data.votes);

                changeVoteColor(data.votes);
            }
        });
    });

    $("#createJoke").submit(function(event) {
        event.preventDefault();

        var setup = $('#createJokeSetup').val();
        var punchline = $('#createJokePunchline').val();

        $.ajax({
            url: '/createjoke',
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

    $("#refreshJokes").on('click', function() {
        refreshJokes();
    });

    $("#deleteJoke").on('click', function() {
       $.ajax({
           url: 'deletejoke',
           type: 'DELETE',
           contentType: 'application/json',
           data: JSON.stringify(
               {
                    id: $('#allJokes').val()
               }
           ),
            success: function(data, status, xhr) {
                $('#deleteJokeSuccess').text("Joke deleted successfully. {setup: " + $('#allJokes option:selected').text() + "}");
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
            var optionsHTML = "";
            $('#allJokes').empty();
            data.forEach(function(element, index, array) {
                $('#allJokes')
                    .append($("<option></option>")
                    .attr("value",element._id)
                    .text(element.setup + " " + element.punchline));
            });
        });
    }
});
