let nVideos = 1000;
let allRankerOptions = [];

function getYouTubeTitle(episode) {
  if (episode.youtube_title && episode.youtube_title.trim() !== "") {
    return episode.youtube_title;
  } else {
    return "Joe Rogan Experience Episode " + episode.episode_number + " - " + episode.guests.join(", ");
  }
}

function editCardContent(card, episode) {
  card.style.display = "block";
  const youtubeTitle = getYouTubeTitle(episode);
  const cardHeader = card.querySelector("h2");
  cardHeader.textContent = youtubeTitle;
  const episodeNumberElement = card.querySelector(".episode-number");
  if (episodeNumberElement) {
    episodeNumberElement.textContent = "Episode: " + episode.title;
  }
  const cardImage = card.querySelector("img");
  cardImage.src = episode.thumbnail_url;
  cardImage.alt = youtubeTitle + " Thumbnail";
  const cardLink = card.querySelector("a");
  cardLink.href = episode.video_url;
  const listItems = card.querySelector("ul").getElementsByTagName("li");
  listItems[0].textContent = "Guest(s): " + episode.guests.join(", ");
  listItems[1].textContent = "Uploaded: " + new Date(episode.published_at).toLocaleDateString("en-CA");
  const views = Number.parseInt(episode.view_count);
  listItems[2].textContent = views.toLocaleString() + " views";
  listItems[3].textContent = "Duration: " + episode.duration;
  if (listItems.length > 4) {
    listItems[4].textContent = episode.description.slice(0, 150) + "...";
    listItems[4].style.backgroundColor = "WhiteSmoke";
    listItems[4].style.display = "inline-block";
    listItems[4].style.padding = "5px 10px";
    listItems[4].style.borderRadius = "5px";
  }
}

function showCards(data, guest = null, topic = null) {
  const cardContainer = document.getElementById("card-container");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";
  const templateCard = document.querySelector(".card");
  for (let i = 0; i < data.length; i++) {
    const episode = data[i];
    if (guest && !episode.guests.includes(guest)) continue;
    if (topic && !episode.description.toLowerCase().includes(topic)) continue;
    const nextCard = templateCard.cloneNode(true);
    editCardContent(nextCard, episode);
    cardContainer.appendChild(nextCard);
  }
}

function filterGuest(guest) {
  fetch("podcast_episodes.json")
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(data => {
      data = data.splice(0, nVideos);
      showCards(data, guest);
    })
    .catch(error => console.error("Error fetching JSON:", error));
}

function popular() {
  fetch("podcast_episodes.json")
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(data => {
      data = data.splice(0, nVideos);
      data.sort((a, b) => parseInt(b.view_count) - parseInt(a.view_count));
      showCards(data);
    })
    .catch(error => console.error("Error fetching JSON:", error));
}

function latest() {
  fetch("podcast_episodes.json")
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(data => {
      data = data.splice(0, nVideos);
      data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
      showCards(data);
    })
    .catch(error => console.error("Error fetching JSON:", error));
}

function oldest() {
  fetch("podcast_episodes.json")
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(data => {
      data = data.splice(0, nVideos);
      data.sort((a, b) => new Date(a.published_at) - new Date(b.published_at));
      showCards(data);
    })
    .catch(error => console.error("Error fetching JSON:", error));
}

function reset() {
  fetch("podcast_episodes.json")
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(data => {
      data = data.splice(0, nVideos);
      showCards(data);
    })
    .catch(error => console.error("Error fetching JSON:", error));
}

/* Ranker Functions */
// Use HTML5 datalists so each rank field is a single input with search-enabled suggestions.
function loadRankerOptions() {
  fetch("podcast_episodes.json")
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(data => {
      data = data.splice(0, nVideos);
      allRankerOptions = data.map(episode => ({
        value: episode.episode_number,
        title: getYouTubeTitle(episode)
      }));
      // Populate each datalist for rank fields
      const datalistIds = ["rank-1-datalist", "rank-2-datalist", "rank-3-datalist", "rank-4-datalist", "rank-5-datalist"];
      datalistIds.forEach(datalistId => {
        const datalistEl = document.getElementById(datalistId);
        if (datalistEl) {
          populateDatalistWithOptions(datalistEl, allRankerOptions);
        }
      });
    })
    .catch(error => console.error("Error loading ranker options:", error));
}

