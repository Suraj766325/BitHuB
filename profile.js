// code for profile change

let n1=Math.ceil(Math.random()*3);
let n2=Math.ceil(Math.random()*3);
while(n1==n2){
    n2=Math.ceil(Math.random()*3);
}
let p1=document.getElementById("profilesuffle1");
let p2=document.getElementById("profilesuffle2");
let satyamprofile=`<img src="satyam.png" alt="Profile Picture" class="profile-pic">
            <h2 class="name">Satyam Kumar</h2>
            <p class="title">Content Manager</p>
            <p class="description">Everything is theoretically impossible , until it is done.  </p>
          <div class="logo1">
            <a href="https://www.linkedin.com/in/satyam-kumar-4a7a7a194?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank"><img class="insta" src="linkedin.png" alt=""></a>
            <a href="https://www.instagram.com/rocksat12m?igsh=MWdpYnJhcWhxc2JiZA==" target="_blank"><img class="insta"  src="instagram.png" alt=""></a>
            <a href="mailto:btech10038.23@bitmesra.ac.in" target="_blank"><img class="insta"  src="email.png" alt=""></a>
          </div>`;
let sudhanshuprofile=`<img src="sudhanshu.jpeg" alt="Profile Picture" class="profile-pic">
            <h2 class="name">Sudhanshu Kumar</h2>
            <p class="title">Web Developer</p>
            <p class="description"> Creativity is intelligence having fun.</p>
          <div class="logo1">
            <a href="https://www.linkedin.com/in/soumyadeep-ghosh-0aa16531b?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BJL%2BExp4CS16v7JGE4OkhTw%3D%3D  " target="_blank"><img class="insta" src="linkedin.png" alt=""></a>
            <a href="https://www.instagram.com/k_sudhanshu04?igsh=bGZ3NTdqa2tlaHh5" target="_blank"><img class="insta"  src="instagram.png" alt=""></a>
            <a href="mailto:btech10879.23@bitmesra.ac.in" target="_blank"><img class="insta"  src="email.png" alt=""></a>
          </div>`;
let soumyadeepprofile=`<img src="soumyadeep.jpg" alt="Profile Picture" class="profile-pic">
          <h2 class="name">Soumyadeep Ghosh</h2>
          <p class="title">Web Designer</p>
          <p class="description">Exploring life one day at a time.</p>
        <div class="logo1">
          <a href="https://www.linkedin.com/in/soumyadeep-ghosh-0aa16531b?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BJL%2BExp4CS16v7JGE4OkhTw%3D%3D" target="_blank"><img class="insta" src="linkedin.png" alt=""></a>
          <a href="https://www.instagram.com/soumyadeep_ghosh_14/" target="_blank"><img class="insta"  src="instagram.png" alt=""></a>
          <a href="mailto:btech10873.23@bitmesra.ac.in" target="_blank"><img class="insta"  src="email.png" alt=""></a>
        </div>`;

if(n1==1){
    p1.innerHTML=satyamprofile;
}
else if(n1==2){
    p1.innerHTML=sudhanshuprofile;
}
else{
    p1.innerHTML=soumyadeepprofile;
}
if(n2==1){
    p2.innerHTML=satyamprofile;
}
else if(n2==2){
    p2.innerHTML=sudhanshuprofile;
}
else{
    p2.innerHTML=soumyadeepprofile;
}
console.log(n1);
console.log(n2);
