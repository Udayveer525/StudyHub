document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("FTrmCneOkzuYSh0Km"); // Replace with your EmailJS user ID

    document.getElementById("contact-form").addEventListener("submit", function (event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;
        const formStatus = document.getElementById("form-status");

        // Prepare email parameters
        const templateParams = {
            user_name: name,
            user_email: email,
            user_message: message
        };

        // Send email
        emailjs.send("service_oxcw582", "template_iwherno", templateParams)
            .then(response => {
                formStatus.style.color = "green";
                formStatus.textContent = "Message sent successfully! ✅";
                console.log("Email sent:", response);
                document.getElementById("contact-form").reset();
            })
            .catch(error => {
                formStatus.style.color = "red";
                formStatus.textContent = "Failed to send message. ❌";
                console.error("Email error:", error);
            });
    });
});
