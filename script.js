// Import necessary Firebase modules
import { db, auth,provider} from './firebase.config.js'; 
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"; 
import { onAuthStateChanged, signInWithPopup,signInWithRedirect, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"; 

// Initialize Firestore collections
const slotsCollection = collection(db, 'slots');
const bookingsCollection = collection(db, 'bookings'); 

// const provider = new GoogleAuthProvider();

// Function to load slot data and update the page
async function loadSlotDetails() {
    const loader = document.getElementById('loader');
    const slotDropdown = document.querySelector('.select-white-outline');
    const seatInfo = document.querySelector('.seat-book-control-container p');
    const seatContainer = document.querySelector('.seats-container'); 

    try {
        loader.classList.remove('d-none');
        const slotsSnapshot = await getDocs(slotsCollection);
        slotDropdown.innerHTML = '';

        let firstSlotLoaded = false;
        slotsSnapshot.forEach(doc => {
            const slot = doc.data();
            const option = document.createElement('option');
            option.value = doc.id; 
            option.textContent = slot.time;
            slotDropdown.appendChild(option);

            if (!firstSlotLoaded) {
                seatInfo.textContent = `Seats Available: ${slot.availableSeats} / ${slot.bookedSeats + slot.availableSeats}`;
                updateSeatIcons(slot.availableSeats, slot.bookedSeats + slot.availableSeats);
                firstSlotLoaded = true; 
            }
        });
    } catch (error) {
        console.error('Error loading slots:', error);
    } finally {
        loader.classList.add('d-none');
    }
}

// Function to update seat icons based on available and booked seats
function updateSeatIcons(availableSeats, totalSeats) {
    const seatContainer = document.querySelector('.seats-container'); 
    seatContainer.innerHTML = '';

    for (let index = 0; index < totalSeats; index++) {
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('seat-icon');

        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-couch');

        if (index < availableSeats) {
            iconDiv.classList.add('white'); 
        } else {
            iconDiv.classList.add('gray'); 
        }

        iconDiv.appendChild(icon);
        seatContainer.appendChild(iconDiv);
    }
}

// Function to load details for the selected slot
async function loadSelectedSlotDetails(selectedSlot) {
    const loader = document.getElementById('loader');
    const seatInfo = document.querySelector('.seat-book-control-container p');

    loader.classList.remove('d-none');

    try {
        const slotDoc = doc(db, 'slots', selectedSlot);
        const docSnapshot = await getDoc(slotDoc);

        if (docSnapshot.exists()) {
            const slot = docSnapshot.data();
            seatInfo.textContent = `Seats Available: ${slot.availableSeats} / ${slot.bookedSeats + slot.availableSeats}`;
            updateSeatIcons(slot.availableSeats, slot.bookedSeats + slot.availableSeats);
        }
    } catch (error) {
        console.error('Error fetching selected slot:', error);
    } finally {
        loader.classList.add('d-none');
    }
}

// Function to check user bookings and update booking ticket visibility
async function checkUserBookings(user) {
    const bookSeatButton = document.getElementById('book-seat-button');
    const cancelSeatButton = document.getElementById('cancel-seat-button');
    const bookingTicketDiv = document.getElementById('booking-ticket'); // Ticket div
    const bookieNameElement = document.querySelector('.bookie-name'); // Name element in ticket
    const bookingSlotTiming = document.getElementById('booking-slot');

    if (user) {
        const bookingsSnapshot = await getDocs(bookingsCollection);
        const userBooking = bookingsSnapshot.docs.find(doc => doc.data().userEmail === user.email);

        if (userBooking) {
            const bookingData = userBooking.data();
            bookieNameElement.textContent = user.displayName || "Guest"; // Set user name on ticket

            // Show booking ticket div
            bookingTicketDiv.classList.remove('d-none');

            // Update book seat button to reflect booking
            const slotTimings = {
                slot1: "7:00PM - 8:00PM",
                slot2: "8:00PM - 9:00PM",
                slot3: "9:00PM - 10:00PM",
                slot4: "10:00PM - 11:00PM",
                slot5: "11:00PM - 12:00AM",
                slot6: "12:00AM - 1:00AM",
                slot7: "1:00AM - 2:00AM"
            };
            
            const slotId = bookingData.slotId;
            bookingSlotTiming.textContent = slotTimings[slotId];
            const formattedSlotId = `${slotId.slice(0, -1).toUpperCase()}-${slotId.slice(-1)}`;
            bookSeatButton.textContent = `Booked Slot: ${formattedSlotId}`;            
            bookSeatButton.disabled = true; 
            bookSeatButton.classList.add('btn-success'); 
            bookSeatButton.classList.remove('btn-white'); 
            bookSeatButton.style.display = 'inline-block'; 
            cancelSeatButton.style.display = 'inline-block';
        } else {
            // No booking found
            bookingTicketDiv.classList.add('d-none'); // Hide booking ticket div

            // Reset book seat button
            bookSeatButton.textContent = 'Book Seat'; 
            bookSeatButton.disabled = false; 
            bookSeatButton.classList.remove('btn-success'); 
            bookSeatButton.classList.add('btn-white'); 
            bookSeatButton.style.display = 'inline-block'; 
            cancelSeatButton.style.display = 'none';
        }
    } else {
        // User is not logged in
        bookingTicketDiv.classList.add('d-none'); // Hide booking ticket div
        bookSeatButton.style.display = 'none'; 
        cancelSeatButton.style.display = 'none';
    }
}

// Function to update login indicator
function updateLoginIndicator(user) {
    const loader = document.getElementById('loader');
    const loginIndicator = document.querySelector('.glass-login');
    loginIndicator.innerHTML = '';

    if (user) {
        const iconDiv = document.createElement('div');
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-arrow-right-from-bracket', 'text-white'); 

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
            console.log('Login link clicked. Attempting to sign in...');
            try {
                loader.classList.remove('d-none');
                await signInWithPopup(auth, provider);
                console.log('Successfully signed in');
                loader.classList.add('d-none');
            } catch (error) {
                console.error('Sign-in error:', error);
                alert(`Error: ${error.message}`);
                loader.classList.add('d-none');
            }
        });
        loginIndicator.appendChild(loginLink);
    }
    checkUserBookings(user);
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    updateLoginIndicator(user);
});

