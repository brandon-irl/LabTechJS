/* Author: Brandon A.

*/

$("#executebutton").click(function () {
    var un = $("#uninput").val();
    var pw = $("#pwinput").val();
    var ep = $("#endpointinput").val();
    var success = function (response) { alert("Success! " + response); };
    var error = function (response) { alert("Failure! " + response); };
    var lt = new LabTech(ep, un, pw);
    lt.AssignToken().then(function (result) {
        console.log("Token receieved: " + result);
        lt.Computers.GetCount().then(function (result) {
            success(result);
        });
    }, function (err) {
        alert("Problem: " + err);
        console.log(err);
    });
});


