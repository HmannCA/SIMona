#!/usr/bin/env python3
# -*- coding: UTF-8 -*-

# Gibt den HTTP-Header aus, damit der Browser weiß, dass HTML kommt.
print("Content-Type: text/html;charset=utf-8")
print()  # Eine leere Zeile ist wichtig, um den Header vom Body zu trennen.

# Der eigentliche HTML-Inhalt, der angezeigt werden soll.
print("<!DOCTYPE html>")
print("<html>")
print("<head>")
print("<title>Python Test</title>")
print("</head>")
print("<body>")
print("<h1>Hallo Welt!</h1>")
print("<p>Wenn Sie das sehen, wurde das Python-Skript erfolgreich auf Ihrem Strato-Server ausgef&uuml;hrt.</p>")
print("</body>")
print("</html>")