//PAGE1
//GETTING THE POSTS
function getPosts(post){
    const pstctr=document.createElement("div");
    pstctr.setAttribute("class","post-container");

    const container=document.getElementById("nearbyposts-container");
    pstctr.innerHTML=
        `
        <div id=${post.id}-title class="title-container">${post.title}</div>
        <div class="content-container">
            <p id=${post.id}-content>${post.content}</p>
            <br>
            
            <p id=${post.id}-other>Other information:${post.other}</p>
            <div class="button-outercontainer">
                <div class="button-innercontainer">
                    <div id=${post.id} class="button-div" onclick="local('${post.id}')"><a href="edit.html" style="text-decoration: none;">Edit Post</a></div>
                    <div class="button-div"><a href="#postdeleted" onclick="deletePost('${post.id}')" style="text-decoration: none;">Delete Post</a></div>
                    <div class="button-div"><a href="create.html" style="text-decoration: none;">Create New Posts</a></div>
                </div>
            </div>
        </div>`
    container.appendChild(pstctr);
}
const headers = {
    "Content-Type": "application/json"
};

async function fetchPosts() {
    let response = await fetch('http://127.0.0.1:8000/api/getPosts/');
    let data = await response.json();
    console.log(data);

    let foundPosts = false;

    async function processPost(post) {
        function showPosition(position) {
            const lat1 = position.coords.latitude;
            const lon1 = position.coords.longitude;
            const lat2 = post.createdLat;
            const lon2 = post.createdLong;
            const R = 6371e3;
            const lat1rad = (lat1 * Math.PI) / 180;
            const lat2rad = (lat2 * Math.PI) / 180;
            const latDiff = (lat2 - lat1) * (Math.PI / 180);
            const lonDiff = (lon2 - lon1) * (Math.PI / 180);

            const a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
                Math.cos(lat1rad) * Math.cos(lat2rad) * Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = (R * c) / 1000;
            if (d <= 10) {
                getPosts(post);
                foundPosts = true;
            }
        }

        function getlocation() {
            if (navigator.geolocation) {
                
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                alert("Location not supported");
            }
        }

        getlocation();
    }

    for (const post of data) {
        await processPost(post);
    }

    if (!foundPosts && data.length===0) {
        alert("No posts found");
    }
}

//CREATING THE POST

function CreatePost() {
    const newPost = {
        title: document.getElementById(`titleofuser`).value,
        content: document.getElementById('contentofuser').value,
        createdLat: lat,
        createdLong: lon,
        other: document.getElementById('otherofuser').value
    };
    fetch('http://127.0.0.1:8000/api/createPost/', {
    method: "POST",
    headers: headers,
    body: JSON.stringify(newPost),
    })
    .then((response) => {
        if (response.ok) {
            let data = response.json();
            return response.json();
        } else {
            throw new Error(`Error: ${response.status}`);
        }
    })
    .then((data) => {
        console.log(data);
        redirect(); // Move the redirect inside the .then block
    })
    .catch((error) => {
        console.error("An error occurred:", error);
    });
}

//HANDLING SUBMIT BUTTON FROM CREATE CONTENT PAGE
function handlingformsubmsn(event){
    event.preventDefault();
    findlocation(); 
    redirect();
}
let lat, lon;

//REDIRECTING TO THE MAIN PAGE

function redirect() {
window.location.href = "main.html";
}

function findposition(position) {
lat = position.coords.latitude;
lon = position.coords.longitude;
CreatePost();
}

function findlocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(findposition);
    } 
    else {
        alert("Location not supported");
    }
}
//EDITING POSTS

function local(id){
    localStorage.setItem("postedit",id);

}

async function Editpost(){
    let id=localStorage.getItem("postedit");
    await fetch(`http://127.0.0.1:8000/api/getPost/${id}`, {
        method: "GET",
        headers: headers
    })
        .then((response) => {
            if (response.ok) {
                data = response.json();
                return data;
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        })
        .then((data) => {
            document.getElementById(`titleofuser`).value=`${data.title}`;
            document.getElementById(`contentofuser`).value=`${data.content}`;
            document.getElementById(`otherofuser`).value=`${data.other}`;
            document.getElementById("f1").addEventListener("submit",editsubmsn);
            
        })
        .catch((error) => {
            console.error("An error occurred:", error);
        });
    }
async function editsubmsn(e){
    e.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
        });
    } 
    else {
        alert("Location not supported");
    }
   
   
    const newPost = {
        title: document.getElementById(`titleofuser`).value,
        content: document.getElementById('contentofuser').value,
        createdLat: lat,
        createdLong: lon,
        other: document.getElementById('otherofuser').value
    };
    let idput=localStorage.getItem("postedit");
    await fetch(`http://127.0.0.1:8000/api/updatePost/${idput}/`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(newPost),
    })
    .then((response) => {
        if (response.ok) {
            let data = response.json();
            return response.json();
        } else {
            throw new Error(`Error: ${response.status}`);
        }
    })
    .then((data) => {
        console.log(data);
    })
    .catch((error) => {
        console.error("An error occurred:", error);
    });

        
        
    redirect();    
}

//DELETING POSTS

function deletePost(id){
    fetch(`http://127.0.0.1:8000/api/deletePost/${id}/`, {
        method: "DELETE",
        headers: headers
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        })
        .then((data) => {
            console.log("Post deleted",data);
        })
        .catch((error) => {
            console.error("An error occurred:", error);
        });
}
    
