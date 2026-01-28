import streamlit as st
import math

# --- Configuratie van de pagina ---
st.set_page_config(page_title="Potter's Counterhulp", page_icon="⚡", layout="wide")

# Titel en Introductie
st.title("⚡ Potter's Counterhulp")
st.markdown("""
**Welkom in de War Room.** Deze tool berekent of het spelen op de counter je een voordeel oplevert in Expected Goals (xG).
We analyseren de matchups per sector en wegen je tactische vaardigheid mee.
""")

st.divider()

# --- Functies ---

def calculate_scoring_prob(att_rating, def_rating):
    """
    Berekent de scoorkans op basis van de Hattrick-formule benadering:
    Kans = Att^3.5 / (Att^3.5 + Def^3.5)
    Vermijdt deling door nul.
    """
    if att_rating == 0 and def_rating == 0:
        return 0.5
    denom = (att_rating ** 3.5) + (def_rating ** 3.5)
    if denom == 0:
        return 0.0
    return (att_rating ** 3.5) / denom

def get_potter_rating(delta_xg, pos_share_normal):
    """Bepaalt de rating en tekst op basis van de Delta xG."""
    
    # Check: Als je meer dan 55% balbezit hebt, is counteren onlogisch
    if pos_share_normal > 0.55:
        return 0, "Niet-bestaand (Je hebt het overwicht)", "Counteren is zelfmoord. Je bent sterker op het middenveld.", "error"

    # Mapping logic
    # We gebruiken de formule uit je voorbeeld: clamp(floor(delta * 3.5), 0, 7)
    # Echter, voor de leesbaarheid gebruiken we if/elif structuren die exact matchen met je tabel.
    
    rating_val = 0
    advies = ""
    uitleg = ""
    status = "info" # voor kleur (error, warning, info, success)

    if delta_xg < 0:
        rating_val = 0
        advies = "Niet-bestaand"
        uitleg = "Counteren kost je meer dan het oplevert door verlies middenveld."
        status = "error"
    elif 0.0 <= delta_xg < 0.2:
        rating_val = 1
        advies = "Rampzalig"
        uitleg = "Alleen doen als je een wonder verwacht."
        status = "error"
    elif 0.2 <= delta_xg < 0.5:
        rating_val = 2
        advies = "Matig"
        uitleg = "Het voordeel is te klein voor het risico."
        status = "warning"
    elif 0.5 <= delta_xg < 0.8:
        rating_val = 3
        advies = "Zwak"
        uitleg = "Twijfelgeval, alleen doen bij zeer hoge verdediging."
        status = "warning"
    elif 0.8 <= delta_xg < 1.2:
        rating_val = 4
        advies = "Passabel"
        uitleg = "Een degelijke optie als je middenveld kansloos is."
        status = "info"
    elif 1.2 <= delta_xg < 1.6:
        rating_val = 5
        advies = "Goed"
        uitleg = "Counteren levert duidelijk meer kansen op dan normaal."
        status = "success"
    elif 1.6 <= delta_xg < 2.0:
        rating_val = 6
        advies = "Uitstekend"
        uitleg = "Je verdediging stopt alles en je counters zijn dodelijk."
        status = "success"
    else: # > 2.0
        rating_val = 7
        advies = "Magisch"
        uitleg = "De perfecte counter-wedstrijd (De 'Potter-Standard')."
        status = "success"
        
    return rating_val, advies, uitleg, status

# --- Input Sectie (Sidebar) ---
st.sidebar.header("📊 Team Data")

st.sidebar.subheader("1. Middenveld & Tactiek")
mid_self = st.sidebar.number_input("Jouw Middenveld (Rating)", 1, 80, 20)
mid_opp = st.sidebar.number_input("Tegenstander Middenveld (Rating)", 1, 80, 25)
tl_basis = st.sidebar.number_input("Tactisch Niveau (Basis)", 1.0, 30.0, 12.0, step=0.5)

