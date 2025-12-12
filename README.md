# 🌊 Previsioni Marine Italia 🌐 (Open-Meteo)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white)
![API](https://img.shields.io/badge/API-OpenMeteo-blue?style=for-the-badge)

Una semplice applicazione web responsive creata con HTML, CSS e jQuery per visualizzare le previsioni marine e del vento per le località costiere italiane, utilizzando le API di Open-Meteo.

L'applicazione è stata ottimizzata per:
* **Visualizzazione responsiva** su tutti i dispositivi.
* Velocità del vento espressa in **Nodi**.
* Dati organizzati in card orarie per le prossime 24 ore.

## 🌊 Funzionalità Chiave

L'applicazione utilizza una **doppia chiamata API** (`marine-api` e `api.open-meteo`) per aggirare i conflitti di variabili all'interno della piattaforma Open-Meteo, garantendo dati accurati per vento e onde.

* **Stato del Mare:** L'altezza onda è classificata con una descrizione testuale (es. "Poco Mosso", "Agitato") basata su una scala di riferimento.
* **Fuso Orario Dinamico:** Gli orari delle previsioni sono visualizzati in base al fuso orario specifico della località ricercata (es. `Europe/Rome`), utilizzando le impostazioni locali del browser.
* **Velocità Vento:** Dati forniti direttamente in Nodi (`kn`).
* **Direzione Vento:** Convertita da gradi in punti cardinali (N, NE, E, SE, ecc.).
* **Layout:** Le previsioni orarie sono mostrate in una griglia verticale che si adatta allo schermo.
* **Ricerca Rapida:** È possibile avviare la ricerca sia cliccando il pulsante che premendo il tasto **Invio** nel campo di testo.

## 🛠️ Tecnologia Utilizzata

* **Frontend:** HTML5, CSS3 (Flexbox e Media Queries).
* **Logica:** JavaScript / jQuery (per le chiamate AJAX asincrone).
* **Dati API:**
    * [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) (Per trovare Lat/Lon delle città).
    * [Open-Meteo Marine Weather API](https://open-meteo.com/en/docs/marine-api) (Per l'Altezza Onda).
    * [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs) (Per Velocità e Direzione del Vento).

## 🔗 Demo

Potete utilizzare la pagina anche dal seguente link (GitHub Pages):
https://smal82.github.io/Previsioni-Marine-Italia/

## 🚀 Istruzioni per l'Avvio

Trattandosi di un'applicazione frontend pura, non è richiesta alcuna configurazione di server.

1.  **Clona il repository:**
    ```bash
    git clone https://github.com/smal82/Previsioni-Marine-Italia
    cd Previsioni-Marine-Italia
    ```
2.  **Apri nel browser:** Apri il file `index.html` direttamente nel tuo browser.
