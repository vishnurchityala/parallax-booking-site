// Import necessary Firebase modules
import { db, auth } from './firebase.config.js'; 
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; 
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"; 

// Initialize Firestore collections
const slotsCollection = collection(db, 'slots');
const bookingsCollection = collection(db, 'bookings'); 
const provider = new GoogleAuthProvider();

// Function to update login indicator
function updateLoginIndicator(user) {
    const loader = document.getElementById('loader');
    const loginIndicator = document.querySelector('.glass-login');
    loginIndicator.innerHTML = '';

    if (user) {
        const iconDiv = document.createElement('div');
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-user', 'text-white'); 

        iconDiv.appendChild(icon);
        loginIndicator.appendChild(iconDiv);

        iconDiv.addEventListener('click', async () => {
            try {
                loader.classList.remove('d-none');
                await signOut(auth); 
                loader.classList.add('d-none');
            } catch (error) {
                console.error('Error during sign-out:', error);
                loader.classList.add('d-none');
            }
        });
    } else {
        const loginLink = document.createElement('a');
        loginLink.href = '#'; 
        loginLink.textContent = 'Login';
        loginLink.addEventListener('click', async (event) => {
            event.preventDefault(); 
            try {
                loader.classList.remove('d-none');
                await signInWithPopup(auth, provider);
                loader.classList.add('d-none');
            } catch (error) {
                console.error('Error during sign-in:', error);
                loader.classList.add('d-none');
            }
        });
        loginIndicator.appendChild(loginLink);
    }
}

async function populateSlotsDetails() {
    const detailsContainer = document.getElementById('slots-details-container');

    const querySnapshot = await getDocs(slotsCollection);

    detailsContainer.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const data = doc.data(); 

        detailsContainer.innerHTML += `
            <div class="col-10 col-md-3 glass-card px-4 py-3">
                <p class="font-heading m-0">SLOT: <span class="fw-light ms-2">${data.time}</span></p>
                <hr>
                <p class="font-heading fs-small m-0 mt-2">Available Seats: <span class="fw-light font-sub-heading ms-2">${data.availableSeats} / ${data.availableSeats + data.bookedSeats}</span></p>
            </div>
        `;
    });
}

async function populateSlotsSelectMenu() {
    const slotsSelectMenu = document.getElementById('slots-select-menu');
    slotsSelectMenu.innerHTML = '';
    const querySnapshot = await getDocs(slotsCollection);
    querySnapshot.forEach(slot => {
        const data = slot.data();
        const opt = document.createElement('option'); 
            opt.value = slot.id;
            opt.textContent = data.time;
            slotsSelectMenu.appendChild(opt); 
    });
}

async function populateBookingsDetails() {
}

onAuthStateChanged(auth, (user) => {
    // updateLoginIndicator(user);
});

document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.getElementById('loader');
    loader.classList.remove('d-none');
    await populateSlotsDetails();
    await populateBookingsDetails();
    await populateSlotsSelectMenu();
    loader.classList.add('d-none');
});