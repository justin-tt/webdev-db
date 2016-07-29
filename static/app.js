var index = 0;

$(function() {
    $("#setup, #punchline, #voting, #votes-container").hide();

    $("#getJoke").click(
        function() {
            $("#setup, #punchline, #voting, #votes-container").show();

            $.get("/jokes",function(data){
                $("#setup").html(data.setup);
                $("#punchline").html(data.punchline);

                index = data.id;

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

    function changeVoteColor(numVotes) {
        if (numVotes < 0) {
            $("#votes").css('color', 'red');
        } else if (numVotes > 0) {
            $("#votes").css('color', 'lightgreen');
        } else {
            $("#votes").css('color', 'white');
        }
    };
});