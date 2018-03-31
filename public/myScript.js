function submitInput(){
    var location = document.forms["input"]["location"].value;
    var constraint = document.forms["input"]["constraint"].value;
    var e = document.getElementById("activities");
    var activity = e.options[e.selectedIndex].value;
    if(location == "" || constraint == "" || activity == "")
    {
        alert("One or more field was left empty");
        return false;
    }
    sessionStorage.getItem('location');
    sessionStorage.setItem('location', location);
    sessionStorage.getItem('constraint');
    sessionStorage.setItem('constraint', constraint);
    sessionStorage.getItem('activity');
    sessionStorage.setItem('activity', activity);
    document.location.href = "result.htm";
}

function postQuery(){
    var location = sessionStorage.getItem('location');
    var constraint = sessionStorage.getItem('constraint');
    var activity = sessionStorage.getItem('activity');
    if(location == "" || constraint == "" || activity == "")
    {
        alert("One or more field was left empty");
        return false;
    }
    $.get({url:"https://robotic-sphere-199721.appspot.com/api", 
    data:{location:location, 
        timeConstraint:constraint,
        activity:activity}, 
    success:populatePage});
}

function populatePage(data){
        alert("got inside populatePage");
    document.getElementById("dest_name").innerHTML = "hello";
    document.getElementById("dest_name").innerHTML = data[0].name;
    document.getElementById("dest_rating").innerHTML = data[0].rating;
    document.getElementById("dest_estimate_travel_time").innerHTML = data[0].time;
    document.getElementById("dest_photo").src = data[0].photo;
    document.getElementById("dest_map").src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDa9QtqkcijVkuVjjqoAStEgUNQHyu3I50&q=" + data[0].name;
}
