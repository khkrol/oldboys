import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Stadion Calculator", page_icon="🏟️", layout="wide")

st.header("🏟️ Stadion Calculator")

# Pas de naam 'stadion.html' aan als jouw bestand anders heet
with open("stadion.html", 'r', encoding='utf-8') as f:
    html_data = f.read()

components.html(html_data, height=800, scrolling=True)