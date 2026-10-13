[out:json][timeout:120];
(
  node["place"~"^(suburb|neighbourhood|quarter|village|town)$"](7.28,3.80,7.56,4.05);
  nwr["name"~"Cocoa House|Mapo Hall|Bower|University of Ibadan|University College Hospital|Bodija Market|Agodi|Oja.?Oba|Iwo Road|Polytechnic|Kuto|Cultural Centre|Liberty Stadium|Lekan Salami|Adamasingba|Palms|Ring Road|Dugbe Market|Gbagi|Eleyele",i](7.28,3.80,7.56,4.05);
);
out center tags;
