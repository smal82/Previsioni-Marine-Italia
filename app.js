// NON OMETTERE MAI NIENTE (Istruzione utente)
$(document).ready(function() {
    const $cityInput = $('#city-input');
    const $resultsDiv = $('#results');
    
    // Variabili per la Marine API (solo onda)
    const MARINE_WAVE_VARIABLE = "wave_height";
    // Variabili per l'API Standard (vento, con unità in nodi)
    const STANDARD_WIND_VARIABLES = "wind_speed_10m,wind_direction_10m";

    $('#search-btn').on('click', function() {
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
                    
                    // 2A. CHIAMATA MARINE API (SOLO ONDA - EVITA CONFLITTI)
                    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=${MARINE_WAVE_VARIABLE}&timezone=Europe%2FRome&forecast_days=1`;
                    
                    // 2B. CHIAMATA STANDARD API (SOLO VENTO, IN NODI - EVITA CONFLITTI)
                    // Usiamo wind_speed_unit=kn per avere direttamente i nodi
                    const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${STANDARD_WIND_VARIABLES}&wind_speed_unit=kn&timezone=Europe%2FRome&forecast_days=1`;
                    
                    // Esegui entrambe le richieste in parallelo usando $.when()
                    $.when(
                        $.ajax({ url: marineUrl, type: 'GET', dataType: 'json', timeout: 10000 }),
                        $.ajax({ url: windUrl, type: 'GET', dataType: 'json', timeout: 10000 })
                    )
                    .done(function(marineResponse, windResponse) {
                        // I dati sono nel primo elemento dell'array di risposta [0]
                        const marineData = marineResponse[0];
                        const windData = windResponse[0];
                        
                        displayResults(location.name, marineData, windData);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        let errorMessage = `Errore nel recupero dei dati completi.`;
                        // Se una delle due fallisce, mostra un messaggio composito
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
    });

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
     * Visualizza i risultati delle previsioni per le prossime 24 ore.
     */
    function displayResults(cityName, marineData, windData) {
        // La serie temporale deve essere basata sui dati del vento
        if (!windData.hourly || !windData.hourly.time || windData.hourly.time.length === 0) {
            $resultsDiv.html(`<p class="error">Nessun dato orario disponibile per ${cityName}.</p>`);
            return;
        }

        let htmlContent = `<h2>Previsioni Marine e Vento per ${cityName} (Prossime 24 ore)</h2>`;
        
        htmlContent += `<p style="font-size: 0.8em; color: #555; text-align: center; margin-bottom: 20px;">
                        Combinazione di dati: Onda (Marine API) e Vento (Standard API) in <strong>nodi</strong>.
                       </p>`;

        htmlContent += `<div class="hourly-forecast">`;

        // Iteriamo sui dati del vento, che definiscono la serie temporale
        const hoursToShow = Math.min(24, windData.hourly.time.length); 

        for (let i = 0; i < hoursToShow; i++) {
            const time = windData.hourly.time[i];
            
            // Dati VENTO (da windData): Sono già in nodi
            const windSpeed = windData.hourly.wind_speed_10m[i] !== undefined ? windData.hourly.wind_speed_10m[i].toFixed(1) : 'N/D';
            const windDirectionDeg = windData.hourly.wind_direction_10m[i];
            const windDirectionCard = degToCard(windDirectionDeg);
            
            // Dati ONDA (da marineData)
            const waveHeight = marineData.hourly && marineData.hourly.wave_height[i] !== undefined ? marineData.hourly.wave_height[i].toFixed(1) : 'N/D';
            
            // Genero una card o un blocco per ogni ora (CON LAYOUT CORRETTO)
            htmlContent += `
                <div class="forecast-card">
                    <div class="card-time">
                        ${new Date(time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div class="card-date">
                        ${new Date(time).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    </div>
                    <div class="card-detail">
                        🌊 Onda: <strong>${waveHeight} m</strong>
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