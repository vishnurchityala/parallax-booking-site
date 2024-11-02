function sendEmail() {
    Email.send({
        Host: "smtp.gmail.com",
        Username: "sender@email_address.com",
        Password: "Enter your password",
        To: 'receiver@email_address.com',
        From: "sender@email_address.com",
        Subject: "Sending Email using JavaScript",
        Body: "Well, that was easy!!",
    })
    .catch(
        error => console.error("Failed to send email:", error)
    );
}
