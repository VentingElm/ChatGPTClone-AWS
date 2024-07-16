const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "API_KEY here";
const initialHeight = chatInput.scrollHeight;

const loadDatafromLocalStorage = () => {
  const themeColor = localStorage.getItem("theme-color");

  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
  
  const defaultText = `<div class="default-text"> 
                        <h1>ChatGPT Clone</h1> 
                        <p>This is a clone of ChatGPT. You can ask it anything.<br> Your chat history will be displayed here.
                        </p> </div>`
  
  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
}
loadDatafromLocalStorage();

const createElement = (html, className) => {
 const chatDiv = document.createElement("div");
 chatDiv.classList.add("chat", className);
 chatDiv.innerHTML = html;
 return chatDiv;
}
const getChatResponse = async(incomingChatDiv, userInput) => {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const pElement = document.createElement("p");

  const requestOptions = {
    method: "POST",
    headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
    },
    
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: userInput }
      ],
      max_tokens: 2048,
      temperature: 0.2,
      top_p: 1,
      stop: null
    })
  }

  try {
      const response = await( await fetch(API_URL, requestOptions)).json(); 
      //console.log(response);
      pElement.textContent = response.choices[0].message.content;
  }catch(error){
    pElement.classList.add("error");
    pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
  }

  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const copyResponse = (copyBtn) => {
  //function for copying text to the clipboard
  const responseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => 
    copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = (userInput) => {
 const html = `<div class= "chat-content"> 
        <div class= "chat-details"> 
          <img src= "chatbot3.png">
          <div class= "typing-animation">
            <div class="typing-dot" style="--delay:0.2s"></div>
            <div class="typing-dot" style="--delay:0.3s"></div>
            <div class="typing-dot" style="--delay:0.4s"></div>
          </div>
        </div>
        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
      </div>`
 //create an incoming chat div with typing animation  and append it to the chat container
 const incomingChatDiv = createElement(html, "incoming");
 chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv, userText);
}
const handleOutgoingChat = () => {
 userText = chatInput.value.trim();//get chat input and remove the extra spaces
if(!userText) return;//return from here if chat input is empty

chatInput.value = "";
chatInput.style.height = `${initialHeight}px`;
  
  const html = `<div class= "chat-content"> 
        <div class= "chat-details"> 
          <img src= "user2.png">
          <p></p>
        </div>
      </div>
    </div>`
 //create an outging chat div with the user input and append it to the chat container
  const outgoingChatDiv = createElement(html, "outgoing");
  outgoingChatDiv.querySelector("p").textContent = userText;
  document.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(() => showTypingAnimation(userText), 500);
  //setTimeout(showTypingAnimation, 500);
}

themeButton.addEventListener("click", () => {
  //toggle the theme and save to local storage
  document.body.classList.toggle("light-mode");
  localStorage.setItem("theme-color", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click", ()=>{
  //Remove the chats from local storage
  if(confirm("Are you sure you want to delete all the chats?"))
  {
    localStorage.removeItem("all-chats");
    loadDatafromLocalStorage();
  }
});


chatInput.addEventListener("input", () =>{
  //Adjust the height of the chat input based on the content
  chatInput.style.height = `${initialHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) =>{
  //if the user presses enter key and the width is larger than 800 pixels, handle the outgoing chat
  if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});

sendButton.addEventListener("click", handleOutgoingChat);