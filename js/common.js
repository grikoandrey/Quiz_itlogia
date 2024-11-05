function checkUserData() {
    // передача через адресную строку заменена на session Storage
    // const url = new URL(location.href);
    const name = sessionStorage.getItem("name");
    const lastName = sessionStorage.getItem("lastName");
    const email = sessionStorage.getItem("email");

    if (!name || !lastName || !email) {
        location.href = 'index.html';
    }
}

function checkUserId() {
    // const url = new URL(location.href);
    const testId = sessionStorage.getItem("id");

    if (!testId) {
        location.href = 'index.html';
    }
}