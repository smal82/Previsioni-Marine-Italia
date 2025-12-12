// NON OMETTERE MAI NIENTE (Istruzione utente)
$(document).ready(function() {
    const $cityInput = $('#city-input');
    const $resultsDiv = $('#results');
    
    const MARINE_WAVE_VARIABLE = "wave_height";
    const STANDARD_WIND_VARIABLES = "wind_speed_10m,wind_direction_10m";

    // --- CONFIGURAZIONE FILTRI ---
    const MAX_DISTANZA_MARE = 45; // km (tolleranza per griglia API Marine)
    const MAX_ALTITUDINE = 100;   // metri (limite per considerare una città "costiera")

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

    // --- LOGICA DI RECUPERO DATI ---
    function fetchWeather(cityName, cityLat, cityLon, cityElev, isFallback = false) {
        $resultsDiv.html('<p style="text-align: center;">Analisi marina in corso...</p>');
        
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${cityLat}&longitude=${cityLon}&hourly=${MARINE_WAVE_VARIABLE}&timezone=Europe%2FRome&forecast_days=1`;
        const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${cityLat}&longitude=${cityLon}&hourly=${STANDARD_WIND_VARIABLES}&wind_speed_unit=kn&timezone=Europe%2FRome&forecast_days=1`;
        
        $.when(
            $.ajax({ url: marineUrl, type: 'GET', dataType: 'json' }),
            $.ajax({ url: windUrl, type: 'GET', dataType: 'json' })
        )
        .done(function(marineResponse, windResponse) {
            const marineData = marineResponse[0];
            const windData = windResponse[0];
            const distance = getDistance(cityLat, cityLon, marineData.latitude, marineData.longitude);

            // --- CONTROLLO FILTRI ---
            if (distance > MAX_DISTANZA_MARE || cityElev > MAX_ALTITUDINE) {
                // Se fallisce e non siamo già in un tentativo fallback, proviamo con "[Città] Marina"
                if (!isFallback) {
                    console.log(`Punto principale [${cityName}] scartato. Provo fallback Marina...`);
                    tryMarinaFallback(cityName);
                } else {
                    $resultsDiv.html(`<p class="error">ERRORE: ${cityName} non è una zona costiera valida (Mare a ${distance.toFixed(1)}km, Altitudine ${cityElev}m).</p>`);
                }
                return;
            }

            displayResults(cityName, marineData, windData, distance, cityElev);
        })
        .fail(function() {
            $resultsDiv.html('<p class="error">Errore API. Riprova.</p>');
        });
    }

    // --- IL TRUCCO: Fallback automatico per Alcamo -> Alcamo Marina ---
    function tryMarinaFallback(originalCity) {
        const fallbackName = originalCity + " Marina";
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${fallbackName}&count=1&language=it&country=IT`;
        
        $.getJSON(geocodingUrl).done(function(data) {
            if (data.results && data.results.length > 0) {
                const loc = data.results[0];
                fetchWeather(loc.name, loc.latitude, loc.longitude, loc.elevation, true);
            } else {
                $resultsDiv.html(`<p class="error">ERRORE: ${originalCity} è nell'entroterra e non è stata trovata una località "Marina" associata.</p>`);
            }
        });
    }

    function performSearch() {
        const city = $cityInput.val().trim();
        if (city === "") return;

        $resultsDiv.html('<p style="text-align: center;">Ricerca in corso...</p>');
        $resultsDiv.show();
        
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=it&country=IT`;
        
        $.getJSON(geocodingUrl).done(function(geoData) {
            if (geoData.results && geoData.results.length > 0) {
                const loc = geoData.results[0];
                fetchWeather(loc.name, loc.latitude, loc.longitude, loc.elevation);
            } else {
                $resultsDiv.html('<p class="error">Località non trovata.</p>');
            }
        });
    }

    $cityInput.on('keydown', function(e) { if (e.key === 'Enter') performSearch(); });
    $('#search-btn').on('click', performSearch);

    function displayResults(cityName, marineData, windData, distance, elevation) {
        const apiTimezone = windData.timezone; 
        let htmlContent = `<h2>Meteo: ${cityName}</h2>`;        
        

        htmlContent += `<div class="hourly-forecast">`;
        for (let i = 0; i < 24; i++) {
            const time = windData.hourly.time[i];
            const wave = marineData.hourly.wave_height[i];
            htmlContent += `
                <div class="forecast-card">
                    <div class="card-time">${formatTimeForTimezone(time, apiTimezone)}</div>
                    <div class="card-detail">${getSeaCondition(wave)}</div>
                    <div class="card-detail">Onda: <strong>${wave.toFixed(1)} m</strong></div>
                    <div class="card-detail">💨 Vento: <strong>${windData.hourly.wind_speed_10m[i].toFixed(1)} kn</strong></div>
                </div>`;
        }
        $resultsDiv.html(htmlContent + `</div>`);
    }
});