import streamlit as st

st.set_page_config(
    page_title="Oldboys Manager",
    page_icon="⚽",
)

st.write("# Welkom bij de Oldboys Manager! ⚽")

st.markdown(
    """
    Dit is de centrale hub voor alle Oldboys tools. 
    Gebruik het menu aan de linkerkant om naar de verschillende apps te navigeren.
    
    ### Beschikbare Tools:
    * **⚡ Counterhulp:** Bereken of counteren zin heeft (Potter-stijl).
    * **🔍 Scoutscore:** Analyseer spelerspotentieel.
    * **🏟️ Stadion Calculator:** Bereken de optimale stadioncapaciteit.
    * **🔄 Wisselbalk:** Visuele weergave van je wissels.
    """
)
