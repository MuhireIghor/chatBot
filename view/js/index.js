const videoElement = document.getElementById('preview');
const popupElement = document.getElementById('popup');

// QR code scanner configuration
const scanner = new Instascan.Scanner({ video: videoElement });
scanner.addListener('scan', function (content) {
    console.log(content);

    // Send QR code data to server
    fetch('/qr-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: content }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                console.log(`Data received successfully ${data.message}`)
            }
        }
        ).catch((err) => {
            console.log(err)
        })
})
