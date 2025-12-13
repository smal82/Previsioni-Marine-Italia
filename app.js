// NON OMETTERE MAI NIENTE (Istruzione utente)
$(document).ready(function() {
    const $cityInput = $('#city-input');
    const $resultsDiv = $('#results');
    
    const MARINE_WAVE_VARIABLE = "wave_height";
    const STANDARD_WIND_VARIABLES = "wind_speed_10m,wind_direction_10m";

    // --- FILTRI INTERNI (Invisibili all'utente) ---
    const MAX_DISTANZA_MARE = 45; 
    const MAX_ALTITUDINE = 100;   
    const COUNTRY_CODE = "IT"; // Codice paese (Italia)

    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
    }

    function getSeaCondition(waveHeight) {
        if (waveHeight === undefined || waveHeight === null) return 'N/D';
        if (waveHeight < 0.1) return '🌊 Calmo';
        if (waveHeight < 0.5) return '🌊 Quasi Calmo';
        if (waveHeight < 1.25) return '🌊 Poco Mosso';
        if (waveHeight < 2.5) return '🌊 Mosso';
        if (waveHeight < 4.0) return '🌊 Molto Mosso';
        return '🌊 Agitato/Tempestoso';
    }

    function formatTimeForTimezone(timeString, timezone) {
        if (!timeString || !timezone) return 'N/D';
        try {
            return new Date(timeString).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: timezone });
        } catch (e) { return 'N/D'; }
    }
    
    function degToCard(deg) {
        if (deg === undefined || deg === null) return 'N/D';
        const val = Math.floor((deg / 22.5) + 0.5);
        const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
        return arr[(val % 16)];
    }

    // --- LOGICA DI VALIDAZIONE E RECUPERO ---
    async function validateAndFetch(location) {
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${location.latitude}&longitude=${location.longitude}&hourly=${MARINE_WAVE_VARIABLE}&timezone=Europe%2FRome&forecast_days=1`;
        const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=${STANDARD_WIND_VARIABLES}&wind_speed_unit=kn&timezone=Europe%2FRome&forecast_days=1`;
        
        try {
            const [marineRes, windRes] = await Promise.all([
                $.ajax({ url: marineUrl, type: 'GET', dataType: 'json' }),
                $.ajax({ url: windUrl, type: 'GET', dataType: 'json' })
            ]);

            const distance = getDistance(location.latitude, location.longitude, marineRes.latitude, marineRes.longitude);

            // Validazione silenziosa su Distanza Mare e Altitudine
            if (distance <= MAX_DISTANZA_MARE && location.elevation <= MAX_ALTITUDINE) {
                const fullLocationName = `${location.name}${location.admin1 ? ', ' + location.admin1 : ''}`;
                displayResults(fullLocationName, marineRes, windRes);
                return true; 
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    async function tryMarinaFallback(originalName) {
        const fallbackName = originalName + " Marina";
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${fallbackName}&count=1&language=it&country=${COUNTRY_CODE}`;
        
        try {
            const data = await $.getJSON(geocodingUrl);
            if (data.results && data.results.length > 0) {
                const loc = data.results[0];
                if (loc.country_code === COUNTRY_CODE) {
                     return await validateAndFetch(loc);
                }
            }
        } catch (e) {}
        return false;
    }

    async function performSearch() {
        const city = $cityInput.val().trim();
        if (city === "") return;

        $resultsDiv.html('<p style="text-align: center;">Ricerca in corso...</p>');
        $resultsDiv.show();
        
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=it`;
        
        try {
            const geoData = await $.getJSON(geocodingUrl);
            
            if (geoData.results && geoData.results.length > 0) {
                
                // Dividiamo i risultati in italiani e non italiani
                const italianResults = geoData.results.filter(loc => loc.country_code === COUNTRY_CODE);
                const foreignResults = geoData.results.filter(loc => loc.country_code !== COUNTRY_CODE);

                let found = false;
                
                if (italianResults.length > 0) {
                    // 1. Scansione dei risultati italiani (inclusa la risoluzione ambiguità)
                    for (const loc of italianResults) {
                        found = await validateAndFetch(loc);
                        if (found) break; 
                    }
                }

                // 2. Se non si è trovato nulla, prova il fallback "Marina" in Italia
                if (!found) {
                    found = await tryMarinaFallback(city);
                }
                
                // 3. Gestione degli errori finali
                if (!found) {
                    if (foreignResults.length > 0 && italianResults.length === 0) {
                        // Se sono stati trovati solo risultati esteri (es. Barcellona)
                        $resultsDiv.html(`<p class="error">ERRORE: La località "${city}" si riferisce a una città estera. Attualmente sono supportate solo le previsioni marine per l'Italia.</p>`);
                    } else {
                        // Se non è costiera (es. Partinico/Milano)
                        $resultsDiv.html(`<p class="error">Previsioni marine non disponibili per "${city}". Seleziona una località sulla costa.</p>`);
                    }
                }
                
            } else {
                $resultsDiv.html('<p class="error">Località non trovata.</p>');
            }
        } catch (e) {
            $resultsDiv.html('<p class="error">Errore di connessione.</p>');
        }
    }

    $cityInput.on('keydown', function(e) { if (e.key === 'Enter') performSearch(); });
    $('#search-btn').on('click', performSearch);

    function displayResults(cityName, marineData, windData) {
        const apiTimezone = windData.timezone; 
        let htmlContent = `<h2 style="margin-bottom: 20px;">Meteo Marino: ${cityName}</h2>`;

        htmlContent += `<div class="hourly-forecast">`;
        for (let i = 0; i < 24; i++) {
            const time = windData.hourly.time[i];
            const wave = marineData.hourly.wave_height[i];
            const windSpeed = windData.hourly.wind_speed_10m[i];
            const windDir = windData.hourly.wind_direction_10m[i];
            
            htmlContent += `
                <div class="forecast-card">
                    <div class="card-time">${formatTimeForTimezone(time, apiTimezone)}</div>
                    <div class="card-detail">${getSeaCondition(wave)}</div>
                    <div class="card-detail">Onda: <strong>${wave.toFixed(1)} m</strong></div>
                    <div class="card-detail">💨 Vento: <strong>${windSpeed.toFixed(1)} kn</strong> (${degToCard(windDir)})</div>
                </div>`;
        }
        $resultsDiv.html(htmlContent + `</div>`);
    }
});