// Function to handle booking a seat
async function bookSeat(user, selectedSlotId) {
    const seatInfo = document.querySelector('.seat-book-control-container p');
    const loader = document.getElementById('loader'); 

    try {
        loader.classList.remove('d-none');
        const slotDoc = doc(db, 'slots', selectedSlotId);
        const slotSnapshot = await getDoc(slotDoc);

        if (slotSnapshot.exists()) {
            const slot = slotSnapshot.data();

            if (slot.availableSeats > 0) {
                const newAvailableSeats = slot.availableSeats - 1;
                const newBookedSeats = slot.bookedSeats + 1;

                await updateDoc(slotDoc, {
                    availableSeats: newAvailableSeats,
                    bookedSeats: newBookedSeats
                });

                const bookingData = {
                    userEmail: user.email,
                    userName: user.displayName,
                    slotId: selectedSlotId,
                    slotTiming: slot.time, 
                    timestamp: new Date()
                };

                await addDoc(bookingsCollection, bookingData);
                seatInfo.textContent = `Seats Available: ${newAvailableSeats} / ${newBookedSeats}`;
                updateSeatIcons(newAvailableSeats, newBookedSeats); 
                console.log('Booking successful!'); 
            } else {
                console.log('No seats available for this slot.');
            }
        } else {
            console.error('Selected slot does not exist.');
        }
    } catch (error) {
        console.error('Error booking seat:', error);
    } finally {
        loader.classList.add('d-none');
        location.reload();
    }
}

// Function to cancel the booking
async function cancelBooking(user) {
    const bookingsSnapshot = await getDocs(bookingsCollection);
    const userBooking = bookingsSnapshot.docs.find(doc => doc.data().userEmail === user.email);

    if (userBooking) {
        const bookingDocRef = doc(bookingsCollection, userBooking.id);
        const slotDoc = doc(db, 'slots', userBooking.data().slotId);

        try {
            const slotSnapshot = await getDoc(slotDoc);
            if (slotSnapshot.exists()) {
                const slotData = slotSnapshot.data();
                const newAvailableSeats = slotData.availableSeats + 1;
                const newBookedSeats = slotData.bookedSeats - 1;

                await updateDoc(slotDoc, {
                    availableSeats: newAvailableSeats,
                    bookedSeats: newBookedSeats
                });
            }

            await deleteDoc(bookingDocRef);
            console.log('Booking cancelled successfully!');
            checkUserBookings(user); 
        } catch (error) {
            console.error('Error cancelling booking:', error);
            console.log('Error cancelling booking. Please try again.');
        }
    } else {
        console.log('No booking found to cancel.');
    }
}

// Event listener for the Cancel Seat button
document.getElementById('cancel-seat-button').addEventListener('click', async () => {
    const loader = document.getElementById('loader'); 
    loader.classList.remove('d-none');
    const user = auth.currentUser;
    if (user) {
        await cancelBooking(user);
        location.reload();
    }
    loader.classList.add('d-none');
});

// Event listener for the Book Seat button
document.getElementById('book-seat-button').addEventListener('click', async () => {
    const user = auth.currentUser;
    const selectedSlotId = document.querySelector('.select-white-outline').value; 
    if (user) {
        await bookSeat(user, selectedSlotId);
    }
});

// Event listener for the View Seats button
document.getElementById('view-seats-button').addEventListener('click', () => {
    const selectedSlot = document.querySelector('.select-white-outline').value; 
    loadSelectedSlotDetails(selectedSlot);
});

// Load slots and update initial view on page load
window.addEventListener('load', () => {
    loadSlotDetails();
});
