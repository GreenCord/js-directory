(function() {
  // ----------------------------------------------------------------------------
  // Method: getData | Returns: parsed JSON
  // ----------------------------------------------------------------------------
  // Info: Uses Fetch API to retrieve data from an API endpoint.
  //       Config object contains URL stub and parameters with array vals.
  //       API URL is constructed automatically using keys/values as params.
  // ----------------------------------------------------------------------------
  const getData = (function ajaxHandler() {
    // Takes config obj and constructs the API URL.
    // Returns URL string.
    function constructUrl(endpoint) {
      let stub = [];
      let params = [];
      for (const key in endpoint) {
        let val = endpoint[key];
        if (endpoint.hasOwnProperty(key)) {
          key === "url"
            ? stub.push(val)
            : params.push(`${key}=${val.join(",")}`);
        }
      }
      return `${stub.join("")}?${params.join("&")}`;
    }

    // Fetches Data from URL
    function fetchData(endpoint) {
      const url = constructUrl(endpoint);
      return fetch(url).then(function(response) {
        if (!response.ok) {
          return new Error(
            `Problem fetching data, status code: ${response.status}`
          );
        }
        return response.json();
      });
    }
    return {
      fetchData: fetchData
    };
  })();
  // ----------------------------------------------------------------------------
  // Method: renderDirectory | Returns: N/A
  // ----------------------------------------------------------------------------
  // Info: Takes results as an array and renders the cards for the screen.
  // ----------------------------------------------------------------------------
  const handleData = (function renderDirectory(directory) {
    // Function taking the person phone data and normalizing the format.
    // Returns empty string or string formatted to: (###)###-####.
    function normalizePhone() {
      let phone = this.replace(/\D/g, "");
      phone = phone.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (phone) {
        return `(${phone[1]})${phone[2]}-${phone[3]}`;
      }
      return "";
    }
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
      return element;
    }
    // Function to generate contact info from a person.
    function generateInfo() {
      const { phone, email } = this;
      const formattedPhone = normalizePhone.call(phone);
      // Contact Info
      const infoDiv = generateElement("div", "card-contact");
      const phoneNum = generateElement("div", "card-phone", formattedPhone);
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
    function createDirectory(directory) {
      return directory.map(person => {
        renderPersonCard.call(person);
        return person;
      });
    }

    return {
      createDirectory: createDirectory
    };
  })();
  // ----------------------------------------------------------------------------
  // Method: handleStorage | Returns: Data from storage
  // ----------------------------------------------------------------------------
  // Info: Takes an action (get/set), a key, and returns data from storage.
  // ----------------------------------------------------------------------------
  const handleStorage = (function storageApi() {
    function doStorage(action, key, data) {
      switch (action) {
        case "get":
          console.log("get storage");
          return JSON.parse(window.localStorage.getItem(key));
        case "set":
          console.log("set storage");
          data
            ? window.localStorage.setItem(key, JSON.stringify(data))
            : console.warn("Storage data not provided.");
          break;
        default:
          console.warn("Storage action not specified");
          return null;
      }
    }

    return {
      doStorage: doStorage
    };
  })();
  // ----------------------------------------------------------------------------
  // Page Logic
  // ----------------------------------------------------------------------------

  // Configuration information.
  const STORAGE_KEY = "JS_DIRECTORY";
  const config = {
    url: "https://randomuser.me/api/",
    results: [27],
    nat: ["US", "CA"],
    exc: ["id", "login", "registered", "dob", "gender"]
  };

  // Set up modules for use.
  const storage = handleStorage;
  const directory = handleData;

  // Attempt to get data from storage. If storage doesn't exist, get from API.
  let data = storage.doStorage("get", STORAGE_KEY);
  if (data) {
    directory.createDirectory(data);
  } else {
    data = getData.fetchData(config);
    data.then(response => {
      storage.doStorage("set", STORAGE_KEY, response.results);
      directory.createDirectory(response.results);
    });
  }
})();
