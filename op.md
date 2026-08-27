Priorita dalších oprav:

omezit maximální délku jednoho kandidátního bloku,
při neuzavřeném bloku zastavit detekci na konci aktuální sekce nebo odstavce,
nepřidávat delimiterové uzávěry přes nadpisy a další rovnice,
odstranit klasifikaci backslash-artifact pro pouhé \r,
opravit UTF-8 zápis debug logu,
generovat nový log pouze z jedné aktuální verze aplikace.

Další priorita je proto:

omezit velikost jednoho kandidáta,
ukončit kandidát na hranici sekce nebo odstavce,
neprovádět opravy přes nadpisy a oddělovače sekcí,
oddělit jednotlivé vzorce uvnitř dlouhého bloku,
opravit klasifikaci backslash-artifact,
vygenerovat nový log po spuštění kompletního stress testu a exportu.