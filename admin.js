// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const googleSignInButton = document.getElementById('google-signin');
const logoutBtn = document.getElementById('logout-btn');
const addEventForm = document.getElementById('add-event-form');
const eventsList = document.getElementById('events-list');


googleSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
        })
        .catch((error) => {
            console.error('Google Sign-In Error:', error);
            alert('Google Sign-In failed. Please try again.');
        });
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        showLoginContainer();
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    });
});

addEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const description = document.getElementById('event-description').value;

    db.collection('events').add({
        title: title,
        date: date,
        description: description
    })
    .then(() => {
        alert('Event added successfully');
        addEventForm.reset();
        loadEvents();
    })
    .catch((error) => {
        console.error('Error adding event:', error);
        alert('Error adding event. Please try again.');
    });
});

function loadEvents() {
    eventsList.innerHTML = '<p class="text-center">Loading events...</p>';
    db.collection('events').orderBy('date').get().then((querySnapshot) => {
        eventsList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const event = doc.data();
            const eventElement = document.createElement('div');
            eventElement.className = 'mb-4 p-4 bg-gray-50 rounded-lg';
            eventElement.innerHTML = `
                <h3 class="text-lg font-semibold">${event.title}</h3>
                <p class="text-sm text-gray-600">${event.date}</p>
                <p class="mt-2">${event.description}</p>
                <button class="mt-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteEvent('${doc.id}')">Delete</button>
            `;
            eventsList.appendChild(eventElement);
        });
    }).catch((error) => {
        console.error('Error loading events:', error);
        eventsList.innerHTML = '<p class="text-center text-red-500">Error loading events. Please try again.</p>';
    });
}

function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        db.collection('events').doc(id).delete()
            .then(() => {
                alert('Event deleted successfully');
                loadEvents();
            })
            .catch((error) => {
                console.error('Error deleting event:', error);
                alert('Error deleting event. Please try again.');
            });
    }
}

function checkAccess(user) {
    db.collection('admins').doc(user.email).get()
        .then((doc) => {
            if (doc.exists) {
                showDashboard();
                loadEvents();
            } else {
                window.location.href = './pages/no-access.html';
            }
        })
        .catch((error) => {
            console.error('Error checking access:', error);
            window.location.href = './pages/no-access.html';
        });
}

function showLoginContainer() {
    loginContainer.style.display = 'flex';
    dashboardContainer.style.display = 'none';
}

function showDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
}

auth.onAuthStateChanged((user) => {
    if (user) {
        checkAccess(user);
    } else {
        showLoginContainer();
    }
});