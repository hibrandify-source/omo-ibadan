[out:json][timeout:180];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|motorway_link|trunk_link|primary_link)$"](7.28,3.80,7.56,4.05);
);
out geom tags;
