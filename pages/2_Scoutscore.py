import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Scoutscore", page_icon="🔍", layout="wide")

st.header("🔍 Scoutscore Calculator")

# We openen het HTML bestand dat in de hoofdmap staat
# Pas de naam 'scoutscore.html' aan als jouw bestand anders heet!
with open("scoutscore.html", 'r', encoding='utf-8') as f:
    html_data = f.read()

# We tonen de HTML. 
# height=800 zorgt voor genoeg ruimte. 
# scrolling=True zorgt dat je kunt scrollen als de tool lang is.
components.html(html_data, height=800, scrolling=True)