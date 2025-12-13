# 🌊 Previsioni Marine Italia 🌐 (Open-Meteo)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white)
![API](https://img.shields.io/badge/API-OpenMeteo-blue?style=for-the-badge)

Una semplice applicazione web responsive creata con HTML, CSS e jQuery per visualizzare le previsioni marine e del vento **esclusivamente** per le località costiere italiane, utilizzando le API di Open-Meteo.

L'applicazione è stata ottimizzata per:
* **Visualizzazione responsiva** su tutti i dispositivi.
* Velocità del vento espressa in **Nodi**.
* Dati organizzati in card orarie per le prossime 24 ore.

## 🧠 Algoritmo di Validazione Geografica (Italia Costiera)

Per garantire che i dati siano pertinenti e disponibili, l'applicazione non si limita a cercare la città, ma esegue un sofisticato algoritmo di validazione in più fasi. Questo assicura che vengano considerate solo le località che soddisfano rigorosi criteri di **nazionalità** e **costierità**.

### Fasi dell'Algoritmo:

#### 1. Filtro di Nazionalità (Check Esplicito)
Il sistema interroga l'API di Geocoding per recuperare 10 risultati. Esegue immediatamente un controllo per escludere qualsiasi località con un codice paese diverso da `IT`.
* **Gestione Errore Estero:** Se non viene trovato alcun risultato italiano, viene restituito un messaggio di errore specifico (`Località estera non supportata`).

#### 2. Validazione Costiera (Doppia Metrica)
Per i risultati italiani, l'algoritmo applica due filtri geografici in sequenza per distinguere la costa dall'entroterra:
* **Controllo Altitudine:** La città deve avere un'altitudine inferiore a **100 metri** (blocca Partinico, Milano).
* **Controllo Distanza Mare:** Il punto di campionamento dell'API Marine deve essere entro **45 km** dal centro della città (assicura che la località sia sufficientemente vicina per dati utili).

#### 3. Risoluzione di Ambiguità e Fallback Intelligente
L'algoritmo risolve automaticamente le incertezze del nome:
* **Omonimie:** Scansionando i primi risultati Geocoding validi, l'algoritmo gestisce nomi comuni (es. "Castellammare") selezionando e visualizzando il nome completo della località che supera i filtri costieri.
* **Fallback "Marina":** Se la città principale non supera la validazione (es. "Alcamo" a 250m), il sistema tenta in automatico la ricerca di **"[Città] Marina"** (es. "Alcamo Marina") e applica nuovamente i criteri di validazione.

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
* **Logica:** JavaScript / jQuery (per le chiamate AJAX asincrone e l'algoritmo di validazione).
* **Dati API:**
    * [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) (Per trovare Lat/Lon, Altitudine e Codice Paese).
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