st.sidebar.subheader("2. Snelle Spelers")
q_mid = st.sidebar.number_input("Aantal Snelle Middenvelders", 0, 5, 0)
q_fwd = st.sidebar.number_input("Aantal Snelle Aanvallers", 0, 3, 0)

st.sidebar.markdown("---")
st.sidebar.subheader("3. Ratings per Sector")

# We gebruiken tabs of expanders om het netjes te houden in de sidebar, 
# of gewoon duidelijke headers. Hier gebruiken we headers.

st.sidebar.markdown("**Jouw Aanval vs. Opp Verdediging**")
col_att1, col_att2 = st.sidebar.columns(2)
with col_att1:
    att_self_l = st.number_input("Jouw Aanval Links", 1, 80, 15)
    att_self_c = st.number_input("Jouw Aanval Midden", 1, 80, 15)
    att_self_r = st.number_input("Jouw Aanval Rechts", 1, 80, 15)
with col_att2:
    # Let op de labels: Rechts verdediging staat tegenover Linker aanval
    def_opp_r = st.number_input("Opp Verdediging Rechts", 1, 80, 15, help="Staat tegenover jouw Linker Aanval")
    def_opp_c = st.number_input("Opp Verdediging Midden", 1, 80, 15)
    def_opp_l = st.number_input("Opp Verdediging Links", 1, 80, 15, help="Staat tegenover jouw Rechter Aanval")

st.sidebar.markdown("**Jouw Verdediging vs. Opp Aanval**")
col_def1, col_def2 = st.sidebar.columns(2)
with col_def1:
    def_self_l = st.number_input("Jouw Verdediging Links", 1, 80, 20, help="Staat tegenover Opp Rechter Aanval")
    def_self_c = st.number_input("Jouw Verdediging Midden", 1, 80, 20)
    def_self_r = st.number_input("Jouw Verdediging Rechts", 1, 80, 20, help="Staat tegenover Opp Linker Aanval")
with col_def2:
    att_opp_r = st.number_input("Opp Aanval Rechts", 1, 80, 15)
    att_opp_c = st.number_input("Opp Aanval Midden", 1, 80, 15)
    att_opp_l = st.number_input("Opp Aanval Links", 1, 80, 15)


# --- Berekeningen (De Engine) ---

# Stap 1: Scoorkansen per sector berekenen
# Jouw scoorkans (Average van 3 sectoren)
# Matchups: Left vs Right, Center vs Center, Right vs Left
p_score_self_l = calculate_scoring_prob(att_self_l, def_opp_r)
p_score_self_c = calculate_scoring_prob(att_self_c, def_opp_c)
p_score_self_r = calculate_scoring_prob(att_self_r, def_opp_l)
avg_score_chance_self = (p_score_self_l + p_score_self_c + p_score_self_r) / 3

# Tegenstander scoorkans
p_score_opp_l = calculate_scoring_prob(att_opp_l, def_self_r) # Opp L vs Self R
p_score_opp_c = calculate_scoring_prob(att_opp_c, def_self_c)
p_score_opp_r = calculate_scoring_prob(att_opp_r, def_self_l) # Opp R vs Self L
avg_score_chance_opp = (p_score_opp_l + p_score_opp_c + p_score_opp_r) / 3

# Stap 2: Tactisch Niveau
tl_eff = tl_basis + (q_mid * 0.5) + (q_fwd * 0.2)

# Stap 3: Scenario A (Normaal)
pos_share_normal = mid_self / (mid_self + mid_opp)
eigen_kansen_norm = 10 * pos_share_normal
opp_kansen_norm = 10 * (1 - pos_share_normal)

xg_normaal = (eigen_kansen_norm * avg_score_chance_self) - (opp_kansen_norm * avg_score_chance_opp)

