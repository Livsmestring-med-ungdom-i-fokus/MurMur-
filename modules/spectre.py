from __future__ import annotations

from typing import Any

from modules.memory import RuntimeState


def run_spectre_mode(user_text: str, listener_output: dict[str, Any], state: RuntimeState) -> dict[str, Any]:
    goals = listener_output.get("goals", []) or ["Bygge en enkel inntektsmotor"]
    obstacles = listener_output.get("obstacles", []) or ["Lite tid"]

    primary_goal = goals[0]
    primary_obstacle = obstacles[0]

    spectre_phases = [
        "Scan: identifiser kjøps- og salgsdata per modul",
        "Prioriter: ranger kontoer etter kjøpssignal og kontrakts-fit",
        "Trigger: kjør målrettet outreach med eksklusivt tilbud",
        "Secure: verifiser NDA-krav, kontraktsflyt og tilgangsnivå",
        "Refiner: logg svar, lær, og juster automatisk",
        "Execute: repeter daglig med KPI-kontroll",
    ]

    next_actions = [
        f"Velg én nisje: {state.niche}",
        f"Definer ett resultatløfte for målet '{primary_goal}'",
        "Bygg to flyter: digitalt innkjøp (buy-side) og digitalt salg (sell-side)",
        "Aktiver NDA-gating før deling av sensitiv dokumentasjon",
        f"Lag en anti-friksjon-rutine for hinderet '{primary_obstacle}'",
        "Sett ukentlig måltall: leads, svarrate, avslutninger, signerte NDA",
    ]

    return {
        "mode": "spectre",
        "summary": f"Mål: {primary_goal}. Flaskehals: {primary_obstacle}.",
        "automation_loop": spectre_phases,
        "next_actions": next_actions,
        "state_snapshot": {
            "interactions": state.interactions,
            "known_goals": state.top_goals[:5],
            "known_obstacles": state.top_obstacles[:5],
        },
        "raw_input": user_text,
    }
