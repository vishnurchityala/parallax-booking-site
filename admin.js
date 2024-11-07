// Import necessary Firebase modules
import { db, auth,provider} from './firebase.config.js';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Initialize Firestore collections
const slotsCollection = collection(db, 'slots');
const bookingsCollection = collection(db, 'bookings');
const allowedEmails = ["e23cseu0049@bennett.edu.in","e23cseu0055@bennett.edu.in"];
const loader = document.getElementById('loader');
const slotSelectionMenu = document.getElementById('slots-select-menu');
const bookingsContainer = document.getElementById('bookings-container');

// Update bookings on slot selection change
slotSelectionMenu.addEventListener('change', (event) => {
    const selectedOption = event.target.value;
    updateBookings(selectedOption);
});

async function updateBookings(slotId) {
    loader.classList.remove('d-none');
    bookingsContainer.innerHTML = '';

    try {
        const querySnapshot = await getDocs(bookingsCollection);
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (bookingDoc) => {
                const bookingData = bookingDoc.data();
                
                if (bookingData.slotId === slotId) {
                    const bookingCard = document.createElement('div');
                    bookingCard.className = 'glass-card px-3 py-3 col-11 col-md-auto fs-small';

                    bookingCard.innerHTML = `
                        <p class="font-heading m-0 mt-2">Name: <span class="fw-light ms-2">${bookingData.userName}</span></p>
                        <p class="font-heading m-0 mt-2">Email: <span class="fw-light ms-2">${bookingData.userEmail}</span></p>
                        <p class="font-heading m-0 mt-2">Slot: <span class="fw-light ms-2">${bookingData.slotTiming}</span></p>
                    `;

                    const cancelButton = document.createElement('button');
                    cancelButton.className = 'btn-cancel mt-3';
                    cancelButton.style.fontSize = 'x-small';
                    cancelButton.textContent = 'Cancel Seat';
                    cancelButton.addEventListener('click', async () => {
                        loader.classList.remove('d-none');
                        const bookingDocRef = doc(bookingsCollection, bookingDoc.id);
                        const slotDocRef = doc(db, 'slots', bookingData.slotId);

                        try {
                            const slotSnapshot = await getDoc(slotDocRef);
                            if (slotSnapshot.exists()) {
                                const slotData = slotSnapshot.data();
                                const newAvailableSeats = slotData.availableSeats + 1;
                                const newBookedSeats = slotData.bookedSeats - 1;

                                await updateDoc(slotDocRef, {
                                    availableSeats: newAvailableSeats,
                                    bookedSeats: newBookedSeats
                                });
                                populateSlotsDetails();
                            } else {
                                console.error('Slot document does not exist.');
                            }

                            await deleteDoc(bookingDocRef);
                            console.log('Booking cancelled successfully!');
                        } catch (error) {
                            console.error('Error cancelling booking:', error);
                            alert('Error cancelling booking. Please try again.');
                        }
                        updateBookings(slotId);
                        loader.classList.add('d-none');
                        console.log(`Canceling seat for ${bookingData.userName}`);
                    });

                    const checkInButton = document.createElement('button');
                    checkInButton.className = 'btn-success mt-3 ms-3';
                    checkInButton.style.fontSize = 'x-small';
                    checkInButton.textContent = 'Check In';
                    checkInButton.addEventListener('click', () => {
                        console.log(`Checking in ${bookingData.userName}`);
                        // Implement check-in logic here
                    });

                    bookingCard.appendChild(cancelButton);
                    bookingCard.appendChild(checkInButton);
                    bookingsContainer.appendChild(bookingCard);
                }
            });
        } else {
            bookingsContainer.innerHTML = 'No Bookings found';
            bookingsContainer.classList.add('font-heading');
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
    } finally {
        loader.classList.add('d-none');
    }
}

function updateLoginIndicator(user) {
    const loginIndicator = document.querySelector('.glass-login');
    loginIndicator.innerHTML = '';

    if (user) {
        const iconDiv = document.createElement('div');
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-user', 'text-white');
        iconDiv.appendChild(icon);
        loginIndicator.appendChild(iconDiv);

        iconDiv.addEventListener('click', async () => {
            loader.classList.remove('d-none');
            await signOut(auth);
            document.getElementById('protected-content').classList.add('d-none')
            loader.classList.add('d-none');
        });
    } else {
        const loginLink = document.createElement('a');
        loginLink.href = '#';
        loginLink.textContent = 'Login';
        loginLink.addEventListener('click', async (event) => {
            event.preventDefault();
            loader.classList.remove('d-none');
            await signInWithPopup(auth, provider);
            loader.classList.add('d-none');
        });
        loginIndicator.appendChild(loginLink);
    }
}

function checkUserAccess(user) {
    if (user && allowedEmails.includes(user.email)) {
        document.getElementById("protected-content").classList.remove('d-none');
    } else {
        console.log("Access denied: Unauthorized email.");
        if (user){
            console.log(user.email);
        }
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
                <p class="font-heading fs-small m-0 mt-2">Available Seats: <span class="fw-light font-sub-heading ms-2">${data.availableSeats} / ${data.availableSeats + (data.bookedSeats || 0)}</span></p>
            </div>
        `;
    });
}

async function populateSlotsSelectMenu() {
    const querySnapshot = await getDocs(slotsCollection);
    slotSelectionMenu.innerHTML = '';

    querySnapshot.forEach(slot => {
        const data = slot.data();
        const opt = document.createElement('option');
        opt.value = slot.id;
        opt.textContent = data.time;
        slotSelectionMenu.appendChild(opt);
    });
}

async function login() {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error during sign-in:", error);
        alert("Failed to log in. Please try again.");
    }
}

onAuthStateChanged(auth, (user) => {
    updateLoginIndicator(user);
    checkUserAccess();
});

document.addEventListener('DOMContentLoaded', async () => {
    
    loader.classList.remove('d-none');
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            ;
        }        
        if (user) {
            checkUserAccess(user);
            await populateSlotsDetails();
            await populateSlotsSelectMenu();
            updateBookings(slotSelectionMenu.value);
        } 
    });
    loader.classList.add('d-none');
});
