import asyncio

import httpx


def get(app, path: str, **kwargs) -> httpx.Response:
    async def request():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.get(path, **kwargs)

    return asyncio.run(request())
