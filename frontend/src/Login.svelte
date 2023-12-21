<script>
    import axios from 'axios';

    let password = '';
    let email = '';

    async function loginUser() {
        // Überprüfen, ob alle Felder ausgefüllt sind

        // Einfache E-Mail-Validierung
        if (!email.includes('@') || !email.match(/\.[a-z]+$/)) {
            alert('Bitte geben Sie eine gültige E-Mail-Adresse ein');
            return;
        }

        // Überprüfen der Passwortlänge
        if (password.length < 2) {
            alert('Das Passwort muss mindestens 2 Zeichen lang sein');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/login', {
                email,
                password,
            });
            console.log('Registrierung erfolgreich:', response);
            // Hier können Sie weitere Aktionen nach erfolgreicher Registrierung hinzufügen

            window.location.href = '#/Home';
        } catch (error) {
            console.error('Fehler bei der Registrierung:', error);
            // Behandeln von Fehlern, z.B. Benutzer existiert bereits
        }
    }
</script>

<form on:submit|preventDefault={loginUser}>

    <div>
        <label for="E-mail">E-mail:</label>
        <input id="E-mail" type="E-mail" bind:value={email} />
    </div>
    <div>
        <label for="password">Passwort:</label>
        <input id="password" type="password" bind:value={password} />
    </div>
    
    <button type="submit">Login</button>
</form>