// NON OMETTERE MAI NIENTE (Istruzione utente)
$(document).ready(function() {
    const $cityInput = $('#city-input');
    const $resultsDiv = $('#results');
    
    // Variabili API
    const MARINE_WAVE_VARIABLE = "wave_height";
    const STANDARD_WIND_VARIABLES = "wind_speed_10m,wind_direction_10m";

    /**
     * Converte l'altezza onda (in metri) in uno stato del mare descrittivo.
     * Basato sulla Scala di Douglas.
     */
    function getSeaCondition(waveHeight) {
        if (waveHeight === undefined || waveHeight === null) return 'N/D';

        if (waveHeight < 0.1) {
            return '🌊 Calmo (Piatto)';
        } else if (waveHeight >= 0.1 && waveHeight < 0.5) {
            return '🌊 Quasi Calmo';
        } else if (waveHeight >= 0.5 && waveHeight < 1.25) {
            return '🌊 Poco Mosso';
        } else if (waveHeight >= 1.25 && waveHeight < 2.5) {
            return '🌊 Mosso';
        } else if (waveHeight >= 2.5 && waveHeight < 4.0) {
            return '🌊 Molto Mosso';
        } else if (waveHeight >= 4.0 && waveHeight < 6.0) {
            return '🌊 Agitato';
        } else if (waveHeight >= 6.0 && waveHeight < 9.0) {
            return '🌊 Molto Agitato';
        } else {
            return '🌊 Grosso / Tempestoso';
        }
    }

    /**
     * Funzione principale di ricerca API
     */
    function performSearch() {
        const city = $cityInput.val().trim();
        if (city === "") {
            $resultsDiv.html('<p class="error">Inserisci il nome di una città.</p>');
            return;
        }

        $resultsDiv.html('<p style="text-align: center;">Caricamento dei dati marini e atmosferici...</p>');
        
        // 1. CHIAMATA DI GEOCODING
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=it&country=IT`;

        $.getJSON(geocodingUrl)
            .done(function(geoData) {
                if (geoData.results && geoData.results.length > 0) {
                    const location = geoData.results[0];
                    const lat = location.latitude;
                    const lon = location.longitude;
                    
                    // 2A. CHIAMATA MARINE API (SOLO ONDA)
                    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=${MARINE_WAVE_VARIABLE}&timezone=Europe%2FRome&forecast_days=1`;
                    
                    // 2B. CHIAMATA STANDARD API (SOLO VENTO, IN NODI)
                    const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${STANDARD_WIND_VARIABLES}&wind_speed_unit=kn&timezone=Europe%2FRome&forecast_days=1`;
                    
                    $.when(
                        $.ajax({ url: marineUrl, type: 'GET', dataType: 'json', timeout: 10000 }),
                        $.ajax({ url: windUrl, type: 'GET', dataType: 'json', timeout: 10000 })
                    )
                    .done(function(marineResponse, windResponse) {
                        const marineData = marineResponse[0];
                        const windData = windResponse[0];
                        displayResults(location.name, marineData, windData);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        let errorMessage = `Errore nel recupero dei dati completi.`;
                        if (jqXHR.responseJSON && jqXHR.responseJSON.reason) {
                            errorMessage += ` Motivo: ${jqXHR.responseJSON.reason}`;
                        } else {
                            errorMessage += ` Stato: ${textStatus}, Errore: ${errorThrown}`;
                        }
                        $resultsDiv.html(`<p class="error">${errorMessage}</p>`);
                    });

                } else {
                    $resultsDiv.html('<p class="error">Città italiana costiera non trovata o non riconosciuta.</p>');
                }
            })
            .fail(function() {
                $resultsDiv.html('<p class="error">Errore nel servizio di Geocoding. Controlla la connessione.</p>');
            });
    }

    // --- IMPLEMENTAZIONE RICERCA TRAMITE TASTO INVIO ---
    $cityInput.on('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            performSearch();
        }
    });

    // --- RICERCA TRAMITE CLICK ---
    $('#search-btn').on('click', performSearch);


    /**
     * Converte i gradi in una direzione cardinale (es. 90 -> Est).
     */
    function degToCard(deg) {
        if (deg === undefined || deg === null) return 'N/D';
        const val = Math.floor((deg / 22.5) + 0.5);
        const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
        return arr[(val % 16)];
    }
    
    /**
     * Formatta la stringa dell'orario utilizzando il fuso orario dinamico dell'API.
     * @param {string} timeString - La data/ora ISO fornita dall'API.
     * @param {string} timezone - Il fuso orario fornito dall'API (es. Europe/Rome).
     * @returns {string} L'orario formattato.
     */
    function formatTimeForTimezone(timeString, timezone) {
        if (!timeString || !timezone) {
            return 'N/D';
        }
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('it-IT', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: timezone // Usa il fuso orario dinamico
            });
        } catch (e) {
            return 'N/D';
        }
    }


    /**
     * Visualizza i risultati delle previsioni per le prossime 24 ore.
     */
    function displayResults(cityName, marineData, windData) {
        if (!windData.hourly || !windData.hourly.time || windData.hourly.time.length === 0) {
            $resultsDiv.html(`<p class="error">Nessun dato orario disponibile per ${cityName}.</p>`);
            return;
        }

        // Fuso orario dinamico: usiamo quello fornito dall'API del Vento
        const apiTimezone = windData.timezone; 
        
        let htmlContent = `<h2>Previsioni Marine e Vento per ${cityName}</h2>`;
        
        htmlContent += `<p style="font-size: 0.8em; color: #555; text-align: center; margin-bottom: 20px;">
                        Orari in ${apiTimezone}. Combinazione dati: Onda (Marine API) e Vento (Standard API) in <strong>nodi</strong>.
                       </p>`;

        htmlContent += `<div class="hourly-forecast">`;

        const hoursToShow = Math.min(24, windData.hourly.time.length); 

        for (let i = 0; i < hoursToShow; i++) {
            const time = windData.hourly.time[i];
            
            // Dati VENTO
            const windSpeed = windData.hourly.wind_speed_10m[i] !== undefined ? windData.hourly.wind_speed_10m[i].toFixed(1) : 'N/D';
            const windDirectionDeg = windData.hourly.wind_direction_10m[i];
            const windDirectionCard = degToCard(windDirectionDeg);
            
            // Dati ONDA
            const waveHeight = marineData.hourly && marineData.hourly.wave_height[i] !== undefined ? marineData.hourly.wave_height[i] : null;
            const waveHeightFormatted = waveHeight !== null ? waveHeight.toFixed(1) : 'N/D';
            
            // Nuove Funzionalità
            const seaCondition = getSeaCondition(waveHeight);
            const formattedTime = formatTimeForTimezone(time, apiTimezone); // Ora formattata con Timezone
            
            htmlContent += `
                <div class="forecast-card">
                    <div class="card-time">
                        ${formattedTime}
                    </div>
                    <div class="card-date">
                        ${new Date(time).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    </div>
                    <div class="card-detail">
                        ${seaCondition}
                    </div>
                    <div class="card-detail">
                        Altezza Onda: <strong>${waveHeightFormatted} m</strong>
                    </div>
                    <div class="card-detail">
                        💨 Vento: <strong>${windSpeed} nodi</strong>
                    </div>
                    <div class="card-detail">
                        ➡️ Dir: <strong>${windDirectionCard} (${windDirectionDeg}°)</strong>
                    </div>
                </div>
            `;
        }
        
        htmlContent += `</div>`; // Chiude .hourly-forecast
        $resultsDiv.html(htmlContent);
    }
});