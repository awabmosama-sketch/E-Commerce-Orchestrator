import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import uvicorn


if __name__ == "__main__":
    config = uvicorn.Config("app.main:app", host="127.0.0.1", port=8000)
    server = uvicorn.Server(config)
    with asyncio.Runner(loop_factory=asyncio.SelectorEventLoop) as runner:
        runner.run(server.serve())