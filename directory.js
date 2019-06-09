// IIFE to ensure contained variables and function calls.
(function() {
  const endpoint =
    "https://randomuser.me/api/?results=27&nat=US,CA&exc=id,login,registered,dob,gender";
  const storageKey = "JS_DIRECTORY";
  // Check local storage for cached data or AJAX to endpoint to retrieve.
  let directory = JSON.parse(localStorage.getItem(storageKey));
  if (directory) {
    console.log("LOADING STORED DIRECTORY...");
    renderDirectory(directory);
  } else {
    console.log("AJAX REQUEST TO GET DATA...");
    // XMLHttpRequest method.
    let httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      console.error("httpRequest not initialized.");
      return false;
    }
    httpRequest.onreadystatechange = handleResponse;
    httpRequest.open("GET", endpoint);
    httpRequest.send();

    function handleResponse() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          const data = httpRequest.responseText;
          localStorage.setItem(storageKey, data);
          renderDirectory(JSON.parse(data));
        } else {
          console.error(
            "httpRequest received with error code: ",
            httpRequest.status
          );
        }
      }
    }
  }
  function renderDirectory(directory) {
    // Function call with person to generate a persons image.
    // Size can be 'large', 'medium', or 'thumbnail'.
    function generatePersonImage(size) {
      const imgDiv = document.createElement("div");
      imgDiv.setAttribute("class", "card-image");

      const img = document.createElement("IMG");
      img.setAttribute("src", this.picture[size]);
      img.setAttribute("alt", `${this.name.first} ${this.name.last}`);

      imgDiv.appendChild(img);
      return imgDiv;
    }
    // Function to generate a simple element with a class. Text is optional.
    function generateElement(elem, className, text) {
      const element = document.createElement(elem);
      element.setAttribute("class", className);
      if (text) element.textContent = text;
      if (className === "card-name")
        console.log("generateElement div", element);
      return element;
    }
    // Function to generate contact info from a person.
    function generateInfo() {
      const { phone, email } = this;
      // Contact Info
      const infoDiv = generateElement("div", "card-contact");
      const phoneNum = generateElement("div", "card-phone", phone);
      const emailAddr = generateElement("div", "card-email", email);
      infoDiv.appendChild(phoneNum);
      infoDiv.appendChild(emailAddr);

      const masterDiv = generateElement("div", "card-info");
      masterDiv.appendChild(infoDiv);
      return masterDiv;
    }
    // Function to render the full person card.
    function renderPersonCard() {
      const ul = document.querySelector("ul.card-list");
      const li = document.createElement("li");
      li.setAttribute("class", "card-item");
      const name = generateElement(
        "div",
        "card-name",
        `${this.name.first} ${this.name.last}`
      );
      name.appendChild(generatePersonImage.call(this, "large"));
      li.appendChild(name);

      // li.appendChild(generatePersonImage.call(this, "large"));
      li.appendChild(generateInfo.call(this));
      ul.appendChild(li);
    }

    // Extract people from dataset and render their cards.
    const people = directory.results.map(person => {
      renderPersonCard.call(person);
      return person;
    });
  }
})();
