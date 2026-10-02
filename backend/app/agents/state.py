from typing import TypedDict

class State(TypedDict, total=False):
    ticket: dict
    route: list[str]
    db: str
    logs: str
    plan: dict
    result: dict