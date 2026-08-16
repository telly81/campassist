# CampAssist v1.1 - JSON-basierte Anleitungen

Diese Version lagert die Schritt-für-Schritt-Anleitungen in separate JSON-Dateien aus.

## Struktur

```text
index.html
assets/js/guide-loader.js
guides/
  index.json
  truma-combi-6.json
  thetford-c223-cs.json
  frischwasser.json
  landstrom.json
  dometic-kuehlschrank.json
  thule-omnistor.json
assets/awning/
  01.jpg ... 07.jpg
```

## Wichtig für Hetzner Webhosting

Die JSON-Dateien werden per `fetch()` geladen. Das funktioniert auf dem Webserver, aber nicht zuverlässig durch direktes Öffnen der HTML-Datei per Doppelklick (`file://`).

## Neue Anleitung hinzufügen

1. Neue JSON-Datei in `guides/` anlegen.
2. Bilder in passenden `assets/`-Ordner legen.
3. Hotspot/Komponente in `index.html` mit `data-guide="dateiname-ohne-json"` verknüpfen.
