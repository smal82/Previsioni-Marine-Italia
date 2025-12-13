# 🌊 Previsioni Marine Italia 🌐 (Open-Meteo)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white)
![API](https://img-shields.io/badge/API-OpenMeteo-blue?style=for-the-badge)

Una semplice applicazione web responsive creata con HTML, CSS e jQuery per visualizzare le previsioni marine e del vento per le località costiere italiane, utilizzando le API di Open-Meteo.

L'applicazione è stata ottimizzata per:
* **Visualizzazione responsiva** su tutti i dispositivi.
* Velocità del vento espressa in **Nodi**.
* Dati organizzati in card orarie per le prossime 24 ore.

## 🛡️ Logiche di Filtraggio Geografico Avanzate

Per garantire la massima accuratezza ed escludere città dell'entroterra (es. Milano, Partinico) o omonimie estere (es. Barcellona Spagna), l'applicazione implementa una logica di filtraggio a più livelli basata su dati geografici e amministrativi:

### 1. Filtro di Nazionalità (Italia)
Il sistema verifica esplicitamente che ogni risultato di ricerca appartenga all'Italia (`country_code: IT`). Se un nome corrisponde a una città estera (es. cercando "Barcellona" l'API trova Barcellona Spagna), il risultato viene scartato, e viene mostrato un messaggio di errore specifico se non vengono trovate alternative italiane.

### 2. Filtro di Altitudine e Distanza (Costo/Entroterra)
Per determinare se una località è costiera (e non solo vicina al mare), il sistema esegue una doppia validazione con soglie interne:

* **Altitudine:** La località deve avere un'altitudine inferiore a **100 metri**. Questo blocca efficacemente città interne che potrebbero essere vicine al mare ma non sono sulla costa (es. Partinico, che è a circa 175 metri).
* **Distanza dal Mare:** Il punto di campionamento più vicino dell'API Marine deve essere entro **45 km**. Questo serve a includere grandi città costiere il cui punto di rilevamento marino è molto al largo (es. Napoli).

### 3. Gestione di Ambiguità e Località Balneari (Fallback)

L'applicazione affronta due problemi comuni di omonimia e localizzazione:

* **Risoluzione di Omonimie (Castellammare):** Se la ricerca restituisce più località con lo stesso nome (es. "Castellammare di Stabia" e "Castellammare del Golfo"), il sistema scansiona i primi 10 risultati di Geocoding e sceglie automaticamente la prima località che supera i filtri di Altitudine e Distanza. Il nome completo della città (es. "Castellammare di Stabia, Campania") viene visualizzato per evitare confusione.
* **Correzione Automatica "Marina" (Alcamo):** Se la città cercata è nell'entroterra e viene bloccata dal filtro Altitudine (es. "Alcamo"), l'applicazione tenta automaticamente una seconda ricerca con il suffisso **"[Nome Città] Marina"** (es. "Alcamo Marina"). Se la località "Marina" esiste e supera i filtri, i dati vengono restituiti.

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
* **Logica:** JavaScript / jQuery (per le chiamate AJAX asincrone e i filtri geografici).
* **Dati API:**
    * [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) (Per trovare Lat/Lon, Altitudine, Nome Completo e Codice Paese).
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