# Stap 4: Scenario B (Counter Attack)
mid_self_ca = mid_self * 0.93 # 7% straf
pos_share_ca = mid_self_ca / (mid_self_ca + mid_opp)
eigen_kansen_ca_basis = 10 * pos_share_ca
opp_kansen_ca_basis = 10 * (1 - pos_share_ca)

# Stops (Kansen die tegenstander mist door jouw verdediging)
# Let op: Formule uit prompt: (10 * (1-Pca)) * (1 - ScoorkansTegen)
stops = opp_kansen_ca_basis * (1 - avg_score_chance_opp)

# Extra Counter Kansen
extra_ca = stops * (tl_eff / (tl_eff + 10))

# xG Counter
# Formule: ((EigenKansenBasis + Extra) * Scoorkans) - (KansenTegen * ScoorkansTegen)
xg_ca = ((eigen_kansen_ca_basis + extra_ca) * avg_score_chance_self) - (opp_kansen_ca_basis * avg_score_chance_opp)

# Stap 5: Saldo & Rating
delta_xg = xg_ca - xg_normaal

# Bonus voor snelle aanvallers als er > 1 is
bonus_text = ""
if q_fwd > 1:
    delta_xg += 0.1
    bonus_text = "(Inclusief +0.10 bonus voor snelle aanvallers)"

# Potter Rating bepalen
potter_rating, advies_titel, advies_text, status_color = get_potter_rating(delta_xg, pos_share_normal)


# --- Output Weergave ---

# Kolommen voor hoofdresultaten
c1, c2, c3 = st.columns(3)

with c1:
    st.metric("Normaal Balbezit", f"{pos_share_normal:.1%}")
    st.metric("Counter Balbezit", f"{pos_share_ca:.1%}", delta="-7% Straf")

with c2:
    st.metric("Effectief Tactisch Niveau", f"{tl_eff:.1f}")
    if tl_eff < 10:
        st.warning("⚠️ Let op: TL onder 10 is onbetrouwbaar!")

with c3:
    st.metric("Gem. Scoorkans Zelf", f"{avg_score_chance_self:.1%}")
    st.metric("Gem. Scoorkans Opp", f"{avg_score_chance_opp:.1%}")

st.divider()

st.subheader("Resultaat: De Potter-Analyse")

# Grote weergave van de Delta
col_res_L, col_res_R = st.columns([1, 2])

with col_res_L:
    st.metric(label="Delta Expected Goals (ΔxG)", value=f"{delta_xg:.2f}", delta="Winst door Counter")
    if bonus_text:
        st.caption(bonus_text)

with col_res_R:
    st.markdown(f"### Rating: {potter_rating}/7 - {advies_titel}")
    if status_color == "error":
        st.error(advies_text)
    elif status_color == "warning":
        st.warning(advies_text)
    elif status_color == "success":
        st.success(advies_text)
    else:
        st.info(advies_text)

st.markdown("---")

# Detail Data (Expandable)
with st.expander("Bekijk de gedetailleerde berekeningen"):
    st.write("#### Scenario A: Normaal")
    st.write(f"- Jouw Kansen (basis): {eigen_kansen_norm:.2f}")
    st.write(f"- Opp Kansen (basis): {opp_kansen_norm:.2f}")
    st.write(f"- **xG Normaal: {xg_normaal:.2f}**")
    
    st.write("#### Scenario B: Counter Attack")
    st.write(f"- Jouw Kansen (na straf): {eigen_kansen_ca_basis:.2f}")
    st.write(f"- Opp Kansen (na straf): {opp_kansen_ca_basis:.2f}")
    st.write(f"- Aantal Stops (Opp mist): {stops:.2f}")
    st.write(f"- Gegenereerde Counters: {extra_ca:.2f}")
    st.write(f"- Totaal eigen kansen (basis + counter): {eigen_kansen_ca_basis + extra_ca:.2f}")
    st.write(f"- **xG Counter: {xg_ca:.2f}**")
