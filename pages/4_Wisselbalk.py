import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Wisselbalk", page_icon="🔄", layout="wide")

st.header("🔄 De Wisselbalk")

# Pas de naam 'index.html' aan als jouw bestand anders heet
with open("index.html", 'r', encoding='utf-8') as f:
    html_data = f.read()

components.html(html_data, height=600, scrolling=True)