import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [nfcToken, setNfcToken] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    async function fetchUserData() {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        const res = await fetch('/api/auth/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            setUser(data.user);
        } else {
            console.error(data.message);
        }
    }

    // 1) Call the server to create an NFC token
    // 2) Then write that token to the NFC tag via Web NFC
    async function handleNfcWrite() {
        try {
            const webToken = localStorage.getItem('userToken');
            if (!webToken) return alert('No user token found. Please log in.');

            // 1) Ask the server for the special NFC token
            const res = await fetch('/api/nfc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: webToken })
            });
            const data = await res.json();
            if (!res.ok) {
                return alert(data.message || 'Error generating NFC token');
            }
            const tokenToWrite = data.nfcToken;
            setNfcToken(tokenToWrite);

            // 2) Write the token to NFC
            if ('NDEFReader' in window) {
                const ndef = new NDEFReader();
                await ndef.scan();
                await ndef.write(tokenToWrite);
                alert('NFC token written successfully!');
            } else {
                alert('Web NFC is not supported on this browser/device.');
            }
        } catch (error) {
            console.error(error);
            alert('Error writing to NFC: ' + error);
        }
    }

    return (
        <div>
            <h2>Dashboard</h2>
            {user ? (
                <>
                    <p>User: {user.email}</p>
                    <h3>Sensor Data</h3>
                    <p>Soil Moisture: {user.sensorData?.soilMoisture}</p>
                    <p>Water Sensor: {user.sensorData?.waterSensor}</p>
                    <p>Light Sensor: {user.sensorData?.lightSensor}</p>
                    <p>Camera Images: {user.sensorData?.cameraImages?.join(', ')}</p>

                    <button onClick={handleNfcWrite}>Write NFC Tag</button>
                    {nfcToken && <p>Most recent NFC token: {nfcToken}</p>}
                </>
            ) : (
                <p>Please log in.</p>
            )}
        </div>
    );
}
