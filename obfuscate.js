document.addEventListener("DOMContentLoaded", function () {
    // Email link generation
    const emailLink = document.getElementById("email-link");
    const emailUser = emailLink.getAttribute("data-user");
    const emailDomain = emailLink.getAttribute("data-domain");
    emailLink.innerHTML = `<a href="mailto:${emailUser}@${emailDomain}">${emailUser}@${emailDomain}</a>`;

    // Phone link generation
    const phoneLink = document.getElementById("phone-link");
    const phoneNumber = phoneLink.getAttribute("data-number");
    const formattedPhone = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    phoneLink.innerHTML = `<a href="tel:${phoneNumber}">${formattedPhone}</a>`;
});
