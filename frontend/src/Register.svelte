<script>
    import axios from 'axios';

    let username = '';
    let password = '';

    async function registerUser() {
        try {
            const response = await axios.post('http://localhost:3001/register', {
                username,
                password
            });
            console.log('Registrierung erfolgreich:', response);
            // Hier können Sie weitere Aktionen nach erfolgreicher Registrierung hinzufügen
        } catch (error) {
            console.error('Fehler bei der Registrierung:', error);
            // Behandeln von Fehlern, z.B. Benutzer existiert bereits
        }
    }
</script>

<form on:submit|preventDefault={registerUser}>
    <div>
        <label for="username">Benutzername:</label>
        <input id="username" type="text" bind:value={username} />
    </div>
    <div>
        <label for="password">Passwort:</label>
        <input id="password" type="password" bind:value={password} />
    </div>
    <button type="submit">Registrieren</button>
</form>