import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0HmfxViCsYRqNzI7CEQZW6wRou_XVs1c",
  authDomain: "rc-sjcet.firebaseapp.com",
  projectId: "rc-sjcet",
  storageBucket: "rc-sjcet.appspot.com",
  messagingSenderId: "533155614413",
  appId: "1:533155614413:web:217d333825a33e2057a384",
  measurementId: "G-Z5FT708XPC",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const loginContainer = document.getElementById("login-container");
const dashboardContainer = document.getElementById("dashboard-container");
const googleSignInButton = document.getElementById("google-signin");
const logoutBtn = document.getElementById("logout-btn");
const addEventForm = document.getElementById("add-event-form");
const eventsList = document.getElementById("events-list");
const responsesList = document.getElementById("responses-list");
const responsesBtn = document.getElementById("responses-btn");
const eventsBtn = document.getElementById("events-btn");
const responsesContainer = document.getElementById("responses-container");
const eventsContainer = document.getElementById("events-container");
const mainOptions = document.getElementById("main-options");
const responsesBackBtn = document.getElementById("responses-back-btn");
const eventsBackBtn = document.getElementById("events-back-btn");

googleSignInButton.addEventListener("click", function () {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Google Sign-In successful");
    })
    .catch((error) => {
      console.error("Google Sign-In Error:", error);
      alert("Google Sign-In failed. Please try again.");
    });
});

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      showLoginContainer();
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    });
});

addEventForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const posterFile = document.getElementById("event-poster").files[0];

  if (!posterFile) {
    alert("Please select a poster image.");
    return;
  }

  const posterRef = ref(
    storage,
    "event_posters/" + Date.now() + "_" + posterFile.name
  );

  uploadBytes(posterRef, posterFile)
    .then((snapshot) => {
      return getDownloadURL(snapshot.ref);
    })
    .then((downloadURL) => {
      return addDoc(collection(db, "events"), {
        posterUrl: downloadURL,
        timestamp: serverTimestamp(),
      });
    })
    .then(() => {
      alert("Event added successfully");
      addEventForm.reset();
      loadEvents();
    })
    .catch((error) => {
      console.error("Error adding event:", error);
      alert("Error adding event. Please try again.");
    });
});

function loadEvents() {
  eventsList.innerHTML = '<p class="text-center">Loading events...</p>';
  const eventsQuery = query(
    collection(db, "events"),
    orderBy("timestamp", "desc")
  );
  getDocs(eventsQuery)
    .then((querySnapshot) => {
      eventsList.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        const eventElement = document.createElement("div");
        eventElement.className = "mb-4 p-4 bg-white rounded-lg shadow";
        eventElement.innerHTML = `
                <img src="${event.posterUrl}" alt="Event Poster" class="w-full h-auto mb-4 rounded">
                <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" onclick="deleteEvent('${doc.id}')">
                    Delete Event
                </button>
            `;
        eventsList.appendChild(eventElement);
      });
    })
    .catch((error) => {
      console.error("Error loading events:", error);
      eventsList.innerHTML =
        '<p class="text-center text-red-500">Error loading events. Please try again.</p>';
    });
}

window.deleteEvent = function (id) {
  if (confirm("Are you sure you want to delete this event?")) {
    const eventRef = doc(db, "events", id);

    getDoc(eventRef)
      .then((doc) => {
        if (doc.exists()) {
          const event = doc.data();
          const posterRef = ref(storage, event.posterUrl);
          return deleteObject(posterRef).then(() => {
            return deleteDoc(eventRef);
          });
        } else {
          throw new Error("Event not found");
        }
      })
      .then(() => {
        alert("Event deleted successfully");
        loadEvents();
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        alert("Error deleting event. Please try again.");
      });
  }
};

function loadResponses() {
  responsesList.innerHTML = '<p class="text-center">Loading responses...</p>';
  const responsesQuery = query(
    collection(db, "responses"),
    orderBy("timestamp", "desc")
  );
  getDocs(responsesQuery)
    .then((querySnapshot) => {
      responsesList.innerHTML = "";
      
      querySnapshot.forEach((doc) => {
        const response = doc.data();
        const responseElement = document.createElement("div");
        responseElement.className = "mb-4 p-4 bg-white rounded-lg shadow";
        responseElement.innerHTML = `
                <p><strong>Name:</strong> ${response.name}</p>
                <p><strong>Email:</strong> ${response.email}</p>
                <p><strong>Message:</strong> ${response.message}</p>
                <p><strong>Timestamp:</strong> ${response.timestamp.toDate().toLocaleString()}</p>
            `;
        responsesList.appendChild(responseElement);
      });
    })
    .catch((error) => {
      console.error("Error loading responses:", error);
      responsesList.innerHTML =
        '<p class="text-center text-red-500">Error loading responses. Please try again.</p>';
    });
}

function showLoginContainer() {
  loginContainer.style.display = "flex";
  dashboardContainer.style.display = "none";
}

function showDashboard() {
  loginContainer.style.display = "none";
  dashboardContainer.style.display = "block";
  showMainOptions();
}

function showMainOptions() {
  mainOptions.style.display = "grid";
  responsesContainer.style.display = "none";
  eventsContainer.style.display = "none";
}

responsesBtn.addEventListener("click", () => {
  mainOptions.style.display = "none";
  responsesContainer.style.display = "block";
  eventsContainer.style.display = "none";
  loadResponses();
});

eventsBtn.addEventListener("click", () => {
  mainOptions.style.display = "none";
  responsesContainer.style.display = "none";
  eventsContainer.style.display = "block";
  loadEvents();
});

responsesBackBtn.addEventListener("click", showMainOptions);
eventsBackBtn.addEventListener("click", showMainOptions);

onAuthStateChanged(auth, (user) => {
  if (user) {
    showDashboard();
  } else {
    showLoginContainer();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("loader");

  function hideLoader() {
    loader.style.opacity = "0";
    loader.style.transition = "opacity 0.5s ease-out";
    setTimeout(() => {
      loader.style.display = "none";
    }, 2000);
  }
  setTimeout(hideLoader, 3000);
});