function populateDatalistWithOptions(datalistEl, optionsArray) {
  datalistEl.innerHTML = "";
  optionsArray.forEach(opt => {
    const option = document.createElement("option");
    // Use a separator "––" to combine title and id
    option.value = `${opt.title}––${opt.value}`;
    datalistEl.appendChild(option);
  });
}

function submitRanker(event) {
  event.preventDefault();
  const userName = document.getElementById("user-name").value;
  const ranks = [];
  for (let i = 1; i <= 5; i++) {
    const inputEl = document.getElementById("rank-" + i);
    const inputValue = inputEl.value;
    if (!inputValue.includes("––")) {
      alert("Please select a valid episode for rank " + i);
      return;
    }
    const parts = inputValue.split("––");
    if (parts.length < 2) {
      alert("Invalid selection for rank " + i);
      return;
    }
    const title = parts[0].trim();
    const id = parts[1].trim();
    ranks.push({ rank: i, id: id, title: title });
  }
  const resultDiv = document.getElementById("ranker-result");
  resultDiv.innerHTML = `<h3>Thanks for your rankings, ${userName}!</h3>`;
  const ol = document.createElement("ol");
  ranks.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.title;
    ol.appendChild(li);
  });
  resultDiv.appendChild(ol);
}

function attachRemoveButtons() {
  const removeButtons = document.querySelectorAll(".remove-btn");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetInputId = btn.getAttribute("data-target");
      const inputEl = document.getElementById(targetInputId);
      if (inputEl) {
        inputEl.value = "";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Episodes page functionality
  fetch("podcast_episodes.json")
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(data => {
      data = data.splice(0, nVideos);
      showCards(data);
    })
    .catch(error => console.error("Error fetching JSON data:", error));
  
  const searchInput = document.querySelector("[data-search]");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      let topic = e.target.value.toLowerCase();
      fetch("podcast_episodes.json")
        .then(response => {
          if (!response.ok) throw new Error("HTTP error " + response.status);
          return response.json();
        })
        .then(data => {
          data = data.splice(0, nVideos);
          showCards(data, null, topic);
        })
        .catch(error => console.error("Error fetching JSON:", error));
    });
  }
  
  if (document.getElementById("sort-options")) {
    document.getElementById("sort-options").addEventListener("change", e => {
      let sortOption = e.target.value;
      if (sortOption === "latest") {
        latest();
      } else if (sortOption === "popular") {
        popular();
      } else if (sortOption === "oldest") {
        oldest();
      } else if (sortOption === "alphabetical") {
        fetch("podcast_episodes.json")
          .then(response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
          })
          .then(data => {
            data = data.splice(0, nVideos);
            data.sort((a, b) => getYouTubeTitle(a).localeCompare(getYouTubeTitle(b)));
            showCards(data);
          })
          .catch(error => console.error("Error fetching JSON:", error));
      } else if (sortOption === "guest") {
        fetch("podcast_episodes.json")
          .then(response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
          })
          .then(data => {
            data = data.splice(0, nVideos);
            data.sort((a, b) => {
              const guestA = a.guests[0] || "";
              const guestB = b.guests[0] || "";
              return guestA.localeCompare(guestB);
            });
            showCards(data);
          })
          .catch(error => console.error("Error fetching JSON:", error));
      } else {
        reset();
      }
    });
  }
  
  // Only for the ranker page...
  if (document.getElementById("ranker-form")) {
    loadRankerOptions();
    attachRemoveButtons();
    document.getElementById("ranker-form").addEventListener("submit", submitRanker);
  }
});
