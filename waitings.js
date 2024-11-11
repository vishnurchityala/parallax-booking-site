// Import necessary Firebase modules
import { db, auth,provider} from './firebase.config.js';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Initialize Firestore collections
const slotsCollection = collection(db, 'slots');
const bookingsCollection = collection(db, 'bookings');
const checkInCollection = collection(db, 'checkins');
const allowedEmails = ["e23cseu0049@bennett.edu.in","e23cseu0032@bennett.edu.in","e23cseu0055@bennett.edu.in","e23cseu1951@bennett.edu.in","e23cseu0068@bennett.edu.in","e23cseu1989@bennett.edu.in","e23cseu2246@bennett.edu.in","e23cseu0051@bennett.edu.in","e23cseu2192@bennett.edu.in"];
const loader = document.getElementById('loader');
const slotSelectionMenu = document.getElementById('slots-select-menu');
const bookingsContainer = document.getElementById('bookings-container');



// Update bookings on slot selection change
slotSelectionMenu.addEventListener('change', (event) => {
    const selectedOption = event.target.value;
    updateBookings(selectedOption);
});

async function updateBookingCheckInButton(elementId,bookingId) {

    const bookingCard = document.getElementById(elementId);
    const checkInSnapShot = await getDocs(checkInCollection);
    let isCheckedIn = false;
    let checkinRef;
    
    checkInSnapShot.forEach((doc) => {
        const data = doc.data();
        if (data.bookingId === bookingId) {
            isCheckedIn = true;
            checkinRef = doc.ref;
            }
        });
        if (!isCheckedIn) {
            const checkInButton = document.getElementById(elementId+'chck');
            checkInButton.className = 'btn-success mt-3 ms-3';
            checkInButton.style.fontSize = 'x-small';
            checkInButton.textContent = 'Check In';

        } else {
            const checkInButton = document.getElementById(elementId+'chck');
            checkInButton.className = 'btn-warning mt-3 ms-3';
            checkInButton.style.fontSize = 'x-small';
            checkInButton.textContent = 'Check Out';

        }
    
}

async function updateBookings(slotId) {
    loader.classList.remove('d-none');
    bookingsContainer.innerHTML = '';

    try {
        const querySnapshot = await getDocs(waitingsCollection);
        
        if (!querySnapshot.empty) {
            for (const bookingDoc of querySnapshot.docs) {
                const bookingData = bookingDoc.data();
                
                if (bookingData.slotId === slotId) {
                    const bookingCard = document.createElement('div');
                    bookingCard.id = bookingData.userEmail;
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
                        document.getElementById(bookingData.userEmail).remove();
                        loader.classList.add('d-none');
                        console.log(`Canceling seat for ${bookingData.userName}`);
                    });

                    const checkInButton = document.createElement('button');
                    let isCheckedIn = false;
                    let checkinRef;
                    checkInButton.id = bookingData.userEmail + 'chck';

                    const checkInSnapShot = await getDocs(checkInCollection);
                    checkInSnapShot.forEach((doc) => {
                        const data = doc.data();
                        if (data.bookingId === bookingDoc.id) {
                            isCheckedIn = true;
                            checkinRef = doc.ref;
                        }
                    });

                    if (!isCheckedIn) {
                        checkInButton.className = 'btn-success mt-3 ms-3';
                        checkInButton.style.fontSize = 'x-small';
                        checkInButton.textContent = 'Check In';
                        checkInButton.addEventListener('click', async () => {
                            loader.classList.remove('d-none');
                            console.log(`Checking in ${bookingData.userName}`);
                            try {
                                const docRef = await addDoc(checkInCollection, {
                                    bookingId: bookingDoc.id
                                });
                                console.log("Document added with ID: ", docRef.id);
                                updateBookingCheckInButton(bookingData.userEmail,bookingDoc.id);
                            } catch (error) {
                                console.error("Error adding document: ", error);
                            }
                            loader.classList.add('d-none');
                        });
                    } else {
                        checkInButton.className = 'btn-warning mt-3 ms-3';
                        checkInButton.style.fontSize = 'x-small';
                        checkInButton.textContent = 'Check Out';
                        checkInButton.addEventListener('click', async () => {
                            loader.classList.remove('d-none');
                            console.log(`Checking out ${bookingData.userName}`);
                            try {
                                await deleteDoc(checkinRef);
                                console.log("Check-out successful");
                                // updateBookingCheckInButton(bookingData.userEmail,bookingDoc.id);

                            } catch (error) {
                                console.error("Error deleting document:", error);
                            }
                            loader.classList.add('d-none');
                        });
                    }

                    bookingCard.appendChild(cancelButton);
                    bookingCard.appendChild(checkInButton);
                    bookingsContainer.appendChild(bookingCard);
                }
            }
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
            await populateSlotsSelectMenu();
            await updateBookings();
        }   
    });
    loader.classList.add('d-none');
});
