document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit',send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email(event){
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value ;
  const subject = document.querySelector('#compose-subject').value ;
  const body = document.querySelector('#compose-body').value;
  
  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    }),
    headers:{
      'Content-Type': 'application/json'
    }
  })
  .then(function(response){
    return response.json();
  })
  .then(function(result){
    console.log(result);
    if (result.message === "Email sent successfully."){
      load_mailbox('sent');
    }
    
  })
  
  .catch(function(error){
    console.error('Error:' , error);
  });

}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  

}



function load_mailbox(mailbox) {
  
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(function(response){
    return response.json();
  })
  .then(function(emails){
    emails.forEach(function(email){
      let emailDiv = document.createElement('div');
      let emailInfo = document.createElement('p');
      emailInfo.innerHTML = `<strong>${email.sender} </strong>- ${email.subject} - ${email.timestamp}`
      emailDiv.style.border = "1px solid black";
      if(!email.read){
        emailDiv.style.backgroundColor = "orange";
      }
      emailDiv.appendChild(emailInfo)
      document.querySelector('#emails-view').appendChild(emailDiv);
      emailDiv.addEventListener('click',function(){
        fetch(`/emails/${email.id}`)
        .then(function(response){
          return response.json();
        })
        .then(function(email){
          document.querySelector('#emails-view').innerHTML = '';
          document.querySelector('h2').innerHTML = email.sender;
          let archieveButton = document.createElement('button')
          archieveButton.classList.add("btn", "btn-sm", "btn-outline-primary");
          if(email.archived){
            archieveButton.innerText = "Unarchive";
          }
          else{
            archieveButton.innerText = "Archive";
          }
          archieveButton.addEventListener('click',function(){
            fetch(`/emails/${email.id}`,{
              method: 'PUT',
              body: JSON.stringify({
                archived: !email.archived
              })
            })
            .then(function(){
              load_mailbox('inbox')
            })
          })
          let replyButton = document.createElement('button')
          replyButton.classList.add("btn", "btn-sm", "btn-outline-primary");
          replyButton.innerText = "Reply"
          document.querySelector('#emails-view').appendChild(replyButton);
          replyButton.addEventListener('click',function(){
            document.querySelector('#compose-view').style.display = 'block';
            document.querySelector('#compose-recipients').value = email.sender
            if(!email.subject.startsWith("Re: ")){
              subject = "Re: " + email.subject;
            }
            else{
              subject = email.subject;
            }
            document.querySelector('#compose-subject').value = subject;
            document.querySelector('#compose-body').value = "\n \n \n Quoted message from " + email.sender + ":\n" + email.body;
            document.querySelector('#compose-form').addEventListener('submit',send_email);

          })

          document.querySelector('#emails-view').appendChild(archieveButton);
          let particularEmaildiv = document.createElement('div')
          let particularEmailInfoDiv = document.createElement('div');
          let particularEmailSender = document.createElement('p');
          let particularEmailTo = document.createElement('p');
          let particularEmailSubject = document.createElement('p');
          let particularEmailTimestamp = document.createElement('p');
          let hr = document.createElement('hr')
          let particularEmailBody = document.createElement('div')
          particularEmailSender.innerHTML = `<strong>From: </strong>${email.sender}`
          particularEmailTo.innerHTML = `<strong>To: </strong> ${email.recipients}`
          particularEmailSubject.innerHTML = `<strong>Subject: </strong> ${email.recipients}`
          particularEmailTimestamp.innerHTML = `<strong>Timestamp: </strong> ${email.timestamp}`
          particularEmailBody.innerHTML = `${email.body}`
          particularEmailInfoDiv.append(particularEmailSender);
          particularEmailInfoDiv.append(particularEmailTo);
          particularEmailInfoDiv.append(particularEmailSubject);
          particularEmailInfoDiv.append(particularEmailTimestamp);
          particularEmailInfoDiv.append(hr);
          particularEmaildiv.append(particularEmailInfoDiv);
          particularEmaildiv.append(particularEmailBody);
          document.querySelector('#emails-view').appendChild(particularEmaildiv);
          fetch(`/emails/${email.id}`,{
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          })
            

          
          
        })
        
      })
      
    })


  

  })
}

