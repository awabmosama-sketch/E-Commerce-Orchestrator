from contextlib import asynccontextmanager
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import END, START, StateGraph
from ..config import settings
from .nodes import action, db_analyst, log_analyst, planner, supervisor
from .state import State

def build_graph() -> StateGraph:
    g = StateGraph(State)
    g.add_node("supervisor", supervisor)
    g.add_node("db_analyst", db_analyst)
    g.add_node("log_analyst", log_analyst)
    g.add_node("planner", planner)
    g.add_node("action", action)

    g.add_edge(START, "supervisor")
    g.add_conditional_edges("supervisor", lambda s: s["route"], ["db_analyst", "log_analyst"])
    g.add_edge("db_analyst", "planner")
    g.add_edge("log_analyst", "planner")
    g.add_edge("planner", "action")
    g.add_edge("action", END)
    return g

@asynccontextmanager
async def graph_ctx():
    async with AsyncPostgresSaver.from_conn_string(settings.checkpoint) as saver:
        await saver.setup()
        yield build_graph().compile(checkpointer=saver, interrupt_before=["action"])