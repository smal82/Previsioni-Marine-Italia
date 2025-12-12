# 🇮🇹 Previsioni Marine Italia (Open-Meteo)

Una semplice applicazione web responsive creata con HTML, CSS e jQuery per visualizzare le previsioni marine e del vento per le località costiere italiane, utilizzando le API di Open-Meteo.

L'applicazione è stata ottimizzata per:
* Visualizzazione responsiva su tutti i dispositivi.
* Velocità del vento espressa in **Nodi**.
* Dati organizzati in card orarie per le prossime 24 ore.

## 🛠️ Tecnologia Utilizzata

* **Frontend:** HTML5, CSS3 (Flexbox e Media Queries).
* **Logica:** JavaScript / jQuery (per le chiamate AJAX asincrone).
* **Dati API:**
    * [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) (Per trovare Lat/Lon delle città).
    * [Open-Meteo Marine Weather API](https://open-meteo.com/en/docs/marine-api) (Per l'Altezza Onda).
    * [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs) (Per Velocità e Direzione del Vento).

## 🌊 Funzionalità Chiave

L'applicazione utilizza una **doppia chiamata API** (`marine-api` e `api.open-meteo`) per aggirare i conflitti di variabili all'interno della piattaforma Open-Meteo, garantendo dati accurati per vento e onde.

* **Velocità Vento:** Dati forniti direttamente in Nodi (`kn`).
* **Direzione Vento:** Convertita da gradi in punti cardinali (N, NE, E, SE, ecc.).
* **Layout:** Le previsioni orarie sono mostrate in una griglia verticale che si adatta allo schermo.

## 🔗 Demo

Potete utilizzare la pagina anche dal seguente link: https://smal82.github.io/Previsioni-Marine-Italia/

## 🚀 Istruzioni per l'Avvio

Trattandosi di un'applicazione frontend pura, non è richiesta alcuna configurazione di server.

1.  **Clona il repository:**
    ```bash
    git clone https://github.com/smal82/Previsioni-Marine-Italia.git
    cd Previsioni-Marine-Italia
    ```
2.  **Apri nel browser:** Apri il file `index.html` direttamente nel tuo browser.

## 📝 Roadmap Futura

* Implementare la funzione di **Autocomplete** sul campo di ricerca.
* Aggiungere l'indicazione dello stato del mare (es. "Calmo", "Mosso") basato sull'altezza onda.
* Aggiungere il supporto per il fuso orario dinamico.
