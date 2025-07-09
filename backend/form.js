document.getElementById('add-user-form').addEventListener('submit', async function (e) {
    const form = e.target
    const name = e.name.value
    const email = e.email.value

    const response = await fetch('http://localhost:5000/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
    })

    const result = await response.json();
    if (result.redirectUrl) {
    window.location.href = result.redirectUrl;
    } else {
    alert('Something went wrong.');
    }
})