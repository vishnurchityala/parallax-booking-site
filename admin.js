// Import necessary Firebase modules
import { db, auth } from './firebase.config.js'; 
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; 
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"; 

// Initialize Firestore collections
const slotsCollection = collection(db, 'slots');
const bookingsCollection = collection(db, 'bookings'); 
const provider = new GoogleAuthProvider();

const slotSelectionMenu = document.getElementById('slots-select-menu');

slotSelectionMenu.addEventListener('change', (event) => {
    const selectedOption = event.target.value;
    updateBookings(selectedOption);
});

async function updateBookings(slotId) {
    const loader = document.getElementById('loader');
    loader.classList.remove('d-none');
    const bookingsContainer = document.getElementById('bookings-container');
    bookingsContainer.innerHTML = '';

    try {
        // Ensure you await the promise here
        const querySnapshot = await getDocs(bookingsCollection);

        // Check if querySnapshot is a valid object with forEach
        if (querySnapshot && querySnapshot.forEach) {
            querySnapshot.forEach(async (bookingDoc) => { // Renamed iterator to bookingDoc
                const bookingData = bookingDoc.data();

                // Ensure you filter based on the selected slot ID
                if (bookingData.slotId === slotId) {  // Assuming booking has slotId field
                    // Create a booking card container
                    const bookingCard = document.createElement('div');
                    bookingCard.className = 'glass-card px-3 py-3 col-11 col-md-auto fs-small';

                    bookingCard.innerHTML = `
                        <p class="font-heading m-0 mt-2">Name: <span class="fw-light ms-2">${bookingData.userName}</span></p>
                        <p class="font-heading m-0 mt-2">Email: <span class="fw-light ms-2">${bookingData.userEmail}</span></p>
                        <p class="font-heading m-0 mt-2">Slot: <span class="fw-light ms-2">${bookingData.slotTiming}</span></p>
                    `;

                    // Create Cancel Seat button
                    const cancelButton = document.createElement('button');
                    cancelButton.className = 'btn-cancel mt-3';
                    cancelButton.style.fontSize = 'x-small';
                    cancelButton.textContent = 'Cancel Seat';
                    cancelButton.addEventListener('click', async () => {
                        // Create a reference to the booking document
                        const loader = document.getElementById('loader');
                        loader.classList.remove('d-none');
                        const bookingDocRef = doc(bookingsCollection, bookingDoc.id); // Use bookingDoc.id

                        // Create a reference to the slot document using bookingData.slotId
                        const slotDocRef = doc(db, 'slots', bookingData.slotId); // Use bookingData.slotId

                        try {
                            // Get the slot document to update available and booked seats
                            const slotSnapshot = await getDoc(slotDocRef); // Await getDoc here
                            if (slotSnapshot.exists()) {
                                const slotData = slotSnapshot.data();
                                const newAvailableSeats = slotData.availableSeats + 1;
                                const newBookedSeats = slotData.bookedSeats - 1;

                                // Update the slot document
                                await updateDoc(slotDocRef, { // Await updateDoc here
                                    availableSeats: newAvailableSeats,
                                    bookedSeats: newBookedSeats
                                });
                            } else {
                                console.error('Slot document does not exist.');
                            }

                            // Delete the booking document
                            await deleteDoc(bookingDocRef); // Await deleteDoc here
                            console.log('Booking cancelled successfully!');
                        } catch (error) {
                            console.error('Error cancelling booking:', error);
                            alert('Error cancelling booking. Please try again.');
                        }
                        updateBookings(slotId);
                        loader.classList.add('d-none');
                        console.log(`Canceling seat for ${bookingData.userName}`);
                    });

                    // Create Check In button
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
            console.error('No bookings found or querySnapshot is not iterable.');
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
    }

    if (bookingsContainer.innerHTML === '') {
        bookingsContainer.innerHTML += `No Bookings found`;
    }
    loader.classList.add('d-none');
}




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
    });}

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
    updateBookings('slot1');
    await populateSlotsSelectMenu();
    loader.classList.add('d-none');
});